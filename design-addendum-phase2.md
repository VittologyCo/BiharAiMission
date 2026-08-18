## 9. Phase 2 Addendum — Tailwind & Component Library Stack

> Append this section to the end of your existing `design.md`. It governs all work from
> Navbar/Footer onward and supersedes §5's "prefer extending GSAP over adding new libraries"
> guidance for this specific stack — that guidance was written before this decision.

### 9.1 Decision
Tailwind CSS is added **project-wide**, installed via **CRACO** (`@craco/craco`) so `react-scripts`
does not need to be ejected. This unlocks Aceternity UI, OriginUI, and 21st.dev, whose components
are Tailwind + Framer Motion based.

This is an **addition, not a migration**: everything built in Steps 1–4 (`theme.css` tokens,
`Button`, `Modal`, the homepage sections) stays exactly as it is, in CSS Modules, untouched. Do
not retroactively convert them to Tailwind. Tailwind is for new component-library-sourced work
going forward, starting with Navbar and Footer.

### 9.2 Required setup (do once, before any component work)
1. Install: `tailwindcss`, `postcss`, `autoprefixer`, `@craco/craco`, `framer-motion`, `clsx`,
   `tailwind-merge`, `react-useanimations`.
2. Configure `craco.config.js` to wire Tailwind's PostCSS plugin into the existing CRA build
   without ejecting.
3. In `tailwind.config.js`, `theme.extend` must import/mirror the **exact** token values from
   `src/theme/theme.js` / `theme.css` (§1–3): `colors` (ink, indigo900, indigo600, terracotta500,
   terracotta300, mustard400, sand50, sand100, line, inkMuted, success, error), `fontFamily`
   (display: Fraunces, body: General Sans), `borderRadius` (sm: 10px, lg: 24px). **Do not** use
   Tailwind's default color palette (its default `indigo`/`violet`/`purple` scales must not be
   reachable via `bg-indigo-500` etc. resolving to Tailwind's stock hex — remap those keys to the
   project tokens or use only the custom keys).
4. Set `corePlugins.preflight: false` (or carefully scope Tailwind's base layer) so Tailwind's
   CSS reset does not clobber the existing global styles in `src/index.css`. Verify visually
   after enabling — this is the most common breakage point when adding Tailwind to an existing
   styled app.
5. Create `src/lib/cn.js` exporting a `cn()` helper (`clsx` + `tailwind-merge`) — the standard
   utility Aceternity/OriginUI-style components expect for conditional class merging. Used only
   inside Tailwind-authored components, not CSS Module components.

### 9.3 Motion library split (intentional, not redundant)
- **GSAP** (existing, via `useGSAPTimeline`/`useScrollProgress`) stays the system of record for
  the `experience/` canvas, hero entrance, and scroll-triggered section reveals. Do not
  reimplement any already-GSAP-driven animation in Framer Motion.
- **Framer Motion** is scoped to components sourced from Aceternity UI / OriginUI / 21st.dev —
  their animation logic ships in Framer Motion and should stay that way rather than being
  hand-ported to GSAP.
- Both are acceptable to coexist since they serve different layers (canvas/scroll orchestration
  vs. discrete component micro-interactions) — do not let a third motion approach appear.

### 9.4 Icon system
`react-useanimations` is the single animated-icon library for the project. Do not add LordIcon or
Lottie/lottie-react on top of it — if a homepage or admin section still uses a static icon set
(e.g. lucide/heroicons), only swap it for an animated one at Nav/Footer/interactive trigger
points (menu toggle, socials, notification bell) where the motion earns its place — not on every
static icon on the page (see §5's "motion must be earned" rule).

### 9.5 Particle backgrounds
Do not add `tsparticles`/`particles.js`. The project already has a purpose-built canvas particle
system at `src/experience/canvas/particles/ParticleSystem.ts` + `presets.ts`. Reuse and restyle
that system (palette, density, speed) for any new section that wants a particle backdrop rather
than introducing a second, competing particle engine.

### 9.6 Non-negotiable: re-theme everything pulled from these libraries
Aceternity UI, OriginUI, and 21st.dev's public demos default to purple/violet gradients, neon
glows, and dark-glassmorphism — this is precisely the generic "AI-tool" look §0 and §7 of this
document exist to avoid. Treat their code as a **structural and animation template only**:

- Every color value in copied component code must be replaced with a token from §1 before it is
  considered done — no exceptions, no "we'll reskin it later."
- Prefer components with a spotlight/border-glow/bento/card-hover-3d *mechanic* that can carry the
  indigo/terracotta/sand palette, over components whose whole identity is a specific purple
  gradient effect (e.g. skip "aurora background," "meteor," or default "glowing gradient border"
  variants unless recolored to the project palette first).
- Run every new component through the §7 anti-slop checklist before it ships, same as
  homepage work.
