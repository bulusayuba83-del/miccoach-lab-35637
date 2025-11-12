import { formatCurrency } from '@/utils/chartDataProcessing';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

export const ChartTooltip = ({ 
  active, 
  payload, 
  label,
  valueFormatter = formatCurrency,
  labelFormatter = (l) => l,
}: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-[0_0_20px_rgba(139,195,74,0.3)] animate-fade-in">
      <div className="text-sm font-semibold text-foreground mb-2">
        {labelFormatter(label || '')}
      </div>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.name}:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
