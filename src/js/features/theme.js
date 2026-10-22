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
 * index.html already applied saved/system before first paint; this reconciles it with the config.
 */
export function initTheme(defaultTheme = 'auto') {
  const forced = new URLSearchParams(location.search).get('theme');
  const stored = read();
  if (forced === 'light' || forced === 'dark') apply(forced);
  else if (stored === 'light' || stored === 'dark') apply(stored);
  else apply(defaultTheme === 'light' || defaultTheme === 'dark' ? defaultTheme : systemTheme());

  for (const button of document.querySelectorAll('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
      const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      write(next);
    });
  }
}
