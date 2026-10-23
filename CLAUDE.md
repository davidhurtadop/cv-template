# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

David Hurtado's live CV site on GitHub Pages, and also a reusable template others copy. A CV is written as markdown (one file per language); a vanilla-JS engine in the browser renders it into an HTML layout. No build step. Layouts are registered in `LAYOUTS` (`src/js/core/schema.js`): `horizon` (top nav, hero with typed headline and logo marquee) and `ledger` (profile sidebar plus résumé-style column). `site.json` `layout` picks one; `?layout=ledger` previews the other.

## Rules

Path-scoped rules load automatically when you touch matching files: `.claude/rules/content.md` (CV content, i18n, config), `.claude/rules/layouts.md` (layouts, CSS, JS engine) and `.claude/rules/vendor.md` (vendored libraries). The ones that apply everywhere:

- One language: JavaScript (browser ES modules, plus Node for `scripts/` and tests). No bundler, framework or npm dependencies.
- Content lives in `src/content/cv.<lang>.md`; the format is [docs/cv-schema.md](docs/cv-schema.md). For CV edits change content, not the engine.
- `hide:` keeps a field off the page and PDF only; it stays in the markdown and git history of a public repo.
- `src/` is what gets deployed (`.github/workflows/pages.yml`: tests and validation on every pull request into `main`; on pushes to `main` it also uploads `src/`). `README.md` tells template users which files to replace: `src/content/*.md`, `src/config/site.json`, `src/i18n/`, `src/img/`.

## Commands

- `npm start`: preview `src/` at http://localhost:3000 with the zero-dependency `scripts/serve.mjs`. The page fetches its content, so opening `index.html` as a file does not work.
- `npm test`: parser unit tests (`node --test`).
- `npm run validate`: checks `src/content` and every folder in `tests/fixtures/` (sample CVs that double as schema examples): front matter, section ids, language parity, social and tech names, images. Exits non-zero on errors.
- URL flags for previews: `?lang=es`, `?theme=dark|light`, `?layout=horizon|ledger`, `?debug=1` (missing, extra and unresolved sections).

## Architecture

`src/js/main.js` loads `config/site.json`, then `content/cv.<lang>.md`, `i18n/<lang>.json`, `layouts/<layout>/layout.html` and `layouts/print/layout.html`. The pipeline lives in `src/js/core/`, DOM-free except `render.js`:

1. `parse-cv.js`: markdown to plain data (front matter via vendored js-yaml; sections by `## Title {#id}`; `applyHidden`).
2. `view-model.js`: parsed data to the flat object layouts read (markdown via vendored marked; nav labels from `ui.nav`; tech chips; social links).
3. `render.js`: fills a layout through placeholder attributes `data-cv`, `data-cv-html`, `data-cv-attr`, `data-if` and `<template data-repeat>`. Inside a repeat, paths read the current item only; use `@root.path` for page-level values. Attributes are removed once applied.

`scripts/validate.mjs` and the tests import the same `parse-cv.js`, `schema.js`, `icons.js` and `tech.js`, so these stay dependency-free ESM that runs in both browser and Node. A new section type means editing `schema.js`, `view-model.js`, then the layouts (web and print).

`src/js/features/`: `theme.js` (saved choice > `defaultTheme` > system; `index.html` applies saved/system before first paint), `language.js` (`?lang=` > saved > browser > `defaultLang`; every code in `site.json` `languages` needs `content/cv.<code>.md` and `i18n/<code>.json`), `typed.js` (headline), `scrollspy.js`, `print.js`, `debug.js`.

- Contact labels become language-independent keys through `KEY_ALIASES` in `schema.js`, or an explicit `**Label {#phone}:**`, so `hide: [phone]` works in every language.
- `src/index.html` holds static copies of the default-language title, description and `og:` tags (for link previews without JavaScript) and `<meta name="theme-default">` for the pre-paint theme script; `validate.mjs` warns or fails when they drift from the content and `site.json`.
- PDF: `print.js` renders `layouts/print/layout.html` into a hidden `#print-root`; `layouts/print/print.css` (media=print) hides everything else, so the button and Ctrl/Cmd+P print the same A4 document.
- Icons: social and UI icons come from the hand-picked sprite `vendor/bootstrap-icons/icons.svg` (names in `core/icons.js`); technology logos from `vendor/devicon/tech.svg` (names in `core/tech.js`).

## `.claude/` and the CV skills

- `settings.json` (committed): allows the npm and read-only git commands, asks before `git push` and before editing `src/vendor/`. Personal overrides go in `settings.local.json`, personal notes in `CLAUDE.local.md` (both gitignored).
- `rules/`: the path-scoped rules above, plus `skills.md` (how skills ask the user: multiple-choice questions, one at a time, confirmation before anything outward-facing).
- `agents/cv-reviewer.md`: read-only reviewer for CV wording and ATS readability.
- `skills/`: `cv-setup` is the entry point; it compares `owner.github` in `site.json` with the git remote owner to choose first-time mode (guided interview, replaces the previous owner's content after confirmation) or maintenance mode (routes to the others). `cv-update` (routine edits), `cv-translate`, `cv-import` (other formats to the schema), `cv-validate` (run after every content change) and `cv-pr` (opens a pull request for review; merging it into `main` deploys the site; user-invoked only). Copy-paste versions for other tools are in [docs/claude-prompts.md](docs/claude-prompts.md).
