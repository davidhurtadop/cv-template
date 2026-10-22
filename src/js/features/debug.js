import { KNOWN_SECTIONS } from '../core/schema.js';

/** Overlay for ?debug=1: shows what the CV is missing or contains that layouts do not know. */
export function showDebug({ cv, config, report }) {
  const ids = cv.sections.map((s) => s.id);
  const rows = {
    'Missing known sections': KNOWN_SECTIONS.filter((id) => !ids.includes(id)),
    'Extra sections (generic block)': ids.filter((id) => !KNOWN_SECTIONS.includes(id)),
    'Hidden contact keys': cv.meta.hide ?? [],
    'Unresolved placeholders': [...new Set(report.unresolved)],
    'Languages in config': config.languages,
  };
  const panel = document.createElement('aside');
  panel.className = 'debug-panel';
  panel.innerHTML = '<h2>CV debug</h2>' + Object.entries(rows).map(([title, list]) =>
    `<strong>${title}</strong><ul>${list.length ? list.map((i) => `<li>${i}</li>`).join('') : '<li>none</li>'}</ul>`,
  ).join('');
  document.body.append(panel);
}
