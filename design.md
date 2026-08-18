# Bihar AI Mission — Design System (design.md)

> This file is the single source of truth for visual and motion design. Any agent (Antigravity/Gemini, Claude Code, or a human dev) touching `src/components`, `src/pages`, `src/experience`, or `src/theme/theme.js` must follow this document. It replaces ad-hoc, inconsistent styling across components.

---

## 0. Design Philosophy

Bihar AI Mission is a **state government AI-literacy initiative** — it needs to feel credible, modern, and civic (like a serious institution), not like a startup SaaS landing page or a generic AI-tool wrapper. The current failure mode is "AI slop": default purple/blue gradients, Inter-everywhere, symmetrical card grids, no motion personality.

Three non-negotiables:
1. **No purple/violet gradient hero.** No glassmorphism-by-default. No generic "AI" iconography (glowing brains, neural-net line art, sparkle icons).
2. **One visual anchor per screen section** — not four identical cards fighting for attention.
3. **Motion must be earned** — animate to communicate hierarchy or feedback, never as decoration for its own sake.

---

## 1. Color System

Avoid the default "AI purple." Instead root the palette in Bihar's own visual identity — Madhubani/Mithila art uses deep indigo, terracotta/rust, mustard, and warm off-whites. This gives the site a distinctive, culturally grounded, non-generic identity while still reading as modern and digital.

### 1.1 Core palette

| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#141A2E` | Primary text, headings, dark nav bg |
| `--color-indigo-900` | `#1B2447` | Primary brand color — hero backgrounds, primary buttons |
| `--color-indigo-600` | `#2E3B7A` | Hover states, secondary emphasis |
| `--color-terracotta-500` | `#C1552C` | Primary accent — CTAs, active states, highlights |
| `--color-terracotta-300` | `#E28B5C` | Accent hover, illustrative details |
| `--color-mustard-400` | `#E8B23D` | Secondary accent — badges, stats, small highlights (use sparingly, <10% of a screen) |
| `--color-sand-50` | `#FBF6EE` | Page background (replaces default pure white) |
| `--color-sand-100` | `#F3EADA` | Card/section background alternation |
| `--color-line` | `#E4D9C4` | Borders, dividers (warm, not cold gray) |
| `--color-ink-muted` | `#5A5F73` | Secondary/body text |
| `--color-success` | `#2F7A4F` | Confirmations, enrollment success |
| `--color-error` | `#B3341C` | Errors, validation |

Do **not** introduce a violet/magenta hue anywhere. Do not use `#F5F5F5`/pure white/pure black — always route through the sand/ink tokens above so the whole site reads as one warm, intentional system.

### 1.2 Dark surfaces (Navbar, Footer, hero overlays)
Use `--color-ink` or `--color-indigo-900`, never pure black. Text on dark = `--color-sand-50`, muted text on dark = `#A9AEC4`.

### 1.3 Gradients (use rarely, max one per page)
If a gradient is used (e.g., hero backdrop), it must be a **subtle two-stop indigo-to-ink diagonal** (`#1B2447 → #141A2E`, 135deg), optionally with a soft terracotta radial glow at 8-12% opacity positioned off-center — not centered, not full-bleed rainbow.

### 1.4 Update `src/theme/theme.js`
Centralize every token above as the single export. No component should hardcode a hex value — everything pulls from `theme.js`. This is the #1 fix for the "messed up/inconsistent" complaint, since right now every component likely defines its own ad-hoc colors.

---

## 2. Typography

Inter-only is the single biggest "AI-generated" tell. Pair a characterful display face for headlines with a clean workhorse for body text.

- **Display / Headings:** `Fraunces` (variable, has a "soft" optical style — warm, editorial, not corporate) or `Bricolage Grotesque` as an alternative if a sans display is preferred.
- **Body / UI:** `General Sans` or `Sora` (keep Inter only as a last-resort fallback, not the primary).
- **Numerals/Stats (StatsPanel):** Use tabular numerals of the body font, large weight (600–700), never the display serif for numbers.

Type scale (rem, 16px base):
| Role | Size | Weight | Line-height |
|---|---|---|---|
| Hero H1 | 3.5–4.5rem (clamp) | 600 | 1.05 |
| Section H2 | 2.25–2.75rem (clamp) | 600 | 1.15 |
| Card H3 | 1.25rem | 600 | 1.3 |
| Body | 1rem–1.125rem | 400 | 1.6 |
| Small/meta | 0.875rem | 500 | 1.4 |

Headline copy should be set with **intentional line breaks** (not just wrapped by the browser) and generous `letter-spacing: -0.02em` on large sizes.

---

## 3. Spacing, Grid & Shape

- 8px base spacing unit. Section vertical padding: 96–140px desktop, 56–72px mobile — current inconsistency (per your complaint) usually comes from every component picking its own padding; standardize via a `--space-section` token.
- Content max-width: 1200px, with a wider 1440px "canvas" allowance for the `experience/` full-bleed scenes.
- Border-radius: two tokens only — `--radius-sm: 10px` (buttons, inputs) and `--radius-lg: 24px` (cards, modals). Do not mix 4px/8px/12px/16px randomly across components.
- Shadows: one soft elevation system, warm-toned (not cold gray): `box-shadow: 0 8px 30px -12px rgba(20,26,46,0.18)`. Increase blur/offset on hover, don't add a second shadow color.

---

## 4. Component Patterns

### 4.1 Buttons
- **Primary:** `--color-terracotta-500` fill, `--color-sand-50` text, `--radius-sm`. On hover: darken 8% + scale(1.02) + shadow lift, 180ms ease-out.
- **Secondary:** transparent fill, 1.5px `--color-indigo-900` border, fills on hover.
- **Ghost/nav links:** underline that draws in from left on hover (width 0→100%, 250ms), not a color-only change.
- Every button needs a `:active` state (scale 0.97) so clicks feel tactile — this is currently likely missing everywhere.

### 4.2 Cards (Pillars, UseCases, Training, Startup, LearningHub course cards)
- One consistent card shell: `--color-sand-50` bg, `--radius-lg`, 1px `--color-line` border, soft shadow.
- On scroll into view: fade + rise 24px→0, staggered 60–90ms between siblings (see §5).
- On hover: lift 4px + shadow deepen + the card's accent icon/number nudges slightly — **do not** scale the whole card (that's the generic tell); scale only an inner accent element.
- Cards should NOT be four identical clones. Vary emphasis: e.g., in a 4-up Pillars grid, make one card visually larger/first (bento-style) rather than a perfectly even 4-column grid every time.

### 4.3 Navbar
- Transparent over hero, solidifies to `--color-ink` with blur(12px) after ~80px scroll — animate background-color + shadow, not a hard cut.
- Active route indicator: a small terracotta dot or underline, animated with a sliding indicator (use `layoutId` if Framer Motion, or GSAP `to()` on a pill element) rather than an instant class swap.

### 4.4 Modals (AuthModal, GetInvolvedModal, CertificateModal, ContactUsModal, PhonePePaymentModal)
- Consistent entrance: backdrop fade 200ms + modal scale 0.96→1 + translateY 12px→0, 280ms ease-out. Exit is the reverse, faster (180ms).
- Consistent shell: `--radius-lg`, `--color-sand-50`, close button top-right with a rotate-on-hover micro-interaction.
- These five modal components currently likely each implement their own animation/shell — consolidate into one shared `Modal` wrapper component (new file: `src/components/Modal/Modal.jsx`) that all five use, passing only their content as children. This alone fixes most of the "messed up" inconsistency.

### 4.5 Forms/Inputs
- Consistent input shell across AuthModal, ContactUsModal, GetInvolvedModal, UserProfilePage: `--radius-sm`, 1.5px `--color-line` border, focus state = border color shifts to `--color-terracotta-500` + subtle glow ring, label animates up-and-shrinks (floating label) rather than static placeholder-only.

---

## 5. Motion System

Motion should map to three moments only — keep it disciplined, not "animate everything":

1. **Page/section load:** Hero content (headline, subhead, CTA) enters as a staggered sequence (headline first, 0ms; subhead +120ms; CTA +200ms), each rising 16px + fading in, 500–650ms ease-out. This is a natural extension of the existing `experience/scenes/WelcomeScene` + `useGSAPTimeline` — use that infrastructure for the hero, don't hand-roll a second animation system in Hero.js.
2. **Scroll-triggered reveal:** Each major section (Banner, Pillars, StatsPanel, UseCases, Training, Startup, CTA) fades/rises into view once when it crosses ~75% viewport, using the existing `useScrollProgress` hook — wire GSAP ScrollTrigger (or IntersectionObserver if GSAP's plugin isn't licensed) to trigger once, not on every scroll pass. Numbers in StatsPanel should count up from 0 to their value over ~1.2s when revealed, not just appear.
3. **Interaction feedback:** hover/focus/active states as defined in §4 — always under 250ms, always `ease-out` on enter and `ease-in` on exit for a natural snap.

Explicitly avoid: parallax on every section, infinite auto-looping animations, animated gradient backgrounds that shift constantly (all read as generic AI-site filler motion). Motion should have a beginning and an end, not run forever in the background.

Respect `useReducedMotion` (already present in your codebase) — every animation above must degrade to a simple opacity fade when reduced motion is requested.

---

## 6. Homepage Section-by-Section Notes

Order per current `App.js`/`HomePage.js` composition (adjust if actual order differs): Navbar → Hero → Banner → Pillars → StatsPanel → UseCases → Training → LearningHub preview → Startup → CTA → Footer.

- **Hero:** One clear headline (Bihar's AI mission statement), one subhead, one primary CTA + one secondary ("Explore Courses"). Background: the existing canvas/particle `experience` system tuned to indigo/terracotta palette (§1), kept subtle — not a busy animated backdrop competing with the text.
- **Banner:** Convert to a single-line marquee or stat strip (e.g., "12,000+ learners • 40 districts • 6 masterclasses") — thin, understated, not another big card section.
- **Pillars:** Bento-style asymmetric grid (§4.2), each pillar with a distinct terracotta/indigo/mustard accent rather than all four cards identical in color.
- **StatsPanel:** Big animated count-up numbers, generous whitespace, no card borders needed here — numbers should be the visual anchor.
- **UseCases / Training / Startup:** These three risk looking like the same card-grid three times in a row. Differentiate their layouts: e.g., UseCases = horizontal scroll-snap carousel; Training = alternating left/right image+text rows; Startup = bento grid. Visual rhythm > uniformity.
- **CTA (pre-footer):** Full-bleed `--color-indigo-900` band, terracotta button, minimal copy.
- **Footer:** `--color-ink` background, structured columns, no gradient.

---

## 7. Anti-"AI Slop" Checklist (run before shipping)

- [ ] No purple/violet anywhere
- [ ] No font is "Inter" for headlines
- [ ] No section is a perfectly even 3/4-card grid with identical styling
- [ ] No infinite background animation
- [ ] No glowing-brain / neural-network / sparkle stock icon
- [ ] Every interactive element has a hover AND active state
- [ ] Every color used traces back to a token in `theme.js`
- [ ] At least one section per page breaks the grid intentionally (asymmetry)
- [ ] Copy is specific to Bihar/the mission, not generic "Empowering the future with AI" filler

---

## 8. Implementation Priority

1. Centralize `theme.js` tokens (§1–3) — highest leverage fix for "everything looks inconsistent."
2. Build shared `Modal` and `Button` components; migrate the 5 modal components + all CTAs onto them.
3. Standardize card shell → apply to Pillars/UseCases/Training/Startup/LearningHub.
4. Wire scroll-reveal + count-up motion using existing GSAP/experience infrastructure.
5. Re-layout Hero, Pillars, Banner per §6 for visual variety.
