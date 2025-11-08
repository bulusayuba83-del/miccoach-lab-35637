import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface TradingPlan {
  id: string;
  name: string;
  amount: number;
  tier: string;
  daily_return_min: number;
  daily_return_max: number;
  duration_days: number;
  features: string[];
  theme_colors: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

interface TradingPlanCardProps {
  plan: TradingPlan;
  onSelect?: (plan: TradingPlan) => void;
}

const tierStyles: Record<string, string> = {
  Bronze: 'border-bronze shadow-[0_0_30px_rgba(205,127,50,0.3)]',
  Silver: 'border-silver shadow-[0_0_30px_rgba(192,192,192,0.4)]',
  Gold: 'border-gold shadow-[0_0_40px_rgba(255,215,0,0.5)] animate-pulse-glow',
  Platinum: 'border-platinum shadow-[0_0_50px_rgba(185,242,255,0.6)] animate-pulse-glow',
  Diamond: 'border-diamond shadow-[0_0_60px_rgba(185,242,255,0.8)] animate-pulse-glow',
};

const tierBadgeStyles: Record<string, string> = {
  Bronze: 'bg-bronze/20 text-bronze border-bronze/50',
  Silver: 'bg-silver/20 text-silver border-silver/50',
  Gold: 'bg-gold/20 text-gold border-gold/50',
  Platinum: 'bg-platinum/20 text-platinum border-platinum/50',
  Diamond: 'bg-diamond/20 text-diamond border-diamond/50',
};

export const TradingPlanCard = ({ plan, onSelect }: TradingPlanCardProps) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
        tierStyles[plan.tier] || ''
      } bg-card/80 backdrop-blur-sm border-2`}
    >
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent via-white to-transparent" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={tierBadgeStyles[plan.tier]}>
            {plan.tier}
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold">${plan.amount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Initial Investment</div>
          </div>
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          Daily Returns: {plan.daily_return_min}% - {plan.daily_return_max}%
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-semibold">{plan.duration_days} days</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-muted-foreground">Potential Profit</span>
            <span className="font-bold text-success">
              ${(plan.amount * (plan.daily_return_min / 100) * plan.duration_days).toFixed(0)} - 
              ${(plan.amount * (plan.daily_return_max / 100) * plan.duration_days).toFixed(0)}
            </span>
          </div>
          
          {onSelect && (
            <Button
              onClick={() => onSelect(plan)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
