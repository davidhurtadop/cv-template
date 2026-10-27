# Images

Both images are optional. Put the files in `src/img/` and reference them from the front matter of each CV file (paths are relative to `src/`):

```yaml
hero_image: img/hero.jpg
hero_image_light: img/hero-light.jpg   # optional, used in the light theme
photo: img/profile.jpg
```

If `hero_image` is missing, the hero uses a gradient that follows the light/dark theme. `hero_image_light` is an optional light version (same size rules) shown in the light theme with dark text and no dark overlay; without it the light theme uses `hero_image` too. If `photo` is missing, nothing is shown in its place.

## Hero image (wide banner)

| | |
|---|---|
| Format | JPG or WebP (PNG works but is heavy) |
| Size | **1920 × 1080 px** (16:9, landscape). Anything from 1600 px wide with a 16:9 ratio is fine |
| Weight | Under **400 KB**. Compress with squoosh.app or similar |
| Composition | The name and buttons sit on the left and middle, so keep the subject on the right or leave quiet space on the left. Avoid busy detail behind the text |

A dark overlay is added so white text stays readable, so very bright or very dark photos both work. The same image is used in light and dark mode.

## Profile photo (optional)

| | |
|---|---|
| Format | JPG or WebP |
| Size | **Square, 800 × 800 px** (at least 400 × 400) |
| Weight | Under 400 KB |
| Composition | Head and shoulders, face centred. It is shown as a circle in the hero |

## Checking

`npm run validate` warns when a file is missing, over 400 KB, or has the wrong proportions (it reads sizes of JPG and PNG; for WebP it checks only the weight).
