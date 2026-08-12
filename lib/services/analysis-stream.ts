import { clearSessionOutsideReact } from '@/lib/stores/auth.store';
import { ApiError, type Finding, type RiskLevel } from '@/lib/services/api';

/**
 * The analysis stream, read by hand rather than with EventSource.
 *
 * EventSource cannot be used here for two independent reasons: it cannot set an
 * Authorization header, and this session lives in localStorage with no cookie
 * anywhere to fall back on; and it only issues GETs, while a run is a POST
 * carrying a date range. So: fetch, then read the body ourselves.
 *
 * Same origin as every other call — next.config.ts rewrites /api/v1/* to the
 * backend, and the backend is the only party holding the agent server's key.
 */

const API_BASE_URL = '/api/v1';

export type RunPhase = 'created' | 'updated' | 'clean' | 'failed';

export interface RunSummary {
  diperiksa: number;
  temuan_baru: number;
  temuan_diperbarui: number;
  bersih: number;
  gagal: number;
}

export interface AnalysisEvent {
  status: 'info' | 'progress' | 'complete' | 'error';
  message?: string;
  /** info */
  total?: number;
  start_date?: string;
  end_date?: string;
  force?: boolean;
  /** progress */
  node?: 'finding' | 'clean' | 'error';
  phase?: RunPhase;
  index?: number;
  transaction_id?: number;
  finding_id?: number | null;
  risk_level?: RiskLevel | null;
  risk_score?: number | null;
  /** complete */
  summary?: RunSummary;
  findings?: Finding[];
}

/** One `data:` frame, or null for anything we should ignore (heartbeats, junk). */
export function parseFrame(frame: string): AnalysisEvent | null {
  const payload = frame
    .split('\n')
    // A line starting with ':' is a comment — that is what the relay's keepalive
    // is. Dropping them here is why a quiet run does not look like a broken one.
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

  if (!payload) return null;

  try {
    return JSON.parse(payload) as AnalysisEvent;
  } catch {
    // A malformed frame is not worth killing a run over; the next one is
    // probably fine, and `complete` carries the authoritative totals anyway.
    console.error('[analysis-stream] unparseable frame:', payload.slice(0, 200));
    return null;
  }
}

/**
 * Yields events until the run finishes, the caller aborts, or the connection
 * dies. Throws ApiError if the run could not be started at all.
 */
export async function* streamAnalysis(
  params: { startDate: string; endDate: string; force?: boolean },
  accessToken: string,
  signal: AbortSignal
): AsyncGenerator<AnalysisEvent> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/findings/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        startDate: params.startDate,
        endDate: params.endDate,
        force: params.force ?? false,
      }),
      signal,
    });
  } catch (error) {
    // An abort is the user pressing Halt, not a failure. Let it propagate as
    // itself so the caller can tell the two apart.
    if (signal.aborted) throw error;
    throw new ApiError('Network error. Unable to reach the server.', 0);
  }

  // Checked BEFORE touching the body, and this is the load-bearing line of the
  // whole file. A refusal — 409 because a run is already going, 503 because the
  // agent server is down — comes back as ordinary JSON, not as a stream. Read
  // it as a stream anyway and you get zero events, which renders as "nothing to
  // action here". For an audit tool, a dead backend that looks clean is the
  // worst failure available.
  if (!response.ok) {
    if (response.status === 401) clearSessionOutsideReact();

    let message = 'Internal server error. Please try again later.';
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await response.json();
        if (typeof body?.message === 'string') message = body.message;
      } catch {
        /* keep the generic message */
      }
    }
    throw new ApiError(message, response.status);
  }

  if (!response.body) {
    throw new ApiError('The analysis service returned an empty response.', 0);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Frames are separated by a blank line. Anything after the last separator
      // is a partial frame and waits for the next chunk.
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const frame of parts) {
        const event = parseFrame(frame);
        if (event) yield event;
      }
    }
  } finally {
    // Halting mid-run leaves bytes in flight; cancelling tells the relay to
    // close, which tells the agent server to stop. Safe at any point: runs are
    // resumable, so the next one continues rather than starting over.
    reader.cancel().catch(() => {});
  }
}
