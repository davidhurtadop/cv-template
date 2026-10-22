---
paths:
  - "src/content/**"
  - "src/i18n/**"
  - "src/config/**"
---

# CV content rules

- The format is defined in `docs/cv-schema.md`; read it before editing a CV file.
- Section ids (`{#id}`) and front matter keys must be identical in every `cv.<lang>.md`. Translate titles and text only.
- Never invent facts, dates or numbers. Keep the person's wording unless asked to change it.
- `hide:` only keeps a contact field off the page and the PDF. The value stays in the markdown file and git history, and this repo is public: never describe `hide` as removal.
- Every code in `src/config/site.json` `languages` needs `src/content/cv.<code>.md` and `src/i18n/<code>.json` (same keys as `en.json`).
- Social networks must exist in `src/js/core/icons.js`, `tech` slugs in `src/js/core/tech.js`.
- Run `npm test && npm run validate` after changes.
