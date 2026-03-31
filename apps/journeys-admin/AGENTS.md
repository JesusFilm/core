# Journeys Admin — Convention Guide

Admin app for creating, editing, and managing interactive journeys. Includes a visual journey builder (editor), template publishing, team management, and analytics. Part of the `/core` Nx monorepo.

## Stack

- Next.js (Pages Router) with TypeScript
- MUI (Material UI) — **no raw HTML elements, no Tailwind, no shadcn**
- Apollo Client (GraphQL) with gql.tada
- next-i18next for translations
- Firebase Auth (user login via `next-firebase-auth-edge`)
- Storybook for component development
- React Flow (visual journey diagram)
- Swiper (carousel-based editor navigation)
- react-hotkeys-hook (keyboard shortcuts)

## Component conventions

### File organization

Every component lives in its own PascalCase directory:

```
ComponentName/
  ComponentName.tsx          # Implementation
  ComponentName.spec.tsx     # Unit tests
  ComponentName.stories.tsx  # Storybook (optional)
  index.ts                   # Barrel export
  data.ts                    # Test/story fixtures (optional)
  constants.ts               # Shared constants (optional)
  ChildComponent/            # Nested child components
```

`index.ts` is always a simple re-export: `export { ComponentName } from './ComponentName'`

### Naming

- **Components:** `%UiType%%ComponentFunction%` — e.g., `AccessAvatars`, `EditorToolbar`, `JourneyVisitorsList`
- **Event handlers:** prefix with `handle` — `handleClick`, `handleKeyDown`
- **Props interfaces:** `{ComponentName}Props`
- **Return type:** `ReactElement` from `react`

### UI rules

- Always use MUI components (`Box`, `Typography`, `Button`, etc.) — never bare HTML tags.
- Use `styled()` from `@mui/material/styles` for custom styling.
- Accessibility is mandatory: `tabIndex`, `aria-label`, `onClick`, `onKeyDown` on interactive elements.
- Early returns to reduce nesting.
- Dynamic imports with webpack chunk names where appropriate.

## Provider stack

Top-level wrapping order (from `_app.tsx`):

1. `FlagsProvider` — feature flags
2. `AppCacheProvider` — MUI Emotion cache for SSR
3. `ThemeProvider` — MUI theme (light/dark)
4. `AuthProvider` — Firebase auth
5. `ApolloProvider` — GraphQL client
6. `TeamProvider` — team context (`@core/journeys/ui/TeamProvider`)
7. `SnackbarProvider` — toast notifications

Editor-level additional providers:

8. `JourneyProvider` — journey data (variant: `'admin'`)
9. `EditorProvider` — editor UI state (selected step, active content, analytics view)
10. `MuxVideoUploadProvider` — video upload handling
11. `HotkeysProvider` — keyboard shortcuts

Tests must wrap components in the required providers:

```tsx
<SnackbarProvider>
  <MockedProvider mocks={[...]}>
    <ThemeProvider>
      <Component />
    </ThemeProvider>
  </MockedProvider>
</SnackbarProvider>
```

## Editor / journey builder

The editor is the core feature of this app. Key architecture:

```
Editor/
  Editor.tsx            # Main container, initializes providers
  Toolbar/              # Top action bar
  Slider/               # Center content area (Swiper carousel)
    Content/            # Step/block editing
    JourneyFlow/        # Visual flow diagram (React Flow)
    Settings/           # Block properties panel
  Hotkeys/              # Keyboard shortcuts
  Fab/                  # Floating action buttons
  FontLoader/           # Loads journey theme fonts
```

- `useEditor()` — access editor state (`activeSlide`, `activeContent`, `selectedStep`, `showAnalytics`)
- `useJourney()` — access journey data
- Block operations are granular mutations (one mutation type per block operation)
- Position updates handled separately from property updates

## Custom hooks

60+ custom mutation/query hooks in `src/libs/`:

```
src/libs/
  useJourneyUpdateMutation/
    useJourneyUpdateMutation.ts    # Hook implementation
    useJourneyUpdateMutation.mock.ts  # Test mock
    index.ts                       # Export
```

Pattern: `use{Action}{Resource}{Suffix}` — e.g., `useJourneyCreateMutation`, `useBlockDeleteMutation`

**Always check `src/libs/` before implementing new data-fetching logic** — the hook likely already exists.

## Internationalization

- Hook: `useTranslation('apps-journeys-admin')`
- Namespace files: `libs/locales/{locale}/apps-journeys-admin.json`
- **Convention:** Use inline English strings as keys — `t('Edit {{title}}', { title })`, not `t('admin.editTitle')`
- Supported locales: 15 languages
- Extraction: `pnpm dlx nx run journeys-admin:extract-translations`
- Locale detection: middleware reads `Accept-Language` header with cookie override

## GraphQL & data fetching

- Apollo Client with Firebase JWT auth
- SSE link for subscriptions (Server-Sent Events)
- Debounce link (500ms) to prevent rapid requests
- Mutation queue link for reliable ordering
- Schema source: `apis/api-gateway/schema.graphql`
- Codegen: `pnpm dlx nx run journeys-admin:codegen` after GraphQL changes
- Fragments: `BLOCK_FIELDS`, `JOURNEY_FIELDS` — include in mutations that return these types
- Generated types in `__generated__/` directories

## Routing

Pages Router with server-side rendering:

- `/` — dashboard
- `/journeys/[journeyId]` — journey editor
- `/templates/` — template browsing
- `/teams/` — team management
- `/reports/` — analytics
- `/publisher/[journeyId]` — template publisher view
- `/users/sign-in` — public auth page

Pages use `getServerSideProps` for auth checks and data preloading. Redirects to sign-in if unauthenticated.

## Testing

- Framework: Jest + `@testing-library/react`
- MSW (Mock Service Worker) for HTTP/GraphQL mocking via `test/mswServer.ts`
- Custom test providers: `ApolloLoadingProvider` in `test/ApolloLoadingProvider.tsx`
- Setup: `setupTests.tsx` auto-includes testing libraries, mocks Next.js
- Required providers in tests: `MockedProvider`, `ThemeProvider`, `SnackbarProvider`
- Colocated test fixtures in `data.ts` files alongside components

## Quality gates

```bash
pnpm dlx nx run journeys-admin:lint
pnpm dlx nx run journeys-admin:type-check
pnpm dlx nx run journeys-admin:test
pnpm dlx nx run journeys-admin:codegen               # after GraphQL changes
pnpm dlx nx run journeys-admin:extract-translations   # after i18n changes
pnpm dlx nx run journeys-admin-e2e:e2e                # end-to-end tests
```

## Imports

- Shared UI: `@core/shared/ui/*`
- Journeys UI: `@core/journeys/ui/*`
- MUI: `@mui/material/*`
- Apollo: `@apollo/client`
- i18n: `next-i18next`
