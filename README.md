# cv-template

A CV/résumé site for GitHub Pages that is driven by markdown. You write your CV in a markdown file, and the page is built from it in the browser: light/dark theme, English/Spanish (or any languages you add), social icons, and a hero banner, and a PDF download built from the same markdown. No build step and no dependencies to install.

This repository is also the author's own live site, so it works as a template: copy it, replace the content with yours, publish.

## Make your own CV site

1. **Copy the repo.** On GitHub choose **Use this template** (or **Fork**) and name it. (Repository owners: the **Use this template** button only appears after ticking **Template repository** in Settings → General.) For a profile site named `<username>.github.io` or any project name, both work.
2. **Replace the content.** Edit these files; nothing else is needed:

   | File | What to change |
   |---|---|
   | `src/content/cv.en.md` | Your CV. Keep the structure: front matter, then sections with `{#id}` after each title. A full annotated example is in [docs/cv-schema.md](docs/cv-schema.md). |
   | `src/content/cv.es.md` | The same CV in a second language. Delete it (and remove `es` from `languages` below) if you only need one. |
   | `src/config/site.json` | `owner.github` (your username), `languages`, `defaultLang`, `layout` (`horizon` or `ledger`), `defaultTheme` (`auto`, `light` or `dark`), `accent` colour, `baseUrl` (your final Pages URL). |
   | `src/i18n/<lang>.json` | Button and menu labels for each language. Copy `en.json` for a new language. |
   | `src/index.html` | The `<title>`, description and `og:` tags near the top: copies of your default-language title and description so link previews (LinkedIn, WhatsApp) show your name. Also `theme-default`, which must match `defaultTheme`. `npm run validate` warns when they drift. |
   | `src/img/` | Optional hero image and profile photo, referenced from the front matter. See [docs/images.md](docs/images.md) for sizes. |

   Hide private contact details with `hide: [phone]` in the front matter. They are removed from the page, but **they stay in the markdown file and git history, so don't commit data you need to keep private** in a public repo.
3. **Preview locally** (needs Node 20+, nothing to install): `npm start`, then open http://localhost:3000. Add `?lang=es`, `?theme=dark`, `?layout=ledger` or `?debug=1` to the URL to test a language, a theme, the other layout, or to list missing sections.
4. **Check your content:** `npm test && npm run validate`. It catches missing sections, language mismatches, unknown social networks and oversized images.
5. **Deploy** (once per repo):
   1. Push your changes to the `main` branch.
   2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
   3. Open the **Actions** tab. The *Deploy to GitHub Pages* workflow runs the tests and validation on every pull request into `main` (without deploying), and on every push or merge to `main` it also publishes the `src/` folder.
   4. When it is green, your site is at `https://<username>.github.io/<repo-name>/` (shown in the workflow summary). Put that URL in `baseUrl`.

After that, updating your CV is: edit the markdown, commit to `main` (directly or by merging a pull request), wait about a minute. In Claude Code, `/cv-pr` opens the pull request for review; once it is merged into `main` the site updates by itself.

## PDF

The **Download PDF** button (and Ctrl/Cmd+P) prints an A4 version of the CV built from the same markdown, in the current language. In the print dialog choose **Save as PDF**; the proposed file name is "CV - Your Name (en)", in the current language. The PDF always prints dark-on-white, and hidden contact fields are left out. The text stays selectable.

## Using Claude to edit your CV

In Claude Code, run `/cv-setup`: it guides you step by step the first time, and afterwards asks what you want to change (add a job, translate, import a CV, validate, publish). To adapt your CV to a job offer, run `/cv-tailor` with the job description: it asks about anything the job needs that your CV doesn't show, never invents experience, and saves a separate markdown file in `tailored/` (kept off GitHub) without touching the website. The skills live in `.claude/skills/`. [docs/claude-prompts.md](docs/claude-prompts.md) has the same jobs as copy-paste prompts for the usual jobs: setting up from scratch, converting a CV from PDF/Word/LinkedIn into the markdown format, translating to another language, updating one entry, hiding details and publishing.

## Where things are

- `src/`: the published site. `content/` (your CV), `config/`, `i18n/`, `layouts/` (page markup and styles, including the A4 print view), `js/` (engine), `css/`, `vendor/` (Bootstrap, icons, marked, js-yaml, committed as-is).
- `.claude/`: Claude Code configuration: `settings.json`, path-scoped `rules/`, a `cv-reviewer` subagent, and `skills/` for setup, updates, translation, import, validation and publishing.
- `docs/`: the markdown format ([cv-schema.md](docs/cv-schema.md)), image specs, and Claude prompts.
- `scripts/validate.mjs`, `tests/`: content validation and parser tests.
- `.github/workflows/pages.yml`: the deployment.

## Notes

- The CV is rendered by JavaScript in the browser, so open it through a web server (`npm start`), not by double-clicking `index.html`.
- Page content is trusted markdown from you; it is not sanitised, so don't paste untrusted HTML.
