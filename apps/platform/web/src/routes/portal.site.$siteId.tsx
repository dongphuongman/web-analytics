import { createFileRoute } from '@tanstack/react-router';
import { isPeriodParam, parsePropsFilter, propsFilterValue } from '@traks/shared';
import type { PeriodParam } from '@traks/shared';

/** Dashboard URL state; shared with the public /share/$siteId route. */
export type SiteSearch = {
  /** A preset, or a custom range 'YYYY-MM-DD..YYYY-MM-DD'. */
  period?: PeriodParam;
  // Click-to-filter params (exact match), mirrored to the API's query fields.
  page?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  os?: string;
  device?: string;
  /** Custom-property filter, kept as an object so the URL reads
   *  ?props={"spaceid":"a"} rather than an escaped JSON string. */
  props?: Record<string, string>;
};

const FILTER_KEYS = [
  'page',
  'source',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'country',
  'region',
  'city',
  'browser',
  'os',
  'device',
] as const;

/** A props filter as URL state: accepts the object or its JSON text (as a
 *  segment or the live view hands it over) and returns the canonical object,
 *  or undefined when it is not a valid filter. */
export function propsSearch(value: unknown): Record<string, string> | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const pairs = parsePropsFilter(text);
  return pairs ? (JSON.parse(propsFilterValue(pairs)) as Record<string, string>) : undefined;
}

export function validateSiteSearch(search: Record<string, unknown>): SiteSearch {
  const out: SiteSearch = {
    period: isPeriodParam(search.period) ? search.period : undefined,
  };
  for (const key of FILTER_KEYS) {
    const value = search[key];
    if (typeof value === 'string' && value.length > 0) out[key] = value;
  }
  const props = propsSearch(search.props);
  if (props) out.props = props;
  return out;
}

export const Route = createFileRoute('/portal/site/$siteId')({
  validateSearch: validateSiteSearch,
});
