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

export function SimpleLineChart({ data, isAllTime = false, metricFilter = 'All' }: { data: { label: string; income: number; expense: number; net?: number }[], isAllTime?: boolean, metricFilter?: string }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (data.length === 0) return <div className="h-full min-h-[220px] flex items-center justify-center text-on-surface-variant font-body-sm">No transaction data available</div>;

  const series = data.map((d) => ({
    ...d,
    net: d.net !== undefined ? d.net : d.income - d.expense,
  }));

  const showIncome = metricFilter === 'All' || metricFilter === 'Income';
  const showExpense = metricFilter === 'All' || metricFilter === 'Expense';
  const showNet = metricFilter === 'All' || metricFilter === 'Net Cash Flow';

  const rawMax = Math.max(0, ...series.flatMap((d) => [
    showIncome ? d.income : 0,
    showNet ? d.net : 0
  ]));
  const rawMin = Math.min(0, ...series.flatMap((d) => [
    showExpense ? -d.expense : 0,
    showNet ? d.net : 0
  ]));

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
    
    // Ensure zero is a tick if data spans positive and negative
    if (minVal < 0 && maxVal > 0) {
      minVal = Math.floor(rawMin / step) * step;
      maxVal = Math.ceil(rawMax / step) * step;
    }
    
    for (let v = minVal; v <= maxVal + step * 0.5; v += step) {
      ticks.push(Number(v.toFixed(10)));
    }
    if (!ticks.includes(0) && minVal <= 0 && maxVal >= 0) {
        ticks.push(0);
        ticks.sort((a,b) => a-b);
    }
  } else {
    ticks = [0];
  }

  const span = Math.max(maxVal - minVal, 1e-9);
  const yPct = (v: number) => ((v - minVal) / span) * 100;
  
  const colWidth = 100 / Math.max(series.length, 1);
  const xPct = (i: number) => (i + 0.5) * colWidth;

  const toPoints = (key: 'net') =>
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
    <div className="w-full flex-1 flex flex-col min-h-0 relative">
      <div className="flex flex-1 min-h-[220px] relative">
        {/* Fixed Y-Axis */}
        <div className="relative w-11 shrink-0 sm:w-14 h-full z-10 bg-surface border-r border-surface-container-highest/50 pr-1">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-2 -translate-y-1/2 text-[9px] sm:text-[10px] font-medium tabular-nums text-on-surface-variant sm:right-3"
              style={{ top: `${100 - yPct(tick)}%` }}
            >
              {compactCurrency(tick)}
            </span>
          ))}
        </div>

        {/* Scrollable Data Area */}
        <div 
          className="flex-1 overflow-x-auto hide-scrollbar relative flex flex-col"
          onClick={() => setSelectedIdx(null)}
        >
          <div 
            className="relative flex-1 min-h-[180px] border-b border-surface-container-high"
            style={{ minWidth: isAllTime ? `${Math.max(100, series.length * (100 / 6))}%` : '100%' }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Background Grid Lines */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              {ticks.map((tick) => (
                <line
                  key={tick}
                  x1="0"
                  y1={100 - yPct(tick)}
                  x2="100"
                  y2={100 - yPct(tick)}
                  stroke="currentColor"
                  className={tick === 0 ? "text-on-surface-variant opacity-40" : "text-surface-container-high"}
                  strokeWidth={tick === 0 ? "2" : "1"}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* HTML Bars */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {series.map((d, i) => {
                const x = xPct(i);
                const bottomZeroPct = yPct(0);
                const incomeHeight = Math.max(0, yPct(d.income) - yPct(0));
                const expenseHeight = Math.max(0, yPct(0) - yPct(-d.expense));
                const barWidthPctCol = (100 / Math.max(series.length, 1)) * 0.4;
                
                const isMuted = selectedIdx !== null && selectedIdx !== i;
                const opacityClass = isMuted ? 'opacity-40' : 'opacity-100';

                return (
                  <div 
                    key={`bars-${i}`} 
                    className={`absolute top-0 bottom-0 flex flex-col items-center transition-opacity duration-200 ${opacityClass}`} 
                    style={{ 
                      left: `${x}%`, 
                      transform: 'translateX(-50%)', 
                      width: `${barWidthPctCol}%`, 
                      maxWidth: '40px', 
                      minWidth: '8px' 
                    }}
                  >
                     {showIncome && incomeHeight > 0 && (
                       <div 
                         className="absolute w-full"
                         style={{
                           backgroundColor: '#D4E7CE',
                           bottom: `${bottomZeroPct}%`,
                           height: `${incomeHeight}%`,
                           borderTopLeftRadius: '4px',
                           borderTopRightRadius: '4px',
                         }}
                       />
                     )}
                     {showExpense && expenseHeight > 0 && (
                       <div 
                         className="absolute w-full"
                         style={{
                           backgroundColor: '#FFD6D2',
                           top: `${100 - bottomZeroPct}%`,
                           height: `${expenseHeight}%`,
                           borderBottomLeftRadius: '4px',
                           borderBottomRightRadius: '4px',
                         }}
                       />
                     )}
                  </div>
                );
              })}
            </div>

            {/* Foreground Line */}
            {showNet && (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible pointer-events-none z-10">
                <polyline 
                  points={toPoints('net')} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-[#243B53]" 
                  vectorEffect="non-scaling-stroke" 
                />
              </svg>
            )}

            {/* Points */}
            {showNet && series.map((d, i) => {
              const isMuted = selectedIdx !== null && selectedIdx !== i;
              return (
                <span 
                  key={`m-${i}`}
                  className={`absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#243B53] shadow-sm ring-[1.5px] ring-surface pointer-events-none z-10 transition-opacity duration-200 ${isMuted ? 'opacity-40' : 'opacity-100'}`}
                  style={{ left: `${xPct(i)}%`, top: `${100 - yPct(d.net)}%` }}
                />
              );
            })}

            <div className="absolute inset-0 z-20 flex">
              {series.map((d, i) => (
                <div 
                  key={i} 
                  className="relative h-full flex-1 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdx(prev => prev === i ? null : i);
                  }}
                >
                  <div className={`absolute inset-0 transition-colors duration-200 ${hoveredIdx === i ? 'bg-surface-variant/10' : ''}`} />
                </div>
              ))}
            </div>

            {/* Dynamic Tooltip */}
            {hoveredIdx !== null && (
              (() => {
                const activeData = series[hoveredIdx];
                let peakValue = 0;
                if (showIncome) peakValue = Math.max(peakValue, activeData.income);
                if (showNet) peakValue = Math.max(peakValue, activeData.net);
                const topEdgePct = 100 - yPct(peakValue);
                
                const isTopTight = topEdgePct < 30;
                const isLeftTight = hoveredIdx === 0 || hoveredIdx === 1;
                const isRightTight = hoveredIdx === series.length - 1 || hoveredIdx === series.length - 2;

                return (
                  <div 
                    className="pointer-events-none absolute z-50 rounded-lg bg-surface p-3 text-[11px] text-on-surface shadow-lg border border-surface-container-highest w-max max-w-[220px]"
                    style={{
                      left: `${xPct(hoveredIdx)}%`,
                      top: `${topEdgePct}%`,
                      transform: `translate(${isRightTight ? '-110%' : isLeftTight ? '10%' : '-50%'}, ${isTopTight ? '20px' : '-110%'})`
                    }}
                  >
                    <div className="mb-2 font-bold text-[12px] border-b border-surface-container-highest pb-1">{activeData.label}</div>
                    {showIncome && (
                      <div className="flex justify-between gap-4 font-medium text-[#596B58]">
                        <span>Income:</span>
                        <span>{formatCurrency(activeData.income)}</span>
                      </div>
                    )}
                    {showExpense && (
                      <div className={`flex justify-between gap-4 font-medium text-[#C92A2A] ${showIncome ? 'mt-0.5' : ''}`}>
                        <span>Expense:</span>
                        <span>{formatCurrency(activeData.expense)}</span>
                      </div>
                    )}
                    {showNet && (
                      <div className={`flex justify-between gap-4 font-bold text-[#243B53] ${(showIncome || showExpense) ? 'mt-1.5 border-t border-surface-container-highest pt-1.5' : ''}`}>
                        <span>Net Cash Flow:</span>
                        <span>{formatCurrency(activeData.net)}</span>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>

          {/* X-Axis Labels embedded inside scroll area */}
          <div 
            className="relative h-6 shrink-0 mt-3"
            style={{ minWidth: isAllTime ? `${Math.max(100, series.length * (100 / 6))}%` : '100%' }}
          >
            {series.map((d, i) => (
              <span 
                key={i} 
                className="absolute -translate-x-1/2 text-center text-[10px] font-medium text-on-surface-variant whitespace-nowrap"
                style={{ left: `${xPct(i)}%` }}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-4 sm:gap-6 shrink-0 bg-surface z-10 pt-2 pb-1">
        {showIncome && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: '#D4E7CE' }}></span>
            <span className="text-[10px] sm:text-[11px] font-medium text-on-surface">Income</span>
          </div>
        )}
        {showExpense && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: '#FFD6D2' }}></span>
            <span className="text-[10px] sm:text-[11px] font-medium text-on-surface">Expense</span>
          </div>
        )}
        {showNet && (
          <div className="flex items-center gap-2">
            <span className="h-0 w-3 border-t-[3px] border-solid border-[#243B53]"></span>
            <span className="text-[10px] sm:text-[11px] font-medium text-on-surface">Net Cash Flow</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[], total: number }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: typeof data[0] } | null>(null);

  if (total === 0 || data.length === 0) return <div className="h-64 flex items-center justify-center text-on-surface-variant font-body-sm">No expense data available</div>;
  const getCoordinatesForPercent = (percent: number, radius: number) => {
    const x = radius * Math.cos(2 * Math.PI * percent);
    const y = radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Pre-calculate rendering percentages to account for round linecaps
  const activeSlices = data.filter(d => d.value > 0);
  const baseRadius = 0.8;
  const strokeW = 0.25;
  const capPercent = strokeW / (2 * Math.PI * baseRadius); 
  const visibleGap = 0.015; // ~5 degrees visual gap
  const GAP_PERCENT = activeSlices.length > 1 ? (capPercent + visibleGap) : 0;
  
  const totalGap = activeSlices.length * GAP_PERCENT;
  const availableSpace = Math.max(0, 1 - totalGap);
  
  const unnormalizedSlices = data.map(slice => {
    if (slice.value === 0 || total === 0) return { ...slice, renderedPercent: 0 };
    const rawPercent = slice.value / total;
    return { ...slice, renderedPercent: Math.max(0.001, rawPercent * availableSpace) };
  });
  
  const sumRendered = unnormalizedSlices.reduce((sum, s) => sum + s.renderedPercent, 0);
  const normalizationFactor = sumRendered > 0 ? availableSpace / sumRendered : 1;
  
  const slices = unnormalizedSlices.reduce((acc, slice) => {
    if (slice.renderedPercent === 0) {
      acc.push({ ...slice, slicePercent: 0, startPercent: 0, endPercent: 0 });
      return acc;
    }
    const finalRendered = slice.renderedPercent * normalizationFactor;
    const prev = acc.slice().reverse().find(s => s.slicePercent > 0);
    const startPercent = prev ? prev.endPercent + GAP_PERCENT : 0;
    const endPercent = startPercent + finalRendered;
    
    acc.push({ ...slice, slicePercent: slice.value / total, startPercent, endPercent });
    return acc;
  }, [] as (typeof data[0] & { slicePercent: number; startPercent: number; endPercent: number })[]);

  return (
    <div 
      className="flex flex-row flex-wrap items-center justify-center h-full gap-x-10 gap-y-6 w-full relative"
      onClick={() => setSelectedIdx(null)}
    >
      <div className="relative w-56 h-56 shrink-0">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full overflow-visible">
          {slices.map((slice, i) => {
            if (slice.slicePercent === 0) return null;
            
            const isSelected = selectedIdx === i;
            const isOtherSelected = selectedIdx !== null && selectedIdx !== i;
            // Pop out selected segment
            const currentRadius = isSelected ? 0.85 : 0.8;
            const currentStrokeW = 0.25; 
            
            if (slice.slicePercent === 1) {
              return (
                <circle 
                  key={i} 
                  cx="0" cy="0" r={currentRadius} fill="none" stroke={slice.color} strokeWidth={currentStrokeW}
                  className={`transition-all duration-300 cursor-pointer ${isOtherSelected ? 'opacity-40' : 'opacity-100 hover:opacity-85'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedIdx(isSelected ? null : i); }}
                  onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, data: slice })}
                  onMouseMove={(e) => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            }

            const [startX, startY] = getCoordinatesForPercent(slice.startPercent, currentRadius);
            const [endX, endY] = getCoordinatesForPercent(slice.endPercent, currentRadius);
            const largeArcFlag = slice.endPercent - slice.startPercent > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
            ].join(' ');

            return (
              <path 
                key={i} 
                d={pathData} 
                fill="none" 
                stroke={slice.color} 
                strokeWidth={currentStrokeW} 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-all duration-300 cursor-pointer ${isOtherSelected ? 'opacity-40' : 'opacity-100 hover:opacity-85'}`}
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(isSelected ? null : i); }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, data: slice })}
                onMouseMove={(e) => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1 line-clamp-2 text-center break-words">
            {selectedIdx !== null ? data[selectedIdx].label : "Total Expense"}
          </span>
          <span className="text-[16px] font-bold text-on-surface truncate w-full">
            {selectedIdx !== null ? formatCurrency(data[selectedIdx].value) : formatCurrency(total)}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 flex-1 min-w-[240px] max-w-full">
        {data.map((d, i) => {
          const isSelected = selectedIdx === i;
          const isOtherSelected = selectedIdx !== null && selectedIdx !== i;
          return (
            <div 
              key={i} 
              className={`flex items-center gap-3 text-[13px] w-full p-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-surface-container-low shadow-sm' : 'hover:bg-surface-container-lowest'} ${isOtherSelected ? 'opacity-50' : 'opacity-100'}`}
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(isSelected ? null : i); }}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
              <span className={`truncate flex-1 ${isSelected ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'}`}>{d.label}</span>
              <span className="font-semibold tabular-nums text-on-surface text-right shrink-0">{formatCurrency(d.value)}</span>
              <span className="font-bold w-10 text-right tabular-nums text-on-surface-variant shrink-0">{((d.value / total) * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>

      {tooltip && (
        <div 
          className="fixed z-50 pointer-events-none bg-inverse-surface text-inverse-on-surface px-3 py-2 rounded-lg text-xs shadow-lg transform -translate-x-1/2 -translate-y-[calc(100%+12px)]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-semibold mb-1">{tooltip.data.label}</div>
          <div className="flex justify-between gap-4">
            <span>{formatCurrency(tooltip.data.value)}</span>
            <span className="font-bold">{((tooltip.data.value / total) * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
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
  const [metricFilter, setMetricFilter] = useState('All');

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    Promise.allSettled([
      (async () => {
        let allTx: Transaction[] = [];
        let page = 1;
        while (allTx.length < 2000) {
          const res = await listTransactionsApi(accessToken, { page, limit: 100 });
          if (!res.success) throw new Error(res.message);
          allTx = [...allTx, ...res.data.transactions];
          if (res.data.transactions.length < 100) break;
          page++;
        }
        return { success: true, data: { transactions: allTx } };
      })(),
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

  // Chart Data: Cash Flow Trend
  const trendDataMap: Record<string, { income: number; expense: number; timestamp: number }> = {};
  
  if (period === 'All Time') {
    if (transactions.length > 0) {
      const dates = transactions.map(t => new Date(t.created_at).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      
      while (current <= end) {
        const monthStr = current.toLocaleString('default', { month: 'short', year: 'numeric' });
        trendDataMap[monthStr] = { income: 0, expense: 0, timestamp: current.getTime() };
        current.setMonth(current.getMonth() + 1);
      }
      
      transactions.forEach(t => {
        const d = new Date(t.created_at);
        const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (t.type === 'income') trendDataMap[monthStr].income += parseFloat(t.amount);
        if (t.type === 'expense') trendDataMap[monthStr].expense += Math.abs(parseFloat(t.amount));
      });
    }
  } else {
    // Specific month: aggregate by week
    filteredTransactions.forEach(t => {
      const d = new Date(t.created_at);
      const dateNum = d.getDate();
      const weekNum = Math.min(4, Math.ceil(dateNum / 7)); 
      const weekStr = `Week ${weekNum}`;
      if (!trendDataMap[weekStr]) {
        trendDataMap[weekStr] = { income: 0, expense: 0, timestamp: weekNum };
      }
      if (t.type === 'income') trendDataMap[weekStr].income += parseFloat(t.amount);
      if (t.type === 'expense') trendDataMap[weekStr].expense += Math.abs(parseFloat(t.amount));
    });
    // Ensure all 4 weeks are present for the month to keep the timeline consistent
    for (let w = 1; w <= 4; w++) {
      if (!trendDataMap[`Week ${w}`]) {
        trendDataMap[`Week ${w}`] = { income: 0, expense: 0, timestamp: w };
      }
    }
  }

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
  let trueTotalExpense = 0;
  
  filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
    const amount = Math.abs(parseFloat(t.amount));
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amount;
    trueTotalExpense += amount;
  });
  
  const top4Colors = ['#667000', '#8FAF00', '#B7D000', '#CFE1CA'];
  const othersColor = '#D8DFE9';
  
  let donutData = Object.keys(expenseByCategory)
    .map(k => ({ label: k, value: expenseByCategory[k] }))
    .sort((a, b) => b.value - a.value);
    
  if (donutData.length > 4) {
    const top = donutData.slice(0, 4);
    const otherVal = donutData.slice(4).reduce((sum, d) => sum + d.value, 0);
    donutData = [...top, { label: 'Others', value: otherVal }];
  }
  
  const donutChartData = donutData.map((d, i) => ({
    ...d,
    color: d.label === 'Others' ? othersColor : top4Colors[i % top4Colors.length]
  }));

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
    <div className="flex flex-col gap-gutter">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
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
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Cash Flow Trend</h2>
              <p className="font-body-sm text-on-surface-variant">Income and expenses over time.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface border border-surface-container-high rounded-lg p-1 card-shadow self-start sm:self-auto">
              <select 
                value={metricFilter} 
                onChange={(e) => setMetricFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-on-surface py-1 px-2 outline-none cursor-pointer appearance-none"
              >
                 <option value="All">All</option>
                 <option value="Income">Income</option>
                 <option value="Expense">Expense</option>
                 <option value="Net Cash Flow">Net Cash Flow</option>
              </select>
              <div className="pr-2 text-on-surface-variant pointer-events-none">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
             {isLoading ? (
               <div className="flex-1 flex items-center justify-center text-on-surface-variant">Loading chart...</div>
             ) : (
               <SimpleLineChart data={trendData} isAllTime={period === 'All Time'} metricFilter={metricFilter} />
             )}
          </div>
        </div>
        <div className="lg:col-span-1 overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow flex flex-col">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Expense Breakdown</h2>
            <p className="font-body-sm text-on-surface-variant">Distribution of spending across categories.</p>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
             {isLoading ? (
               <div className="h-64 flex items-center justify-center text-on-surface-variant">Loading chart...</div>
             ) : (
               <DonutChart data={donutChartData} total={trueTotalExpense} />
             )}
          </div>
        </div>
      </div>

      {/* AI Section Row */}
      <div className="grid grid-cols-1 gap-gutter">
        {/* AI Audit Summary & Risk Distribution */}
        <div className="flex flex-col gap-gutter">
          {/* AI Audit Summary */}
          <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface p-5 card-shadow relative">
            <div className="flex flex-col gap-1 mb-6">
              <div className="flex items-center gap-2">
                 <ChartBarIcon className="h-5 w-5 text-primary" />
                 <h2 className="font-headline-sm text-headline-sm text-on-surface">AI Audit Summary</h2>
              </div>
              <p className="font-body-sm text-on-surface-variant">{period}</p>
            </div>
            
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
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Risk Distribution</h2>
            <div className="flex flex-col gap-4">
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
      </div>

      {/* Recent AI Findings */}
      <div className="flex flex-col gap-4">
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
                      <td className="px-4 py-3 text-center font-semibold text-on-surface">{finding.risk_score}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge tone={RISK_TONES[finding.risk_level]} dot>
                          {RISK_LABELS[finding.risk_level]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-on-surface-variant">
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
