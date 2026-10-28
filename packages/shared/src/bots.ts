/**
 * Known bots: the user-agent pattern, the display name ingest stores in
 * `browser` for a 'bot_pageview', and a category the API adds at query
 * time. Categories are labels only, never stored, so regrouping a bot
 * changes old data too.
 *
 * Order matters: the collector names a bot after the first matching
 * pattern, so specific entries sit above anything they would also match.
 */
export type BotCategory = 'search' | 'ai' | 'social' | 'seo' | 'monitoring' | 'other';

export const NAMED_BOTS: { pattern: RegExp; name: string; category: BotCategory }[] = [
  { pattern: /googlebot/i, name: 'Googlebot', category: 'search' },
  { pattern: /mediapartners/i, name: 'Google Mediapartners', category: 'search' },
  { pattern: /bingbot/i, name: 'Bingbot', category: 'search' },
  { pattern: /yandexbot/i, name: 'YandexBot', category: 'search' },
  { pattern: /baiduspider/i, name: 'Baiduspider', category: 'search' },
  { pattern: /duckduckbot/i, name: 'DuckDuckBot', category: 'search' },
  { pattern: /applebot/i, name: 'Applebot', category: 'search' },
  // Huawei's Petal Search
  { pattern: /petalbot/i, name: 'PetalBot', category: 'search' },
  // AI crawlers and assistant fetchers. All would match the collector's
  // generic /bot/ fallback; named entries give them stable display names.
  { pattern: /gptbot/i, name: 'GPTBot', category: 'ai' },
  { pattern: /oai-searchbot/i, name: 'OAI-SearchBot', category: 'ai' },
  { pattern: /chatgpt-user/i, name: 'ChatGPT-User', category: 'ai' },
  { pattern: /claudebot/i, name: 'ClaudeBot', category: 'ai' },
  { pattern: /claude-user/i, name: 'Claude-User', category: 'ai' },
  { pattern: /claude-searchbot/i, name: 'Claude-SearchBot', category: 'ai' },
  { pattern: /perplexitybot/i, name: 'PerplexityBot', category: 'ai' },
  { pattern: /perplexity-user/i, name: 'Perplexity-User', category: 'ai' },
  { pattern: /meta-externalagent/i, name: 'Meta-ExternalAgent', category: 'ai' },
  { pattern: /amazonbot/i, name: 'Amazonbot', category: 'ai' },
  { pattern: /bytespider/i, name: 'Bytespider', category: 'ai' },
  // Google's Vertex AI crawler (already named this by the generic fallback;
  // listed for its category).
  { pattern: /google-cloudvertexbot/i, name: 'Google-CloudVertexBot', category: 'ai' },
  // Social link preview fetchers
  { pattern: /facebookexternalhit/i, name: 'Facebook', category: 'social' },
  { pattern: /twitterbot/i, name: 'Twitterbot', category: 'social' },
  { pattern: /linkedinbot/i, name: 'LinkedInBot', category: 'social' },
  { pattern: /whatsapp/i, name: 'WhatsApp', category: 'social' },
  { pattern: /telegrambot/i, name: 'Telegram', category: 'social' },
  { pattern: /discordbot/i, name: 'Discord', category: 'social' },
  { pattern: /slackbot/i, name: 'Slack', category: 'social' },
  // SEO / marketing crawlers
  { pattern: /semrushbot/i, name: 'SemrushBot', category: 'seo' },
  { pattern: /ahrefsbot/i, name: 'AhrefsBot', category: 'seo' },
  { pattern: /dotbot/i, name: 'DotBot', category: 'seo' },
  { pattern: /mj12bot/i, name: 'MJ12bot', category: 'seo' },
  // Monitoring and automation
  { pattern: /lighthouse/i, name: 'Lighthouse', category: 'monitoring' },
  { pattern: /pingdom/i, name: 'Pingdom', category: 'monitoring' },
  { pattern: /uptimerobot/i, name: 'UptimeRobot', category: 'monitoring' },
  { pattern: /headlesschrome/i, name: 'Headless Chrome', category: 'monitoring' },
  { pattern: /phantomjs/i, name: 'PhantomJS', category: 'monitoring' },
  { pattern: /scrapy/i, name: 'Scrapy', category: 'monitoring' },
];

// Cloudflare's verified-bot categories (request.cf.verifiedBotCategory),
// for crawlers the collector catches by network rather than UA. The list is
// fixed, so each stored name can be listed up front like a named bot. A
// category Cloudflare adds later lands in 'other' until it is listed here.
const VERIFIED_BOT_CATEGORIES: Record<string, BotCategory> = {
  'Search Engine Crawler': 'search',
  'AI Crawler': 'ai',
  'AI Assistant': 'ai',
  'AI Search': 'ai',
  'Page Preview': 'social',
  'Search Engine Optimization': 'seo',
  'Monitoring & Analytics': 'monitoring',
};

/** Stored name of a Cloudflare-verified crawler that sent a browser UA. */
export function verifiedBotName(category: string): string {
  return `Verified bot (${category})`.slice(0, 64);
}

const CATEGORY_BY_NAME = new Map<string, BotCategory>([
  ...NAMED_BOTS.map(b => [b.name, b.category] as const),
  ...Object.entries(VERIFIED_BOT_CATEGORIES).map(([c, cat]) => [verifiedBotName(c), cat] as const),
]);

function namesIn(categories: BotCategory[]): string[] {
  return [...CATEGORY_BY_NAME].filter(([, c]) => categories.includes(c)).map(([name]) => name);
}

/** Category of a stored bot display name. Names the collector derived from
 *  an unknown user agent ("SomeNewBot", "Unknown Bot") are 'other'. */
export function botCategory(name: string): BotCategory {
  return CATEGORY_BY_NAME.get(name) ?? 'other';
}

/** The Bots panel's tabs. SEO, monitoring and unnamed bots share 'other'. */
export const BOT_GROUPS = ['search', 'ai', 'social', 'other'] as const;
export type BotGroup = (typeof BOT_GROUPS)[number];

/** Stored bot names in a group, as a list to keep (`exclude` false) or to
 *  leave out (`exclude` true): 'other' is every name outside the named
 *  search, AI and social bots, including names the collector made up. */
export function botGroupNames(group: BotGroup): { names: string[]; exclude: boolean } {
  return group === 'other'
    ? { names: namesIn(['search', 'ai', 'social']), exclude: true }
    : { names: namesIn([group]), exclude: false };
}
