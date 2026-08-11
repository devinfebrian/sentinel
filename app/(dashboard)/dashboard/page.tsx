'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { listTransactionsApi, listFindingsApi, listVendorsApi, type Transaction, type Finding, type Vendor, type RiskLevel } from '@/lib/services/api';
import Badge, { type BadgeTone } from '@/components/common/Badge';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/format/datetime';
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { FilterSelect } from '@/components/common/FilterControls';
import { AskSentinel } from '@/components/dashboard/AskSentinel';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// The band was re-derived from the score here, which meant this page could
// disagree with the agent server about where the boundaries sit. `risk_level`
// comes down on every finding already — read it instead of recomputing it.
const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const RISK_TONES: Record<RiskLevel, BadgeTone> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

// --- CHARTS (SVG/CSS based) ---

function SimpleLineChart({ data }: { data: { label: string; income: number; expense: number; net?: number }[] }) {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-on-surface-variant font-body-sm">No data</div>;

  const series = data.map((d) => ({
    ...d,
    net: d.net !== undefined ? d.net : d.income - d.expense,
  }));

  const rawMin = Math.min(0, ...series.flatMap((d) => [d.income, d.expense, d.net]));
  const rawMax = Math.max(0, ...series.flatMap((d) => [d.income, d.expense, d.net]));

  let minVal = rawMin;
  let maxVal = rawMax;
  let ticks: number[] = [];
  const rawRange = rawMax - rawMin;
  if (rawRange > 0) {
    const rawStep = rawRange / 5;
    const exponent = Math.floor(Math.log10(rawStep));
    const fraction = rawStep / 10 ** exponent;
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    const step = niceFraction * 10 ** exponent;
    minVal = Math.floor(rawMin / step) * step;
    maxVal = Math.ceil(rawMax / step) * step;
    for (let v = minVal; v <= maxVal + step * 0.5; v += step) {
      ticks.push(Number(v.toFixed(10)));
    }
  } else {
    ticks = [0];
  }

  const span = Math.max(maxVal - minVal, 1e-9);
  const yPct = (v: number) => ((v - minVal) / span) * 100;
  const xPct = (i: number) => (series.length > 1 ? (i / (series.length - 1)) * 100 : 50);

  const toPoints = (key: 'income' | 'expense' | 'net') =>
    series.map((d, i) => `${xPct(i)},${100 - yPct(d[key])}`).join(' ');

  const compactCurrency = (v: number) => {
    const sign = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    const num = (x: number) => x.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    if (abs >= 1_000_000_000) return `${sign}Rp ${num(abs / 1_000_000_000)}B`;
    if (abs >= 1_000_000) return `${sign}Rp ${num(abs / 1_000_000)}M`;
    if (abs >= 1_000) return `${sign}Rp ${num(abs / 1_000)}K`;
    return `${sign}Rp ${num(abs)}`;
  };

  return (
    <div className="w-full">
      <div className="flex">
        <div className="relative h-[220px] w-10 shrink-0 sm:w-12">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-2 -translate-y-1/2 text-[10px] font-medium tabular-nums text-on-surface-variant sm:right-3"
              style={{ top: `${100 - yPct(tick)}%` }}
            >
              {compactCurrency(tick)}
            </span>
          ))}
        </div>

        <div className="relative h-[220px] min-w-0 flex-1 border-b border-surface-container-high">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            {ticks.map((tick) => (
              <line
                key={tick}
                x1="0"
                y1={100 - yPct(tick)}
                x2="100"
                y2={100 - yPct(tick)}
                stroke="currentColor"
                className="text-surface-container-high"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <polyline points={toPoints('income')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary" vectorEffect="non-scaling-stroke" />
            <polyline points={toPoints('expense')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error" vectorEffect="non-scaling-stroke" />
            <polyline points={toPoints('net')} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" className="text-[#243B53]" vectorEffect="non-scaling-stroke" />
          </svg>

          {series.map((d, i) => (
            <span key={`m-${i}`}>
              <span className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary" style={{ left: `${xPct(i)}%`, top: `${100 - yPct(d.income)}%` }} />
              <span className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-error" style={{ left: `${xPct(i)}%`, top: `${100 - yPct(d.expense)}%` }} />
              <span className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#243B53]" style={{ left: `${xPct(i)}%`, top: `${100 - yPct(d.net)}%` }} />
            </span>
          ))}

          <div className="absolute inset-0 z-10 flex">
            {series.map((d, i) => (
              <div key={i} className="group relative h-full flex-1">
                <div className="pointer-events-none absolute left-1/2 top-1/2 hidden w-max max-w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-inverse-surface p-3 text-[10px] text-inverse-on-surface group-hover:block">
                  <div className="mb-1 font-semibold">{d.label}</div>
                  <div className="font-medium text-secondary">Income: {formatCurrency(d.income)}</div>
                  <div className="font-medium text-error">Expense: {formatCurrency(d.expense)}</div>
                  <div className="mt-1 border-t border-inverse-on-surface/20 pt-1 font-bold text-[#243B53]">Net: {formatCurrency(d.net)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ml-10 mt-2 flex justify-between sm:ml-12">
        {series.map((d, i) => (
          <span key={i} className={`flex-1 truncate px-0.5 text-center text-[10px] font-medium text-on-surface-variant ${series.length > 8 && i % 2 !== 0 ? 'invisible' : ''}`}>
            {d.label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-secondary"></span>
          <span className="text-[10px] font-medium text-on-surface">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-error"></span>
          <span className="text-[10px] font-medium text-on-surface">Expense</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0 w-3 border-t-[3px] border-dashed border-[#243B53]"></span>
          <span className="text-[10px] font-medium text-on-surface">Net Cash Flow</span>
        </div>
      </div>
    </div>
  );
}

function SimplePieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return <div className="h-64 flex items-center justify-center text-on-surface-variant font-body-sm">No data</div>;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.reduce((acc, slice) => {
    const slicePercent = slice.value / total;
    const startPercent = acc.length > 0 ? acc[acc.length - 1].endPercent : 0;
    const endPercent = startPercent + slicePercent;
    acc.push({ ...slice, slicePercent, startPercent, endPercent });
    return acc;
  }, [] as (typeof data[0] & { slicePercent: number; startPercent: number; endPercent: number })[]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8">
      <div className="relative w-40 h-40">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
          {slices.map((slice, i) => {
            // If the slice is 100%, render a circle
            if (slice.slicePercent === 1) {
              return <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />;
            }

            const [startX, startY] = getCoordinatesForPercent(slice.startPercent);
            const [endX, endY] = getCoordinatesForPercent(slice.endPercent);
            const largeArcFlag = slice.slicePercent > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return <path key={i} d={pathData} fill={slice.color} className="transition-all duration-300 hover:opacity-80" />;
          })}
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-on-surface">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
            <span className="truncate max-w-[120px] font-medium">{d.label}</span>
            <span className="font-semibold ml-auto">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function DashboardPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('All Time');

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    // Fetch data independently so one failure doesn't block the others
    Promise.allSettled([
      listTransactionsApi(accessToken, { limit: 100 }),
      listFindingsApi(accessToken, { limit: 100 }),
      listVendorsApi(accessToken)
    ])
      .then(([txResult, findResult, vendorResult]) => {
        if (txResult.status === 'fulfilled' && txResult.value.success) {
          setTransactions(txResult.value.data.transactions);
        } else if (txResult.status === 'rejected') {
          console.error('Failed to load transactions', txResult.reason);
        }

        if (findResult.status === 'fulfilled' && findResult.value.success) {
          setFindings(findResult.value.data.findings);
        } else if (findResult.status === 'rejected') {
          console.error('Failed to load findings', findResult.reason);
        }

        if (vendorResult.status === 'fulfilled' && vendorResult.value.success) {
          setVendors(vendorResult.value.data.vendors);
        } else if (vendorResult.status === 'rejected') {
          console.error('Failed to load vendors', vendorResult.reason);
        }
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  // Filter by period
  const filteredTransactions = transactions.filter(t => {
    if (period === 'All Time') return true;
    const d = new Date(t.created_at);
    const month = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    return month === period;
  });

  const filteredFindings = findings.filter(f => {
    if (period === 'All Time') return true;
    const d = new Date(f.created_at);
    const month = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    return month === period;
  });

  // KPIs
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netCashFlow = totalIncome - totalExpenses;
  const txCount = filteredTransactions.length;

  // Generate period options dynamically based on transactions
  const availablePeriods = Array.from(new Set(transactions.map(t => {
    const d = new Date(t.created_at);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  })));

  // Chart Data: Cash Flow Trend (by month) - Uses UNFILTERED transactions to show trend over time
  const trendDataMap: Record<string, { income: number; expense: number; timestamp: number }> = {};
  transactions.forEach(t => {
    const d = new Date(t.created_at);
    const month = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!trendDataMap[month]) {
      trendDataMap[month] = { 
        income: 0, 
        expense: 0, 
        timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime() 
      };
    }
    if (t.type === 'income') trendDataMap[month].income += parseFloat(t.amount);
    if (t.type === 'expense') trendDataMap[month].expense += Math.abs(parseFloat(t.amount));
  });
  
  // Sort chronologically
  const trendData = Object.keys(trendDataMap)
    .map(k => ({
      label: k,
      income: trendDataMap[k].income,
      expense: trendDataMap[k].expense,
      net: trendDataMap[k].income - trendDataMap[k].expense,
      timestamp: trendDataMap[k].timestamp
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Chart Data: Expense Breakdown
  const expenseByCategory: Record<string, number> = {};
  filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + parseFloat(t.amount);
  });
  
  const colors = ['#576400', '#B0CC00', '#D3E646', '#8FA800', '#414D00'];
  let pieData = Object.keys(expenseByCategory)
    .map(k => ({ label: k, value: expenseByCategory[k] }))
    .sort((a, b) => b.value - a.value);
    
  if (pieData.length > 5) {
    const top = pieData.slice(0, 4);
    const otherVal = pieData.slice(4).reduce((sum, d) => sum + d.value, 0);
    pieData = [...top, { label: 'Other', value: otherVal }];
  }
  
  const pieChartData = pieData.map((d, i) => ({ ...d, color: colors[i % colors.length] }));

  // AI Findings calculations
  const totalFindings = filteredFindings.length;
  let criticalRisk = 0;
  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;

  filteredFindings.forEach(f => {
    if (f.risk_level === 'critical') criticalRisk++;
    else if (f.risk_level === 'high') highRisk++;
    else if (f.risk_level === 'medium') mediumRisk++;
    else lowRisk++;
  });

  const aiSummary = { totalFindings, highRisk, criticalRisk, mediumRisk, lowRisk };
  
  const riskDistribution = [
    { level: 'Critical', count: criticalRisk, color: 'bg-red-600' },
    { level: 'High', count: highRisk, color: 'bg-rose-400' },
    { level: 'Medium', count: mediumRisk, color: 'bg-amber-400' },
    { level: 'Low', count: lowRisk, color: 'bg-emerald-500' },
  ];

  const recentFindings = filteredFindings.slice(0, 5);

  return (
    <div className="space-y-stack-lg">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Financial performance and AI audit insights across the transactions.
          </p>
        </div>
        
        <div className="flex shrink-0">
          <FilterSelect
            label="Period"
            value={period}
            onChange={setPeriod}
            className="w-40"
          >
            <option value="All Time">All Time</option>
            {availablePeriods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FilterSelect>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Income', value: totalIncome, icon: ArrowUpIcon, color: 'text-secondary', bg: 'bg-secondary-container text-on-secondary-container' },
          { label: 'Total Expenses', value: totalExpenses, icon: ArrowDownIcon, color: 'text-error', bg: 'bg-error-container text-on-error-container' },
          { label: 'Net Cash Flow', value: netCashFlow, icon: BanknotesIcon, color: netCashFlow >= 0 ? 'text-secondary' : 'text-error', bg: 'bg-primary-container text-on-primary-container' },
          { label: 'Total Transactions', value: txCount, isCount: true, icon: DocumentTextIcon, color: 'text-on-surface', bg: 'bg-surface-container-highest text-on-surface' },
        ].map((kpi, idx) => (
          <div key={idx} className="overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow flex flex-col gap-3">
             <div className="flex items-start justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                  {kpi.label}
                </span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <kpi.icon className="h-4 w-4" />
                </span>
             </div>
             <div className="mt-1">
               {isLoading ? (
                 <div className="h-8 w-24 bg-surface-container rounded animate-pulse"></div>
               ) : (
                 <div className={`font-headline-md text-headline-md ${kpi.color} truncate`}>
                   {kpi.isCount ? kpi.value : formatCurrency(kpi.value as number)}
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Cash Flow Trend</h2>
          <p className="font-body-sm text-on-surface-variant mb-4">Income and expenses over time.</p>
          <div className="flex-1 mt-auto">
             {isLoading ? (
               <div className="h-64 flex items-center justify-center text-on-surface-variant">Loading chart...</div>
             ) : (
               <SimpleLineChart data={trendData} />
             )}
          </div>
        </div>
        <div className="lg:col-span-1 overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Expense Breakdown</h2>
          <p className="font-body-sm text-on-surface-variant mb-4">Distribution of spending across categories.</p>
          <div className="flex-1 mt-auto">
             {isLoading ? (
               <div className="h-64 flex items-center justify-center text-on-surface-variant">Loading chart...</div>
             ) : (
               <SimplePieChart data={pieChartData} />
             )}
          </div>
        </div>
      </div>

      {/* AI Section Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left Column (2/3): AI Audit Summary & Risk Distribution */}
        <div className="lg:col-span-2 flex flex-col gap-gutter">
          {/* AI Audit Summary */}
          <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow ai-glow relative">
            <div className="flex items-center gap-2 mb-1">
               <ChartBarIcon className="h-5 w-5 text-primary" />
               <h2 className="font-headline-sm text-headline-sm text-on-surface">AI Audit Summary</h2>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-6">{period}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
               <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                 <span className="font-label-sm text-outline uppercase tracking-wider">Total Findings</span>
                 <span className="font-headline-sm text-on-surface">{aiSummary.totalFindings}</span>
               </div>
               <div className="flex flex-col gap-1 p-3 rounded-lg bg-red-100 border border-red-200">
                 <span className="font-label-sm text-red-800 uppercase tracking-wider">Critical Risk</span>
                 <span className="font-headline-sm text-red-800">{aiSummary.criticalRisk}</span>
               </div>
               <div className="flex flex-col gap-1 p-3 rounded-lg bg-rose-50 border border-rose-200">
                 <span className="font-label-sm text-rose-700 uppercase tracking-wider">High Risk</span>
                 <span className="font-headline-sm text-rose-700">{aiSummary.highRisk}</span>
               </div>
               <div className="flex flex-col gap-1 p-3 rounded-lg bg-amber-50 border border-amber-200">
                 <span className="font-label-sm text-amber-800 uppercase tracking-wider">Medium Risk</span>
                 <span className="font-headline-sm text-amber-800">{aiSummary.mediumRisk}</span>
               </div>
               <div className="flex flex-col gap-1 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                 <span className="font-label-sm text-emerald-800 uppercase tracking-wider">Low Risk</span>
                 <span className="font-headline-sm text-emerald-800">{aiSummary.lowRisk}</span>
               </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Risk Distribution</h2>
            <div className="flex flex-col gap-4 mt-6">
               {riskDistribution.map((item, idx) => {
                 const maxCount = Math.max(1, ...riskDistribution.map(d => d.count));
                 const widthPct = (item.count / maxCount) * 100;
                 return (
                   <div key={idx} className="flex flex-col gap-1.5">
                     <div className="flex justify-between font-label-sm text-on-surface">
                       <span className="font-semibold">{item.level}</span>
                       <span>{item.count}</span>
                     </div>
                     <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
                       <div className={`h-full rounded-full ${item.color.split(' ')[0]}`} style={{ width: `${widthPct}%` }}></div>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Ask Sentinel */}
        <div className="lg:col-span-1 overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow flex flex-col h-[600px] max-h-[600px]">
          <AskSentinel />
        </div>
      </div>

      {/* Recent AI Findings */}
      <div className="space-y-stack-md pt-4">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Findings</h2>
        <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-surface-container-high bg-surface-container-highest/30 font-label-sm text-label-sm text-on-surface-variant">
                  <th className="px-4 py-3 text-center font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Finding</th>
                  <th className="px-4 py-3 text-center font-semibold">Risk Score</th>
                  <th className="px-4 py-3 text-center font-semibold">Risk Level</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-data text-table-data text-on-surface">
                {recentFindings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                      No findings reported.
                    </td>
                  </tr>
                ) : (
                  recentFindings.map((finding) => (
                    <tr key={finding.id} className="transition-colors hover:bg-surface-container-low cursor-pointer">
                      <td className="px-4 py-3 text-on-surface-variant">{formatDate(finding.created_at)}</td>
                      {/* Findings carry one narrative, not a title/category pair —
                          the Category column was showing undefined for every row. */}
                      <td className="max-w-md truncate px-4 py-3 font-medium">{finding.description}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface">{finding.risk_score}</td>
                      <td className="px-4 py-3">
                        <Badge tone={RISK_TONES[finding.risk_level]} dot>
                          {RISK_LABELS[finding.risk_level]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {finding.resolution ? 'Resolved' : 'Open'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
}
