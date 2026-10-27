# CV markdown schema

Each language has one file: `src/content/cv.<lang>.md`. All languages must use the **same section ids**, so the site can match them.

## Front matter (YAML)

| Key | Required | Meaning |
|---|---|---|
| `lang` | yes | Language code (`en`, `es`, ...), must match the file name |
| `title` | yes | Browser tab title |
| `description` | no | Search/link-preview text |
| `career_start` | no | `YYYY` or `YYYY-MM` when your career began. Enables the `{{years}}` token (see below) |
| `headline` | no | List of titles typed in the hero banner |
| `hero_image` | no | Wide banner, path relative to `src/` (see `docs/images.md`) |
| `photo` | no | Square profile photo, path relative to `src/` |
| `tech` | no | List of technology slugs shown as a scrolling logo strip in the hero (`python`, `aws`, `dotnet`, ...; full list in `src/js/core/tech.js`). Unknown slugs show as text only |
| `hide` | no | Contact keys (lowercase label, e.g. `phone`) hidden on web and PDF |
| `logos` | no | Map of company name (exactly as written in experience/projects) to a logo image path, e.g. `MVM: img/companies/mvm.svg`. Companies without one get a lettered badge |
| `social` | no | List of `{ network, url }`; `network` is a Bootstrap Icons brand name (`linkedin`, `github`, `twitter-x`, `instagram`, `youtube`, ...) |

## Body

- `# NAME` then a bold line with roles.
- Each section is `## TITLE {#id}`. Known ids: `contact`, `summary`, `skills`, `experience`, `projects` (optional), `education`, `certifications`, `languages`. Any other id becomes a generic text section.
- `contact`, `skills`, `languages`: bullets of the form `* **Label:** value`. Every contact line is optional; for a public repo it is safest to leave out a phone number or address entirely instead of using `hide`.
- `experience`: for each job, a bold line `**Role** — Company`, an italic period line `*MM/YYYY – Present*`, then bullets.
- `projects`: same shape as `experience` (`**Project** — Company`, period), plus an optional one-line description and an optional `Tech: a, b, c` line (`Tecnologías:` also works). On the website each project is a compact card in an auto-advancing carousel: company logo, dates, name, description followed by the first bullet (up to 6 lines) and the first four technologies. The PDF lists name, dates, description and technologies.
- `education`, `certifications`: plain bullets.

## Tokens

Write `{{years}}` anywhere in the text (summary, bullets, `description`) and it is replaced by the whole years since `career_start`, recalculated every time the page loads: `{{years}} years of experience` shows "14 years of experience" in 2026 and "15" in 2027. With only a year (`career_start: 2012`) it counts calendar years; with `2012-02` it counts full years from that month. Add a `+` yourself (`{{years}}+ years`) if you prefer "14+". `npm run validate` fails if `{{years}}` is used without a valid `career_start`, and warns about unknown tokens.

## Rules

- Keep ids identical in every language; translate only titles and text.
- Hidden fields are removed when rendering, but they remain in the file and its git history. In a public repo, don't commit data you must keep private.

## Annotated example (copy this to start from scratch)

```md
---
lang: en
title: "Your Name"
description: "One sentence used by search engines and link previews."
headline: [Your Role, Another Role]       # typed in the hero banner
# hero_image: img/hero.jpg                # optional, see docs/images.md
# photo: img/profile.jpg                  # optional
tech: [python, aws, git]                  # logo strip in the hero
hide: []                                  # e.g. [phone] to hide it on the page
social:
  - { network: linkedin, url: "https://www.linkedin.com/in/your-name" }
  - { network: github, url: "https://github.com/your-name" }
---
# YOUR NAME
**Role | Role**

## CONTACT {#contact}
* **Location:** City, Country
* **Phone:** +00 000 000 0000     # every contact line is optional: leave out what you don't want public
* **Email:** you@example.com

## PROFESSIONAL SUMMARY {#summary}
Two or three sentences.

## CORE COMPETENCIES {#skills}
* **Backend:** Python, Node.js
* **Databases:** PostgreSQL

## PROFESSIONAL EXPERIENCE {#experience}

**Job title** — Company
*MM/YYYY – Present*
* Achievement with a result.

## EDUCATION {#education}
* **Degree** — Institution (YYYY – YYYY)

## CERTIFICATIONS {#certifications}
* Certification — Issuer (YYYY)

## LANGUAGES {#languages}
* **Language:** Level
```

A complete filled-in example in two languages lives in `tests/fixtures/sample/`.
