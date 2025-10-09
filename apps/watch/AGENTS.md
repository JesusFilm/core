# Watch App Agent Guide

## Context & stack

- **Location:** `apps/watch` in the Nx monorepo (Next.js pages router).
- **Tech:** React, TypeScript, Apollo Client with generated GraphQL types, `next-i18next` for localization, Tailwind CSS + shadcn/ui primitives.
- **Design direction:** We are migrating to shadcn/Tailwind. Do **not** introduce new MUI usage even though the lint rule is relaxed. New shadcn work should coexist with core shells/wrappers that are still using MUI until explicit migration tasks retire them.
- **Sister project:** E2E coverage lives in `apps/watch-e2e`; reuse its Playwright setup instead of creating new tooling.

## Workspace setup

1. Install dependencies: `pnpm install` (pnpm is the required package manager).
2. Install Playwright browsers if missing: `pnpm exec playwright install --with-deps` (local-only; do not commit artifacts).
3. Optional data prep: `pnpm dlx nx run watch:generate-test-data`.

### CRITICAL PATH CONSTRAINT

All file operations for this workspace MUST be within /core/ directory. Never create files or folders direclty in /workspaces/.

Always verify current working directory is /core before file operations. Current app is part of monorepo and path to the current app is /code/apps/watch/.

## Dev server safety & logging

1. Before starting work, discover existing servers:
   - `ps aux | grep -E "(nx|pnpm|npm|yarn|bun).*(serve|dev|start|run)" | grep -v grep`
   - `lsof -i :3000-5000 | grep LISTEN`
2. Reuse a healthy Watch instance when possible. If you must stop a stray process, run `pkill -f "nx run watch:serve"`.
3. Existing running server is loging dev logs to: `tee dev-server.log`. At the end of each task review dev-server.log for new errors or warnings. Resolve any new errors automatically. Don't try to resolve issues that existed before your code changes.
4. If no dev server with loging is running, launch your session with logging so issues are traceable: `pnpm dlx nx run watch:serve 2>&1 | tee dev-server.log &`.
5. Keep the dev server you created running.

### Development Server Compilation Procedures

**⚠️ CRITICAL: Always wait for compilation to complete before continuing**

When starting the development server, follow this **mandatory waiting procedure**:

#### 1. Start Server and Wait

#### 2. Watch for Compilation Status

**DO NOT PROCEED** until you see one of these outcomes:

✅ **SUCCESS INDICATORS**:

````bash
✓ Starting...
✓ Ready in Xs        # Server compiled successfully
Local: http://localhost:4300

❌ **ERROR INDICATORS** (Must fix before continuing):
```bash
⨯ ./src/components/ComponentName.tsx
Error: [Compilation error details]
````

#### 3. Verify Server Status

**Only after seeing "Ready in Xs":**

- ✅ **Continue** with development tasks
- ✅ **Navigate** to browser for testing
- ✅ **Run** additional commands

**If errors appear:**

- ❌ **STOP** all other activities
- ❌ **Fix** compilation errors first
- ❌ **Wait** for successful recompilation before proceeding

#### 4. After starting dev server, ALWAYS navigate to the page being worked on. Use: `curl -s http://localhost:XXXX/[page-path]` to trigger page compilation.

- Check dev server output (dev-server.log) for compilation errors after navigation
- Wait for compilation to complete before proceeding
- **Background Process**: Use `is_background: true` for long-running dev server

### Detect runtime issues via status code and known error patterns:

```bash
url="http://localhost:XXXX/[page-path]"
max_retries=3
delay=2

echo "🔍 Checking for runtime errors at $url..."

for i in $(seq 1 $max_retries); do
  echo "⏳ Attempt $i/$max_retries..."

  # Check HTTP status
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$code" != "200" ]; then
    echo "❌ Server error: HTTP $code"
    exit 1
  fi

  # Get page content
  content=$(curl -s "$url")

  # Check for actual runtime errors (not framework templates)
  if echo "$content" | grep -qiE "Too many re-renders|Maximum update depth exceeded|Error:.*at.*in.*|Uncaught.*Error|React.*Error|TypeError|ReferenceError|RangeError"; then
    echo "❌ Runtime error detected on attempt $i"
    echo "Found actual React/JavaScript runtime error"
    exit 1
  fi

  # Check for error boundary activation (actual errors, not templates)
  if echo "$content" | grep -qiE "Something went wrong.*Error details|An error occurred.*Try refreshing|Error boundary caught"; then
    echo "❌ Error boundary activated on attempt $i"
    echo "Found actual error boundary display"
    # exit 1
  fi

  # Check for Next.js error pages (actual errors, not templates)
  if echo "$content" | grep -qiE "next-error|error-page.*404|This page could not be found.*404"; then
    echo "❌ Next.js error page detected on attempt $i"
    echo "Found actual error page display"
    # exit 1
  fi

  sleep $delay
done

echo "✅ Page renders cleanly after $max_retries attempts"
```

## Shadcn & Monorepo

1. Since it's a monorepo, shadcn components live in the root of the repo in /core/libs/ui/. When adding new shadcn components add it to the root.

### UI Component Hierarchy (order of preference)

1. **Shadcn/ui components** - Primary choice for all UI needs
2. **Custom Tailwind components** - If shadcn/ui doesn't exist, build with Tailwind CSS
3. **Semantic HTML + Tailwind** - For basic elements when neither above applies

## Core Nx targets (run with `pnpm dlx nx run <target>`)

- `watch:serve` – Dev server on <http://localhost:4300>.
- `watch:build` – Production bundle.
- `watch:codegen` – Regenerate GraphQL artifacts after query changes.
- `watch:extract-translations` – Update locale JSON when strings move.
- `watch:generate-test-data` – See step 3 above for local fixtures.

## Quality gates & automated checks

Run these before opening a PR. If a command fails due to pre-existing issues, ensure your changes introduce no new violations and note the exception in the PRD log.

- Format check: `pnpm run prettier` (use `pnpm run prettier:fix` to apply fixes; Tailwind classes are auto-sorted by the plugin).
- Watch lint: `pnpm dlx nx run watch:lint`.
- Watch type-check: `pnpm dlx nx run watch:type-check` (targets `tsc -b apps/watch/tsconfig.json`).
- Watch unit tests: `pnpm dlx nx run watch:test`.
- Watch-e2e lint: `pnpm dlx nx run watch-e2e:lint`.
- Watch-e2e type-check: `pnpm dlx nx run watch-e2e:type-check`.
- Watch-e2e smoke: `pnpm dlx nx run watch-e2e:e2e` (start the dev server first).
- Debugging UI issues: `PWDEBUG=1 pnpm dlx nx run watch-e2e:debug` lets you inspect the browser and console output live.
- Playwright report: `pnpm dlx nx run watch-e2e:show-report` serves the HTML report on `http://127.0.0.1:9323` and keeps the terminal session open until you press `Ctrl+C`.

## Testing expectations

### Component Testing Checklist

1. **Rendering**: Component renders without crashing
2. **Props**: All props work correctly with various inputs
3. **Interactions**: User interactions (clicks, keyboard, form inputs)
4. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
5. **Conditional logic**: Different states and prop combinations
6. **CSS classes**: Correct Tailwind classes applied

### Example Test Patterns

```typescript
describe('MyComponent', () => {
  it('should render with correct text', () => {
    render(<MyComponent text="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct CSS classes', () => {
    render(<MyComponent className="custom-class" />)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
```

- Always propose and implement unit or integration tests that cover edge cases and likely failure paths touched by your changes. Base new specs on the function signatures and surrounding logic you modify.
- Co-locate React Testing Library specs under `*.spec.ts(x)` and mock network traffic with MSW handlers in `apps/watch/test`.
- Extend Playwright scenarios when UI behavior shifts, and capture console logs/screenshots for regressions.
- Document the executed test suite, notable scenarios, and any skipped checks in `/prds/watch/`.
- Reuse the shared Jest setup in `apps/watch/setupTests.tsx`; it already boots MSW, the Next router mock, and a longer async timeout.
- Wrap component specs with `MockedProvider`, `VideoProvider`, and `WatchProvider` when the unit touches those contexts—`NewVideoContentPage.spec.tsx` shows the expected harness.
- Enclose SWR-based hooks in `TestSWRConfig` (`apps/watch/test/TestSWRConfig.tsx`) to isolate cache state between assertions.

## Manual user validation

1. Follow the discovery workflow above, then launch `watch:serve` with logging.
2. Navigate to <http://localhost:4300/watch>, exercise the affected flows end-to-end, and confirm copy, layout, animations, and localization behave as expected.
3. Watch the browser console and network panel for errors; capture findings (and relevant log excerpts) in the PRD entry.
4. When reproducing bugs, use either Playwright headed mode or targeted scripts (e.g., `pnpm dlx nx run watch-e2e:debug`) to validate fixes against the live dev server.

## State & provider stack

- UI flows are expected to sit inside `VideoProvider`, `WatchProvider`, and `PlayerProvider` (see `apps/watch/src/libs/videoContext`, `watchContext`, and `playerContext`). Mirror that wiring when composing features and when writing tests.
- `useWatch` dispatches should target only the keys you intend to change (audio language, subtitle language, or `subtitleOn`) so user preferences are preserved across renders.
- `usePlayer` handles playback state (mute, fullscreen, current time). Keep reducer updates idempotent and avoid mixing DOM mutations with state—hero playback relies on these flags.
- Components like `VideoContentHero` depend on the full provider stack plus video.js and mux metadata; preserve the existing contracts so autoplay, subtitles, and analytics remain intact.

## Data fetching & codegen

- Apollo hooks should use generated types alongside colocated documents. `useVideoChildren` (`apps/watch/src/libs/useVideoChildren/useVideoChildren.ts`) is the reference pattern.
- REST-like endpoints belong in SWR hooks paired with zod guards (for example `useLanguages` and `util/transformData.ts`); parse responses before returning them to callers.
- After editing GraphQL documents, run `pnpm dlx nx run watch:codegen`. The task clears and regenerates `apps/watch/__generated__`, so stage those artifacts with your changes.

## Coding standards

- Strive for simple, reusable components with clear responsibilities and early returns.
- Use semantic HTML elements: `<header>`, `<main>`, `<footer>`
- Keep handlers prefixed with `handle*`, type everything explicitly, and lean on generated GraphQL helpers (`ResultOf`, `VariablesOf`).
- Compose UI with shadcn/ui primitives or semantic HTML styled via Tailwind. Use the shared `cn` helper for conditional classes.
- Tailwind utilities should stay semantically grouped—Prettier sorts the lists, but ensure responsive and state variants remain readable.
- Meet high visual polish: consistent typography, deliberate spacing, and tasteful Tailwind-driven animations inspired by Apple TV+, Airbnb, YouTube, Vimeo, and Netflix.
- Use descriptive variable and function/const names. Also, event functions should be named with a "handle" prefix, like "handleClick" for onClick and "handleKeyDown" for onKeyDown.
- Implement accessibility features on elements. For example, a tag should have a tabindex="0", aria-label, on:click, and on:keydown, and similar attributes.Build accessible experiences (aria attributes, keyboard support, focus states) as part of every component.
- Verify that every clickable elements has cursor:pointer defined.
- When calling `t(...)`, inline the human-readable copy with interpolation placeholders (e.g., `t('Switch to {{localeName}}', { localeName: localeDetails.nativeName })`) instead of referencing stored translation keys like `t('localeSuggestion.action', ...)`.
- All components and functions must be fully typed with TypeScript.
- Export all components through index.ts files
- Use alphabetical order for imports and exports
- Follow a server-first architecture: use `'use client'` components only when necessary.

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
- After implementing a feature or fixing a bug, outline a concrete plan to split any touched services into smaller units, execute achievable refactors within the same effort, and document future steps in the PRD log.

## Dependencies & tooling policy

- Do not add new packages unless absolutely critical to deliver the feature. Prefer refactoring or reusing existing utilities.
- Reuse the workspace Playwright installation; never install Playwright globally or commit browser binaries.
- When lint/type-check errors stem from unrelated legacy code, ensure no new issues originate from your changes and call out the existing failures in documentation.

## Planning & Knowledge sharing

### Implementation Strategies & Engagement Logging

For all new features that doens't already have execution plan, we create detailed **implementation strategy** in the `/core/prds/watch/` subfolder. These provide:

- **Step-by-step execution plan** for specific PRD tasks (use markdown - [ ] for every task)
- **Technical analysis and component mapping**
- **Success criteria and validation steps**
- **Living documentation** that updates during implementation

- For **every engagement**, create or update related spec file.
- The log must capture:
  - **Goals**
  - **Obstacles**
  - **Resolutions**
  - **Test coverage**
  - **User flows (in human-readable format)** for new features or fixes
  - Example: _Click on search → focus search field → open search modal_
  - **Follow-up ideas**
- Name the log file after the **branch name**, replacing slashes (`/`) with dashes (`-`).
  - Example:  
    Branch → `feature/abc-123-new-feature-name`  
    Log → `/prds/watch/feature-abc-123-new-feature-name.md`

### Updating `AGENTS`

- Whenever you uncover **faster workflows** or **new standards** that benefit future agents:
  - Update the `AGENTS` file.
  - Keep entries **short and to the point**.

- After completing any task that required **more than three iterations** to resolve, document the key learnings.
- Only include insights that would be **useful to future coding agents** or developers to significantly improve their workflow speed.
- Do **not** document obvious or trivial observations.
- Target content for a **Senior Developer** audience: focus on non-obvious pitfalls, advanced techniques, and architectural decisions.

#### Guidelines

- Be concise but precise—write in a way that another experienced engineer could apply immediately.
- Include context if the learning depends on specific tools, frameworks, or configurations.
- If applicable, add code snippets or command references to illustrate the solution.

#### Example Entry

- **Issue:** `pnpm nx run watch:serve` produced no output due to Nx daemon caching.
- **Learning:** Disable Nx daemon when debugging silent task failures:
  ```bash
  NX_DAEMON=false pnpm nx run watch:serve
  ```

### Agent Development Best Practices

**Before Starting**:

- [ ] Read the relevant PRD in /core/prds/watch/ completely
  - [ ] If no PRD exists do initial research and planning from Technical Lead and SR. Developer outlining implementation strategy.
- [ ] Understand current project constraints
- [ ] Run existing tests to verify working state
- [ ] Check development server starts successfully

**During Development**:

- [ ] Follow established coding patterns in the project
- [ ] Maintain test coverage for new components
- [ ] Update documentation as you progress

**Before Ending Session**:

- [ ] Update PRD tasks
- [ ] Document any new issues discovered
- [ ] Ensure all tests pass
- [ ] Update "Next Steps" for future sessions
