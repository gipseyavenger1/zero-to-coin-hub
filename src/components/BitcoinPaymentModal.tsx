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

const BITCOIN_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bitcoin className="h-6 w-6 text-primary" />
            Bitcoin Payment
          </DialogTitle>
          <DialogDescription>
            Complete your {plan.name} plan subscription (${plan.amount}/month)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Step 1: Send Bitcoin to this address</Label>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm break-all">{BITCOIN_ADDRESS}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Amount: ${plan.amount} USD equivalent in BTC
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="txHash">Step 2: Enter Transaction Hash</Label>
              <Input
                id="txHash"
                placeholder="Enter your Bitcoin transaction hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                After sending Bitcoin, paste the transaction hash here for verification
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Important Notes:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Subscription activates after 1 blockchain confirmation</li>
                <li>Typically takes 10-30 minutes for confirmation</li>
                <li>You'll receive email notification once active</li>
                <li>Keep your transaction hash for records</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm Payment"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}