# Migration Plan: Move Watch Home Page to Watch‑Modern (MUI → shadcn/ui + Tailwind)

Status: Planned
Owner: Watch‑Modern Frontend
Scope: Migrate the Watch home page UI/UX and data wiring from `apps/watch` (Pages Router + MUI) to `apps/watch-modern` (App Router + shadcn/ui + Tailwind). Strictly eliminate all `@mui/*` usage in watch‑modern.

—

Goals
- No MUI: Replace all MUI components with shadcn/ui primitives and Tailwind utilities.
- App Router: Implement under `apps/watch-modern/src/app/watch` using Next 15 App Router.
- Parity: Match visual layout and functionality (Search, Video Grid, copy blocks, hero overlay).
- i18n: Use `next-intl` with watch‑modern locales.
- DX: Keep Nx targets working and dev server smooth (default port 4800).

—

Source Of Truth (What we’re migrating)
- pages entry: `apps/watch/pages/watch/index.tsx`
- home shell: `apps/watch/src/components/WatchHomePage/WatchHomePage.tsx`
- hero: `apps/watch/src/components/WatchHomePage/HomeHero/HomeHero.tsx`
- overlay: `apps/watch/src/components/HeroOverlay/HeroOverlay.tsx`
- button section: `apps/watch/src/components/WatchHomePage/SeeAllVideos/SeeAllVideos.tsx`
- grid: `apps/watch/src/components/VideoGrid/AlgoliaVideoGrid/AlgoliaVideoGrid.tsx`

—

High‑Level Phases
1) Prepare Environment (no code changes)
2) UI Framework Setup (shadcn/ui + Tailwind tokens)
3) Route + Providers (App Router, Apollo, InstantSearch, Watch context)
4) Component Rewrites (Hero, Overlay, Home shell, See All Videos, Video Grid)
5) i18n Messages + Copy
6) Tests (unit + integration + basic visual)
7) QA + Performance + Accessibility
8) Cleanup (no MUI, lint guards, dead code)

—

Phase 1 — Prepare Environment
- Verify Nx workspace at repo root. Dev server command: `nx run watch-modern:serve` (default port 4800).
- Ensure Node and deps install cleanly: `npm ci`.
- Confirm required env for search/grid is present (Algolia index, API keys, GraphQL URL).
- Acceptance: Dev server boots (without the migrated page) and renders `/` at `http://localhost:4800`.

Phase 2 — UI Framework Setup (shadcn/ui + Tailwind)
- Initialize shadcn/ui in watch‑modern (generates `components.json`, `components/ui/*`, and `lib/utils.ts`).
- Generate primitives: Button, Input, Label, Select/Combobox, Card, Skeleton, Alert, Sheet/Dialog.
- Tailwind: extend theme tokens to cover backgrounds, text colors, spacing used on the Watch home page. Keep tokens minimal and consistent.
- Create a project `Container` component (responsive widths + padding) in `src/components/ui/container.tsx`.
- Acceptance: A simple demo page under `src/app/modern-test` renders shadcn components styled correctly.

Phase 3 — Route + Providers (App Router)
- Create `src/app/watch/page.tsx` and `src/app/watch/layout.tsx`.
- Providers in layout:
  - Next‑Intl (already wired in root layout).
  - Apollo client provider for SSR hydration.
  - InstantSearch SSR provider + client with router integration.
  - Watch context replacement (no MUI). If reusing existing context from `/apps/watch/src/libs/watchContext`, extract to a shareable lib if it contains no MUI. Otherwise, recreate minimal context locally.
- Replace Pages Router `getStaticProps` with App Router server code: precompute InstantSearch server state, pass to client via props.
- Acceptance: `/watch` route loads with empty shell (no MUI) and providers are active, no runtime errors.

Phase 4 — Component Rewrites (MUI → shadcn/ui + Tailwind)
- HomeHero (Tailwind)
  - Replace MUI `Box`, `Container`, `Stack`, `Typography` with semantic HTML + Tailwind classes and custom `Container`.
  - Implement responsive underline thickness via Tailwind (`[text-decoration-thickness]`, responsive classes) and `xl:` breakpoints.
  - Use `next/image` as before.
  - Acceptance: Visual parity for hero text, overlay, and responsive alignment.

- HeroOverlay (Tailwind)
  - Convert gradient layers and grain texture from `sx` to Tailwind + inline styles when needed.
  - Absolutely positioned full‑bleed layers with correct `z-index`.
  - Acceptance: Overlay blends correctly over hero image.

- WatchHomePage (Shell)
  - Layout, spacing, and background blocks using Tailwind.
  - Replace typographic variants with `h1..h6` + Tailwind text utilities.
  - “About Our Project” block: recreate primary accent bar and copy stack with Tailwind.
  - Acceptance: Structural parity and spacing across breakpoints.

- SeeAllVideos (CTA)
  - Replace MUI `Button`/`Stack` with shadcn `Button` and Tailwind layout.
  - Acceptance: Accessible button with same label and hover/active states.

- Video Grid
  - If current grid (`AlgoliaVideoGrid`) is UI coupled to MUI, replace with a local grid using `react-instantsearch` widgets and Tailwind.
  - Keep variant handling (e.g., contained) via props, style with Tailwind utility classes.
  - Acceptance: Grid renders results, supports paging/load more, preserves analytics hooks.

Phase 5 — i18n (next‑intl)
- Add/merge messages used by the Watch home page into `apps/watch-modern/src/i18n/locales/<locale>/apps-watch-modern.json`.
- Replace `useTranslation('apps-watch')` keys with `getTranslations('WatchHome')` / `useTranslations('WatchHome')` in watch‑modern.
- Acceptance: All strings render for default locale; fallback behavior verified.

Phase 6 — Tests
- Unit tests (Jest + RTL): HomeHero, HeroOverlay, Home shell, SeeAllVideos, minimal VideoGrid behavior.
- Integration tests: `/watch` route with providers (Apollo, InstantSearch) mounting without errors.
- Optional visual checks: Storybook snapshots or screenshot diffs for hero and about block.
- Acceptance: Tests pass under `nx test watch-modern` and coverage meets threshold for new components.

Phase 7 — QA, Performance, Accessibility
- QA the page on key breakpoints (sm/md/lg/xl/2xl).
- Lighthouse pass for performance and SEO; validate canonical/metas equivalent to original.
- AXE/aria checks: headings hierarchy, contrast, keyboard navigation.
- Acceptance: No critical regressions vs. original page.

Phase 8 — Cleanup & Guardrails
- Assert no imports from `@mui/*` under `apps/watch-modern/**` (search and CI check).
- Add ESLint `no-restricted-imports` in `apps/watch-modern/eslint.config.mjs` to block `@mui/*`.
- Remove any temporary shims or dead code.
- Acceptance: Build, lint, and type‑check clean.

—

Concrete Task Checklist
1. Env & Dev Server
- [ ] Run `npm ci` at repo root.
- [ ] Start dev server: `nx run watch-modern:serve` (http://localhost:4800).
- [ ] Verify root index renders.

2. shadcn/ui + Tailwind
- [ ] Initialize shadcn/ui and generate base primitives (Button, Input, Label, Select/Combobox, Card, Skeleton, Alert, Sheet/Dialog).
- [ ] Create `src/components/ui/container.tsx` with responsive widths.
- [ ] Extend Tailwind theme tokens for colors/spacing used on the page.

3. Route & Providers
- [ ] Create `src/app/watch/layout.tsx` with Apollo + InstantSearch providers (Next‑Intl already at root).
- [ ] Create `src/app/watch/page.tsx` skeleton with hero + shells wired, no MUI.
- [ ] Implement SSR server state for InstantSearch (App Router compatible) and pass to client provider.

4. Rewrites (no MUI)
- [ ] `HomeHero` in `src/components/watch/home/HomeHero.tsx` (Tailwind + semantic HTML).
- [ ] `HeroOverlay` in `src/components/watch/home/HeroOverlay.tsx` (Tailwind gradients + grain).
- [ ] `WatchHomePage` shell in `src/components/watch/home/WatchHomePage.tsx` (layout + sections).
- [ ] `SeeAllVideos` in `src/components/watch/home/SeeAllVideos.tsx` (shadcn Button).
- [ ] `VideoGrid` in `src/components/watch/home/VideoGrid.tsx` (InstantSearch widgets + Tailwind).

5. i18n
- [ ] Add translation keys used by hero/about/CTA into `src/i18n/locales/<locale>/apps-watch-modern.json`.
- [ ] Update page/components to use `next-intl` hooks.

6. Tests
- [ ] Jest + RTL unit tests for each component.
- [ ] Route integration test to ensure providers mount and render content.

7. QA & Cleanup
- [ ] Manual visual parity check versus original page.
- [ ] ESLint rule to forbid `@mui/*` in watch‑modern; run lint and fix.
- [ ] Verify bundle size and performance.

—

MUI → shadcn/ui + Tailwind Mapping
- Box: div + Tailwind utilities (e.g., `relative`, `h-[50svh]`).
- Container: custom Container component (centered, max‑widths, responsive paddings).
- Stack: flex + gap classes (e.g., `flex flex-col gap-10`).
- Typography: semantic tags + Tailwind text utilities (`text-4xl font-bold tracking-tight`).
- Button: shadcn `Button`.
- Paper/Card: shadcn `Card`.
- `sx`: inline class utilities; when complex, use style attribute or extracted CSS.

Example: Hero container
// MUI
// <Box sx={{ height: '50svh', position: 'relative', backgroundColor: 'background.default' }} />
// Tailwind
// <div className="relative h-[50svh] bg-neutral-950" />

—

Key Files To Create/Touch (watch‑modern)
- `apps/watch-modern/src/app/watch/layout.tsx`
- `apps/watch-modern/src/app/watch/page.tsx`
- `apps/watch-modern/src/components/ui/container.tsx`
- `apps/watch-modern/src/components/watch/home/HomeHero.tsx`
- `apps/watch-modern/src/components/watch/home/HeroOverlay.tsx`
- `apps/watch-modern/src/components/watch/home/WatchHomePage.tsx`
- `apps/watch-modern/src/components/watch/home/SeeAllVideos.tsx`
- `apps/watch-modern/src/components/watch/home/VideoGrid.tsx`
- `apps/watch-modern/src/i18n/locales/<locale>/apps-watch-modern.json` (add missing keys)
- `apps/watch-modern/eslint.config.mjs` (restrict MUI imports)

—

Definition of Done
- `/watch` renders in watch‑modern with feature parity: hero, overlay, search input, video grid, CTA, about section.
- No `@mui/*` imports anywhere under `apps/watch-modern/**`.
- Dev server runs and compiles without errors; unit and integration tests pass.
- i18n strings load via `next-intl`.
- Performance and accessibility meet or exceed the original page.

Notes
- Prefer extracting any logic‑only utilities from `apps/watch` into a shared lib if needed (e.g., Algolia router, Apollo client factory) as long as they bring no MUI UI.
- If reusing existing shared UI imports, audit them for MUI usage before pulling into watch‑modern.
5. **Accessibility** - Meet WCAG guidelines
6. **Performance** - Bundle size should not increase significantly

---

## ✅ Acceptance Criteria

### Visual Requirements
- [ ] Home page appears identical to original design
- [ ] All responsive breakpoints work correctly
- [ ] Hover states and interactions preserved
- [ ] Typography hierarchy maintained
- [ ] Color scheme matches theme

### Functional Requirements
- [ ] Search functionality works
- [ ] Video grid loads correctly
- [ ] Language switching functions
- [ ] Navigation works properly
- [ ] All CTAs and links functional

### Technical Requirements
- [ ] No MUI dependencies in bundle
- [ ] All tests pass (90%+ coverage)
- [ ] TypeScript types complete
- [ ] Accessibility audit passes
- [ ] Performance benchmarks met

---

## 📝 Notes & Considerations

- **Image Assets**: Copy hero images from `/apps/watch/src/components/WatchHomePage/HomeHero/assets/`
- **Translations**: Ensure all translation keys are compatible with next-intl
- **Context**: Verify WatchProvider state management works correctly
- **SEO**: Maintain meta tags and structured data
- **Analytics**: Preserve existing tracking implementations

---

**Last Updated**: 2025-01-28  
**Next Review**: After Phase 2 completion
