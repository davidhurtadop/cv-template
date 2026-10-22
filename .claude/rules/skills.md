---
paths:
  - ".claude/skills/**"
---

# Writing skills for this repo

- Every decision a skill needs from the user is a multiple-choice question with the AskUserQuestion tool (2 to 4 options, the recommended one first and labelled "(Recommended)", header of at most 12 characters). Do not ask choices as plain text, and ask one question at a time.
- Anything that deletes, overwrites, pushes, opens a pull request, merges or changes repo settings needs its own question first, preceded by one line saying exactly what will happen.
- Report progress as a short checklist of one fact per line, with lines under about 80 characters. No long paragraphs.
- Keep `SKILL.md` short and procedural. Point to `docs/cv-schema.md` instead of repeating the format.
- Frontmatter: `description` says what the skill does, `when_to_use` lists trigger phrases, `disable-model-invocation: true` for anything with outside effects, `allowed-tools` only for read-only or local commands.
