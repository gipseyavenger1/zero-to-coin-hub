import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

interface TransactionFormProps {
  user: User;
  onTransactionAdded?: () => void;
  onTransactionComplete?: () => void;
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ user, onTransactionAdded, onTransactionComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    crypto_symbol: '',
    transaction_type: 'buy',
    amount: '',
    purchase_price: '',
    fees: '',
    exchange: 'manual',
    from_address: '',
    to_address: ''
  });
  const [loading, setLoading] = useState(false);

  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'BNB', label: 'BNB (BNB)' },
    { value: 'ADA', label: 'Cardano (ADA)' },
    { value: 'SOL', label: 'Solana (SOL)' },
    { value: 'XRP', label: 'XRP (XRP)' },
    { value: 'DOT', label: 'Polkadot (DOT)' }
  ];

  const exchangeOptions = [
    { value: 'manual', label: 'Manual Entry' },
    { value: 'binance', label: 'Binance' },
    { value: 'coinbase', label: 'Coinbase' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'metamask', label: 'MetaMask' },
    { value: 'trust-wallet', label: 'Trust Wallet' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTransactionValue = () => {
    const amount = parseFloat(formData.amount) || 0;
    const price = parseFloat(formData.purchase_price) || 0;
    const fees = parseFloat(formData.fees) || 0;
    
    if (formData.transaction_type === 'buy') {
      return (amount * price) + fees;
    } else {
      return (amount * price) - fees;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crypto_symbol || !formData.amount || !formData.purchase_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const transactionValue = calculateTransactionValue();
      
      const { error } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          crypto_symbol: formData.crypto_symbol,
          transaction_type: formData.transaction_type,
          amount: parseFloat(formData.amount),
          purchase_price: parseFloat(formData.purchase_price),
          fees: parseFloat(formData.fees) || 0,
          transaction_value: transactionValue,
          exchange: formData.exchange,
          from_address: formData.from_address || null,
          to_address: formData.to_address || null,
          status: 'completed'
        });

      if (error) throw error;

      // Update user balance  
      const balanceChange = formData.transaction_type === 'buy' 
        ? parseFloat(formData.amount) 
        : -parseFloat(formData.amount);
      
      const { error: balanceError } = await supabase.rpc('update_balance', {
        user_id_param: user.id,
        crypto_symbol_param: formData.crypto_symbol,
        amount_change_param: balanceChange
      });

      if (balanceError) {
        console.error('Balance update error:', balanceError);
      }

      toast.success(`Transaction recorded: ${formData.transaction_type.toUpperCase()} ${formData.amount} ${formData.crypto_symbol}`);
      
      // Reset form
      setFormData({
        crypto_symbol: '',
        transaction_type: 'buy',
        amount: '',
        purchase_price: '',
        fees: '',
        exchange: 'manual',
        from_address: '',
        to_address: ''
      });

      onTransactionAdded?.();
      onTransactionComplete?.();
      
    } catch (error: any) {
      console.error('Error recording transaction:', error);
      toast.error('Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Transaction
        </CardTitle>
        <CardDescription>
          Record your crypto trades and transfers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crypto_symbol">Cryptocurrency *</Label>
              <Select 
                value={formData.crypto_symbol} 
                onValueChange={(value) => handleInputChange('crypto_symbol', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type *</Label>
              <Select 
                value={formData.transaction_type} 
                onValueChange={(value) => handleInputChange('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Price (USD) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange('purchase_price', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fees">Fees (USD)</Label>
              <Input
                id="fees"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={formData.fees}
                onChange={(e) => handleInputChange('fees', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange/Wallet</Label>
              <Select 
                value={formData.exchange} 
                onValueChange={(value) => handleInputChange('exchange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exchangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(formData.transaction_type === 'deposit' || formData.transaction_type === 'withdrawal') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_address">From Address</Label>
                <Input
                  id="from_address"
                  placeholder="Sender wallet address"
                  value={formData.from_address}
                  onChange={(e) => handleInputChange('from_address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_address">To Address</Label>
                <Input
                  id="to_address"
                  placeholder="Recipient wallet address"
                  value={formData.to_address}
                  onChange={(e) => handleInputChange('to_address', e.target.value)}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium">Transaction Value:</span>
            </div>
            <span className="font-bold text-lg">
              ${calculateTransactionValue().toFixed(2)} USD
            </span>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Recording Transaction...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;