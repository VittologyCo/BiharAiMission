# Prompt for Antigravity — Phase 2: Navbar + Footer (Tailwind + Component Library Setup)

Before running this, append `design-addendum-phase2.md`'s contents to the end of your project's
`design.md`, so it's one file again. Then tag both files as before.

---

```
@design.md @antigravity_redesign_prompt.md

CONTEXT
Phase 1 (homepage) is complete: design tokens are centralized in src/theme/theme.css and
src/theme/theme.js, and shared Button/Modal components exist and are used across the app.
Read design.md section 9 (Phase 2 Addendum) fully — it governs everything in this task and
supersedes the "prefer GSAP over new libraries" guidance from earlier sections for this specific
work. Also re-read design.md sections 0, 1, 2, 5, and 7 — the color system and anti-AI-slop
checklist apply to every new component in this phase exactly as they did in Phase 1.

GOAL
Set up Tailwind CSS project-wide (coexisting with the existing CSS Modules approach, not
replacing it) and use it to redesign Navbar.js and Footer.js with components adapted from
Aceternity UI, OriginUI, and/or 21st.dev, plus react-useanimations for interactive icons.

STEP-BY-STEP PLAN (do these in order, show me a plan/diff before large edits, wait for my
confirmation between steps)

1. SETUP — follow design.md §9.2 exactly:
   - Install tailwindcss, postcss, autoprefixer, @craco/craco, framer-motion, clsx,
     tailwind-merge, react-useanimations.
   - Configure craco.config.js to add Tailwind's PostCSS plugin to the existing react-scripts
     build without ejecting. Update package.json scripts to use craco instead of react-scripts.
   - Configure tailwind.config.js theme.extend to mirror the exact tokens from theme.js/theme.css
     (colors, font families, border radius) — do not leave Tailwind's default indigo/violet/
     purple palette reachable.
   - Set corePlugins.preflight to false, or scope it so it doesn't clobber src/index.css's
     existing global styles.
   - Create src/lib/cn.js with the standard clsx + tailwind-merge cn() helper.
   - Run the dev server and confirm the existing homepage still renders correctly with zero
     visual regressions before touching Navbar/Footer — this is the checkpoint that proves
     Tailwind was added safely alongside the existing system.

2. NAVBAR REDESIGN (src/components/Navbar/Navbar.js):
   - Rebuild using Tailwind utility classes + a Framer-Motion-based component adapted from
     Aceternity/OriginUI/21st.dev for the transparent-to-solid scroll behavior and the animated
     active-route indicator described in design.md §4.3.
   - Every color in the adapted component must be replaced with project tokens per §9.6 — no
     purple, no default library gradients.
   - Use react-useanimations for the mobile menu toggle (hamburger-to-X) and any nav icon that
     benefits from motion on interaction (notification bell, user avatar chevron) — not on every
     static icon.
   - Preserve all existing functionality exactly: auth state display, user avatar/dropdown,
     active route highlighting, mobile responsive menu, all existing links and their destinations,
     and the trigger that opens AuthModal. Do not change any routing or auth logic.

3. FOOTER REDESIGN (src/components/Footer/Footer.js):
   - Rebuild using Tailwind utility classes on the dark --color-ink / --color-indigo-900 treatment
     from design.md §6, structured columns, no gradient beyond what §1.3 allows.
   - Any social/contact icons use react-useanimations where a hover/interaction state adds value.
   - Preserve all existing links, contact info, and any legal/policy link destinations exactly.

4. VERIFY (use the browser sub-agent, don't rely on compile success):
   - Full homepage still renders with no visual regression from the Tailwind/preflight change.
   - Navbar: scroll behavior (transparent -> solid), active route indicator, mobile menu open/
     close, auth-dependent states, all links work.
   - Footer: renders correctly at desktop and 375px mobile width, all links work.
   - No console errors. Confirm prefers-reduced-motion degrades the new Framer Motion animations
     to a simple fade, per design.md §5.
   - Run every new component through the design.md §7 anti-slop checklist explicitly and report
     the result — especially "no purple/violet anywhere" and "no default library gradient shipped
     as-is."

CONSTRAINTS (same as Phase 1 — restated because this task touches new ground)
- Do not modify auth logic, routing logic, or any Supabase/API calls in Navbar or Footer — only
  their presentation and the interaction/motion layer.
- Do not touch homepage components, Button, Modal, or theme.css/theme.js from Phase 1 in this
  pass — Navbar and Footer only.
- Do not add a second particle-background library — none is needed for Navbar/Footer, but note
  this for future phases per design.md §9.5.
- Keep existing nav/footer copy and links as-is; do not invent new nav items, footer columns, or
  a government seal/badge that doesn't already exist in the current implementation.

DELIVERABLE
1. Confirm the Tailwind setup checkpoint (step 1's dev-server check) passed before moving to
   step 2 — report this explicitly.
2. Summary of every file changed/created and why.
3. Any place you deviated from design.md §9 and why.
4. Explicit pass/fail on each verification item in step 4.
```
