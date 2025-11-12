import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { getDailyReturns, calculateAverage, formatCurrency, type DailyProfit } from '@/utils/chartDataProcessing';

interface DailyReturnsChartProps {
  profits: DailyProfit[];
  days?: number;
}

export const DailyReturnsChart = ({ profits, days = 7 }: DailyReturnsChartProps) => {
  const chartData = useMemo(() => getDailyReturns(profits, days), [profits, days]);
  const averageReturn = useMemo(() => 
    calculateAverage(chartData.map(d => d.value)), 
    [chartData]
  );

  if (chartData.every(d => d.value === 0)) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">No returns yet</div>
          <div className="text-sm text-muted-foreground">Daily profits will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.9} />
            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
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
          cursor={{ fill: 'rgba(139, 195, 74, 0.1)' }}
        />
        <ReferenceLine 
          y={averageReturn} 
          stroke="hsl(var(--warning))" 
          strokeDasharray="5 5"
          label={{ 
            value: `Avg: ${formatCurrency(averageReturn)}`, 
            position: 'right',
            fill: 'hsl(var(--warning))',
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="value"
          name="Daily Return"
          fill="url(#barGradient)"
          radius={[8, 8, 0, 0]}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
