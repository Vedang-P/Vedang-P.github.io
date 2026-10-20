# Vedang Pandey — personal site

A one-page portfolio in the visual language of **Kern Society** (a type-foundry
landing page by Mike Shocking): paper/ink/signal palette, 12-column grid,
hairline rules, monospaced labels, an elastic wordmark, and a quiet
achievements ledger.

No framework, no build step. One HTML file, one CSS file, one JS file.

## Run it

```bash
cd vedang-site
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Opening `index.html` directly also works, but a local server is closer to the
real thing and avoids a few file:// quirks.

## What is where

| File | Purpose |
|---|---|
| `index.html` | All content and section structure |
| `style.css` | Design tokens, layout, card art, responsive rules |
| `main.js` | Hero wordmark, project cards, experience rail, achievements list, contact |
| `favicon.png`, `og.jpg` | Icon and social preview |
| `assets/projects/` | 800×500 card images (WebP) |

## Edit your details

- **Hero name** — the letters in `.wm` in `index.html`. Keep them as individual
  `<span class="wm__l">` elements, split into two `.wm__line` groups (used on
  mobile). The JS measures the actual font, so any name works.
- **Palette** — `:root` in `style.css`: `--paper`, `--ink`, `--signal`.
- **Sections** — `(01)` to `(05)`; headings and copy are plain HTML. The
  experience timeline (`.xp`) fills its rail on scroll; the two roles are plain
  `<li>` elements, so add or reorder them freely.
- **Projects** — the six cards live in `index.html`. Each has an image, tags,
  and GitHub / Live links; edit them in place.
- **Contact** — the form opens the visitor's mail client via `mailto:`. There is
  no backend and nothing is stored. Change the address in `initContact()` and
  in the `mailto:` links.

## Deploy

**GitHub Pages:** create a repository, push these files to the root (or to
`docs/`), then Settings → Pages → deploy from the branch. A repo named
`<user>.github.io` serves at the root.

**Netlify / Vercel:** drag the folder in; no build command, publish directory
`.`.

## Type & credits

- **Roboto Flex**, **Fraunces**, **Recursive** via Google Fonts (all free).
- Lenis smooth scrolling is loaded from jsDelivr and only enhances the page:
  navigation, cards, the form and the clock work without it.
- Layout language inspired by [Kern Society](https://shockingmike.github.io/kern-society/)
  by Mike Shocking. The copy, project content and code are original.

## Accessibility notes

- Semantic sections, a skip link, visible focus styles, labelled form fields and buttons.
- `prefers-reduced-motion` disables the loader, the pointer-driven wordmark and
  the footer stretch.
