import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { calculatePortfolioDistribution, formatCurrency, type Subscription } from '@/utils/chartDataProcessing';

interface PortfolioDistributionChartProps {
  subscriptions: Subscription[];
}

export const PortfolioDistributionChart = ({ subscriptions }: PortfolioDistributionChartProps) => {
  const chartData = useMemo(() => calculatePortfolioDistribution(subscriptions), [subscriptions]);

  const totalInvested = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0), 
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">No investments yet</div>
          <div className="text-sm text-muted-foreground">Purchase a trading plan to begin</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip 
            content={<ChartTooltip 
              valueFormatter={(value) => `${formatCurrency(value)} (${((value / totalInvested) * 100).toFixed(1)}%)`}
            />}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center label */}
      <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-sm text-muted-foreground">Total</div>
        <div className="text-xl font-bold text-foreground">{formatCurrency(totalInvested)}</div>
      </div>
    </div>
  );
};
