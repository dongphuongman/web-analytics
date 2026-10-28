/**
 * Iceberg table schema for Traks events.
 *
 * Written by the collect Worker via the Pipelines binding.
 * Queried by the api Worker via R2 SQL.
 *
 * Partitioning: the Pipelines R2 Data Catalog sink exposes no user-defined
 * partition spec (checked Sep 2026; `--partitioning` is r2-sink only). Tables
 * are partitioned only on the system column `__ingest_ts`, which queries.ts
 * bounds so R2 SQL can skip whole manifests; beyond that it prunes on Parquet
 * row-group min/max statistics. Rows land in arrival order so `ts` prunes
 * well, which is why every query builder filters on the time range first;
 * `site_id` prunes weakly, though each instance's bucket only ever holds its
 * own sites. Revisit if Cloudflare ships partition specs for catalog sinks.
 *
 * date_key, hour_key and week_key are computed at ingest in the site's IANA
 * timezone. R2 SQL has date_trunc/date_part now, but no timezone conversion
 * (to_local_time only strips the zone), so site-local bucketing still has to
 * happen before the row is written.
 */

export const EVENT_TYPES = {
  PAGEVIEW: 'pageview',
  EVENT: 'event',
} as const;

/**
 * Reserved event names the tracker fires automatically. Stored as regular
 * custom events with a canonical `event_meta` of `{"url":"..."}` (the collect
 * worker re-serializes it), so link panels can GROUP BY the raw meta string
 * on both the hot and cold paths without JSON functions.
 */
export const AUTO_EVENTS = {
  OUTBOUND: 'Outbound Link: Click',
  DOWNLOAD: 'File Download',
  WEBMCP: 'WebMCP: Tool Call',
} as const;

export const PERIODS = ['today', 'yesterday', '7d', '30d', '90d', '6m', '1y', 'all'] as const;
export type Period = (typeof PERIODS)[number];

/** A custom date range, 'YYYY-MM-DD..YYYY-MM-DD': whole days in the site's
 *  timezone, both ends inclusive. */
export type CustomPeriod = `${string}..${string}`;

/** What the analytics endpoints accept: a preset or a custom range. */
export type PeriodParam = Period | CustomPeriod;

/** Earliest day a custom range may start (the all-time floor). */
export const CUSTOM_PERIOD_MIN_DATE = '2000-01-01';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar day in YYYY-MM-DD form (rejects 2026-02-30). */
export function isIsoDay(value: string): boolean {
  if (!ISO_DAY.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function customPeriod(from: string, to: string): CustomPeriod {
  return `${from}..${to}`;
}

/** The days of a custom range, or null when `period` is not a valid one. */
export function parseCustomPeriod(period: string): { from: string; to: string } | null {
  const parts = period.split('..');
  if (parts.length !== 2) return null;
  const [from, to] = parts;
  if (!isIsoDay(from) || !isIsoDay(to)) return null;
  if (from > to || from < CUSTOM_PERIOD_MIN_DATE) return null;
  return { from, to };
}

export function isPreset(period: string): period is Period {
  return (PERIODS as readonly string[]).includes(period);
}

export function isPeriodParam(value: unknown): value is PeriodParam {
  return typeof value === 'string' && (isPreset(value) || parseCustomPeriod(value) !== null);
}

// Both envs use `traks.events` - physical isolation is per-bucket (R2_BUCKET_NAME env),
// so the namespace/table pair can match without collision. Keeps naming symmetric.
export const TABLE_PROD = 'traks.events';
export const TABLE_DEV = 'traks.events';
