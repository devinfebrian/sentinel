'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { askHistoryApi, AskHistory } from '@/lib/services/api';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

export function AskHistoryPanel() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [history, setHistory] = useState<AskHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [topic, setTopic] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchHistory = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await askHistoryApi(accessToken, {
        topic: topic || undefined,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setHistory(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch on mount. There is no event handler that can trigger the first
    // load, so the setState inside `fetchHistory` is expected here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [accessToken]);

  const handleApplyFilters = () => {
    fetchHistory();
  };

  const handleClearFilters = () => {
    setTopic('');
    setStartDate('');
    setEndDate('');
    // Need to fetch again with empty filters, so use setTimeout to let state update
    setTimeout(() => {
      fetchHistory();
    }, 0);
  };

  if (isMinimized) {
    return (
      <div className="w-14 border-l border-surface-container-high bg-surface flex flex-col shrink-0 h-full items-center py-4">
        <button
          onClick={() => setIsMinimized(false)}
          className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
          title="Expand History"
        >
          <ClockIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-surface-container-high bg-surface flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-surface-container-high flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-on-surface">
          <ClockIcon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">History</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters ? 'bg-primary-container text-on-primary-container' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
            title="Toggle filters"
          >
            <FunnelIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg transition-colors hover:bg-surface-container text-on-surface-variant"
            title="Minimize History"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 border-b border-surface-container-high bg-surface-container-lowest shrink-0 space-y-3">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Topic</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Search keywords..."
                className="w-full bg-surface border border-surface-container-highest rounded-lg pl-8 pr-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface border border-surface-container-highest rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface border border-surface-container-highest rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-on-surface-variant px-3 py-1.5 hover:bg-surface-container rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              className="text-xs font-semibold bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-surface-container-high rounded-xl bg-surface-container-lowest p-3 flex items-start gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 bg-surface-container rounded-md w-full animate-pulse" />
                  <div className="h-3.5 bg-surface-container rounded-md w-4/5 animate-pulse" />
                  <div className="h-2.5 bg-surface-container rounded-md w-1/3 animate-pulse mt-1" />
                </div>
                <div className="w-4 h-4 rounded bg-surface-container animate-pulse shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-error">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-6 text-sm text-on-surface-variant">No history found.</div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="border border-surface-container-high rounded-xl bg-surface-container-lowest overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full text-left p-3 hover:bg-surface-container transition-colors flex items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface line-clamp-2 leading-tight mb-1">
                    {item.question}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                {expandedId === item.id ? (
                  <ChevronUpIcon className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                )}
              </button>
              
              {expandedId === item.id && (
                <div className="px-3 pb-3 pt-1 border-t border-surface-container-highest/50">
                  <div className="text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
