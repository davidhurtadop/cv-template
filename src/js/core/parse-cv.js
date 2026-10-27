import { load as loadYaml } from '../../vendor/js-yaml/js-yaml.mjs';
import { SECTION_KINDS, canonicalKey } from './schema.js';
import { fillPlaceholders } from './placeholders.js';

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const SECTION_HEADING = /^##\s+(.+?)\s*\{#([\w-]+)\}\s*$/;
const BULLET = /^[*-]\s+(.*)$/;
const PAIR = /^\*\*(.+?)\*\*\s*(.*)$/;
const ENTRY_HEAD = /^\*\*(.+?)\*\*\s+[—–-]\s+(.+)$/;
const PERIOD = /^\*(?!\*)(.+?)\*$/;
// "Tech: Python, AWS" (or Technologies/Tecnologías) under an entry becomes its tag list.
const TECH_LINE = /^(?:tech|technologies|tecnolog[ií]as)\s*:\s*(.+)$/i;
// "Highlight: Minimal disruption | AWS migration" gives a project its short headline phrases.
const HIGHLIGHT_LINE = /^(?:highlights?|destacados?)\s*:\s*(.+)$/i;

export function slug(label) {
  return label
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Parse a CV markdown file into plain data. No DOM, so it runs in the browser and in Node.
 * Returns { meta, name, tagline, sections: [{ id, title, kind, ... }] }.
 */
export function parseCv(text, now = new Date()) {
  const normalized = text.replace(/\r\n/g, '\n');
  const fm = normalized.match(FRONT_MATTER);
  const meta = fm ? (loadYaml(fm[1]) ?? {}) : {};
  if (typeof meta.description === 'string') meta.description = fillPlaceholders(meta.description, meta, now);
  const body = fillPlaceholders(fm ? normalized.slice(fm[0].length) : normalized, meta, now);

  const lines = body.split('\n');
  const cv = { meta, name: '', tagline: '', sections: [] };

  let current = null;
  const head = [];
  for (const line of lines) {
    const match = line.match(SECTION_HEADING);
    if (match) {
      current = { id: match[2], title: match[1], lines: [] };
      cv.sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      head.push(line);
    }
  }

  const nameLine = head.find((l) => l.startsWith('# '));
  cv.name = nameLine ? nameLine.slice(2).trim() : '';
  const tagIdx = head.findIndex((l) => l.trim() && !l.startsWith('# '));
  if (tagIdx >= 0) cv.tagline = head[tagIdx].trim().replace(/^\*\*(.*)\*\*$/, '$1');

  cv.sections = cv.sections.map(({ lines: sectionLines, ...section }) => {
    const kind = SECTION_KINDS[section.id] ?? 'markdown';
    return { ...section, kind, ...parseBody(kind, sectionLines) };
  });
  return cv;
}

function parseBody(kind, lines) {
  const trimmed = lines.join('\n').trim();
  switch (kind) {
    case 'pairs': return { pairs: parsePairs(lines) };
    case 'list': return { items: lines.map((l) => l.match(BULLET)?.[1]).filter(Boolean) };
    case 'entries': return { entries: parseEntries(lines) };
    case 'text': return { text: trimmed };
    default: return { text: trimmed };
  }
}

// "Teléfono {#phone}:" -> { key: 'phone', label: 'Teléfono' }; without {#key} the key comes from the label.
function labelOf(raw) {
  const explicit = raw.match(/\{#([\w-]+)\}/)?.[1];
  const label = raw.replace(/\s*\{#[\w-]+\}/, '').replace(/\s*:\s*$/, '').trim();
  return { key: explicit ?? canonicalKey(slug(label)), label };
}

function parsePairs(lines) {
  const pairs = [];
  for (const line of lines) {
    const bullet = line.match(BULLET);
    if (!bullet) continue;
    const pair = bullet[1].match(PAIR);
    if (!pair) {
      pairs.push({ key: '', label: '', value: bullet[1].trim() });
      continue;
    }
    const { key, label } = labelOf(pair[1]);
    const value = pair[2].replace(/^:\s*/, '').trim();
    pairs.push({ key, label, value });
  }
  return pairs;
}

function parseEntries(lines) {
  const entries = [];
  let entry = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const head = line.match(ENTRY_HEAD);
    if (head) {
      entry = { role: head[1].trim(), company: head[2].trim(), period: '', description: '', bullets: [], tags: [], highlights: [] };
      entries.push(entry);
      continue;
    }
    if (!entry) continue;
    const bullet = line.match(BULLET);
    const tech = line.match(TECH_LINE);
    const highlight = line.match(HIGHLIGHT_LINE);
    if (bullet) entry.bullets.push(bullet[1]);
    else if (highlight) entry.highlights = highlight[1].split('|').map((t) => t.trim()).filter(Boolean);
    else if (tech) entry.tags = tech[1].split(',').map((t) => t.trim()).filter(Boolean);
    else if (!entry.period && PERIOD.test(line)) entry.period = line.match(PERIOD)[1].trim();
    else entry.description = entry.description ? `${entry.description} ${line}` : line;
  }
  return entries;
}

/** Remove contact pairs listed in meta.hide so they never reach the page or the PDF. */
export function applyHidden(cv) {
  const hide = new Set((cv.meta.hide ?? []).map(String));
  if (!hide.size) return cv;
  return {
    ...cv,
    sections: cv.sections.map((s) => (s.kind === 'pairs'
      ? { ...s, pairs: s.pairs.filter((p) => !hide.has(p.key)) }
      : s)),
  };
}
