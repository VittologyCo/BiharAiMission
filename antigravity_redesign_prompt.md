# Prompt for Antigravity (Gemini) — Bihar AI Mission Homepage Redesign

Paste everything in the box below as one message to the Antigravity agent, with `design.md` and `PROJECT_STRUCTURE.md` attached/open in the workspace so it can read them as context.

---

```
ROLE
You are acting as a senior front-end/UI engineer doing a visual redesign pass on an existing
React project called "Bihar AI Mission." This is a REDESIGN, not a rebuild — do not change
routing, business logic, Supabase calls, auth flow, payment integration, or any data-fetching
logic. Only touch presentation: JSX structure where needed for new layout, CSS/styling,
animation, and shared component extraction.

CONTEXT
- Read `design.md` in the project root fully before writing any code. It is the design system
  and is the source of truth for colors, typography, spacing, motion, and component patterns.
  Every visual decision you make must be traceable to a rule in that file.
- Read `PROJECT_STRUCTURE.md` to understand where things live before editing.
- The project already has an animation/canvas system under `src/experience/` (GSAP timelines via
  `useGSAPTimeline`, scroll progress via `useScrollProgress`, particle/canvas rendering). Reuse
  and extend this system for hero and scroll motion instead of introducing a second, competing
  animation library or hand-rolled CSS animation approach.
- Styling is currently inconsistent across components (mixed inline styles, CSS modules, and
  plain .css files). Do not standardize the whole codebase on one styling method in this pass —
  instead, centralize DESIGN TOKENS (color, spacing, radius, font) into `src/theme/theme.js` and
  make every touched component consume them, regardless of which styling method it uses.

GOAL
Redesign the homepage (`src/pages/user/HomePage.js` and the components it renders: Navbar, Hero,
Banner, Pillars, StatsPanel, UseCases, Training, LearningHub preview, Startup, CTA, Footer) so it
is:
1. Visually distinctive and professional — NOT a generic "AI startup" look (no purple/violet
   gradients, no Inter-only typography, no identical 4-card grids, no glowing-brain iconography).
   Follow the color system, type system, and anti-slop checklist in `design.md` exactly.
2. Interactive with restrained, purposeful motion: staggered hero entrance on load, one-time
   scroll-reveal per section, count-up numbers in StatsPanel, tactile hover/active states on all
   buttons and cards, smooth navbar solidify-on-scroll. No infinite/looping decorative animation.
3. Consistent — every button, card, modal, and input across the site should visually read as the
   same design system, not five different ad-hoc implementations.

STEP-BY-STEP PLAN (do these in order, and show me a short plan before large multi-file edits)
1. Update `src/theme/theme.js` with the full token set from `design.md` §1–3 (colors, type scale,
   spacing, radius, shadow). This is the foundation everything else depends on.
2. Create `src/components/Button/Button.jsx` (+ styles) implementing the primary/secondary/ghost
   variants from `design.md` §4.1, and `src/components/Modal/Modal.jsx` implementing the shared
   modal shell/entrance-exit animation from §4.4.
3. Migrate `AuthModal`, `GetInvolvedModal`, `CertificateModal`, `ContactUsModal`, and
   `PhonePePaymentModal` to render inside the new shared `Modal` wrapper, keeping each modal's own
   form/content logic intact — only replace their outer shell/animation, not their internal logic.
4. Redesign `Hero.js`: single clear headline + subhead + primary/secondary CTA, staggered entrance
   animation wired through the existing `experience/` GSAP system, background tuned to the
   indigo/terracotta palette per `design.md` §6 (subtle, not busy).
5. Redesign `Banner.js` into a thin stat/marquee strip (not a full card section).
6. Redesign `Pillars.js` into an asymmetric "bento" layout per `design.md` §4.2/§6, each pillar
   with a distinct accent color from the palette (not four identical cards).
7. Redesign `StatsPanel.js` with large count-up numbers animated on scroll-into-view.
8. Give `UseCases.js`, `Training.js`, and `Startup.js` visually distinct layouts from each other
   (e.g. horizontal scroll-snap, alternating image/text rows, bento grid respectively) so three
   consecutive sections don't repeat the same card-grid pattern — see `design.md` §6.
9. Update `Navbar.js` to solidify/blur on scroll with an animated active-route indicator.
10. Update `Footer.js` and the pre-footer `CTA.js` to match the dark `--color-ink` /
    `--color-indigo-900` treatment from `design.md`.
11. Wire scroll-triggered reveal (fade + rise, staggered per section/card) using the existing
    `useScrollProgress` hook or GSAP ScrollTrigger, gated behind `useReducedMotion` so it degrades
    to a simple opacity fade when reduced motion is requested.
12. Run the app locally, click through the homepage yourself (use your browser sub-agent) to
    verify: hover/active states work, modals open/close smoothly, scroll reveal fires once (not
    on every scroll direction change), no layout shift/jank, mobile viewport (375px) still looks
    correct.

CONSTRAINTS
- Do not modify anything under `database/`, `supabase/`, `.env`, `src/utils/supabase.js`,
  `src/utils/phonepePayment.js`, or any auth/exam/enrollment logic.
- Do not add new heavy dependencies unless clearly justified (the project already has GSAP —
  prefer extending that over adding Framer Motion/Lottie/etc. unless GSAP genuinely can't do it).
- Do not touch `src/pages/admin/*`, `AboutPage.js`, `BlogPage.jsx`, `CourseDetailPage.jsx`,
  `ExamDetailPage.jsx`, `PolicyPage.js`, `ResetPasswordPage.jsx`, `StartupsPage.js`, `ToolsPage.js`,
  or `UserProfilePage.jsx` in this pass — homepage only, unless I explicitly ask to extend the
  design system to those pages next.
- Keep all existing copy/text content unless a section's new layout genuinely requires re-wording
  labels (ask me first if so) — this pass is visual/structural, not a copywriting pass.
- Preserve all existing accessibility attributes (aria labels, alt text) and add any that are
  missing on new interactive elements you create.

DELIVERABLE
After implementing, give me:
1. A short summary of every file you changed or created and why.
2. Any place where you deviated from `design.md` and why.
3. A list of remaining pages that would benefit from the same design system pass, for a future
   task.
```

---

## Before you run this

**You don't need a separate skill file to make this work** — the `design.md` I generated already functions as the persistent design-constraint document (the same role a Antigravity "Agent Skill" would play). Keep `design.md` at your project root next to `PROJECT_RULES.md`, and reference it explicitly in every redesign prompt as done above; Antigravity will read it as workspace context each session.

If you want to go further, Antigravity (like Claude Code) supports installable **Agent Skills** — markdown-based instruction packs that stop the model from defaulting to generic layouts even without you repeating instructions every prompt. If you want one, search Antigravity's skill/plugin directory inside the app for a general UI-design-quality skill (sometimes listed as a "design system" or "frontend design" skill) and add it alongside `design.md` — it's optional, not required, since `design.md` already carries the actual rules.

One practical tip: run the plan in the numbered order above as **separate messages/turns** rather than one giant request — large multi-file redesigns are more reliable for the agent when broken into reviewable chunks (theme tokens → shared components → section by section) rather than asked all at once.
