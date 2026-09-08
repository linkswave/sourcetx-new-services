# Homepage Apple-grade 3D + Motion Design

Date: 2026-09-04
Status: Approved by user (approach A selected)

## Goal

Make the SourceTX homepage feel premium and "Apple-grade" using native CSS 3D
and lightweight JavaScript. Scope is intentionally limited to the homepage
hero and the capability/service card grid on `public/index.html`. Other 41
pages remain untouched.

## Approach

**A: CSS 3D + light JS** (selected). No WebGL, no Three.js, no new runtime
dependencies. All depth/motion is CSS transforms + a small JS driver
(`public/js/motion.js`). Keeps every page fast and robust, degrades cleanly.

## Visual language

- **Capability cards** (`div.home-capabilities > a.home-capability`):
  - Container gets `perspective`.
  - Card uses `transform-style: preserve-3d`.
  - On pointer move, card rotates toward cursor (max ~8 deg, eased), so the
    face "follows" the mouse like Apple product tiles.
  - Inner layers at different depths: ghost number (far back), text content
    (mid), sheen highlight (near) — gives the card real thickness.
  - Moving specular "glass" highlight follows cursor via CSS custom props.
  - On pointer leave, card springs back to flat.
- **Hero depth** (`section.hero`): a restrained 3D "core" — concentric glass
  rings + a glowing gradient orb built from stacked `translateZ` layers,
  slowly rotating, plus gentle pointer parallax on the rings. No particles,
  no WebGL. Must not fight the headline copy; sits visually behind/right.

## Interaction & scroll

- Scroll reveals: cards rise with a slight 3D flip + stagger as they enter
  viewport (IntersectionObserver).
- Pointer parallax on hero layers; cards use per-card tilt.
- All animation triggered once per view, not re-run on every frame.
- Motion stays ~60fps: use `transform`/`opacity` only; avoid layout thrash.

## Files

- `public/css/styles.css` — append v2.1 3D classes + CSS custom props.
  Cache-bust on pages that load it: `css/styles.css?v=11`.
- `public/js/motion.js` — new file; drivers: IntersectionObserver reveals,
  pointer tilt on cards, hero parallax, `prefers-reduced-motion` handling.
  Loaded only on homepage. Cache-bust `js/motion.js?v=1`.
- `public/index.html` — only homepage changes: add script/style refs and
  hero "core" markup; capability grid markup unchanged (JS targets classes).

## Guardrails

- `prefers-reduced-motion: reduce` → disable tilt/flip/parallax entirely;
  layout stays static and readable.
- No-JS: all content remains visible; only motion/tilt is absent.
- Pointer-only interactions (mouse). Touch devices get scroll reveals only.
- No change to copy, nav, footer, chat widget, cookie banner, or any other
  page. 19 `npm test` checks continue to pass.
- Keep existing `section-head`/CTA/industries styling intact.

## Testing

- `npm test` (19 checks) after changes.
- Visual check: hero + capability grid on homepage at desktop width, hover
  tilt, scroll reveal, reduced-motion off/on, and keyboard/touch no-op.
