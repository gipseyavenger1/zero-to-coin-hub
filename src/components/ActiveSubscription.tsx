import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface Subscription {
  id: string;
  plan_type: string;
  investment_amount: number;
  projected_profit: number;
  status: string;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
}

export default function ActiveSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSubscription();
  }, []);

  const fetchActiveSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setSubscription(data[0]);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      label: "Pending Verification"
    },
    active: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      label: "Active"
    }
  };

  const status = statusConfig[subscription.status as keyof typeof statusConfig] || {
    icon: AlertCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: subscription.status
  };

  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Subscription</CardTitle>
          <Badge className={`${status.bgColor} ${status.color} border-0`}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {status.label}
          </Badge>
        </div>
        <CardDescription>
          {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Investment Amount</p>
            <p className="text-2xl font-bold">${subscription.investment_amount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Projected Profit</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-primary">
                ${subscription.projected_profit}
              </p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {subscription.status === 'pending' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              Your subscription is pending Bitcoin transaction confirmation. This typically takes 10-30 minutes.
            </p>
          </div>
        )}

        {subscription.status === 'active' && subscription.end_date && (
          <div className="text-sm text-muted-foreground">
            <p>Active until: {new Date(subscription.end_date).toLocaleDateString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}