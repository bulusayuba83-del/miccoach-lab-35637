import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Deposit = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState('Bitcoin');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (amount < 10) {
      toast.error('Minimum deposit is $10');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum deposit is $10,000');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount,
        status: 'pending',
        payment_method: paymentMethod,
        payment_details: { details: paymentDetails },
        notes,
      });

      if (error) throw error;

      toast.success('Deposit request submitted! Awaiting admin approval.');
      navigate('/client/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/client/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-primary/30 shadow-[0_0_40px_rgba(139,195,74,0.15)]">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Deposit Funds</CardTitle>
                <CardDescription>Add funds to your trading account</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Slider */}
              <div className="space-y-4">
                <Label>Deposit Amount</Label>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    ${amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Min: $10 • Max: $10,000
                  </div>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={([value]) => setAmount(value)}
                  min={10}
                  max={10000}
                  step={10}
                  className="my-6"
                />
                <div className="flex gap-2">
                  {[100, 500, 1000, 2000, 5000].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset)}
                      className="flex-1"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Input
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Bitcoin, Bank Transfer, etc."
                  required
                />
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <Label htmlFor="payment-details">
                  Payment Details (Transaction Hash, Account Number, etc.)
                </Label>
                <Input
                  id="payment-details"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="Enter transaction details"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Deposit Amount</span>
                  <span className="font-semibold">${amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Status</span>
                  <span>Pending approval after submission</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Deposit;
