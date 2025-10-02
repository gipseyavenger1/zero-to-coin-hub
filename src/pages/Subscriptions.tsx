import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp, Copy, Bitcoin } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Premium Bitcoin Investment Plans</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Choose Your Investment Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Secure, transparent Bitcoin subscriptions with automated blockchain verification and recurring payment support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-primary shadow-2xl scale-105 bg-gradient-to-br from-card to-primary/5' 
                  : 'hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              )}
              
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent shadow-lg border-none">
                  ⭐ Most Popular
                </Badge>
              )}
              
              <CardHeader className="space-y-4 pb-6">
                <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.duration} subscription</CardDescription>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${plan.amount}
                  </span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 border border-primary/30 shadow-inner">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12" />
                  <div className="relative space-y-2">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold text-sm">Projected Monthly Profit</span>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      ${plan.projectedProfit}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold">
                        {plan.roi}% ROI
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary font-bold" />
                        </div>
                      </div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl' 
                      : 'hover:bg-primary/10'
                  }`}
                  size="lg"
                  onClick={() => handleSelectPlan(plan)}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Select {plan.name} Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 space-y-8">
          {/* Bitcoin Payment Address Section */}
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(var(--bitcoin-gold))] via-primary to-accent" />
              
              <div className="p-8 md:p-12 space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--bitcoin-gold))] to-[hsl(35_91%_65%)] shadow-lg mb-2">
                    <Bitcoin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Official Bitcoin Payment Address
                  </h3>
                  <p className="text-muted-foreground text-base">
                    Send your subscription payment to this verified address
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8 shadow-inner">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <code className="flex-1 text-lg md:text-xl font-mono font-bold break-all text-foreground bg-background/50 px-4 py-3 rounded-lg border border-border">
                        1D5eHx9YTgqSNkdCWfqN3s7Ei7nQA8Wc39
                      </code>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          navigator.clipboard.writeText("1D5eHx9YTgqSNkdCWfqN3s7Ei7nQA8Wc39");
                          toast({
                            title: "Copied!",
                            description: "Bitcoin address copied to clipboard",
                          });
                        }}
                        className="flex-shrink-0 border-primary/30 hover:bg-primary/10 h-12 px-6"
                      >
                        <Copy className="h-5 w-5 mr-2" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-primary/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">Secure & Verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">Blockchain Monitored</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">SSL/HTTPS Protected</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    💡 Select a plan above, send payment to this address, then submit your transaction hash
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border shadow-md">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Automated blockchain verification • Instant activation</span>
            </div>
          </div>
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