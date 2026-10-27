# Prompts for Claude

Copy-paste prompts for common jobs. Run them in Claude Code at the root of this repo, or paste them into any chat together with the file [cv-schema.md](cv-schema.md), which defines the markdown format. Replace the `<...>` parts.

In Claude Code, most of these exist as skills that follow the same steps: `cv-setup` (start here), `cv-update`, `cv-translate`, `cv-import`, `cv-validate`, `cv-tailor`, `cv-pr`. Just describe what you want, or type the skill name.

Always finish with `npm test && npm run validate`. Claude should run them and fix what they report.

## 1. Set up the site from scratch

> I want to use this repository as my own CV site. Read `README.md` and `docs/cv-schema.md`. Ask me, one question at a time: my name and headline, my default language and any extra languages, the layout, the default theme and accent colour, my social networks, which contact details to include (all optional: for a public repo I recommend leaving out the phone number), and whether I have a hero image or photo (tell me the sizes from `docs/images.md`). Then replace the CV in `src/content/` and update `src/config/site.json` and `src/i18n/` accordingly. Remove everything that belongs to the previous owner (name, photos, links, `owner.github`, `baseUrl`). Do not invent facts: leave a section out if I don't give you the information.

## 2. Convert an existing CV into the markdown format

Use this when your CV is a PDF, Word file, LinkedIn export, JSON Resume or plain text.

> Read `docs/cv-schema.md`. Rewrite the attached CV as `src/content/cv.<code>.md` in exactly that format: front matter, then the sections `contact`, `summary`, `skills`, `experience`, `education`, `certifications`, `languages` with their `{#id}` after each title. Put anything that doesn't fit (projects, publications, volunteering...) in extra sections with their own lowercase ids. Keep my wording, dates and numbers. Never invent or drop information. At the end, list what you were unsure about or had to guess.

## 3. Translate the CV into another language

> Translate `src/content/cv.<source>.md` into <language> as `src/content/cv.<code>.md`. Keep the front matter keys and every `{#id}` exactly as they are, and set `lang: <code>`. Translate titles, summary, job titles, bullets and descriptions. Keep company names, product names, certification titles and proper nouns as they are. Keep dates, numbers and URLs. Don't add or remove facts. Then add `"<code>"` to `languages` in `src/config/site.json` and create `src/i18n/<code>.json` by translating `src/i18n/en.json` (keep the keys). If a contact label is not recognised in this language, add `{#phone}`, `{#email}` or `{#location}` after it (see the schema).

## 4. Update one part of the CV

> In `src/content/cv.en.md`, <add a job / add a certification / change the summary to ...>. Keep the format of the neighbouring entries. Then make the same change, translated, in every other `cv.<code>.md` so the section ids and entries match.

## 5. Hide private details

> Hide my <phone / email / location> on the page and the PDF by adding it to `hide` in the front matter of every CV file. Warn me that the value remains in the markdown file and git history, and tell me how to remove it from the file if I want it gone for good.

## 6. Change how it looks

> Change the accent colour to `<#hex>` and the default theme to `<auto|light|dark>` in `src/config/site.json`. Don't edit the files in `src/vendor/`.

## 7. Add social links

> Add my <network> profile `<url>` to `social` in the front matter of every CV file. Use a network name from `src/js/core/icons.js`; if mine is missing, tell me how to add the icon to `src/vendor/bootstrap-icons/icons.svg`.

## 8. Review the content

In Claude Code you can also ask for the `cv-reviewer` subagent.

> Read `src/content/cv.<code>.md` as a recruiter would. Report, without editing: vague bullets without results, inconsistent date formats, missing sections, typos and anything an applicant tracking system might misread. Then wait for me to choose what to change.

## 9. Open a pull request for review

> Run the checks (`npm test && npm run validate`). Then upload my current branch and open a pull request into `main` with a short title and a description of what changed and that the checks passed. Do not merge it. Tell me that when a reviewer approves and it is merged, the GitHub Pages workflow updates the site by itself, and remind me of the one-time setting: repository Settings → Pages → Source = GitHub Actions.

## 10. Tailor the CV to a job description

> Read `docs/cv-schema.md` and my CV in `src/content/cv.<en|es>.md`. Here is a job description: <paste it>. List the must-have and nice-to-have requirements, and for each one show where my CV covers it. For anything not covered, ask me one question at a time whether I have that experience; never add or exaggerate anything I haven't confirmed. Then write a tailored CV in the same format to `tailored/cv.<company>-<role>.<lang>.md` (relevant skills and bullets first, every job, title and date unchanged) and do not edit anything in `src/`.
