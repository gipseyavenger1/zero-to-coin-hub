import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Deposit = {
  id: string;
  user_name: string;
  cryptocurrency_type: string;
  deposit_amount: number;
  wallet_address: string;
  transaction_hash: string | null;
  deposit_date: string;
  status: string;
};

export const DepositsTable = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cryptoFilter, setCryptoFilter] = useState<string>('all');

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [deposits, searchTerm, statusFilter, cryptoFilter]);

  const fetchDeposits = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('deposit_date', { ascending: false });

      if (error) throw error;

      setDeposits(data || []);
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      toast.error('Failed to load deposits');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDeposits = () => {
    let filtered = [...deposits];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Crypto filter
    if (cryptoFilter !== 'all') {
      filtered = filtered.filter((d) => d.cryptocurrency_type === cryptoFilter);
    }

    setFilteredDeposits(filtered);
  };

  const exportToCSV = () => {
    const headers = ['User Name', 'Cryptocurrency', 'Amount', 'Date', 'Status', 'Transaction Hash', 'Wallet Address'];
    const rows = filteredDeposits.map((d) => [
      d.user_name,
      d.cryptocurrency_type,
      d.deposit_amount,
      format(new Date(d.deposit_date), 'yyyy-MM-dd HH:mm:ss'),
      d.status,
      d.transaction_hash || 'N/A',
      d.wallet_address,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deposits_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export completed');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      confirmed: 'default',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const uniqueCryptos = Array.from(new Set(deposits.map((d) => d.cryptocurrency_type)));

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, wallet, or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cryptoFilter} onValueChange={setCryptoFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by crypto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cryptocurrencies</SelectItem>
                {uniqueCryptos.map((crypto) => (
                  <SelectItem key={crypto} value={crypto}>
                    {crypto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Cryptocurrency</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">{deposit.user_name}</TableCell>
                    <TableCell>{deposit.cryptocurrency_type}</TableCell>
                    <TableCell>{deposit.deposit_amount.toFixed(8)}</TableCell>
                    <TableCell>{format(new Date(deposit.deposit_date), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={deposit.transaction_hash || 'N/A'}>
                      {deposit.transaction_hash || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredDeposits.length} of {deposits.length} deposits
        </div>
      </div>
    </Card>
  );
};
