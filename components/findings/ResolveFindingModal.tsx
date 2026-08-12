'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/common/Modal';
import { resolveFindingApi, ApiError, type Resolution } from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';

const RESOLUTIONS: { value: Resolution; label: string; hint: string }[] = [
  { value: 'justified', label: 'Justified', hint: 'There is a legitimate explanation' },
  { value: 'false_positive', label: 'False positive', hint: 'The detection was wrong' },
  { value: 'confirmed_fraud', label: 'Confirmed fraud', hint: 'Verified and acted on' },
  { value: 'escalated', label: 'Escalated', hint: 'Reported upward' },
];

interface ResolveFindingModalProps {
  open: boolean;
  findingId: number | null;
  onClose: () => void;
  /** Fired after a successful resolve so the page can refresh its list and counts. */
  onResolved: () => void;
}

/**
 * The second modal in the resolve flow: FindingsClient -> FindingDetailModal
 * -> here. Picking a resolution type only selects it — nothing is submitted
 * until "Confirm & close finding" is pressed. There is no unresolve endpoint
 * anywhere in the backend, so this is genuinely permanent, which is exactly
 * why it needs its own explicit confirmation step rather than firing on the
 * first click like the old inline flow did.
 */
export default function ResolveFindingModal({
  open,
  findingId,
  onClose,
  onResolved,
}: ResolveFindingModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setResolution(null);
    setNote('');
    setSaving(false);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const confirm = async () => {
    if (findingId == null || !accessToken || !resolution) return;
    setSaving(true);
    try {
      await resolveFindingApi(findingId, { resolution, note: note.trim() || undefined }, accessToken);
      toast.success('Finding closed.');
      reset();
      onResolved();
      onClose();
    } catch (e) {
      // The prototype fired this and forgot: a rejected resolution left the card
      // sitting there with no explanation. Say so instead.
      toast.error(e instanceof ApiError ? e.message : 'Could not close the finding.');
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={findingId != null ? `Close finding #${findingId}` : 'Close finding'}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="h-10 rounded-lg px-4 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!resolution || saving}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckIcon aria-hidden="true" className="h-[18px] w-[18px]" />
            {saving ? 'Closing...' : 'Confirm & close finding'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Pick a reason, then confirm. This can&apos;t be undone from here.
        </p>

        {/* Not a checkbox: WHY a finding was closed matters more than that it
            was. Ten z-score findings closed as "justified" in a row is a
            signal the threshold is too tight — a boolean never says that. */}
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Resolution">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={resolution === r.value}
              title={r.hint}
              onClick={() => setResolution(r.value)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                resolution === r.value
                  ? 'border-primary bg-primary-container text-on-primary-container'
                  : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="font-body-sm text-body-sm font-semibold">{r.label}</span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant">{r.hint}</span>
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Note (optional)"
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>
    </Modal>
  );
}
