# Code Review – Studio Branch

## Summary
- The `NewPage` workflow lives inside `apps/studio/pages/new.tsx` as a nearly 3k-line component that intermixes constants, UI layout, state orchestration, and async OpenAI/Unsplash calls. The surface area makes it difficult to validate behavior, share logic, or reason about regressions.
- The Polotno editor (`apps/studio/src/components/editor.tsx`) duplicates that pattern with a monolithic component, embeds a large serialized default design string inline, and couples UI with localStorage/session wiring, which hurts maintainability and violates our modular component standards from the Watch app.
- A broken `@/components/ui/carousel` import lacks an alias in the Studio tsconfig, so the build will fail until we either configure the alias or swap to a relative import. Loading a saved session from the editor also redirects users back to `/new`, which likely discards the editor state we just rehydrated.

## Tasks

### Task 1 – Restore valid carousel import resolution
**Process**
1. Audit `apps/studio/pages/new.tsx` for every `@/components/ui/carousel` reference and determine the intended module path.
2. Decide whether to introduce an alias (`@`) in the Studio `tsconfig.json`/Next config or to replace the usage with a relative import that resolves to the existing carousel component.
3. Update the import statement(s) accordingly and ensure co-located tests or stories reference the new path.
4. Run `pnpm lint studio` (or the relevant workspace target) followed by `pnpm dlx nx run studio:build` to verify TypeScript and Next.js compilation succeed without alias errors.

### Task 2 – Decompose `apps/studio/pages/new.tsx`
**Process**
1. Identify distinct logical areas in `apps/studio/pages/new.tsx` (configuration constants, async services, UI regions) and document their responsibilities.
2. Extract static prompt/config objects into modules under `apps/studio/src/config`, adding unit tests where business logic warrants validation.
3. Break the page into composable React components (context selector, persona/capture controls, AI response panel, media analyzer) and relocate async OpenAI/Unsplash logic into dedicated hooks/services such as `useAiContent` and `useImageAnalysis`.
4. Create a centralized session state hook responsible for persistence/token aggregation so the top-level page only orchestrates child components.
5. Align naming, prop typing, and `className` passthroughs with the conventions in `apps/watch/AGENTS.md`, updating shared documentation if divergence is necessary.

### Task 3 – Modularize `apps/studio/src/components/editor.tsx`
**Process**
1. Move the serialized Polotno default state into a standalone JSON/TypeScript module that exports typed helpers for loading and updating the default canvas.
2. Extract header/actions, settings dialog, sessions list, and suggestion dialogs into separate components that communicate via explicit props or a small context provider.
3. Encapsulate Polotno store creation/loading into a `usePolotnoStore` hook that handles persistence, hydration, and cleanup, leaving the visual component declarative.
4. Update imports and storybook/tests to target the new components, ensuring consistent typing and prop drilling patterns.

### Task 4 – Keep session loading inside the editor flow
**Process**
1. Refactor `loadSession` in `apps/studio/src/components/editor.tsx` to hydrate the editor state without navigating back to `/new`, unless routing is essential.
2. When navigation is required, persist the editor state via router query params or storage before triggering the route change so the session survives the redirect.
3. Add regression coverage (unit test or Playwright) confirming the selected session remains visible in the editor after loading and that navigation behavior matches UX expectations.
4. Validate the flow manually in `pnpm dlx nx run studio:serve` (or equivalent) to ensure session continuity in development.
