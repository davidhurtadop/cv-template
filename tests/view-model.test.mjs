import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyHidden, parseCv } from '../src/js/core/parse-cv.js';
import { buildViewModel } from '../src/js/core/view-model.js';

const md = `---
lang: en
title: "CV – Test"
headline: [Engineer, Developer]
tech: [python, cobol]
hide: [phone]
social:
  - { network: linkedin, url: "https://www.linkedin.com/in/test/" }
  - { network: github, url: "https://github.com/test" }
---
# TEST PERSON
**Engineer | Developer**

## CONTACT {#contact}
* **Location:** Somewhere
* **Phone:** +1 555 000
* **Email:** test@example.com
* **LinkedIn:** https://www.linkedin.com/in/test/

## SUMMARY {#summary}
Hello.

## PROJECTS {#projects}
Some *project*.
`;

const ui = { nav: { contact: 'Contact', summary: 'Summary' } };
const vm = buildViewModel(applyHidden(parseCv(md)), ui);

test('contact links: mailto for email, URL for links, plain text otherwise; hidden keys removed', () => {
  assert.deepEqual(vm.contact.map((c) => c.key), ['location', 'email', 'linkedin']);
  assert.equal(vm.contact[1].href, 'mailto:test@example.com');
  assert.equal(vm.contact[2].href, 'https://www.linkedin.com/in/test/');
  assert.equal(vm.contact[0].href, '');
  assert.equal(vm.contact[0].plain, 'Somewhere');
});

test('socialExtra skips links already shown in the contact list', () => {
  assert.deepEqual(vm.socialExtra.map((s) => s.display), ['github.com/test']);
});

test('nav labels come from ui.nav and fall back to the section title; mainSections drops contact', () => {
  assert.deepEqual(vm.sections.map((s) => s.title), ['Contact', 'Summary', 'PROJECTS']);
  assert.deepEqual(vm.mainSections.map((s) => s.id), ['summary', 'projects']);
});

test('unknown sections become extra blocks; unknown tech has no logo', () => {
  assert.equal(vm.extra.length, 1);
  assert.equal(vm.extra[0].id, 'projects');
  assert.match(vm.extra[0].html, /<em>project<\/em>/);
  assert.deepEqual(vm.tech.map((t) => [t.label, Boolean(t.icon)]), [['Python', true], ['Cobol', false]]);
});

test('tagline is a fallback only when there is no headline', () => {
  assert.equal(vm.taglineFallback, '');
  const plain = buildViewModel(parseCv('# A\n**Role | Other**\n'), {});
  assert.equal(plain.taglineFallback, 'Role | Other');
});
