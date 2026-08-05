// Mock data for the Executive Overview workspace

export const overviewKpis = [
  {
    label: 'Total Income',
    value: '$4.2M',
    trend: { direction: 'up', value: '+12%', tone: 'positive' },
    spark: [3.1, 3.4, 3.3, 3.8, 3.6, 4.0, 4.2],
  },
  {
    label: 'Total Expense',
    value: '$2.8M',
    trend: { direction: 'up', value: '+5%', tone: 'warning' },
    spark: [2.4, 2.5, 2.5, 2.6, 2.7, 2.7, 2.8],
  },
  {
    label: 'Net Cash Flow',
    value: '$1.4M',
    trend: { direction: 'up', value: '+8%', tone: 'positive' },
    spark: [0.9, 1.0, 1.1, 1.1, 1.2, 1.3, 1.4],
  },
  {
    label: 'Open Findings',
    value: '3',
    aiGlow: true,
    footer: { badge: 'High Risk', tone: 'high' },
    spark: [5, 5, 4, 4, 3, 3, 3],
  },
];

export const incomeExpenseSeries = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  income: [3.1, 3.4, 3.8, 4.2],
  expense: [2.4, 2.5, 2.7, 2.8],
};

export const expenseByDivision = [
  { label: 'North America', value: 42 },
  { label: 'EMEA', value: 27 },
  { label: 'APAC', value: 19 },
  { label: 'Global', value: 12 },
];

export const recentAnomalies = [
  {
    date: 'Oct 12, 2023',
    vendor: 'Acme Corp Services',
    division: 'Marketing (APAC)',
    risk: 'high',
    status: 'Pending Review',
  },
  {
    date: 'Oct 10, 2023',
    vendor: 'Global Tech Supplies',
    division: 'IT Infrastructure',
    risk: 'medium',
    status: 'Investigating',
  },
  {
    date: 'Oct 08, 2023',
    vendor: 'Stellar Logistics',
    division: 'Supply Chain',
    risk: 'low',
    status: 'Resolved',
  },
];
