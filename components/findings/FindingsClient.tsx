'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MagnifyingGlassIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Badge, { type BadgeTone } from '@/components/common/Badge';
import { FilterSelect, FILTER_INPUT_CLASSES } from '@/components/common/FilterControls';
import EvidenceModal from '@/components/findings/EvidenceModal';
import RippleButton, { PRIMARY_ACTION_CLASSES } from '@/components/common/RippleButton';
import { DataLoadingSkeleton, DataErrorState } from '@/components/common/DataState';
import { useAnalysisRun, type LogLine } from '@/lib/hooks/use-analysis-run';
import {
  listFindingsApi,
  findingsSummaryApi,
  ApiError,
  type Finding,
  type FindingsSummary,
  type FindingStatusFilter,
  type RiskLevel,
} from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatTimestamp } from '@/lib/format/datetime';

const RISK_TONES: Record<RiskLevel, BadgeTone> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const RISK_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const LOG_TONES: Record<LogLine['tone'], string> = {
  info: 'text-on-surface-variant',
  finding: 'text-on-surface',
  clean: 'text-on-surface-variant',
  error: 'text-error',
};

const CARD = 'rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-shadow';

/**
 * One of the three agents.
 *
 * Three, not the four the mockup drew: agent 3 both reviews the detectives and
 * writes the final narrative, so a separate "Synthesizer" would be a box with
 * nothing behind it.
 *
 * State comes from the run, not from the individual agent. The pipeline has no
 * per-agent telemetry — agents 1 and 2 run on pool threads inside a synchronous
 * function — so lighting these up individually would be animation, not status.
 */
function AgentNode({
  icon: Icon,
  name,
  role,
  active,
  done,
}: {
  icon: typeof MagnifyingGlassIcon;
  name: string;
  role: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
        active
          ? 'border-primary/40 bg-primary-container/30'
          : done
            ? 'border-outline-variant/30 bg-surface-container-low'
            : 'border-outline-variant/30 bg-surface-container-low opacity-60'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
        }`}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-headline-sm text-body-md text-on-surface">{name}</p>
        <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{role}</p>
      </div>
      {active && (
        <span aria-hidden="true" className="ml-auto h-2 w-2 shrink-0 animate-ping rounded-full bg-primary" />
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
  children,
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'error' | 'primary';
  children?: React.ReactNode;
}) {
  return (
    <div className={`${CARD} flex flex-col justify-between`}>
      <div>
        <p className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
          {tone && (
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${tone === 'error' ? 'bg-error' : 'bg-primary'}`}
            />
          )}
          {label}
        </p>
        <p className="mt-4 font-kpi-value text-kpi-value text-on-surface">{value}</p>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export default function FindingsClient() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const run = useAnalysisRun();

  const [summary, setSummary] = useState<FindingsSummary | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evidenceFor, setEvidenceFor] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<FindingStatusFilter>('open');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const limit = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, riskFilter, findings.length]);

  const year = new Date().getFullYear();
  const [showRunForm, setShowRunForm] = useState(false);
  const [startDate, setStartDate] = useState(`${year}-01-01`);
  const [endDate, setEndDate] = useState(`${year}-12-31`);
  const [force, setForce] = useState(false);

  const logRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [s, f] = await Promise.all([
        findingsSummaryApi(accessToken),
        listFindingsApi(accessToken, {
          status: statusFilter,
          risk_level: riskFilter === 'all' ? undefined : riskFilter,
          limit,
        }),
      ]);
      setSummary(s.data.summary);
      setFindings(f.data.findings ?? []);
    } catch (e) {
      // Loudly. The prototype this replaces swallowed failures and rendered an
      // empty queue, so an unreachable backend read as "nothing to action".
      setError(e instanceof ApiError ? e.message : 'Could not load findings.');
      setFindings([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, statusFilter, riskFilter]);

  useEffect(() => {
    // Fetch on mount. This is the React-documented data-fetching-in-effect
    // pattern — the rule flags it because `load` sets loading synchronously,
    // but there is no event handler that can trigger the first fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // A finished run changes both the queue and the counts.
  const runStatus = run.status;
  useEffect(() => {
    // Reload after a backfill completes. Same pattern as above: the trigger is
    // a state change, not a user event.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (runStatus === 'done') load();
  }, [runStatus, load]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [run.log]);

  const running = run.status === 'running';
  const pct = run.progress.total > 0 ? Math.round((run.progress.index / run.progress.total) * 100) : 0;

  const maxLevelCount = useMemo(() => {
    const counts = Object.values(summary?.per_tingkat ?? {});
    return counts.length ? Math.max(...counts) : 0;
  }, [summary]);

  const totalPages = Math.ceil(findings.length / itemsPerPage);
  const paginatedFindings = findings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startRun = () => {
    if (!accessToken) return;
    setShowRunForm(false);
    run.start({ startDate, endDate, force }, accessToken);
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface">Findings</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            Risk-scored results from the audit pipeline, each with the evidence behind it.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={run.halt}
            disabled={!running}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-surface-container-high px-5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
          >
            <StopIcon aria-hidden="true" className="h-5 w-5" />
            Halt
          </button>
          <RippleButton
            type="button"
            onClick={() => setShowRunForm((v) => !v)}
            disabled={running}
            className={PRIMARY_ACTION_CLASSES}
          >
            <PlayIcon aria-hidden="true" className="h-5 w-5" />
            Run analysis
          </RippleButton>
        </div>
      </header>

      {showRunForm && (
        <div className={`${CARD} flex flex-wrap items-end gap-4`}>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              From
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${FILTER_INPUT_CLASSES} px-3`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              To
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${FILTER_INPUT_CLASSES} px-3`}
            />
          </label>
          <label className="flex items-center gap-2 pb-1">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Re-check transactions already marked clean
            </span>
          </label>
          <RippleButton
            type="button"
            onClick={startRun}
            className={`ml-auto ${PRIMARY_ACTION_CLASSES}`}
          >
            Start
          </RippleButton>
        </div>
      )}

      {/* ---- Pipeline -------------------------------------------------- */}
      <section className={CARD}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-headline-md text-headline-sm text-on-surface">Pipeline</h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Python detectors screen every expense; the three agents only run for the ones that
              come back as candidates.
            </p>
          </div>
          <Badge tone={running ? 'high' : run.status === 'error' ? 'critical' : run.status === 'done' ? 'success' : 'neutral'}>
            {running ? 'Running' : run.status === 'idle' ? 'Idle' : run.status.charAt(0).toUpperCase() + run.status.slice(1)}
          </Badge>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-3">
            <AgentNode
              icon={MagnifyingGlassIcon}
              name="Investigator 1"
              role="Financial analytics"
              active={running}
              done={run.status === 'done'}
            />
            <AgentNode
              icon={FingerPrintIcon}
              name="Investigator 2"
              role="Fraud patterns"
              active={running}
              done={run.status === 'done'}
            />
          </div>
          <ChevronRightIcon
            aria-hidden="true"
            className="mx-auto hidden h-6 w-6 text-outline-variant md:block"
          />
          <AgentNode
            icon={ShieldCheckIcon}
            name="Reviewer"
            role="Verifies both, writes the finding"
            active={running}
            done={run.status === 'done'}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>
              {run.progress.total > 0
                ? `${run.progress.index} of ${run.progress.total} transactions`
                : 'No run yet'}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ['New findings', run.counters.created],
                ['Updated', run.counters.updated],
                ['Clean', run.counters.clean],
                ['Failed', run.counters.failed],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className={`rounded-lg px-3 py-2 border ${
                label === 'Failed' ? 'bg-red-100 border-red-200' :
                label === 'New findings' ? 'bg-amber-50 border-amber-200' :
                label === 'Updated' ? 'bg-blue-50 border-blue-200' :
                label === 'Clean' ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-container-low border-surface-container-high'
              }`}>
                <dt className={`font-label-sm text-label-sm uppercase tracking-wide ${
                  label === 'Failed' ? 'text-red-800' :
                  label === 'New findings' ? 'text-amber-800' :
                  label === 'Updated' ? 'text-blue-800' :
                  label === 'Clean' ? 'text-emerald-800' : 'text-on-surface-variant'
                }`}>
                  {label}
                </dt>
                <dd className={`font-kpi-value text-body-lg ${
                  label === 'Failed' ? 'text-red-800' :
                  label === 'New findings' ? 'text-amber-800' :
                  label === 'Updated' ? 'text-blue-800' :
                  label === 'Clean' ? 'text-emerald-800' : 'text-on-surface'
                }`}>{value}</dd>
              </div>
            ))}
          </dl>

          {run.log.length > 0 && (
            <div
              ref={logRef}
              className="mt-4 max-h-48 overflow-y-auto rounded-lg bg-surface-container-low p-3 font-body-sm text-body-sm"
            >
              {run.log.map((line) => (
                <p key={line.id} className={LOG_TONES[line.tone]}>
                  {line.text}
                </p>
              ))}
            </div>
          )}

          {run.error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{run.error}</span>
            </div>
          )}
        </div>
      </section>

      {/* ---- Counts ---------------------------------------------------- */}

      {summary && (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="md:col-span-3">
            <KpiCard label="Needs action" value={summary.perlu_tindakan} tone="error">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {summary.perlu_ditinjau} more to review
              </p>
            </KpiCard>
          </div>

          <div className="md:col-span-3">
            <KpiCard label="Resolved" value={summary.selesai} tone="primary">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${summary.clear_rate ?? 0}%` }}
                />
              </div>
              <p className="mt-2 text-right font-body-sm text-body-sm text-on-surface-variant">
                {summary.clear_rate == null ? 'No findings yet' : `${summary.clear_rate}% clear rate`}
              </p>
            </KpiCard>
          </div>

          <div className={`md:col-span-6 ${CARD}`}>
            <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Open by risk level
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {RISK_ORDER.map((level) => {
                const count = summary.per_tingkat[level] ?? 0;
                // Relative to the largest bucket, so the bars compare with each
                // other rather than against an arbitrary scale.
                const width = maxLevelCount > 0 ? (count / maxLevelCount) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-4">
                    <span className="w-16 text-right font-label-sm text-label-sm text-on-surface-variant">
                      {RISK_LABELS[level]}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className={`h-full rounded-full ${
                          level === 'critical'
                            ? 'bg-red-600'
                            : level === 'high'
                              ? 'bg-rose-400'
                              : level === 'medium'
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-8 font-table-data text-table-data font-semibold text-on-surface">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---- Queue ----------------------------------------------------- */}
      <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-high p-6">
          <div>
            <h2 className="font-headline-md text-headline-sm text-on-surface">Findings queue</h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Ordered by severity, then score.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-36"
            >
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </FilterSelect>
            <FilterSelect
              label="Filter by risk level"
              value={riskFilter}
              onChange={setRiskFilter}
              className="w-36"
            >
              <option value="all">All risks</option>
              {RISK_ORDER.map((level) => (
                <option key={level} value={level}>
                  {RISK_LABELS[level]}
                </option>
              ))}
            </FilterSelect>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              aria-label="Reload findings"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
            >
              <ArrowPathIcon aria-hidden="true" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error ? (
          <DataErrorState message={error} onRetry={load} />
        ) : loading && findings.length === 0 ? (
          <div className="p-6">
            <DataLoadingSkeleton columns={6} rows={6} />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="w-20 px-6 py-4">ID</th>
                <th className="w-44 px-6 py-4">Created</th>
                <th className="min-w-[300px] px-6 py-4">Finding</th>
                <th className="w-32 px-6 py-4 text-center">Risk</th>
                <th className="w-20 px-6 py-4 text-center">Score</th>
                <th className="w-12 px-6 py-4" />
              </tr>
            </thead>
            <tbody className="font-table-data text-table-data text-on-surface">
              {paginatedFindings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => setEvidenceFor(f.id)}
                  className={`group cursor-pointer border-b border-surface-container-high transition-colors last:border-0 hover:bg-surface-container-low ${
                    f.resolution ? 'opacity-70' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-tertiary">#{f.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-on-surface-variant">
                    {formatTimestamp(f.created_at, '—')}
                  </td>
                  <td className="max-w-md px-6 py-4">
                    <p
                      className={`truncate font-medium transition-colors group-hover:text-primary ${
                        f.resolution ? 'text-on-surface-variant line-through' : ''
                      }`}
                    >
                      {f.description}
                    </p>
                    <p className="mt-0.5 truncate font-body-sm text-body-sm text-on-surface-variant">
                      {f.recommended_action}
                    </p>
                    {f.narrative_stale && (
                      <span className="mt-1 inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                        <ClockIcon aria-hidden="true" className="h-3.5 w-3.5" />
                        Narrative predates the latest transactions
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {f.resolution ? (
                      <Badge tone="success">Resolved</Badge>
                    ) : (
                      <Badge tone={RISK_TONES[f.risk_level]} dot>
                        {RISK_LABELS[f.risk_level]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-kpi-value text-body-lg">{f.risk_score}</td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-outline-variant transition-colors group-hover:text-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && findings.length === 0 && !error && (
            <p className="p-10 text-center font-body-md text-body-md text-on-surface-variant">
              Nothing in this view.{' '}
              {summary
                ? `${summary.aman} of ${summary.total_transaksi} expenses have been checked and came back clean.`
                : ''}
            </p>
          )}
        </div>

        {findings.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-container-high px-6 py-4">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, findings.length)} of {findings.length} entries
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="rounded-lg border border-outline-variant/50 px-4 py-1.5 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="rounded-lg border border-outline-variant/50 px-4 py-1.5 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </section>

      <EvidenceModal
        findingId={evidenceFor}
        onClose={() => setEvidenceFor(null)}
        onResolved={load}
      />
    </div>
  );
}
