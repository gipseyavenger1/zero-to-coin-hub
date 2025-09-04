import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface SendCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  userBalance: any;
  onTransactionComplete: () => void;
}

const SendCryptoModal: React.FC<SendCryptoModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  userBalance, 
  onTransactionComplete 
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cryptoOptions = [
    { symbol: 'BTC', name: 'Bitcoin', balance: userBalance?.btc_balance || 0 },
    { symbol: 'ETH', name: 'Ethereum', balance: userBalance?.eth_balance || 0 },
    { symbol: 'USDT', name: 'Tether', balance: userBalance?.usdt_balance || 0 },
    { symbol: 'BNB', name: 'Binance Coin', balance: userBalance?.bnb_balance || 0 },
    { symbol: 'ADA', name: 'Cardano', balance: userBalance?.ada_balance || 0 },
  ];

  const selectedCryptoData = cryptoOptions.find(c => c.symbol === selectedCrypto);

  const handleSend = async () => {
    if (!selectedCrypto || !amount || !toAddress) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > (selectedCryptoData?.balance || 0)) {
      toast({
        title: "Error",
        description: "Invalid amount or insufficient balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create transaction record
      const { error: txError } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal',
          crypto_symbol: selectedCrypto,
          amount: numAmount,
          to_address: toAddress,
          status: 'completed'
        });

      if (txError) throw txError;

      // Update user balance
      const balanceField = `${selectedCrypto.toLowerCase()}_balance`;
      const newBalance = (selectedCryptoData?.balance || 0) - numAmount;
      const newTotalBalance = (userBalance?.total_balance || 0) - (numAmount * 50000); // Mock price calculation

      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({ 
          [balanceField]: newBalance,
          total_balance: newTotalBalance 
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Success!",
        description: `${numAmount} ${selectedCrypto} sent successfully`,
      });

      onTransactionComplete();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Error",
        description: "Failed to send cryptocurrency",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCrypto('');
    setAmount('');
    setToAddress('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Cryptocurrency
          </DialogTitle>
          <DialogDescription>
            Send your crypto to another wallet address
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger>
                <SelectValue placeholder="Choose crypto to send" />
              </SelectTrigger>
              <SelectContent>
                {cryptoOptions.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol}) - Balance: {crypto.balance.toFixed(8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={selectedCryptoData?.balance || 0}
            />
            {selectedCryptoData && (
              <p className="text-xs text-muted-foreground">
                Available: {selectedCryptoData.balance.toFixed(8)} {selectedCrypto}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Recipient Address</Label>
            <Input
              id="address"
              placeholder="Enter wallet address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={loading || !selectedCrypto || !amount || !toAddress}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send {selectedCrypto}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendCryptoModal;