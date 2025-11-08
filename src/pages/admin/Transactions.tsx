import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  notes: string;
  admin_notes: string;
  processed_at: string;
  processed_by: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const enrichedTransactions = (txData || []).map(tx => ({
        ...tx,
        profiles: profilesMap.get(tx.user_id),
      }));

      setTransactions(enrichedTransactions as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transaction: Transaction) => {
    setProcessing(transaction.id);
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          admin_notes: adminNotes[transaction.id] || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      if (transaction.type === 'deposit') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', transaction.user_id)
          .single();

        const newBalance = (Number(profile?.balance) || 0) + Number(transaction.amount);

        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', transaction.user_id);

        if (balanceError) throw balanceError;
      } else if (transaction.type === 'withdrawal') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', transaction.user_id)
          .single();

        const newBalance = (Number(profile?.balance) || 0) - Number(transaction.amount);

        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', transaction.user_id);

        if (balanceError) throw balanceError;
      }

      toast.success('Transaction approved successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transaction: Transaction) => {
    setProcessing(transaction.id);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          admin_notes: adminNotes[transaction.id] || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (error) throw error;

      toast.success('Transaction rejected');
      fetchTransactions();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    } finally {
      setProcessing(null);
    }
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {transaction.type === 'deposit' ? '💰 Deposit' : '💸 Withdrawal'}
          </CardTitle>
          <Badge variant={
            transaction.status === 'pending' ? 'default' :
            transaction.status === 'approved' ? 'default' :
            'destructive'
          }>
            {transaction.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">User</p>
            <p className="font-medium">{transaction.profiles?.full_name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{transaction.profiles?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold text-primary">${Number(transaction.amount).toFixed(2)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Payment Method</p>
          <p className="font-medium">{transaction.payment_method || 'N/A'}</p>
        </div>

        {transaction.payment_details && Object.keys(transaction.payment_details).length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Payment Details</p>
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              {JSON.stringify(transaction.payment_details, null, 2)}
            </div>
          </div>
        )}

        {transaction.notes && (
          <div>
            <p className="text-sm text-muted-foreground">User Notes</p>
            <p className="text-sm">{transaction.notes}</p>
          </div>
        )}

        {transaction.status === 'pending' && (
          <>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Admin Notes (Optional)</p>
              <Textarea
                placeholder="Add notes for this transaction..."
                value={adminNotes[transaction.id] || ''}
                onChange={(e) => setAdminNotes({ ...adminNotes, [transaction.id]: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => handleApprove(transaction)}
                disabled={processing === transaction.id}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleReject(transaction)}
                disabled={processing === transaction.id}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {new Date(transaction.created_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const approvedTransactions = transactions.filter(t => t.status === 'approved');
  const rejectedTransactions = transactions.filter(t => t.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Transaction Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending transactions
                </CardContent>
              </Card>
            ) : (
              pendingTransactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No approved transactions
                </CardContent>
              </Card>
            ) : (
              approvedTransactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No rejected transactions
                </CardContent>
              </Card>
            ) : (
              rejectedTransactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
