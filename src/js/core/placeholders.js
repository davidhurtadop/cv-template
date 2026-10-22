// Text tokens that CV markdown can use so facts that change with time stay correct.
//   {{years}}  full years since `career_start` (front matter, "YYYY" or "YYYY-MM"), e.g. "{{years}}+ years"
// Unknown tokens are left untouched (and reported by scripts/validate.mjs).

export const TOKEN = /\{\{\s*([\w-]+)\s*\}\}/g;
export const KNOWN_TOKENS = ['years'];

/** Whole years between `start` ("2012" or "2012-02") and `now`; null if `start` is missing or invalid. */
export function yearsSince(start, now = new Date()) {
  const match = String(start ?? '').match(/^(\d{4})(?:-(\d{1,2}))?$/);
  if (!match) return null;
  const month = match[2] ? Number(match[2]) - 1 : 0;
  const months = (now.getFullYear() - Number(match[1])) * 12 + (now.getMonth() - month);
  return months < 0 ? 0 : Math.floor(months / 12);
}

export function fillPlaceholders(text, meta = {}, now = new Date()) {
  if (typeof text !== 'string') return text;
  return text.replace(TOKEN, (token, name) => {
    if (name === 'years') {
      const years = yearsSince(meta.career_start, now);
      return years === null ? token : String(years);
    }
    return token;
  });
}
