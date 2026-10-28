/**
 * Calendar days as 'YYYY-MM-DD' strings in the viewer's calendar. Strings
 * compare in day order, so ranges and bounds are plain string comparisons.
 */

/** A YYYY-MM-DD day as a local Date (no timezone shift). */
export function dayDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** A local Date as YYYY-MM-DD. */
export function toDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Today in the viewer's calendar. */
export function localToday(): string {
  return toDay(new Date());
}

export function shiftDay(day: string, n: number): string {
  const d = dayDate(day);
  d.setDate(d.getDate() + n);
  return toDay(d);
}

/** Days from `from` to `to`, both included. */
export function dayCount(from: string, to: string): number {
  return Math.round((dayDate(to).getTime() - dayDate(from).getTime()) / 86_400_000) + 1;
}

export function formatDay(day: string, withYear: boolean): string {
  return dayDate(day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

/** First day of the week for the viewer's locale: 0 = Sunday, 1 = Monday. */
export function weekStart(): number {
  try {
    const locale = new Intl.Locale(navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = locale.getWeekInfo?.() ?? locale.weekInfo;
    if (info) return info.firstDay % 7;
  } catch {
    // Older engines: fall through.
  }
  return 1;
}

/** "3 Mar – 15 Mar 2026"; the year shows once unless the range spans two. */
export function rangeLabel(from: string, to: string): string {
  if (from === to) return formatDay(from, true);
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return `${formatDay(from, !sameYear)} – ${formatDay(to, true)}`;
}
