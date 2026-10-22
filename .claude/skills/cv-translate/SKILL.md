---
name: cv-translate
description: Translate this site's CV markdown into another language, or re-sync an existing translation after the source changed.
when_to_use: The user asks to add a language, translate the CV, or update the Spanish or English version.
argument-hint: "[language-code]"
---

# cv-translate

Read `docs/cv-schema.md` first. Target language: $ARGUMENTS (ask for the language and its code if empty).

1. Identify the source file (default: the file for `defaultLang` in `src/config/site.json`) and the target language code. For a re-sync, find what changed with `git diff` and only touch those entries in the target.
2. Write `src/content/cv.<code>.md`:
   - Keep every front matter key and every `{#id}` exactly; set `lang: <code>`; `hide`, `social`, `tech`, `hero_image` and `photo` stay the same.
   - Translate `title`, `description`, `headline`, the tagline, section titles, summary, job titles, bullets and descriptions.
   - Keep company names, product and tool names, certification titles, proper nouns, dates, numbers and URLs.
   - Never add or remove facts; period words like "Present" are translated.
   - Contact labels: if a translated label is not recognised (see `KEY_ALIASES` in `src/js/core/schema.js`), add an explicit key such as `**Telefon {#phone}:**` so `hide` and the icons keep working.
3. New language only: add the code to `languages` in `src/config/site.json`, and create `src/i18n/<code>.json` from `src/i18n/en.json` (same keys, translated values, including the `nav` labels).
4. Run `cv-validate`. Ask the user to review the translation: the person's own CV is theirs to approve.
