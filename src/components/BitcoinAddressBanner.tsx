import { Bitcoin, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const BITCOIN_ADDRESS = "1D5eHx9YTgqSNkdCWfqN3s7Ei7nQA8Wc39";

export default function BitcoinAddressBanner() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BITCOIN_ADDRESS);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Bitcoin address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(var(--bitcoin-gold))] via-primary to-accent" />
      
      <div className="p-6 md:p-8 space-y-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full -ml-12 -mb-12" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--bitcoin-gold))] to-[hsl(35_91%_65%)] shadow-lg">
                <Bitcoin className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">Official Payment Address</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mt-1">
                  Send Subscription Payments Here
                </h3>
              </div>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm rounded-xl border border-primary/40 p-4 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <code className="flex-1 text-sm md:text-base font-mono font-bold break-all text-foreground">
                  {BITCOIN_ADDRESS}
                </code>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={copyToClipboard}
                  className="flex-shrink-0 border-primary/40 hover:bg-primary/20 transition-all duration-300 h-11 px-4"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Secure & Verified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Blockchain Monitored</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">SSL/HTTPS Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
