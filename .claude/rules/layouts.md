---
paths:
  - "src/layouts/**"
  - "src/css/**"
  - "src/js/**"
---

# Layouts, styles and engine

- Colours come from `src/css/tokens.css` variables (light and dark sets, `--accent` from `site.json`); never hard-code theme colours in a layout.
- Layouts are markup with placeholders (`data-cv`, `data-cv-html`, `data-cv-attr`, `data-if`, `<template data-repeat>`) filled by `src/js/core/render.js`; keep CV text out of layout files. Inside a `<template data-repeat>` paths read the current item only; use `@root.path` for page-level values.
- `src/js/core/` must stay dependency-free ESM that runs in both the browser and Node (`scripts/validate.mjs` and the tests import it). Only `render.js` may touch the DOM.
- Section navigation is any element marked `data-spy-nav`; `js/features/scrollspy.js` sets `.active` on its `#anchor` links. A layout folder needs `layout.html` and `layout.css`, and its name must be added to `LAYOUTS` in `src/js/core/schema.js`.
- A new section type needs `schema.js`, `view-model.js`, the web layout and `layouts/print/`.
- The PDF is the browser print dialog on purpose: no PDF library, no generated PDF files.
- No bundler, framework or npm dependencies; `package.json` stays dependency-free.
