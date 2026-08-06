'use client';

import { useSyncExternalStore } from 'react';

// The wall clock is an external mutable source, so it is read through
// useSyncExternalStore rather than an effect + setState. The server snapshot is
// null, which keeps the first client render identical to the server's markup —
// a plain `new Date()` in render would hydrate with a different string.

const subscribe = (onStoreChange: () => void) => {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
};

// Truncated to whole seconds so the snapshot stays referentially equal between
// ticks; handing back a fresh Date on every read would re-render forever.
const getSnapshot = () => Math.floor(Date.now() / 1000);

const getServerSnapshot = () => null;

/** Ticks once per second on the client. `null` until hydrated. */
export function useNow(): Date | null {
  const seconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return seconds === null ? null : new Date(seconds * 1000);
}
