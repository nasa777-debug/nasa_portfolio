# Narayanaswamy C — Portfolio

A scroll-driven, animation-heavy portfolio inspired by [lukebaffait.fr](https://lukebaffait.fr/), built for Narayanaswamy C — CS undergraduate at LICET (Chennai), full-stack developer and computer-vision tinkerer.

## Run it

Any static server works:

```bash
python3 -m http.server 8931
# open http://localhost:8931
```

(Opening `index.html` directly via `file://` also works; the CDN scripts are the only external dependency.)

## Stack

- **GSAP 3 + ScrollTrigger** (CDN) — all scroll choreography
- **Lenis** (CDN) — smooth inertia scrolling, synced to GSAP's ticker
- **Vanilla HTML/CSS/JS** — no build step
- **Procedural artwork** (`js/art.js`) — every "image" is drawn at runtime on `<canvas>`:
  the WebGL hero shader, six project covers (VHS-grain dashboard / candlestick /
  diff-grid / radar / YOLO-box / network motifs), the terminal-style portrait
  poster, and the red ASCII footer panels. No binary assets, nothing to host.

## The experience, top to bottom

1. **Preloader** — "Narayanaswamy C." reveals char-by-char, scales down to the
   viewport edge, then dual red/dark panels wipe away.
2. **Pinned hero (400vh)** — a WebGL fbm-noise canvas (mouse-reactive) behind
   HUD chrome. Scrolling scrubs a fixed reveal overlay: the name splits off the
   screen, a cover frame scales in, and "Basically, I build systems that ship."
   unblurs char-by-char over a procedural filmstrip.
3. **About** — word-by-word blur reveal, a parallaxed terminal-profile poster,
   and rolling red stat numbers (300+ LeetCode · 8.7 CGPA · 80% mAP@50).
4. **Projects** — sticky list, nearest-item activation, mouse-tilted 3D preview
   card with a "See project" cursor, and a red fluid SVG line drawn on scroll.
   Click twice to open a full-screen detail overlay with a flying-title
   transition, description, tags, and a wheel-driven gallery. `Esc` closes.
5. **Circle gallery (600vh)** — covers orbit a 3D ring with cylindrical slice
   bending while a phrase un-blurs at the center.
6. **Skills** — sticky headline, one-open accordion, a red arrow that travels
   across the whole zone on scroll.
7. **Achievements** — award rows with white fill-up highlight + image cursor.
8. **Contact** — a giant white blob expands from the bottom, inverting the page
   (dark text on light), with floating framed covers and availability notes.
9. **Footer** — two procedural ASCII clouds (the lukebaffait.fr pipeline:
   soft density-map → 80-col brightness-tiered glyph pools, seeded so the
   shape is identical every load) that parallax in on scroll and dissolve
   under the cursor — chars churn through the inverted glyph pool with an
   accent highlight, then settle. Plus char-rollup links and the giant
   "NarayanaswamyC." wordmark.
10. **HUD** — right-side section timeline (clickable, per-section fills) and a
    live scroll percentage on the left.
11. **Single fixed accent** — one vibrant red-orange (`#ff4d00`) shared by all
    CSS accents, the procedural canvas art and the WebGL hero shader (the
    theme switcher was removed).

Also included: custom Lenis lerp zones, mobile fallbacks (3D gallery disabled,
stacked layouts), `prefers-reduced-motion` support, a `<noscript>` fallback, and
resize-safe anchor logic throughout.

## Content source

All copy comes from the current resume (DOCX/PDF in `assets/`). Project detail
overlays, hover previews, the hero reveal filmstrip and the orbiting circle
gallery all use real app screenshots from `assets/screenshots/` (Stock
Analyzer, India Web Usage, Calm Canvas) and link to their GitHub repos via the
`link:` fields of `PROJECTS` in `js/main.js`. BootUp, YOLO-OBB Vision Lab and
the DSA grind use matching dark terminal-style placeholder cards (no real
screenshots exist for them yet) — drop a JPEG into `assets/screenshots/` and
add its filename in `PROJECT_SHOTS` / `SHOT_BY_PAINT` to replace one.

## Files

```
index.html        markup for every section
css/style.css     full design system (Space Grotesk / Inter / JetBrains Mono)
js/art.js         procedural canvas + WebGL artwork
js/main.js        all choreography (intro, reveals, projects, gallery, contact…)
drafts/           earlier static drafts kept for reference
```
