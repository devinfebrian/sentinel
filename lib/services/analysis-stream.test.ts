import { describe, it, expect } from 'vitest';
import { parseFrame, type AnalysisEvent } from './analysis-stream';

describe('parseFrame', () => {
  it('parses a single data frame', () => {
    const event = parseFrame('data: {"status":"progress","index":1}\n\n');
    expect(event).toEqual({ status: 'progress', index: 1 });
  });

  it('joins multi-line data payloads', () => {
    const frame = 'data: {"status":"info"\ndata: ,"total":3}\n\n';
    expect(parseFrame(frame)).toEqual({ status: 'info', total: 3 });
  });

  it('drops keepalive comment lines', () => {
    // The relay writes ': keepalive\n\n' between frames; a frame with only
    // comments must read as nothing, not as a malformed event.
    expect(parseFrame(': keepalive\n\n')).toBeNull();
  });

  it('returns null for an empty payload', () => {
    expect(parseFrame('')).toBeNull();
  });

  it('returns null for a malformed frame', () => {
    // Malformed frames must not kill the run — the next frame is probably fine.
    expect(parseFrame('data: {broken\n\n')).toBeNull();
  });

  it('trims whitespace after the data: prefix', () => {
    const event = parseFrame('data:  {"status":"clean"}\n\n');
    expect(event).toEqual({ status: 'clean' });
  });

  it('reads through the full AnalysisEvent shape', () => {
    const event = parseFrame(
      'data: {"status":"complete","summary":{"diperiksa":2},"findings":[{"id":1}]}\n\n'
    ) as AnalysisEvent;
    expect(event.status).toBe('complete');
    expect(event.summary?.diperiksa).toBe(2);
    expect(event.findings).toHaveLength(1);
  });
});
