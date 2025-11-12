import { format, subDays, isAfter, isBefore } from 'date-fns';

export interface DailyProfit {
  id: string;
  date: string;
  amount: number;
  percentage: number;
  user_id: string;
  subscription_id: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  total_earned: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  trading_plans?: {
    id: string;
    name: string;
    tier: string;
    theme_colors?: any;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
  tier: string;
}

// Aggregate daily profits for area chart
export const aggregateDailyProfits = (profits: DailyProfit[], days: number = 30): ChartDataPoint[] => {
  const startDate = subDays(new Date(), days);
  const filteredProfits = profits.filter(p => 
    isAfter(new Date(p.date), startDate) || format(new Date(p.date), 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd')
  );

  // Group by date and calculate cumulative
  const groupedByDate: Record<string, number> = {};
  filteredProfits.forEach(profit => {
    const dateKey = format(new Date(profit.date), 'yyyy-MM-dd');
    groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + Number(profit.amount);
  });

  // Create sorted array with cumulative values
  const sortedDates = Object.keys(groupedByDate).sort();
  let cumulative = 0;
  
  return sortedDates.map(date => {
    cumulative += groupedByDate[date];
    return {
      date: format(new Date(date), 'MMM dd'),
      value: cumulative,
      label: date,
    };
  });
};

// Calculate portfolio distribution for pie chart
export const calculatePortfolioDistribution = (subscriptions: Subscription[]): PieChartDataPoint[] => {
  const tierColors: Record<string, string> = {
    bronze: 'hsl(30, 55%, 50%)',
    silver: 'hsl(0, 0%, 75%)',
    gold: 'hsl(45, 100%, 50%)',
    platinum: 'hsl(200, 15%, 85%)',
    diamond: 'hsl(195, 100%, 85%)',
  };

  // Group by plan
  const planGroups: Record<string, { amount: number; plan: any; tier: string }> = {};
  
  subscriptions.forEach(sub => {
    const planId = sub.plan_id;
    if (!planGroups[planId]) {
      planGroups[planId] = {
        amount: 0,
        plan: sub.trading_plans,
        tier: sub.trading_plans?.tier || 'bronze',
      };
    }
    planGroups[planId].amount += Number(sub.amount);
  });

  // Convert to array and sort by amount
  return Object.values(planGroups)
    .map(group => ({
      name: group.plan?.name || 'Unknown Plan',
      value: group.amount,
      color: tierColors[group.tier.toLowerCase()] || tierColors.bronze,
      tier: group.tier,
    }))
    .sort((a, b) => b.value - a.value);
};

// Get daily returns for bar chart
export const getDailyReturns = (profits: DailyProfit[], days: number = 7): ChartDataPoint[] => {
  const startDate = subDays(new Date(), days);
  const filteredProfits = profits.filter(p => 
    isAfter(new Date(p.date), startDate) || format(new Date(p.date), 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd')
  );

  // Group by date
  const groupedByDate: Record<string, number> = {};
  filteredProfits.forEach(profit => {
    const dateKey = format(new Date(profit.date), 'yyyy-MM-dd');
    groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + Number(profit.amount);
  });

  // Fill in missing days with 0
  const result: ChartDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, 'yyyy-MM-dd');
    result.push({
      date: format(date, 'EEE'),
      value: groupedByDate[dateKey] || 0,
      label: dateKey,
    });
  }

  return result;
};

// Calculate performance metrics for line chart
export const calculatePerformanceMetrics = (
  transactions: Transaction[],
  profits: DailyProfit[],
  days: number = 30
): { date: string; deposits: number; investments: number; profits: number }[] => {
  const startDate = subDays(new Date(), days);
  
  // Initialize data structure
  const metricsMap: Record<string, { deposits: number; investments: number; profits: number }> = {};
  
  // Fill in all dates
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, 'yyyy-MM-dd');
    metricsMap[dateKey] = { deposits: 0, investments: 0, profits: 0 };
  }

  // Add transaction data
  transactions
    .filter(t => isAfter(new Date(t.created_at), startDate) && t.status === 'approved')
    .forEach(transaction => {
      const dateKey = format(new Date(transaction.created_at), 'yyyy-MM-dd');
      if (metricsMap[dateKey]) {
        if (transaction.type === 'deposit') {
          metricsMap[dateKey].deposits += Number(transaction.amount);
        } else if (transaction.type === 'subscription') {
          metricsMap[dateKey].investments += Number(transaction.amount);
        }
      }
    });

  // Add profit data
  profits
    .filter(p => isAfter(new Date(p.date), startDate))
    .forEach(profit => {
      const dateKey = format(new Date(profit.date), 'yyyy-MM-dd');
      if (metricsMap[dateKey]) {
        metricsMap[dateKey].profits += Number(profit.amount);
      }
    });

  // Convert to array with cumulative values
  const sortedDates = Object.keys(metricsMap).sort();
  let cumulativeDeposits = 0;
  let cumulativeInvestments = 0;
  let cumulativeProfits = 0;

  return sortedDates.map(dateKey => {
    cumulativeDeposits += metricsMap[dateKey].deposits;
    cumulativeInvestments += metricsMap[dateKey].investments;
    cumulativeProfits += metricsMap[dateKey].profits;

    return {
      date: format(new Date(dateKey), 'MMM dd'),
      deposits: cumulativeDeposits,
      investments: cumulativeInvestments,
      profits: cumulativeProfits,
    };
  });
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Calculate average
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};
