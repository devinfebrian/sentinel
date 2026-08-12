'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  streamAnalysis,
  type AgentName,
  type AnalysisEvent,
  type RunPhase,
  type RunSummary,
} from '@/lib/services/analysis-stream';
import { ApiError, type Finding } from '@/lib/services/api';

export type RunStatus = 'idle' | 'running' | 'done' | 'halted' | 'error';

export interface LogLine {
  id: number;
  text: string;
  tone: 'info' | 'finding' | 'clean' | 'error';
}

// The console is a live tail, not an archive. The `complete` event carries the
// authoritative totals, so a line that has scrolled off has no job left.
const MAX_LOG_LINES = 200;

const EMPTY_COUNTERS: Record<RunPhase, number> = {
  created: 0,
  updated: 0,
  clean: 0,
  failed: 0,
};

const NO_ACTIVE_AGENTS: Record<AgentName, boolean> = {
  agent1: false,
  agent2: false,
  agent3: false,
};

export interface RunParams {
  startDate: string;
  endDate: string;
  force?: boolean;
}

/**
 * Drives one analysis run and keeps what the page needs to draw it.
 *
 * Halting is a client-side abort, and that is enough: the abort closes the
 * relay, the relay closes the upstream, and the agent server's generator stops
 * on its next yield. Nothing is corrupted by stopping early because runs are
 * resumable — already-checked transactions are skipped, so the next run picks
 * up the remainder rather than starting over.
 */
export function useAnalysisRun() {
  const [status, setStatus] = useState<RunStatus>('idle');
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const [counters, setCounters] = useState<Record<RunPhase, number>>(EMPTY_COUNTERS);
  const [activeAgents, setActiveAgents] = useState<Record<AgentName, boolean>>(NO_ACTIVE_AGENTS);
  const [log, setLog] = useState<LogLine[]>([]);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lineIdRef = useRef(0);

  const append = useCallback((text: string, tone: LogLine['tone']) => {
    lineIdRef.current += 1;
    const line = { id: lineIdRef.current, text, tone };
    setLog((prev) => (prev.length >= MAX_LOG_LINES ? [...prev.slice(1), line] : [...prev, line]));
  }, []);

  // A run still open when the page unmounts would keep the agent server paying
  // for LLM calls nobody is left to read.
  useEffect(() => () => abortRef.current?.abort(), []);

  const halt = useCallback(() => abortRef.current?.abort(), []);

  const start = useCallback(
    async (params: RunParams, accessToken: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('running');
      setProgress({ index: 0, total: 0 });
      setCounters(EMPTY_COUNTERS);
      setActiveAgents(NO_ACTIVE_AGENTS);
      setLog([]);
      setSummary(null);
      setError(null);

      const apply = (event: AnalysisEvent) => {
        switch (event.status) {
          case 'info':
            if (event.total != null) setProgress({ index: 0, total: event.total });
            if (event.message) append(event.message, 'info');
            break;

          case 'progress': {
            const { index, total, phase } = event;
            if (index != null && total != null) setProgress({ index, total });
            if (phase) setCounters((prev) => ({ ...prev, [phase]: prev[phase] + 1 }));

            // Clean rows advance the bar but would drown the console — on seed
            // data roughly nine in ten transactions are clean.
            if (event.message && phase !== 'clean') {
              append(event.message, event.node === 'error' ? 'error' : 'finding');
            }
            break;
          }

          // Only fired for candidate transactions — a clean row never touches
          // an agent, so `active` naturally stays false between candidates
          // without any extra reset.
          case 'agent':
            if (event.agent && event.agent_phase) {
              const isStarting = event.agent_phase === 'started';
              setActiveAgents((prev) => ({ ...prev, [event.agent!]: isStarting }));
            }
            break;

          case 'complete':
            if (event.summary) {
              setSummary(event.summary);
              const s = event.summary;
              append(
                `Finished. ${s.diperiksa} checked · ${s.temuan_baru} new · ` +
                  `${s.temuan_diperbarui} updated · ${s.bersih} clean · ${s.gagal} failed`,
                'info'
              );
            }
            if (event.findings) setFindings(event.findings);
            setActiveAgents(NO_ACTIVE_AGENTS);
            setStatus('done');
            break;

          case 'error':
            setError(event.message ?? 'The analysis run failed.');
            append(event.message ?? 'The analysis run failed.', 'error');
            setActiveAgents(NO_ACTIVE_AGENTS);
            setStatus('error');
            break;
        }
      };

      try {
        for await (const event of streamAnalysis(params, accessToken, controller.signal)) {
          apply(event);
        }
        // A stream can end without a `complete` event if the connection drops
        // partway. Only call it done if the run actually said so.
        setStatus((prev) => (prev === 'running' ? 'done' : prev));
      } catch (e) {
        if (controller.signal.aborted) {
          setActiveAgents(NO_ACTIVE_AGENTS);
          setStatus('halted');
          append('Halted. Transactions already checked will be skipped next run.', 'info');
          return;
        }

        const message = e instanceof ApiError ? e.message : 'The analysis run failed unexpectedly.';
        setError(message);
        append(message, 'error');
        setActiveAgents(NO_ACTIVE_AGENTS);
        setStatus('error');
      }
    },
    [append]
  );

  return { status, progress, counters, activeAgents, log, summary, findings, error, start, halt };
}
