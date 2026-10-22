---
name: cv-validate
description: Check this CV site's content (section ids, language parity, front matter, social and tech names, images) and run the tests.
when_to_use: After any content change, before publishing, or when the user asks to verify or check the CV.
allowed-tools: Bash(npm test) Bash(npm run validate)
---

# cv-validate

1. Run `npm test` and `npm run validate`.
2. Errors must be fixed before continuing; typical causes: a section id missing in one language, `lang` not matching the file name, a missing image, a duplicate id. Fix the markdown (never the validator) and rerun.
3. Warnings are for the user's judgement: explain each one (oversized or wrongly proportioned image, unknown social network or technology name, `hide` key that matches no contact field).
4. Optional visual check: `npm start`, open http://localhost:3000 (and `?lang=<code>`, `?theme=dark`, `?debug=1` to list missing or unresolved sections).
5. Report what passed, what you fixed and what remains.
