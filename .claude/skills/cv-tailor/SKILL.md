---
name: cv-tailor
description: Generate a CV tailored to a job description, as a new markdown file in this repo's CV schema, using only experience the user has confirmed. Never edits the website or the main CV files.
when_to_use: The user shares a job description, job posting or link and wants a CV adapted to it, or asks to tailor, target or customise their CV for a role.
argument-hint: "[job description text, file path or link]"
---

# cv-tailor

Writes **one new file**, `tailored/cv.<company>-<role>.<lang>.md`, in the format of `docs/cv-schema.md`. It never changes `src/` (the website, `src/content/cv.*.md`, config, layouts). Follow `.claude/rules/skills.md`: plain language, every choice as an AskUserQuestion, one question at a time.

## The one rule: nothing invented

The tailored CV may only contain facts from the user's CV (`src/content/cv.<lang>.md`) or facts the user confirms in this conversation. Never add a job, title, employer, date, tool, certification, degree, number or achievement that is not there. Do not stretch wording either: "used once" must not become "expert in", and a tool mentioned for one job must not move to another. When in doubt, ask. When the user says no, leave it out.

## Steps

1. **Job description.** Take it from $ARGUMENTS: pasted text, a file path (read it), or a link (fetch it; if that fails, ask the user to paste the text). If nothing was given, ask for it.
2. **Language.** Ask: "English", "Español", or "Both". The source for each is `src/content/cv.en.md` or `src/content/cv.es.md`.
3. **Read the job.** List for the user, briefly: company, role, the must-have requirements, the nice-to-haves and the key terms (tools, methods, domain). Ask "Does this look right?" (yes / let me correct it).
4. **Match against the CV.** For each requirement find the evidence in the CV and show a short checklist: `✔ covered` (quote where), `◐ partial`, `✘ not in your CV`.
5. **Ask about the gaps**, one requirement at a time, starting with the must-haves. Options: "Yes, I have done this" (then ask where, when and what, in their words), "Some exposure" (ask for the honest extent), "No, leave it out". Use only what they answer. Note confirmed new facts so you can offer to add them to the main CV at the end.
6. **Tailor, truthfully.**
   - Summary: rewrite it around the role using only real experience; keep `{{years}}` replaced by the actual number (the file is standalone).
   - Skills: put the categories and items the job asks for first; keep wording true to the CV.
   - Experience: keep every job, title, company and date exactly. Reorder bullets so the relevant ones come first, tighten wording, and use the job's terms only where they truthfully describe the same thing. Older or unrelated jobs may be shortened to their most relevant bullets.
   - Certifications, education, languages: keep them all; relevant ones first.
   - Front matter: same keys as the source, plus `tailored_for: { company, role, date }`. Keep `social`; drop `tech`, `hero_image` and `photo` (website-only). Keep the section ids.
7. **Save** to `tailored/cv.<company>-<role>.<lang>.md` (lowercase, hyphens; one file per language). The `tailored/` folder is gitignored, so these files stay on this computer and never reach the public repo. Say so.
8. **Check** with `node scripts/validate.mjs tailored/<file>` and fix any error.
9. **Report** in short lines: the file path, what was emphasised, requirements still not covered (and that they were left out on purpose), and the questions the user declined. Then ask: "Add the facts you confirmed to your main CV too?" (Yes, with `cv-update` / No). Do not touch `src/` unless they say yes.
