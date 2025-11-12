import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { calculatePerformanceMetrics, type DailyProfit, type Transaction } from '@/utils/chartDataProcessing';
import { Button } from '@/components/ui/button';

interface PerformanceMetricsChartProps {
  transactions: Transaction[];
  profits: DailyProfit[];
}

type TimePeriod = 7 | 30 | 90;

export const PerformanceMetricsChart = ({ transactions, profits }: PerformanceMetricsChartProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(30);

  const chartData = useMemo(() => 
    calculatePerformanceMetrics(transactions, profits, timePeriod),
    [transactions, profits, timePeriod]
  );

  const hasData = chartData.some(d => d.deposits > 0 || d.investments > 0 || d.profits > 0);

  if (!hasData) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">No performance data yet</div>
          <div className="text-sm text-muted-foreground">Make your first deposit to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time period selector */}
      <div className="flex gap-2 justify-end">
        <Button
          variant={timePeriod === 7 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimePeriod(7)}
          className="text-xs"
        >
          7 Days
        </Button>
        <Button
          variant={timePeriod === 30 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimePeriod(30)}
          className="text-xs"
        >
          30 Days
        </Button>
        <Button
          variant={timePeriod === 90 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimePeriod(90)}
          className="text-xs"
        >
          90 Days
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            cursor={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="line"
            formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="deposits"
            name="Deposits"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="investments"
            name="Investments"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--secondary))', strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="profits"
            name="Profits"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))', r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
