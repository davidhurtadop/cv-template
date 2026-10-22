---
name: cv-setup
description: Entry point for this CV site. Detects whether this is a first-time setup (guided step by step) or a returning owner (asks what changed and routes to the right skill).
when_to_use: The user wants to set up, personalise or start their CV site from this template, or says "update my CV" without details.
allowed-tools: Bash(git remote get-url origin)
---

# cv-setup

Entry point for the CV site. Read `docs/cv-schema.md` once before touching content.

## 1. Detect the mode

1. Run `git remote get-url origin` and take the GitHub owner from the URL (no remote: treat as unknown).
2. Read `owner.github` in `src/config/site.json`.
3. Same owner: **maintenance mode**. Different owner, empty `owner.github`, or unknown: ask the user once whether `src/content/` already holds *their own* CV. Yes means maintenance mode, no means **first-time mode**.

## 2a. First-time mode (from scratch)

The repo still holds the template author's CV. Ask one question at a time (use AskUserQuestion for every choice, as in `.claude/rules/skills.md`) and keep a short running summary.

1. Name, headline roles (the typed titles), one-line description.
2. Default language and extra languages (codes such as `en`, `es`).
3. Layout: `horizon` (top navigation, wide hero banner, scrolling technology logos) or `ledger` (profile sidebar with a résumé-style main column). Tell the user they can compare them on http://localhost:3000/?layout=horizon and `?layout=ledger` once `npm start` runs.
4. Default theme (`auto`, `light`, `dark`) and accent colour (hex).
5. Hero image and profile photo: both optional. Give the exact specs from `docs/images.md` (hero 1920×1080 JPG/WebP under 400 KB; photo 800×800 square). Files go in `src/img/`.
6. Social networks and URLs (names from `src/js/core/icons.js`).
7. Technology logos for the hero strip (slugs from `src/js/core/tech.js`; unknown ones appear as text only).
8. Contact details: every one is optional (location, email, phone...). Recommend leaving the phone number and any address out of a public repo; offer `hide` only as a second choice, and warn that hidden values stay in the markdown file and git history.
9. CV content: from scratch (fill the annotated example in `docs/cv-schema.md` section by section, never inventing facts) or from an existing CV (hand over to the `cv-import` skill).

Before changing anything, **list what you are about to replace or delete and get confirmation**: the previous owner's `src/content/cv.*.md`, unreferenced images in `src/img/`, `owner.github` and `baseUrl` in `src/config/site.json`, and `src/i18n/` files for removed languages. Then:

- Write `src/content/cv.<code>.md` for each language (translations through `cv-translate`), update `src/config/site.json` (`owner.github`, `languages`, `defaultLang`, `layout`, `defaultTheme`, `accent`) and `src/i18n/<code>.json` (copy `en.json`, translate the values).
- Run the `cv-validate` steps, then `npm start` so the user can look at http://localhost:3000.
- Offer `cv-pr` to send the result for review.

## 2b. Maintenance mode (the usual case)

Ask what changed and route:

| Request | Skill |
|---|---|
| Add or edit a job, certification, skill, summary, social link, hide a field | `cv-update` |
| Add a language or re-sync a translation | `cv-translate` |
| Replace the CV from a PDF, Word, LinkedIn or text version | `cv-import` |
| Check everything | `cv-validate` |
| Send changes for review / get them online | `cv-pr` |

Finish every change with `cv-validate`.
