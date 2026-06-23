import { COMPANIES } from '../data/companies.js';

const LEGAL_SUFFIX = /,?\s+(Inc\.?|Corporation|Corp\.?|Company|Co\.?|Holdings?|Group|plc|SE|S\.A\.?|N\.V\.?|AG)\.?$/i;

function coreName(name) {
  let cleaned = name;
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(LEGAL_SUFFIX, '').trim();
  } while (cleaned !== prev && cleaned.length > 0);
  return cleaned;
}

// Suffixes are stripped once at module load so matching an article against
// all ~90 companies is a cheap substring/regex check, not a regex replace,
// repeated for every one of the (up to a few hundred) fetched articles.
const SEARCH_INDEX = COMPANIES.map((company) => ({
  ...company,
  coreNameLower: coreName(company.name).toLowerCase(),
}));

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const tickerRegexCache = new Map();
function tickerRegex(ticker) {
  if (!tickerRegexCache.has(ticker)) {
    tickerRegexCache.set(ticker, new RegExp(`\\b${escapeRegExp(ticker)}\\b`));
  }
  return tickerRegexCache.get(ticker);
}

/**
 * Finds which tracked companies are mentioned in a news article's text.
 * Tickers under 2 chars are skipped for the bare-ticker check (too many
 * false positives against ordinary capitalized words); the case-sensitive,
 * word-boundary regex still lets short tickers like "MU" or "GS" through
 * since headlines write them in caps, while avoiding stray lowercase hits.
 */
export function extractMatchingCompanies(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const company of SEARCH_INDEX) {
    const tickerHit = company.ticker.length >= 2 && tickerRegex(company.ticker).test(text);
    const nameHit = company.coreNameLower.length >= 3 && lower.includes(company.coreNameLower);
    if (tickerHit || nameHit) found.push(company);
  }
  return found;
}
