import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TradingPlanCard } from '@/components/TradingPlanCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Shield, Zap, Clock, LogIn, Star, Quote } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
                Prime Capital Investment
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
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Prime Capital Investment?</h2>
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

      {/* About Us */}
      <section className="py-20 border-b border-border/50 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">About Prime Capital Investment</h2>
              <p className="text-xl text-muted-foreground">
                Leading the Future of Automated Cryptocurrency Trading
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-8 rounded-lg bg-card border border-border/50">
                <h3 className="text-2xl font-semibold text-primary">Our Mission</h3>
                <p className="text-foreground/80 leading-relaxed">
                  At Prime Capital Investment, we democratize access to sophisticated cryptocurrency trading strategies. 
                  Our mission is to empower investors of all levels to participate in the Bitcoin market with confidence, 
                  leveraging cutting-edge technology that was once available only to institutional traders.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  We believe in transparency, security, and consistent performance. Every trading decision is backed by 
                  data-driven algorithms designed to maximize returns while managing risk effectively.
                </p>
              </div>

              <div className="space-y-4 p-8 rounded-lg bg-card border border-border/50">
                <h3 className="text-2xl font-semibold text-secondary">Our Technology</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Our proprietary AI-powered trading bots utilize advanced machine learning algorithms to analyze 
                  market trends, identify profitable opportunities, and execute trades with precision timing. 
                  Operating 24/7 across multiple exchanges, our systems process millions of data points per second.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  With real-time market monitoring, automated risk management, and adaptive strategies that evolve 
                  with market conditions, we deliver consistent returns while protecting your capital through 
                  sophisticated stop-loss mechanisms and diversification protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about Prime Capital Investment
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  How does automated Bitcoin trading work?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  Our AI-powered trading bots analyze market data 24/7, identifying profitable trading opportunities 
                  in real-time. The bots execute trades automatically based on advanced algorithms that consider 
                  market trends, volatility, and risk factors. You don't need any trading experience - our technology 
                  handles everything while you watch your investment grow.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  What investment plans are available?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  We offer multiple investment plans ranging from $100 to $5,000, each with different daily return 
                  percentages (1.5% to 5.5%). Plans typically run for 30 days, and you can choose the one that best 
                  fits your investment goals and risk tolerance. Higher investment amounts generally yield higher 
                  daily returns. All plans include 24/7 automated trading and full customer support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  How do withdrawals work?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  You can request a withdrawal at any time from your dashboard. Withdrawal requests are processed 
                  by our team within 24-48 hours. Your profits and principal can be withdrawn to your preferred 
                  payment method. We support various withdrawal methods including bank transfers and cryptocurrency 
                  wallets. There are no hidden fees - you receive exactly what you request to withdraw.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Is my investment secure?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  Yes. We employ bank-level security measures including SSL encryption, secure servers, and 
                  two-factor authentication. Your funds are stored in segregated accounts and never mixed with 
                  operational funds. Our trading algorithms include risk management protocols and stop-loss 
                  mechanisms to protect your capital. We are committed to maintaining the highest security 
                  standards in the industry.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Do I need trading experience?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  No trading experience is required. Our automated system handles all trading decisions and 
                  executions for you. Simply choose your investment plan, make a deposit, and our AI-powered 
                  bots will do the rest. You can monitor your profits in real-time through your dashboard 
                  without needing to understand complex trading strategies or market analysis.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  What are the daily returns I can expect?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  Daily returns vary by plan and range from 1.5% to 5.5% per day, depending on your investment 
                  amount. Returns are credited to your account daily and compound over the duration of your plan. 
                  While we strive for consistency, returns may vary slightly based on market conditions. Your 
                  dashboard provides real-time tracking of all profits and performance metrics.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border border-border/50 rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  How do I get started?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed">
                  Getting started is simple: 1) Create your free account by clicking "Get Started" above, 
                  2) Choose your preferred investment plan, 3) Make your initial deposit using your preferred 
                  payment method, and 4) Watch your investment grow as our bots trade automatically. Our support 
                  team is available 24/7 to assist you with any questions during the setup process.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Investors Say</h2>
            <p className="text-xl text-muted-foreground">
              Real success stories from Prime Capital Investment members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  JD
                </div>
                <div>
                  <h4 className="font-semibold">James Davis</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                "I started with the $500 plan and was skeptical at first. After seeing consistent 3.5% daily returns, 
                I increased my investment. In just 3 months, I've made over $2,800 in pure profit!"
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-success font-semibold">Total Profit: $2,847</p>
                <p className="text-xs text-muted-foreground">Member since January 2025</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-secondary/10" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-lg">
                  SM
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Martinez</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                "As a busy professional, I needed passive income without the time commitment. Prime Capital's 
                automated trading is perfect. The support team is responsive and withdrawals are processed quickly."
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-success font-semibold">Total Profit: $5,120</p>
                <p className="text-xs text-muted-foreground">Member since December 2024</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  RP
                </div>
                <div>
                  <h4 className="font-semibold">Robert Park</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                "I've tried other trading platforms before, but none compare to Prime Capital. The transparency, 
                consistent returns, and professional approach make this the best investment I've made this year."
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-success font-semibold">Total Profit: $8,934</p>
                <p className="text-xs text-muted-foreground">Member since October 2024</p>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-secondary/10" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-lg">
                  EW
                </div>
                <div>
                  <h4 className="font-semibold">Emily Watson</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                "I was nervous about Bitcoin trading, but the automated system takes care of everything. No stress, 
                no complicated charts. Just steady profits that appear in my account every single day."
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-success font-semibold">Total Profit: $4,256</p>
                <p className="text-xs text-muted-foreground">Member since November 2024</p>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  MC
                </div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                "Best investment decision I've made. Started with $1,000 and reinvested my profits. Now earning 
                over $100 daily. The platform is secure, professional, and the returns are exactly as promised."
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-success font-semibold">Total Profit: $6,789</p>
                <p className="text-xs text-muted-foreground">Member since September 2024</p>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-secondary/10" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-lg">
                  LT
                </div>
                <div>
                  <h4 className="font-semibold">Linda Thompson</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                "Retired and looking for steady income. Prime Capital has exceeded my expectations. The daily returns 
                are reliable, and I can withdraw my profits whenever I need them. Highly recommend!"
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-success font-semibold">Total Profit: $3,421</p>
                <p className="text-xs text-muted-foreground">Member since December 2024</p>
              </div>
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
            Join thousands of investors who trust Prime Capital Investment for their Bitcoin trading needs
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
          <p>&copy; 2025 Prime Capital Investment. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
