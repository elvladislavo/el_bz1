# elvladislavo — website

Static site. HTML, CSS and vanilla JavaScript, no build step and no framework.
Upload the folder to any host and it runs.

```
index.html          Home (single page, PL/EN)
404.html            Not-found page (fully self-contained)
privacy.html        Privacy policy (both languages in one file)
robots.txt
sitemap.xml
site.webmanifest
favicon.ico         Root fallback for browsers that ask for it unprompted
.nojekyll           Stops GitHub Pages running the files through Jekyll
css/style.css       Design system + every section
js/script.js        i18n, motion engine, nav, form
js/bz.js            Belousov–Zhabotinsky reaction behind the page
assets/             Images, favicons, OG card
```

---

## Deploying

Every internal path is **relative**, so the site works both at a domain root
(`elvladislavo.com`) and inside a subfolder (`you.github.io/repo-name/`)
with no changes.

### GitHub Pages

`index.html` has to sit at whatever folder Pages is pointed at — not one
level below it.

1. Put the **contents** of this folder at the repository root, so the repo
   contains `index.html`, `css/`, `js/`, `assets/`… directly. If you commit
   the `elvladislavo/` folder itself, Pages serves `/repo-name/elvladislavo/`
   and `/repo-name/` shows nothing.
2. Settings → Pages → Source: **Deploy from a branch**, branch `main`,
   folder `/ (root)`. (Choose `/docs` instead only if you put the files there.)
3. Give it a minute, then load `https://<you>.github.io/<repo-name>/`.

Keep `.nojekyll` in the repo — without it Pages runs the upload through
Jekyll, which silently drops any file or folder whose name starts with `_`.

**Still seeing an unstyled page?** Hard-reload (Ctrl/Cmd + Shift + R) —
GitHub's CDN caches aggressively, and a browser that already fetched the
broken version will hold on to it. Then open DevTools → Network and check
whether `css/style.css` returns 200; a 404 there means `index.html` isn't at
the folder Pages is serving.

### Custom domain later

When `elvladislavo.com` is registered, point it at Pages (or any host) and
nothing in the markup needs editing. The absolute URLs in `robots.txt`,
`sitemap.xml`, the canonical tag and the Open Graph tags already name that
domain — which is what you want: search engines credit the real domain rather
than the temporary Pages URL.

---

## Before you go live

Four things need your input. Everything else is done.

**1 · Email address.** The site uses `hello@elvladislavo.com` throughout.
If that isn't the address you want, replace it in `index.html` (three places
plus the JSON-LD), `js/script.js` (the `MAIL` constant), `404.html` and
`privacy.html`.

**2 · Contact form delivery.** There is no back end. The form validates,
blocks spam with a honeypot, then composes the message and hands it to the
visitor's mail client. It works out of the box on a plain static host.

To have it submit directly instead, set one constant near the top of the form
section in `js/script.js`:

```js
var ENDPOINT = 'https://formspree.io/f/xxxxxxx';   // or Basin, or your own handler
```

Anything that accepts a JSON `POST` works. The payload is
`{ name, email, need, message, lang }`.

**3 · Privacy policy details.** `privacy.html` is written and legally
structured but has two placeholders marked in an HTML comment:
`[LEGAL NAME]` / `[NAZWA]` and `[ADDRESS]` / `[ADRES]`. Section 6 also names
the hosting provider generically — worth naming yours once you've picked one.

**4 · Domain.** Every canonical URL, `hreflang`, Open Graph tag, the sitemap
and the JSON-LD point at `https://elvladislavo.com`. If the domain changes,
search-and-replace it.

---

## Portfolio images

`assets/work-kameralny-*` and `assets/work-zhyvitsa-*` are abstract brand
panels, not screenshots — built in each project's real palette (Kameralny's
near-black and warm room light; Zhyvitsa's deep burgundy). They are art
direction, and the alt text says so.

If you'd rather show real screenshots, drop replacements in at the same names
and sizes (1200×1500 and 700×875, WebP plus a JPEG fallback) and nothing else
needs touching — the `<picture>` markup already handles `srcset`/`sizes`.

---

## Language

**Polish is the default.** The HTML source, the `<title>`, the meta
description, the Open Graph tags and the JSON-LD are all written in Polish and
`<html lang="pl">` — so that is the version search engines index, which is
what you want for `tworzenie stron internetowych`, `strony dla firm` and the
rest of the Polish keyword set.

A visitor whose browser is not set to Polish is switched to English in the
first frame, before anything is painted.

Selection order: `?lang=pl` / `?lang=en` in the URL → a language the visitor
previously **clicked** → browser language → English.

Only a deliberate pick is remembered. An auto-detected language is
re-detected on every visit, so someone who happens to browse in English once
is not locked out of Polish forever.

Both languages live in one dictionary at the top of `js/script.js`, keyed by
the `data-i18n` attributes in the markup. **Edit copy in the dictionary, not
in the HTML** — the HTML only holds the Polish strings for the first paint,
and changing one without the other makes the two languages drift apart.

To flip the default back to English, swap the static strings, `<html lang>`
and the head metadata; the detection logic itself needs no change.

---

## Notes on how it's built

**Fonts** come from Google Fonts: Archivo (variable, carries the width-axis
animation on the big wordmarks), Instrument Serif (the red italics) and Space
Mono (labels and numbers). Latin-Extended is included, so Polish diacritics
render correctly. To remove the third-party request, download the three
families, self-host them in `assets/fonts/`, and swap the `<link>` for local
`@font-face` rules — then update the Google Fonts paragraph in the privacy
policy, which currently discloses it.

**The background** is a Belousov–Zhabotinsky reaction — the real chemistry,
solved as a two-variable Oregonator on a periodic grid in `js/bz.js` — painted
onto one fixed canvas behind every section. The grid is sized from the
viewport (a cell is about 4 px, 3 px on phones), so the spirals keep one scale
on a phone and on a desktop.

Two dials sit at the top of `js/bz.js`, right under the model constants:

```js
var SPEED = 1;   // 1 as shipped · 0.5 half as fast · 2 twice as fast
var SCALE = 1;   // 1 as shipped · 1.5 a larger, cheaper pattern · 0.7 finer
```

`SPEED` is a rate, not a step count, so fractions work and the waves travel at
the same speed on every machine. The loop owes itself steps by the clock and
pays off as many as fit in a 5 ms slice of each frame, so a frame costs the
same whatever the device — a slow one simply sees the waves move slower, and
the simulation can never hold up a scroll. It starts only after the page has
loaded, pauses in a background tab, and holds one still frame under
`prefers-reduced-motion`.

Three dials in `css/style.css` (`:root`) decide how it sits under the type —
`--bz-veil` (how much ink covers the waves), `--bz-blur` (how soft they are)
and `--bz-fade` (brightness). Raise `--bz-veil` for calmer, lower it for
louder. Above the canvas, every dark section lays down a flat scrim and the
blocks that carry copy add a soft ink halo, so no sharp edge ever lands behind
a line of text. `js/bz.js` is dropped in by `index.html` and `privacy.html`;
`404.html` stays self-contained by design and keeps its own glow.

**Motion** runs on one `requestAnimationFrame` loop that sleeps as soon as
everything settles — no permanently running timers. Scroll work reads all
layout in one pass, then writes, so nothing thrashes. Reveals use
`IntersectionObserver` and unobserve after firing. Only `transform`, `opacity`
and custom properties are animated.

**`prefers-reduced-motion`** is honoured properly: the intro is skipped, the
custom cursor is off, parallax stops, and every element renders in its final
state rather than being hidden.

**Accessibility.** Semantic landmarks, one `h1`, ordered headings, visible
2px focus rings, labelled inputs, `aria-expanded` on the accordion and menu,
`role="alert"` on field errors, a skip link, and headings split by word rather
than by character so screen readers still read them normally.

**SEO.** Unique title and description per language, canonical, `hreflang`
alternates, Open Graph and Twitter cards, and JSON-LD describing the studio,
its services, price floors and both real projects. The copy claims a strong
technical foundation and never promises rankings.

**Performance.** No libraries. WebP with JPEG fallback, `srcset`/`sizes`,
lazy loading below the fold, explicit `width`/`height` on images so nothing
shifts as they land.

---

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Open it over `http://` rather than double-clicking the file — `file://` blocks
the browser storage the language switch uses.
