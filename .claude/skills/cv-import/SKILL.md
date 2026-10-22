---
name: cv-import
description: Convert an existing CV (PDF, Word, LinkedIn export, JSON Resume or plain text) into this site's markdown format.
when_to_use: The user provides a CV in another format or structure and wants it on the site.
argument-hint: "[file path, or paste the text]"
---

# cv-import

Read `docs/cv-schema.md` first. Source: $ARGUMENTS (ask for the file or pasted text if empty).

1. Get the source: a file path (PDF/Word: read it with whatever tools are available; if the text can't be extracted, ask the user to paste it) or pasted text. Ask which language it is in and which `lang` code to use.
2. Write `src/content/cv.<code>.md` in exactly the schema format:
   - Front matter: `lang`, `title`, `description`, `headline` (the person's roles), `social` (profile links found in the source), and `tech` only with slugs from `src/js/core/tech.js` that the CV actually mentions.
   - `# NAME` and a tagline, then the known sections with their `{#id}`: `contact`, `summary`, `skills`, `experience`, `education`, `certifications`, `languages`.
   - Anything that doesn't fit (projects, publications, volunteering, awards) becomes an extra section with its own lowercase id.
   - Experience entries: `**Role** — Company`, then `*MM/YYYY – Present*`, then bullets.
   - Contact lines are optional: ask whether the phone number or address should go on a public site, and leave them out if the repo is public and the user hesitates.
3. Keep the person's wording, dates and numbers. **Never invent or drop information.** Normalise only formatting (date format, bullet style).
4. End with a list of what you were unsure about or had to guess (missing dates, ambiguous titles, skipped content). Do not silently resolve it.
5. If the file would replace the live CV, say so and confirm before overwriting. Run `cv-validate`. For other languages continue with `cv-translate`.
