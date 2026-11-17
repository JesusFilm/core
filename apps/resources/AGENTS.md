# Resources App Agent Guide

## Context & stack

- **Location:** `apps/resources` in the Nx monorepo (Next.js pages router).
- **Tech:** React, TypeScript, Apollo Client with generated GraphQL types, `next-i18next` for localization.
- **Sister project:** E2E coverage lives in `apps/resources-e2e`; reuse its Playwright setup instead of creating new tooling.

## Workspace setup

1. Install dependencies: `pnpm install` (pnpm is the required package manager).
2. Install Playwright browsers if missing: `pnpm exec playwright install --with-deps` (local-only; do not commit artifacts).
3. Optional data prep: `pnpm dlx nx run resources:generate-test-data`.

### Working directory

Keep every file operation inside the repository checkout; this app lives at `apps/resources/`. Do not create files in the checkout's parent directory.

## Dev server safety & logging

1. Before starting work, discover existing servers:
   - `ps aux | grep -E "(nx|pnpm|npm|yarn|bun).*(serve|dev|start|run)" | grep -v grep`
   - `lsof -i :3000-5000 | grep LISTEN`
2. Reuse a healthy Resources instance when possible. If you must stop a stray process, run `pkill -f "nx run resources:serve"`.
3. Existing running server is loging dev logs to: `tee dev-server.log`. At the end of each task review dev-server.log for new errors or warnings. Resolve any new errors automatically. Don't try to resolve issues that existed before your code changes.
4. If no dev server with loging is running, launch your session with logging so issues are traceable: `pnpm dlx nx run resources:serve 2>&1 | tee dev-server.log &`.
5. Keep the dev server you created running.

### Waiting for the dev server

After starting the dev server (as a background process), wait for `✓ Ready in Xs` on <http://localhost:4310> before testing against it. If it prints a compilation error (`⨯ ./src/...`), fix that before anything else. Then request the page you are working on (`curl -s http://localhost:4310/<page-path>`) to trigger its compilation, and check `dev-server.log` for new errors.

A page that compiles can still fail at runtime: confirm it returns HTTP 200 and that neither the response nor `dev-server.log` shows a React/JavaScript runtime error (`TypeError`, `Maximum update depth exceeded`, an error-boundary message, the Next.js error page).

## Core Nx targets (run with `pnpm dlx nx run <target>`)

- `resources:serve` – Dev server on <http://localhost:4310>.
- `resources:build` – Production bundle.
- `resources:codegen` – Regenerate GraphQL artifacts after query changes.
- `resources:extract-translations` – Update locale JSON when strings move.
- `resources:generate-test-data` – See step 3 above for local fixtures.

## Quality gates & automated checks

Run these before opening a PR. If a command fails due to pre-existing issues, ensure your changes introduce no new violations and note the exception in the PR description.

- Format check: `pnpm run prettier` (use `pnpm run prettier:fix` to apply fixes).
- Resources lint: `pnpm dlx nx run resources:lint`.
- Resources type-check: `pnpm dlx nx run resources:type-check` (runs `tsc7` against `apps/resources/tsconfig.ts7.json`).
- Resources unit tests: `pnpm dlx nx run resources:test`.
- Resources-e2e lint: `pnpm dlx nx run resources-e2e:lint`.
- Resources-e2e type-check: `pnpm dlx nx run resources-e2e:type-check`.
- Resources-e2e smoke: `pnpm dlx nx run resources-e2e:e2e` (start the dev server first).
- Debugging UI issues: `PWDEBUG=1 pnpm dlx nx run resources-e2e:debug` lets you inspect the browser and console output live.
- Playwright report: `pnpm dlx nx run resources-e2e:show-report` serves the HTML report on `http://127.0.0.1:9323` and keeps the terminal session open until you press `Ctrl+C`.

## Testing expectations

### Component Testing Checklist

1. **Rendering**: Component renders without crashing
2. **Props**: All props work correctly with various inputs
3. **Interactions**: User interactions (clicks, keyboard, form inputs)
4. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
5. **Conditional logic**: Different states and prop combinations
6. **Styling**: Correct styling applied

### Example Test Patterns

```typescript
describe('MyComponent', () => {
  it('should render with correct text', () => {
    render(<MyComponent text="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct styling', () => {
    render(<MyComponent className="custom-class" />)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
```

- Always propose and implement unit or integration tests that cover edge cases and likely failure paths touched by your changes. Base new specs on the function signatures and surrounding logic you modify.
- Co-locate React Testing Library specs under `*.spec.ts(x)` and mock network traffic with MSW handlers in `apps/resources/test`.
- Extend Playwright scenarios when UI behavior shifts, and capture console logs/screenshots for regressions.
- Note the executed test suite, notable scenarios, and any skipped checks in the PR description.
- Reuse the shared Vitest setup in `apps/resources/setupTests.tsx`; it already boots MSW, the Next router mock, and a longer async timeout.
- Wrap component specs with `MockedProvider`, `VideoProvider`, and `WatchProvider` when the unit touches those contexts—`NewVideoContentPage.spec.tsx` shows the expected harness.
- Enclose SWR-based hooks in `TestSWRConfig` (`apps/resources/test/TestSWRConfig.tsx`) to isolate cache state between assertions.

## Manual user validation

1. Follow the discovery workflow above, then launch `resources:serve` with logging.
2. Navigate to <http://localhost:4310/resources>, exercise the affected flows end-to-end, and confirm copy, layout, animations, and localization behave as expected.
3. Watch the browser console and network panel for errors; capture findings (and relevant log excerpts) in the PR description.
4. When reproducing bugs, use either Playwright headed mode or targeted scripts (e.g., `pnpm dlx nx run resources-e2e:debug`) to validate fixes against the live dev server.

## State & provider stack

- UI flows are expected to sit inside `VideoProvider`, `WatchProvider`, and `PlayerProvider` (see `apps/resources/src/libs/videoContext`, `watchContext`, and `playerContext`). Mirror that wiring when composing features and when writing tests.
- `useWatch` dispatches should target only the keys you intend to change (audio language, subtitle language, or `subtitleOn`) so user preferences are preserved across renders.
- `usePlayer` handles playback state (mute, fullscreen, current time). Keep reducer updates idempotent and avoid mixing DOM mutations with state—hero playback relies on these flags.
- Components like `VideoContentHero` depend on the full provider stack plus video.js and mux metadata; preserve the existing contracts so autoplay, subtitles, and analytics remain intact.

## Data fetching & codegen

- Apollo hooks should use generated types alongside colocated documents. `useVideoChildren` (`apps/resources/src/libs/useVideoChildren/useVideoChildren.ts`) is the reference pattern.
- REST-like endpoints belong in SWR hooks paired with zod guards (for example `useLanguages` and `util/transformData.ts`); parse responses before returning them to callers.
- After editing GraphQL documents, run `pnpm dlx nx run resources:codegen`. The task clears and regenerates `apps/resources/__generated__`, so stage those artifacts with your changes.

## Coding standards

- Strive for simple, reusable components with clear responsibilities and early returns.
- Use semantic HTML elements: `<header>`, `<main>`, `<footer>`
- Keep handlers prefixed with `handle*`, type everything explicitly, and lean on generated GraphQL helpers (`ResultOf`, `VariablesOf`).
- Meet high visual polish: consistent typography, deliberate spacing, and tasteful animations inspired by Apple TV+, Airbnb, YouTube, Vimeo, and Netflix.
- Use descriptive variable and function/const names. Also, event functions should be named with a "handle" prefix, like "handleClick" for onClick and "handleKeyDown" for onKeyDown.
- Build accessible experiences (aria attributes, keyboard support, focus states) as part of every component. MUI and native interactive components already handle focus and key activation; add `tabIndex`, `role`, `aria-label` and `onKeyDown` yourself only on a non-interactive element made clickable.
- Verify that every clickable elements has cursor:pointer defined.
- When calling `t(...)`, inline the human-readable copy with interpolation placeholders (e.g., `t('Switch to {{localeName}}', { localeName: localeDetails.nativeName })`) instead of referencing stored translation keys like `t('localeSuggestion.action', ...)`.
- Use direct English strings in `t()` function calls instead of translation keys. Use `t('Welcome back')` instead of `t('welcomeBack')` or nested structures like `t('user.profile.name')`.
- All components and functions must be fully typed with TypeScript.
- Export all components through index.ts files
- Use alphabetical order for imports and exports

### Rendering Strategy (Next.js Pages Router)

- Prefer SSR (`getServerSideProps`) or SSG (`getStaticProps`) for content and SEO where appropriate.
- Use `<Link>` for navigation instead of custom click handlers.
- Progressive enhancement: ensure core flows work without client JS where feasible; render critical content on the server.
- Use semantic HTML forms with proper `action`/`method` and graceful fallbacks for interactive features.

### Optimization Strategies

- **Static Content**: Render content cards, headers, and layout on server
- **Client Interactivity**: Keep browser-only logic minimal and isolated (forms with complex client state, media controls, browser APIs).
- **Navigation**: Link-based routing for content discovery
- **Image Optimization**: Next.js Image component with proper loading strategies
- **Bundle Optimization**: Tree-shaking and code splitting

### React Component Naming Rule

**Format:** `%UiType%%ComponentFunction%`

- **UiType**: A noun that describes the UI element’s role (e.g., `Modal`, `Button`, `Footer`, `Page`).
- **ComponentFunction**: A concise one- or two-word description of what the component does or represents (e.g., `LanguageSwitch`, `MainVideo`, `VideoShare`).
  - Omit `ComponentFunction` for basic primitives like `Button`, `Input`, `Icon`, etc.

#### Examples

- `ModalLogin`
- `FooterLinks`
- `PageHome`
- `Button` (primitive, no suffix)
- `ButtonSubmit` (specialized version)

- **Pages**: Prefix with 'Page'
  - PageHome
  - PageVideo
  - PageCollection
  - PageSearch
  - PageSettings

- **Dialogs/Modals**: Prefix with 'Dialog'
  - DialogConfirm
  - DialogShare
  - DialogSettings

- **Sections**: Prefix with 'Section'
  - SectionHeader
  - SectionFooter
  - SectionHero
  - SectionFeatures

- **Layout Components**: Prefix with 'Layout'
  - LayoutDefault
  - LayoutFullWidth
  - LayoutSidebar

#### Notes

- Use **PascalCase** for all component names.
- Avoid redundancy (`ModalModal`, `ButtonButton`).
- Keep `ComponentFunction` focused—no vague naming like `ModalStuff` or `FooterThings`.

**Component Props Patterns**:

- Use optional props with sensible defaults: `hideHeader = false`
- Include className prop for extensibility: `className?: string`
- Use ReactNode for children and content slots: `children?: ReactNode`
- Name interfaces with component name prefix: `ComponentNameProps`

## Architecture & refactoring agreements

- Favor small, focused modules; extract shared logic into hooks or utilities when duplication appears.
- After implementing a feature or fixing a bug, outline a concrete plan to split any touched services into smaller units, execute achievable refactors within the same effort, and note future steps in the PR description.

## Dependencies & tooling policy

- Do not add new packages unless absolutely critical to deliver the feature. Prefer refactoring or reusing existing utilities.
- Reuse the workspace Playwright installation; never install Playwright globally or commit browser binaries.
- When lint/type-check errors stem from unrelated legacy code, ensure no new issues originate from your changes and call out the existing failures in documentation.

## Planning

If a plan for the work exists in `prds/resources/`, read it before starting and keep its task list current as you go.
