// Validates CV content without any dependency: node scripts/validate.mjs
// With file arguments (node scripts/validate.mjs tailored/cv.acme.en.md) it checks only those CV files.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCv } from '../src/js/core/parse-cv.js';
import { KNOWN_SECTIONS, OPTIONAL_SECTIONS, REQUIRED_META } from '../src/js/core/schema.js';
import { SOCIAL_NETWORKS } from '../src/js/core/icons.js';
import { TECH } from '../src/js/core/tech.js';
import { KNOWN_TOKENS, TOKEN, yearsSince } from '../src/js/core/placeholders.js';
import { LAYOUTS } from '../src/js/core/schema.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const MAX_IMAGE_BYTES = 400 * 1024;
const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

function imageSize(file) {
  const buf = readFileSync(file);
  const ext = extname(file).toLowerCase();
  if (ext === '.png') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (ext === '.jpg' || ext === '.jpeg') {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const length = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + length;
    }
  }
  return null; // webp and others: weight is checked, dimensions are not
}

function checkImage(where, base, key, value, expect) {
  if (!value) return;
  const file = join(base, value);
  if (!existsSync(file)) return fail(where, `${key} "${value}" does not exist`);
  const bytes = statSync(file).size;
  if (bytes > MAX_IMAGE_BYTES) warn(where, `${key} is ${Math.round(bytes / 1024)} KB (recommended < 400 KB)`);
  const size = imageSize(file);
  if (size && !expect(size)) warn(where, `${key} is ${size.width}x${size.height}, see docs/images.md`);
}

function checkFile(file, base) {
  const where = file.replace(`${root}/`, '');
  const raw = readFileSync(file, 'utf8');
  const cv = parseCv(raw);
  for (const [, token] of raw.matchAll(TOKEN)) {
    if (!KNOWN_TOKENS.includes(token)) warn(where, `unknown placeholder {{${token}}} (known: ${KNOWN_TOKENS.join(', ')})`);
  }
  if (/\{\{\s*years\s*\}\}/.test(raw) && yearsSince(cv.meta.career_start) === null) {
    fail(where, '{{years}} is used but front matter "career_start" is missing or not YYYY or YYYY-MM');
  }
  for (const key of REQUIRED_META) if (!cv.meta[key]) fail(where, `front matter "${key}" is missing`);
  if (!cv.name) fail(where, 'missing "# NAME" heading');
  const ids = cv.sections.map((s) => s.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) fail(where, `duplicate section id "${dup}"`);
  for (const id of KNOWN_SECTIONS) if (!ids.includes(id) && !OPTIONAL_SECTIONS.includes(id)) warn(where, `no "${id}" section`);

  const contactKeys = (cv.sections.find((s) => s.id === 'contact')?.pairs ?? []).map((p) => p.key);
  for (const key of cv.meta.hide ?? []) {
    if (!contactKeys.includes(key)) warn(where, `hide: "${key}" matches no contact field`);
  }
  for (const s of cv.meta.social ?? []) {
    if (!s.url) fail(where, `social entry "${s.network}" has no url`);
    if (!SOCIAL_NETWORKS.includes(s.network)) warn(where, `unknown social network "${s.network}" (generic link icon)`);
  }
  for (const slug of cv.meta.tech ?? []) {
    if (!(slug in TECH)) warn(where, `unknown tech "${slug}" (shown as text only, no logo)`);
  }
  for (const [company, path] of Object.entries(cv.meta.logos ?? {})) {
    if (!existsSync(join(base, path))) fail(where, `logo for "${company}" not found: ${path}`);
  }
  checkImage(where, base, 'hero_image', cv.meta.hero_image, (d) => d.width >= 1600 && Math.abs(d.width / d.height - 16 / 9) < 0.1);
  checkImage(where, base, 'photo', cv.meta.photo, (d) => d.width === d.height && d.width >= 400);
  return { where, cv, ids };
}

function checkSet(label, dir, languages, base) {
  const parsed = {};
  for (const lang of languages) {
    const file = join(dir, `cv.${lang}.md`);
    if (!existsSync(file)) { fail(label, `cv.${lang}.md is missing`); continue; }
    parsed[lang] = checkFile(file, base);
    if (parsed[lang].cv.meta.lang !== lang) fail(parsed[lang].where, `front matter lang "${parsed[lang].cv.meta.lang}" must be "${lang}"`);
  }
  const [first, ...rest] = Object.keys(parsed);
  for (const lang of rest) {
    const a = new Set(parsed[first].ids);
    const b = new Set(parsed[lang].ids);
    for (const id of a) if (!b.has(id)) fail(parsed[lang].where, `section "${id}" exists in ${first} but not in ${lang}`);
    for (const id of b) if (!a.has(id)) fail(parsed[lang].where, `section "${id}" exists in ${lang} but not in ${first}`);
    // Language-independent front matter should be identical in every translation.
    for (const key of SHARED_META) {
      const x = JSON.stringify(parsed[first].cv.meta[key] ?? null);
      const y = JSON.stringify(parsed[lang].cv.meta[key] ?? null);
      if (x !== y) warn(parsed[lang].where, `front matter "${key}" differs from ${first} (should be the same in every language)`);
    }
  }
  return parsed;
}

const SHARED_META = ['career_start', 'tech', 'social', 'hide', 'hero_image', 'photo', 'logos'];

// Every key of the reference labels file (nested keys as a.b), so translations can't miss one.
function flatKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v)
    ? flatKeys(v, `${prefix}${k}.`)
    : [`${prefix}${k}`]));
}

const attr = (html, selector) => html.match(selector)?.[1]?.replace(/&amp;/g, '&');

function report() {
  for (const w of warnings) console.warn(`warning  ${w}`);
  for (const e of errors) console.error(`error    ${e}`);
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}

// 0. Single files (for example a tailored CV outside src/content): schema checks only.
const files = process.argv.slice(2);
if (files.length) {
  for (const file of files) {
    const path = resolve(file);
    if (!existsSync(path)) { fail(file, 'file not found'); continue; }
    checkFile(path, src);
  }
  report();
}

// 1. The live site, driven by config/site.json
const config = JSON.parse(readFileSync(join(src, 'config/site.json'), 'utf8'));
if (!config.languages.includes(config.defaultLang)) fail('config/site.json', 'defaultLang must be in languages');
if (!LAYOUTS.includes(config.layout)) fail('config/site.json', `layout "${config.layout}" is not one of ${LAYOUTS.join(', ')}`);
for (const name of LAYOUTS) {
  for (const file of ['layout.html', 'layout.css']) {
    if (!existsSync(join(src, 'layouts', name, file))) fail(`src/layouts/${name}`, `${file} is missing`);
  }
}
for (const name of readdirSync(join(src, 'layouts'))) {
  if (name !== 'print' && statSync(join(src, 'layouts', name)).isDirectory() && !LAYOUTS.includes(name)) {
    warn(`src/layouts/${name}`, 'not listed in LAYOUTS (src/js/core/schema.js), so it cannot be selected');
  }
}
const content = checkSet('src/content', join(src, 'content'), config.languages, src);

// UI labels: every language needs every key that en.json has.
const reference = join(src, 'i18n', 'en.json');
const referenceKeys = existsSync(reference) ? flatKeys(JSON.parse(readFileSync(reference, 'utf8'))) : [];
for (const lang of config.languages) {
  const file = join(src, 'i18n', `${lang}.json`);
  if (!existsSync(file)) { fail('src/i18n', `${lang}.json is missing (buttons and menus would have no text)`); continue; }
  const keys = new Set(flatKeys(JSON.parse(readFileSync(file, 'utf8'))));
  for (const key of referenceKeys) if (!keys.has(key)) fail(`src/i18n/${lang}.json`, `missing label "${key}" (present in en.json)`);
}

// index.html carries static copies of the default-language title/description for link previews,
// and the theme default for the pre-paint script. They must follow the content and config.
const html = readFileSync(join(src, 'index.html'), 'utf8');
const main = content[config.defaultLang]?.cv.meta;
if (main) {
  const expected = {
    '<title>': [attr(html, /<title>([^<]*)<\/title>/), main.title],
    'meta description': [attr(html, /<meta name="description" content="([^"]*)"/), main.description],
    'og:title': [attr(html, /<meta property="og:title" content="([^"]*)"/), main.title],
    'og:description': [attr(html, /<meta property="og:description" content="([^"]*)"/), main.description],
    'og:url': [attr(html, /<meta property="og:url" content="([^"]*)"/), config.baseUrl],
  };
  for (const [name, [actual, wanted]] of Object.entries(expected)) {
    if ((actual ?? '') !== (wanted ?? '')) warn('src/index.html', `${name} is "${actual ?? ''}" but should be "${wanted ?? ''}" (link previews use it)`);
  }
}
const themeDefault = attr(html, /<meta name="theme-default" content="([^"]*)"/);
if (themeDefault !== (config.defaultTheme ?? 'auto')) {
  fail('src/index.html', `meta theme-default is "${themeDefault}" but config defaultTheme is "${config.defaultTheme}"`);
}

// 2. Test fixtures (every cv.<lang>.md present in each folder), so the schema examples stay valid
const fixtures = join(root, 'tests', 'fixtures');
for (const name of readdirSync(fixtures)) {
  const dir = join(fixtures, name);
  if (!statSync(dir).isDirectory()) continue;
  const langs = readdirSync(dir).map((f) => f.match(/^cv\.(\w+)\.md$/)?.[1]).filter(Boolean);
  checkSet(`tests/fixtures/${name}`, dir, langs, src);
}

report();
