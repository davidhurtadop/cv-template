const STORAGE_KEY = 'theme';
const root = document.documentElement;

function read() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function write(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* storage blocked: toggle still works for this visit */ }
}

function systemTheme() {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme) {
  root.setAttribute('data-bs-theme', theme);
}

/**
 * Order of precedence: ?theme= (preview only) > saved choice > config.defaultTheme > system.
 * index.html already applied the same order before first paint, reading the default from its
 * <meta name="theme-default">; validate.mjs checks that meta matches config.defaultTheme.
 * With no saved choice and an `auto` default, the page follows system changes live.
 */
export function initTheme(defaultTheme = 'auto') {
  const forced = new URLSearchParams(location.search).get('theme');
  const stored = read();
  const fixedDefault = defaultTheme === 'light' || defaultTheme === 'dark';
  if (forced === 'light' || forced === 'dark') apply(forced);
  else if (stored === 'light' || stored === 'dark') apply(stored);
  else apply(fixedDefault ? defaultTheme : systemTheme());

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const chosen = read();
    if (!forced && chosen !== 'light' && chosen !== 'dark' && !fixedDefault) apply(systemTheme());
  });

  for (const button of document.querySelectorAll('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
      const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      write(next);
    });
  }
}
