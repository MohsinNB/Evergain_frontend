/**
 * Slot dates are plain "YYYY-MM-DD" strings in Asia/Dhaka wall-clock time (AGENTS.md §4).
 * We never let the browser's local timezone shift a slot's date.
 */

const DHAKA_TZ = 'Asia/Dhaka';

/** Today's date in Dhaka as "YYYY-MM-DD", regardless of the device timezone. */
export function todayInDhaka(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Parse "YYYY-MM-DD" into a UTC-midnight Date used ONLY for calendar arithmetic. */
function toUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

function fromUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(ymd: string, days: number): string {
  const date = toUtcDate(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtcDate(date);
}

/** Next `count` dates starting from `start` (inclusive). */
export function nextDays(start: string, count: number): string[] {
  const days: string[] = [];
  for (let i = 0; i < count; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

/** 0 = Sunday … 6 = Saturday (matches backend dayOfWeek). */
export function dayOfWeek(ymd: string): number {
  return toUtcDate(ymd).getUTCDay();
}

export interface DateParts {
  weekdayShort: string; // "Tue"
  weekdayLong: string; // "Tuesday"
  day: number; // 7
  monthShort: string; // "Oct"
}

export function dateParts(ymd: string): DateParts {
  const date = toUtcDate(ymd);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(date);
  return {
    weekdayShort: fmt({ weekday: 'short' }),
    weekdayLong: fmt({ weekday: 'long' }),
    day: date.getUTCDate(),
    monthShort: fmt({ month: 'short' }),
  };
}

/** "Tue, 7 Oct 2026" */
export function formatDateLong(ymd: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(toUtcDate(ymd));
}

/** Friendly label: "Today", "Tomorrow" or "Tue 7". */
export function relativeDayLabel(ymd: string, today = todayInDhaka()): string {
  if (ymd === today) return 'Today';
  if (ymd === addDays(today, 1)) return 'Tomorrow';
  const p = dateParts(ymd);
  return `${p.weekdayShort} ${p.day}`;
}
