import { loadJson, loadOptionalJson, loadText } from './core/loader.js';
import { applyHidden, parseCv } from './core/parse-cv.js';
import { buildViewModel } from './core/view-model.js';
import { render } from './core/render.js';
import { initTheme } from './features/theme.js';
import { initTyped } from './features/typed.js';
import { initScrollSpy } from './features/scrollspy.js';
import { addAlternateLinks, languageMenu, pickLanguage } from './features/language.js';
import { initPrint } from './features/print.js';

const params = new URLSearchParams(location.search);

function addStylesheet(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

async function main() {
  const config = await loadJson('config/site.json');
  const lang = pickLanguage(config);
  // ?layout=ledger previews another layout without editing the config.
  const requested = params.get('layout');
  const layout = /^[a-z][a-z-]*$/.test(requested ?? '') ? requested : config.layout;
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
  addStylesheet(`${layoutPath}/layout.css`);
  if (config.languages.length > 1) addAlternateLinks(config);

  const app = document.getElementById('app');
  app.innerHTML = layoutHtml;
  const report = render(app, vm);

  initTheme(config.defaultTheme);
  initTyped(app);
  initScrollSpy('[data-spy-nav]');
  initPrint({ html: printHtml, vm, render, lang, layoutHref: 'layouts/print/print.css' });

  if (params.has('debug')) {
    const { showDebug } = await import('./features/debug.js');
    showDebug({ cv, config, report });
  }
}

main().catch((error) => {
  console.error(error);
  document.getElementById('app').innerHTML =
    `<div class="container py-5"><div class="alert alert-danger">Could not load the CV: ${error.message}</div></div>`;
});
