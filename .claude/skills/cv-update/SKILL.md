---
name: cv-update
description: Edit one part of this site's CV safely in every language - a job, education, certification, skill, summary, social link, technology logo, or a hidden contact field.
when_to_use: Routine CV content changes such as "add a job", "new certification", "hide my phone", "add my GitHub".
argument-hint: "[what to change]"
---

# cv-update

Read `docs/cv-schema.md` if you haven't in this session. Requested change: $ARGUMENTS (ask what to change if empty).

1. Make the requested change in the file for the default language (`src/config/site.json` → `defaultLang`), copying the format of neighbouring entries exactly.
2. Repeat the change, translated, in every other `src/content/cv.<code>.md` so ids and entries match (use `cv-translate` for larger changes).
3. Specific cases:
   - **Social link**: add `{ network, url }` to `social` in every file. The network must be in `src/js/core/icons.js`; otherwise explain how to add an icon (`src/vendor/VERSIONS.md`).
   - **Technology logo**: add the slug to `tech` in every file; it must exist in `src/js/core/tech.js`.
   - **Hide a contact field**: add its key (`phone`, `email`, `location` or the explicit `{#key}`) to `hide` in every file. Tell the user the value still sits in the markdown and git history of a public repo, and offer to remove the line instead.
   - **Images**: files go in `src/img/` with the specs in `docs/images.md`.
4. If the default-language title or description changed, update the matching tags at the top of `src/index.html`.
5. Never edit `src/vendor/`. Run `cv-validate`.

Ask choices (which field to hide, which network, replace or add) with AskUserQuestion, as in `.claude/rules/skills.md`.
