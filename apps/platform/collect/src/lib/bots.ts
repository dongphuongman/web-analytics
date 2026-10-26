import { NAMED_BOTS } from '@traks/shared';

// Bot traffic is counted, not dropped: ingest stores matching pageviews as
// event_type 'bot_pageview' with the display name below in `browser`, so
// every human-facing query (all predicated on event_type) never sees them
// while the dashboard's Bots panel can GROUP BY name.
//
// The named list (with each bot's category) lives in @traks/shared so the
// API can label rows from the same source.

// Generic signals with no named entry: pull the product token containing the
// signal ("SomeNewBot/1.2" -> "SomeNewBot") so unknown crawlers still get a
// usable panel row instead of an "Other" bucket.
const GENERIC_BOT = /([a-z0-9._-]*(?:bot|crawl|spider|slurp)[a-z0-9._-]*)/i;

/**
 * Display name of the bot behind a user agent, or null for human traffic.
 * An empty UA is treated as a bot: no real browser omits the header.
 */
export function botName(ua: string): string | null {
  if (!ua) return 'Unknown Bot';
  for (const bot of NAMED_BOTS) {
    if (bot.pattern.test(ua)) return bot.name;
  }
  const generic = GENERIC_BOT.exec(ua);
  if (generic) return generic[1].slice(0, 64);
  return null;
}

export function isBot(ua: string): boolean {
  return botName(ua) !== null;
}

// Cloud and hosting networks. People rarely browse from these, but scrapers
// running real Chrome (stock UA, JS, screen width) do, and they would
// otherwise count as visitors. Deliberately left out: consumer ISPs and the
// networks big VPNs use (e.g. M247), so VPN users stay human.
const DATACENTER_ASNS = new Set([
  16509, // Amazon AWS
  14618, // Amazon AWS (us-east-1)
  396982, // Google Cloud (verified Googlebot is caught by UA / cf.verifiedBotCategory first)
  8075, // Microsoft Azure
  31898, // Oracle Cloud
  45102, // Alibaba Cloud
  132203, // Tencent Cloud
  14061, // DigitalOcean
  16276, // OVH
  24940, // Hetzner
  63949, // Akamai Connected Cloud (Linode)
  20473, // Vultr
  51167, // Contabo
  212238, // Datacamp
  30058, // FDCservers
  398781, // hosting range sold to scraping proxy providers
]);

/** The subset of request.cf the classifier reads. */
export interface RequestSignals {
  asn?: number;
  asOrganization?: string;
  verifiedBotCategory?: string;
}

/**
 * Bot name from signals other than the UA, or null. Checked only when the UA
 * looks human: a Cloudflare-verified crawler sending a browser UA, a browser
 * reporting navigator.webdriver, or a request from a hosting network.
 */
export function signalBotName(cf: RequestSignals, webdriver: boolean): string | null {
  if (cf.verifiedBotCategory) return `Verified bot (${cf.verifiedBotCategory})`.slice(0, 64);
  if (webdriver) return 'Automated Browser';
  if (cf.asn && DATACENTER_ASNS.has(cf.asn)) {
    return `Datacenter (${cf.asOrganization || `AS${cf.asn}`})`.slice(0, 64);
  }
  return null;
}
