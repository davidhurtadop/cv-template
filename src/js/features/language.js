const STORAGE_KEY = 'lang';

function read() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function write(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* blocked storage: choice lasts for this visit only */ }
}

/** Order: ?lang= > saved choice > browser language > config.defaultLang. */
export function pickLanguage(config) {
  const supported = config.languages;
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (supported.includes(fromUrl)) {
    write(fromUrl);
    return fromUrl;
  }
  const stored = read();
  if (supported.includes(stored)) return stored;
  const browser = (navigator.languages ?? [navigator.language]).map((l) => l?.slice(0, 2));
  return browser.find((l) => supported.includes(l)) ?? config.defaultLang;
}

const nativeName = (code) => {
  const name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code;
  return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
};

/** Menu entries for the layout. Links keep the other query params (theme, debug). */
export function languageMenu(config, current) {
  return config.languages.map((code) => {
    const params = new URLSearchParams(location.search);
    params.set('lang', code);
    return {
      code,
      name: nativeName(code),
      href: `?${params}`,
      current: code === current ? 'true' : '',
    };
  });
}

const pageUrl = (config, code) => (code === config.defaultLang ? config.baseUrl : `${config.baseUrl}?lang=${code}`);

function addLink(rel, href, hreflang) {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (hreflang) link.hreflang = hreflang;
  document.head.append(link);
}

/** Canonical URL for the current language, plus hreflang alternates (and x-default) for search engines. */
export function addAlternateLinks(config, current) {
  if (!config.baseUrl) return;
  addLink('canonical', pageUrl(config, current));
  if (config.languages.length < 2) return;
  for (const code of config.languages) addLink('alternate', pageUrl(config, code), code);
  addLink('alternate', config.baseUrl, 'x-default');
}
