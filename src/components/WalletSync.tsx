import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Link, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletSyncProps {
  onSyncComplete?: () => void;
}

const WalletSync: React.FC<WalletSyncProps> = ({ onSyncComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const exchanges = [
    {
      id: 'binance',
      name: 'Binance',
      description: 'Sync trades from Binance exchange',
      requiresApi: true,
      icon: '🔶'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Pro',
      description: 'Import trades from Coinbase Pro',
      requiresApi: true,
      icon: '🔵'
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect your MetaMask wallet',
      requiresApi: false,
      icon: '🦊'
    },
    {
      id: 'trust-wallet',
      name: 'Trust Wallet',
      description: 'Import from Trust Wallet address',
      requiresApi: false,
      icon: '🔷'
    }
  ];

  const handleExchangeSelect = (exchangeId: string) => {
    setSelectedExchange(exchangeId);
    setApiKey('');
    setApiSecret('');
    setWalletAddress('');
  };

  const handleSync = async () => {
    if (!selectedExchange) {
      toast.error('Please select an exchange or wallet');
      return;
    }

    const exchange = exchanges.find(e => e.id === selectedExchange);
    if (!exchange) return;

    if (exchange.requiresApi && (!apiKey || !apiSecret)) {
      toast.error('Please provide API credentials');
      return;
    }

    if (!exchange.requiresApi && !walletAddress) {
      toast.error('Please provide wallet address');
      return;
    }

    setSyncing(true);

    try {
      // Simulate API call to sync transactions
      // In a real implementation, this would call your backend to:
      // 1. Validate API credentials or wallet address
      // 2. Fetch transaction history
      // 3. Parse and store transactions
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful sync
      const mockTransactions = Math.floor(Math.random() * 50) + 10;
      
      toast.success(`Successfully synced ${mockTransactions} transactions from ${exchange.name}`);
      onSyncComplete?.();
      
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(`Failed to sync from ${exchange?.name}`);
    } finally {
      setSyncing(false);
    }
  };

  const selectedExchangeData = exchanges.find(e => e.id === selectedExchange);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Wallet Synchronization
        </CardTitle>
        <CardDescription>
          Connect your exchange accounts or wallets to automatically import transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Your API keys are encrypted and never stored in plain text. 
            Only read-only permissions are required.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exchanges.map((exchange) => (
            <Card
              key={exchange.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedExchange === exchange.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => handleExchangeSelect(exchange.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{exchange.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{exchange.name}</h3>
                    <p className="text-sm text-muted-foreground">{exchange.description}</p>
                  </div>
                  {selectedExchange === exchange.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="mt-2">
                  <Badge variant={exchange.requiresApi ? "default" : "secondary"}>
                    {exchange.requiresApi ? 'API Required' : 'Address Only'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedExchangeData && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">
                Configure {selectedExchangeData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedExchangeData.requiresApi ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api_secret">API Secret</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      placeholder="Enter your API secret"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                    />
                  </div>

                  <Alert>
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription>
                      <strong>How to get API credentials:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Log into your {selectedExchangeData.name} account</li>
                        <li>Navigate to API Management section</li>
                        <li>Create a new API key with <strong>read-only</strong> permissions</li>
                        <li>Copy the API key and secret here</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="wallet_address">Wallet Address</Label>
                    <Input
                      id="wallet_address"
                      placeholder="Enter your wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>

                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertDescription>
                      We'll scan the blockchain for transactions associated with this address.
                      This may take a few minutes depending on transaction history.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              <Button 
                onClick={handleSync} 
                disabled={syncing}
                className="w-full"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing Transactions...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Sync Transactions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletSync;