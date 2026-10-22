import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { applyHidden, parseCv, slug } from '../src/js/core/parse-cv.js';

const sample = readFileSync(new URL('./fixtures/sample/cv.en.md', import.meta.url), 'utf8');

test('slug strips accents and punctuation', () => {
  assert.equal(slug('Teléfono'), 'telefono');
  assert.equal(slug('Databases & SQL'), 'databases-sql');
});

test('parses front matter, name and sections in order', () => {
  const cv = parseCv(sample);
  assert.equal(cv.meta.lang, 'en');
  assert.equal(cv.name, 'ALEX RIVERA');
  assert.equal(cv.tagline, 'Software Engineer | Full-Stack Developer');
  assert.deepEqual(cv.sections.map((s) => s.id),
    ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'languages']);
});

test('parses contact pairs with keys', () => {
  const contact = parseCv(sample).sections.find((s) => s.id === 'contact');
  assert.deepEqual(contact.pairs.map((p) => p.key), ['location', 'phone', 'email']);
  assert.equal(contact.pairs[2].value, 'alex@example.com');
});

test('parses experience entries with period and bullets', () => {
  const exp = parseCv(sample).sections.find((s) => s.id === 'experience');
  assert.equal(exp.entries.length, 2);
  assert.equal(exp.entries[0].role, 'Senior Software Engineer');
  assert.equal(exp.entries[0].company, 'Example Corp');
  assert.equal(exp.entries[0].period, '03/2021 – Present');
  assert.equal(exp.entries[0].bullets.length, 2);
});

test('unknown section ids fall back to markdown text', () => {
  const cv = parseCv('---\nlang: en\n---\n# A\n\n## Projects {#projects}\nHello **world**\n');
  assert.equal(cv.sections[0].kind, 'markdown');
  assert.equal(cv.sections[0].text, 'Hello **world**');
});

test('hide removes contact pairs', () => {
  const cv = applyHidden(parseCv(sample.replace('hide: []', 'hide: [phone]')));
  const keys = cv.sections.find((s) => s.id === 'contact').pairs.map((p) => p.key);
  assert.deepEqual(keys, ['location', 'email']);
});

const sampleEs = readFileSync(new URL('./fixtures/sample/cv.es.md', import.meta.url), 'utf8');

test('Spanish labels map to the same language-independent keys', () => {
  const contact = parseCv(sampleEs).sections.find((s) => s.id === 'contact');
  assert.deepEqual(contact.pairs.map((p) => p.key), ['location', 'phone', 'email']);
  assert.equal(contact.pairs[1].label, 'Teléfono');
});

test('explicit {#key} overrides the label-derived key', () => {
  const cv = parseCv('# A\n\n## C {#contact}\n* **Handy {#phone}:** 123\n');
  assert.equal(cv.sections[0].pairs[0].key, 'phone');
  assert.equal(cv.sections[0].pairs[0].label, 'Handy');
});

test('hide works across languages', () => {
  const cv = applyHidden(parseCv(sampleEs.replace('hide: []', 'hide: [phone]')));
  assert.deepEqual(cv.sections.find((s) => s.id === 'contact').pairs.map((p) => p.key), ['location', 'email']);
});

import { fillPlaceholders, yearsSince } from '../src/js/core/placeholders.js';

test('yearsSince counts whole years, month aware', () => {
  assert.equal(yearsSince('2012-02', new Date(2026, 9, 22)), 14);
  assert.equal(yearsSince('2012-02', new Date(2027, 0, 31)), 14);
  assert.equal(yearsSince('2012-02', new Date(2027, 1, 1)), 15);
  assert.equal(yearsSince('2012', new Date(2026, 0, 1)), 14);
  assert.equal(yearsSince('2030', new Date(2026, 0, 1)), 0);
  assert.equal(yearsSince(undefined), null);
  assert.equal(yearsSince('twelve'), null);
});

test('{{years}} is filled from career_start and parseCv applies it', () => {
  const md = '---\nlang: en\ncareer_start: 2012-02\ndescription: "{{years}}+ years"\n---\n# A\n\n## S {#summary}\nOver {{years}} years and {{other}}.\n';
  const cv = parseCv(md, new Date(2026, 9, 22));
  assert.equal(cv.meta.description, '14+ years');
  assert.equal(cv.sections[0].text, 'Over 14 years and {{other}}.');
  assert.equal(fillPlaceholders('{{years}}', {}), '{{years}}');
});
