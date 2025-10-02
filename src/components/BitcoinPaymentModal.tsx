import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, CheckCircle2, Bitcoin } from "lucide-react";

interface BitcoinPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    id: string;
    name: string;
    amount: number;
    projectedProfit: number;
  };
}

const BITCOIN_ADDRESS = "1D5eHx9YTgqSNkdCWfqN3s7Ei7nQA8Wc39";

export default function BitcoinPaymentModal({
  open,
  onOpenChange,
  plan,
}: BitcoinPaymentModalProps) {
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BITCOIN_ADDRESS);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Bitcoin address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!txHash.trim()) {
      toast({
        title: "Transaction Hash Required",
        description: "Please enter your Bitcoin transaction hash",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_type: plan.id,
          investment_amount: plan.amount,
          projected_profit: plan.projectedProfit,
          status: 'pending',
          payment_address: BITCOIN_ADDRESS,
          payment_tx_hash: txHash.trim(),
        });

      if (error) throw error;

      toast({
        title: "Payment Submitted!",
        description: "Your subscription is pending verification. We'll notify you once confirmed.",
      });

      onOpenChange(false);
      navigate("/");
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to submit subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-primary/20 shadow-2xl">
        <DialogHeader className="space-y-4 pb-6 border-b border-border">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--bitcoin-gold))] to-[hsl(35_91%_65%)] shadow-lg">
            <Bitcoin className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Secure Bitcoin Payment
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Complete your <span className="font-semibold text-primary">{plan.name}</span> subscription
            <div className="mt-2 text-lg font-bold text-foreground">${plan.amount} USD/month</div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Step 1: Bitcoin Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <Label className="text-base font-semibold">Send Payment to Address</Label>
            </div>
            
            <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono break-all leading-relaxed text-foreground font-semibold">
                      {BITCOIN_ADDRESS}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex-shrink-0 border-primary/30 hover:bg-primary/10 transition-all duration-300"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-primary/20">
                  <div className="text-sm font-medium text-muted-foreground">
                    Amount Required:
                  </div>
                  <div className="text-base font-bold text-primary">
                    ${plan.amount} USD in BTC
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Transaction Hash */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <Label htmlFor="txHash" className="text-base font-semibold">
                  Enter Transaction Hash
                </Label>
              </div>
              
              <Input
                id="txHash"
                placeholder="Paste your Bitcoin transaction hash here"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                required
                className="h-12 text-base border-primary/30 focus:border-primary focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                After sending Bitcoin, paste your transaction hash here for automatic verification
              </p>
            </div>

            {/* Premium Info Box */}
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card to-muted/50 p-6 shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What Happens Next
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">→</span>
                  <span>Your payment is automatically monitored on the blockchain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">→</span>
                  <span>Subscription activates after 1 confirmation (~10-30 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">→</span>
                  <span>Instant email notification upon activation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">→</span>
                  <span>Secure, encrypted transaction with SSL/HTTPS protection</span>
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Payment...
                </span>
              ) : (
                "Confirm & Activate Subscription"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}