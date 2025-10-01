import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BitcoinPaymentModal from "@/components/BitcoinPaymentModal";

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    amount: 500,
    duration: '1 month',
    projectedProfit: 150,
    roi: 30,
    features: [
      'Real-time portfolio tracking',
      'Basic market analytics',
      'Email support',
      'Monthly profit reports'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    amount: 1000,
    duration: '1 month',
    projectedProfit: 350,
    roi: 35,
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced analytics & insights',
      'Priority support',
      'Weekly profit reports',
      'Risk management tools'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    amount: 2000,
    duration: '1 month',
    projectedProfit: 800,
    roi: 40,
    features: [
      'Everything in Standard',
      'Personal account manager',
      '24/7 VIP support',
      'Daily profit reports',
      'Custom investment strategies',
      'Early access to new features'
    ]
  }
];

export default function Subscriptions() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Investment Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a plan that matches your investment goals and start growing your crypto portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.duration}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.amount}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Projected Profit Gain</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ${plan.projectedProfit}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {plan.roi}% ROI
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full"
                  size="lg"
                  onClick={() => handleSelectPlan(plan)}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Select Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <BitcoinPaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}