import { loadJson, loadOptionalJson, loadText } from './core/loader.js';
import { applyHidden, parseCv } from './core/parse-cv.js';
import { buildViewModel } from './core/view-model.js';
import { LAYOUTS } from './core/schema.js';
import { render } from './core/render.js';
import { initTheme } from './features/theme.js';
import { initTyped } from './features/typed.js';
import { initScrollSpy } from './features/scrollspy.js';
import { addAlternateLinks, languageMenu, pickLanguage } from './features/language.js';
import { initPrint } from './features/print.js';
import { initCarousels } from './features/carousel.js';

const params = new URLSearchParams(location.search);

// Resolves once the stylesheet has loaded (or failed), so the layout is never shown unstyled.
function addStylesheet(href) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = link.onerror = resolve;
    document.head.append(link);
  });
}

async function main() {
  const config = await loadJson('config/site.json');
  const lang = pickLanguage(config);
  // ?layout=ledger previews another layout without editing the config.
  const requested = params.get('layout');
  const layout = LAYOUTS.includes(requested) ? requested : config.layout;
  const layoutPath = `layouts/${layout}`;

  const [markdown, ui, layoutHtml, printHtml] = await Promise.all([
    loadText(`content/cv.${lang}.md`),
    loadOptionalJson(`i18n/${lang}.json`),
    loadText(`${layoutPath}/layout.html`),
    loadText('layouts/print/layout.html'),
  ]);

  const cv = applyHidden(parseCv(markdown));
  const vm = buildViewModel(cv, ui);
  vm.langMenu = config.languages.length > 1 ? languageMenu(config, lang) : [];

  document.documentElement.lang = lang;
  document.documentElement.style.setProperty('--accent', config.accent);
  document.title = vm.title;
  document.querySelector('meta[name="description"]').content = vm.description;
  await addStylesheet(`${layoutPath}/layout.css`);
  addAlternateLinks(config, lang);

  const app = document.getElementById('app');
  app.innerHTML = layoutHtml;
  const report = render(app, vm);

  initTheme(config.defaultTheme);
  initTyped(app);
  initScrollSpy('[data-spy-nav]');
  initCarousels(app);
  // The page is rendered after load, so the browser could not jump to #section links by itself.
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  initPrint({ html: printHtml, vm, render, lang, layoutHref: 'layouts/print/print.css' });

  if (params.has('debug')) {
    const { showDebug } = await import('./features/debug.js');
    showDebug({ cv, config, report });
  }
}

main().catch((error) => {
  console.error(error);
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger';
  alert.textContent = `Could not load the CV: ${error.message}`;
  const box = document.createElement('div');
  box.className = 'container py-5';
  box.append(alert);
  document.getElementById('app').replaceChildren(box);
});
