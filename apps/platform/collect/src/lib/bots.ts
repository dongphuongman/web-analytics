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
