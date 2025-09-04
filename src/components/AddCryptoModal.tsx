import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AddCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onTransactionComplete: () => void;
}

const AddCryptoModal: React.FC<AddCryptoModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onTransactionComplete 
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cryptoOptions = [
    { symbol: 'BTC', name: 'Bitcoin', mockPrice: 45000 },
    { symbol: 'ETH', name: 'Ethereum', mockPrice: 3000 },
    { symbol: 'USDT', name: 'Tether', mockPrice: 1 },
    { symbol: 'BNB', name: 'Binance Coin', mockPrice: 300 },
    { symbol: 'ADA', name: 'Cardano', mockPrice: 0.5 },
  ];

  const selectedCryptoData = cryptoOptions.find(c => c.symbol === selectedCrypto);

  const handleAdd = async () => {
    if (!selectedCrypto || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate crypto amount based on mock price
      const cryptoAmount = numAmount / (selectedCryptoData?.mockPrice || 1);

      // Create transaction record
      const { error: txError } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'deposit',
          crypto_symbol: selectedCrypto,
          amount: cryptoAmount,
          status: 'completed'
        });

      if (txError) throw txError;

      // Get current balance
      const { data: currentBalance, error: fetchError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update user balance (no bonus)
      const balanceField = `${selectedCrypto.toLowerCase()}_balance`;
      const currentCryptoBalance = currentBalance[balanceField] || 0;
      const newCryptoBalance = currentCryptoBalance + cryptoAmount;
      const newTotalBalance = (currentBalance.total_balance || 0) + numAmount;

      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({ 
          [balanceField]: newCryptoBalance,
          total_balance: newTotalBalance 
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Success!",
        description: `$${numAmount} added to your portfolio. You received ${cryptoAmount.toFixed(8)} ${selectedCrypto}`,
      });

      onTransactionComplete();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Add crypto error:', error);
      toast({
        title: "Error",
        description: "Failed to add cryptocurrency",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCrypto('');
    setAmount('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Cryptocurrency
          </DialogTitle>
          <DialogDescription>
            Add cryptocurrency to your investment portfolio
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger>
                <SelectValue placeholder="Choose crypto to add" />
              </SelectTrigger>
              <SelectContent>
                {cryptoOptions.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol}) - ${crypto.mockPrice.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {selectedCryptoData && amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-muted-foreground">
                You'll receive: {(parseFloat(amount) / selectedCryptoData.mockPrice).toFixed(8)} {selectedCrypto}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={loading || !selectedCrypto || !amount}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add ${amount}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCryptoModal;