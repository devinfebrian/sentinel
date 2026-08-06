// Pinned to Asia/Jakarta so the server and the browser format identically;
// reading the machine's own zone would produce different strings and break
// hydration. WIB is the operating timezone for this finance team.
const TIME_ZONE = 'Asia/Jakarta';

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

const clockFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
});

const dayDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

/** Wall clock, e.g. "21:03:47". */
export const formatClock = (value: Date) => clockFormatter.format(value);

/** Weekday and date, e.g. "Fri, 7 Aug 2026". */
export const formatDayDate = (value: Date) => dayDateFormatter.format(value);

/** Date and time, e.g. "12 Oct 2023, 21:03 WIB". */
export const formatTimestamp = (value: string | null, fallback: string) =>
  value ? `${dateTimeFormatter.format(new Date(value))} WIB` : fallback;

/** Date only, e.g. "Oct 12, 2023". */
export const formatDate = (value: string) => dateFormatter.format(new Date(value));
