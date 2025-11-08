import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TradingPlanCard } from '@/components/TradingPlanCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Shield, Zap, Clock, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [tradingPlans, setTradingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTradingPlans();
  }, []);

  const fetchTradingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: true });

      if (error) throw error;
      setTradingPlans(data || []);
    } catch (error) {
      console.error('Error fetching trading plans:', error);
      toast.error('Failed to load trading plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: any) => {
    if (!user) {
      toast.error('Please sign in to purchase a trading plan');
      navigate('/auth');
      return;
    }
    navigate('/client/dashboard');
    toast.info('Complete your deposit to activate this plan');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="h-16 w-16 text-primary" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                TCM Financial Services
              </h1>
            </div>
            
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Automated Bitcoin Trading Robots - Your Path to Financial Freedom
            </p>

            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              Invest from <span className="font-bold text-primary">$100 to $5,000</span> and let our advanced AI-powered trading bots work 24/7 to grow your wealth in the cryptocurrency market.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-6">
              {user ? (
                <Button
                  size="lg"
                  onClick={() => navigate('/client/dashboard')}
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                  >
                    Get Started
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    className="text-lg px-8 py-6 gap-2"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-b border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose TCM Financial?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border border-primary/20">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Automated Trading</h3>
              <p className="text-muted-foreground">Advanced AI algorithms trade Bitcoin 24/7</p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border border-secondary/20">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Safe</h3>
              <p className="text-muted-foreground">Bank-level security for your investments</p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border border-success/20">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Daily Returns</h3>
              <p className="text-muted-foreground">Consistent profits from 1.5% to 5.5% daily</p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border border-warning/20">
              <div className="w-16 h-16 mx-auto rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Support</h3>
              <p className="text-muted-foreground">Dedicated support team always available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Trading Plan</h2>
            <p className="text-xl text-muted-foreground">Select the investment level that suits your goals</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tradingPlans.map((plan) => (
                <TradingPlanCard key={plan.id} plan={plan} onSelect={handlePlanSelect} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust TCM Financial for their Bitcoin trading needs
          </p>
          {!user && (
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-lg px-12 py-6"
            >
              Create Your Account
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TCM Financial Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
