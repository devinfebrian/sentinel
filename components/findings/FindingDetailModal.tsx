'use client';

import React, { useEffect, useState } from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import ResolveFindingModal from '@/components/findings/ResolveFindingModal';
import {
  getFindingApi,
  getTransactionApi,
  ApiError,
  type FindingDetail,
  type Trigger,
  type Transaction,
} from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatTimestamp, formatDate } from '@/lib/format/datetime';

const number = (n: unknown) =>
  typeof n === 'number' ? n.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : String(n);

const formatIDR = (amountStr: string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Math.abs(parseFloat(amountStr))
  );

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
      {children}
    </p>
  );
}

function ProvenanceItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-surface-container px-2.5 py-1.5">
      <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <span className="font-body-sm text-body-sm break-words text-on-surface">{value}</span>
    </div>
  );
}

/**
 * One trigger and the numbers behind it.
 *
 * The technical figures live here rather than on the card. The card is for
 * whoever has to act; this panel is for whoever has to prove where the score
 * came from six months later.
 */
function TriggerRow({ trigger }: { trigger: Trigger }) {
  const d = trigger.detail ?? {};
  const stats: [string, unknown][] = [
    ['method', d.method],
    ['baseline n', d.n_baseline],
    ['median', d.median != null ? number(d.median) : null],
    ['MAD', d.mad != null ? number(d.mad) : null],
    ['threshold', d.threshold],
    ['computed value', d.computed_value],
    ['confidence', d.confidence],
    ['rule', d.rule],
    ['matches', d.match_count],
    ['total', d.total_amount != null ? number(d.total_amount) : null],
    ['approval limit', d.approval_threshold != null ? number(d.approval_threshold) : null],
    ['field evaluated', d.evaluated_field],
    ['recorded (WIB)', d.recorded_at_wib],
    ['input role', d.role],
    ['vendor status', d.vendor_status],
  ];
  const present = stats.filter(([, v]) => v !== null && v !== undefined);

  return (
    <div
      className={`rounded-lg border border-outline-variant/30 border-l-[3px] bg-surface-container-low p-4 ${
        trigger.amplifier_only ? 'border-l-outline opacity-90' : 'border-l-primary'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2.5">
        <span
          className={`font-kpi-value text-body-lg ${
            trigger.points > 0 ? 'text-error' : 'text-on-surface-variant'
          }`}
        >
          {trigger.points > 0 ? `+${trigger.points}` : '0'}
        </span>
        <code className="font-body-sm text-body-sm text-on-surface">{trigger.code}</code>
        {trigger.amplifier_only && <Badge tone="neutral">Amplifier</Badge>}
      </div>

      <p className="mb-3 font-body-sm text-body-sm text-on-surface">{trigger.narrative}</p>

      {present.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5">
          {present.map(([k, v]) => (
            <ProvenanceItem key={k} label={k} value={String(v)} />
          ))}
        </div>
      )}
    </div>
  );
}

/** One related transaction, enriched from `/transactions/{id}` rather than
    shown as a bare number — the id alone tells an auditor nothing actionable. */
function RelatedTransactionRow({ tx }: { tx: Transaction }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-body-sm text-body-sm font-medium text-on-surface">
          {tx.vendor_name ?? tx.description}
        </p>
        <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
          #{tx.id} · {formatDate(tx.created_at)} · {tx.category}
        </p>
      </div>
      <span className="shrink-0 font-body-sm text-body-sm font-semibold text-on-surface">
        {formatIDR(tx.amount)}
      </span>
    </div>
  );
}

interface FindingDetailModalProps {
  findingId: number | null;
  onClose: () => void;
  /** Fired after a successful resolve so the page can refresh its list and counts. */
  onResolved: () => void;
}

/**
 * Level one of the resolve flow: FindingsClient -> here -> ResolveFindingModal.
 * Purely read-only except for the "Close this finding" button, which opens
 * the second-level modal rather than resolving inline — resolving is a
 * permanent action (there is no unresolve endpoint anywhere in the backend)
 * and used to fire on the first button click with no confirmation.
 */
export default function FindingDetailModal({ findingId, onClose, onResolved }: FindingDetailModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<FindingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [relatedTx, setRelatedTx] = useState<Transaction[] | null>(null);
  const [relatedTxFailedCount, setRelatedTxFailedCount] = useState(0);

  // Switching from one finding to another must clear the previous finding's
  // state. This is state that depends on a prop, so it resets during render
  // rather than in the fetch effect below.
  const [shownId, setShownId] = useState<number | null>(findingId);
  if (shownId !== findingId) {
    setShownId(findingId);
    setData(null);
    setError(null);
    setResolveOpen(false);
    setRelatedTx(null);
    setRelatedTxFailedCount(0);
  }

  useEffect(() => {
    if (findingId == null || !accessToken) return;

    const controller = new AbortController();
    let ignore = false;

    getFindingApi(findingId, accessToken, controller.signal)
      .then((res) => {
        if (!ignore) setData(res.data.finding);
      })
      .catch((e) => {
        // An abort is us closing the panel, not a failure worth reporting.
        if (ignore || controller.signal.aborted) return;
        setError(e instanceof ApiError ? e.message : 'Could not load the evidence.');
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [findingId, accessToken]);

  // Fetches each related transaction individually (there is no batch-by-ids
  // endpoint) — the array is small (2-4 in the split-payment/duplicate-
  // invoice domain this exists for), so N parallel single-transaction
  // requests is simpler than adding a backend endpoint for it.
  useEffect(() => {
    if (!data || !accessToken) return;

    const controller = new AbortController();
    let ignore = false;

    Promise.allSettled(
      data.related_transaction_ids.map((id) => getTransactionApi(id, accessToken, controller.signal))
    ).then((results) => {
      if (ignore) return;
      const ok: Transaction[] = [];
      let failed = 0;
      for (const r of results) {
        if (r.status === 'fulfilled') ok.push(r.value.data.transaction);
        else failed += 1;
      }
      setRelatedTx(ok);
      setRelatedTxFailedCount(failed);
    });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [data, accessToken]);

  const ev = data?.evidence;
  const an = data?.analysis;
  const adjustment = an?.llm_semantic_adjustment ?? 0;

  return (
    <>
      <Modal
        open={findingId != null}
        onClose={onClose}
        title="Evidence"
        size="xl"
        // Level with the title rather than at the bottom of a long,
        // scrollable panel — resolving shouldn't require hunting for the
        // button.
        headerAction={
          data && !data.resolution ? (
            <button
              type="button"
              onClick={() => setResolveOpen(true)}
              // Fixed to dark mode's --primary/--on-primary regardless of
              // the active theme — same treatment as the Cash Flow Trend
              // bars, a bright accent this header action shouldn't lose in
              // light mode.
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#c3d661] px-3.5 font-label-sm text-label-sm text-[#2d3400] transition-opacity hover:opacity-90"
            >
              <CheckIcon aria-hidden="true" className="h-4 w-4" />
              Close finding
            </button>
          ) : undefined
        }
      >
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
            <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!data && !error && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Loading…</p>
        )}

        {data && (
          <div className="space-y-stack-md">
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {formatTimestamp(data.created_at, '—')}
              </p>
              <p className="mt-2 whitespace-pre-wrap font-body-md text-body-md text-on-surface">
                {data.description}
              </p>
            </div>

            {data.narrative_stale && (
              <div className="flex items-start gap-2 rounded-lg bg-tertiary-container px-3 py-2.5 font-body-sm text-body-sm text-on-tertiary-container">
                <ClockIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  More transactions joined this finding after it was written. The score and evidence
                  are current; the sentence above is not.
                </span>
              </div>
            )}

            <section className="space-y-2">
              <SectionLabel>Transactions ({data.related_transaction_ids.length})</SectionLabel>
              {relatedTx === null ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Loading…</p>
              ) : (
                <div className="space-y-1.5">
                  {relatedTx.map((tx) => (
                    <RelatedTransactionRow key={tx.id} tx={tx} />
                  ))}
                  {relatedTxFailedCount > 0 && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {relatedTxFailedCount} transaction{relatedTxFailedCount > 1 ? 's' : ''} could not be
                      loaded.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* The arithmetic, shown rather than asserted. */}
            <section className="space-y-2">
              <SectionLabel>Score</SectionLabel>
              <div className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm">
                <span className="rounded bg-surface-container px-2 py-1 text-on-surface-variant">
                  base {ev?.base_risk_score ?? 0}
                </span>
                <span
                  className={`rounded bg-surface-container px-2 py-1 ${
                    adjustment > 0 ? 'text-error' : adjustment < 0 ? 'text-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  {adjustment > 0 ? '+' : ''}
                  {adjustment} AI judgement
                </span>
                <span className="rounded bg-surface-container px-2 py-1 font-semibold text-on-surface">
                  = {data.risk_score}
                </span>
              </div>
              {an?.adjustment_reason && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Reason:</span> {an.adjustment_reason}
                </p>
              )}
              {ev?.capped && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Raw total was {ev.raw_score}, capped at the {ev.base_risk_score}-point base ceiling.
                </p>
              )}
            </section>

            {(an === null || an?.llm_review_failed) && (
              <div className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
                <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="font-semibold">AI analysis failed.</span> The score and evidence
                  below are still valid — Python computed them, not the model.
                </span>
              </div>
            )}

            <section className="space-y-2">
              <SectionLabel>Where the score came from</SectionLabel>
              <div className="space-y-2">
                {(ev?.triggers ?? []).map((t) => (
                  <TriggerRow key={`${t.code}-${t.points}`} trigger={t} />
                ))}
              </div>
              {(ev?.suppressed_triggers ?? []).length > 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Dropped to avoid double counting:{' '}
                  {ev!.suppressed_triggers.map((t) => t.code).join(', ')}
                </p>
              )}
            </section>

            {an?.investigation && (
              <section className="space-y-2">
                <SectionLabel>Investigation</SectionLabel>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1.5">
                  <ProvenanceItem
                    label="financial detective"
                    value={`${an.investigation.agent1_verdict ?? '—'}${
                      an.investigation.verdict_review?.agent1
                        ? ` → ${an.investigation.verdict_review.agent1}`
                        : ''
                    }`}
                  />
                  <ProvenanceItem
                    label="fraud detective"
                    value={`${an.investigation.agent2_verdict ?? '—'}${
                      an.investigation.verdict_review?.agent2
                        ? ` → ${an.investigation.verdict_review.agent2}`
                        : ''
                    }`}
                  />
                </div>
                {an.investigation.verdict_review?.reason && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {an.investigation.verdict_review.reason}
                  </p>
                )}
              </section>
            )}

            <section className="space-y-2">
              <SectionLabel>Provenance</SectionLabel>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1.5">
                <ProvenanceItem label="scored by" value={ev?.provenance?.scored_by ?? '—'} />
                <ProvenanceItem label="model" value={ev?.provenance?.llm_model ?? '—'} />
                <ProvenanceItem
                  label="verifier model"
                  value={ev?.provenance?.llm_model_verifier ?? '—'}
                />
              </div>
            </section>

            {/* Every finding ends in a verb. One without an action just creates anxiety. */}
            <section className="space-y-2 rounded-lg bg-surface-container-low p-4">
              <SectionLabel>Recommended action</SectionLabel>
              <p className="font-body-md text-body-md text-on-surface">{data.recommended_action}</p>

              {data.resolution && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Closed as <span className="font-semibold">{data.resolution}</span>
                  {data.resolved_at ? ` on ${formatTimestamp(data.resolved_at, '')}` : ''}
                  {data.resolved_by != null
                    ? ` by ${data.resolved_by === user?.id ? 'you' : `user #${data.resolved_by}`}`
                    : ''}
                  {data.resolution_note ? ` — ${data.resolution_note}` : ''}
                </p>
              )}
            </section>
          </div>
        )}
      </Modal>

      <ResolveFindingModal
        open={resolveOpen}
        findingId={findingId}
        onClose={() => setResolveOpen(false)}
        onResolved={() => {
          onResolved();
          onClose();
        }}
      />
    </>
  );
}
