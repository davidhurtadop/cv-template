---
paths:
  - "src/vendor/**"
---

# Vendored libraries

- Files here are third-party code committed as-is; do not edit them.
- Exceptions are the two hand-picked sprites (`bootstrap-icons/icons.svg`, `devicon/tech.svg`): add symbols only as described in `src/vendor/VERSIONS.md`, with prefixed ids, and keep them small because they download whole.
- Update `VERSIONS.md` whenever a file here changes. Do not add npm dependencies to replace anything here.
