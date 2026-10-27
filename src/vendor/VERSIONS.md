# Vendored libraries

Committed as-is so the site needs no install or build step. To update one, download the new release and replace the files here.

| Library | Version | Files | License |
|---|---|---|---|
| Bootstrap | 5.3.8 | `bootstrap/bootstrap.min.css`, `bootstrap/bootstrap.bundle.min.js` | MIT |
| Bootstrap Icons | 1.13.2 | `bootstrap-icons/icons.svg`: a **hand-picked sprite** (not the full 1 MB file), including `chevron-left`/`chevron-right` for the carousel | MIT |
| marked | 18.1.1 | `marked/marked.esm.js` | MIT |
| Devicon | 2.17.0 | `devicon/tech.svg`: hand-picked coloured logo sprite (`original` variants; AWS uses the wordmark one) | MIT (logos remain trademarks of their owners) |
| js-yaml | 5.5.0 | `js-yaml/js-yaml.mjs` | MIT |

## Adding an icon to the sprite

Copy the `<svg>` children of `icons/<name>.svg` from the `bootstrap-icons` npm package into a new
`<symbol id="bi-<name>" viewBox="0 0 16 16" fill="currentColor">` in `icons.svg`, and add the name to
`src/js/core/icons.js`.

## Adding a technology logo

Take `icons/<name>/<name>-original.svg` from the `devicon` npm package and add it to `devicon/tech.svg` as
`<symbol id="tech-<slug>" viewBox="0 0 128 128">…</symbol>`. Prefix every `id=` inside it (and its `url(#…)`
references) with `t-<slug>-` so gradients don't collide, and keep symbols small (the sprite is downloaded
whole). Then add `<slug>: 'Label'` to `src/js/core/tech.js`.
