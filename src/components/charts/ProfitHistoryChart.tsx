import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { aggregateDailyProfits, formatCurrency, type DailyProfit } from '@/utils/chartDataProcessing';

interface ProfitHistoryChartProps {
  profits: DailyProfit[];
  days?: number;
}

export const ProfitHistoryChart = ({ profits, days = 30 }: ProfitHistoryChartProps) => {
  const chartData = useMemo(() => aggregateDailyProfits(profits, days), [profits, days]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">No profit data yet</div>
          <div className="text-sm text-muted-foreground">Start investing to see your growth!</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis 
          dataKey="date" 
          stroke="rgba(255, 255, 255, 0.3)"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="rgba(255, 255, 255, 0.3)"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          content={<ChartTooltip />}
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Cumulative Profit"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#profitGradient)"
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
