# Journeys — Convention Guide

Public-facing Next.js app that renders interactive journeys to end users. Part of the `/core` Nx monorepo.

## Stack

- Next.js (Pages Router) with TypeScript
- MUI (Material UI) — **no raw HTML elements, no Tailwind, no shadcn**
- Apollo Client (GraphQL) with gql.tada
- next-i18next for translations
- Firebase Auth (anonymous sign-in for visitors)
- Plausible + GTM for analytics
- Storybook for component development

## Component conventions

### File organization

Every component lives in its own PascalCase directory:

```
ComponentName/
  ComponentName.tsx          # Implementation
  ComponentName.spec.tsx     # Unit tests
  ComponentName.stories.tsx  # Storybook (optional)
  index.ts                   # Barrel export
  utils/                     # Extracted helpers (optional)
  ChildComponent/            # Nested child components
```

`index.ts` is always a simple re-export: `export { ComponentName } from './ComponentName'`

### Naming

- **Components:** `%UiType%%ComponentFunction%` — e.g., `NavigationButton`, `EmbeddedPreview`, `JourneyPageWrapper`
- **Event handlers:** prefix with `handle` — `handleClick`, `handleKeyDown`
- **Props interfaces:** `{ComponentName}Props`
- **Return type:** `ReactElement` from `react`

### UI rules

- Always use MUI components (`Box`, `Typography`, `Button`, etc.) — never bare HTML tags.
- Use `styled()` from `@mui/material/styles` for custom styling.
- Accessibility is mandatory: `tabIndex`, `aria-label`, `onClick`, `onKeyDown` on interactive elements.
- Early returns to reduce nesting.

## Provider stack

Page-level wrapping order (from `_app.tsx` and `JourneyPageWrapper`):

1. `FlagsProvider` — LaunchDarkly feature flags (outermost)
2. `AppCacheProvider` — MUI Emotion cache for SSR
3. `ApolloProvider` — GraphQL client
4. `SnackbarProvider` — toast notifications
4. `PlausibleProvider` — analytics (per journey)
5. `JourneyProvider` — journey data context (`useJourney()`)
6. `ThemeProvider` — per-step theming with custom fonts

Tests must wrap components in the required providers:

```tsx
<FlagsProvider flags={{ apologistChat: true }}>
  <MockedProvider mocks={[...]}>
    <SnackbarProvider>
      <JourneyProvider value={{ journey }}>
        <Component />
      </JourneyProvider>
    </SnackbarProvider>
  </MockedProvider>
</FlagsProvider>
```

Note: `FlagsProvider` is optional in tests unless the component under test uses `useFlags()`. Components that consume flags should be wrapped to ensure flag values are provided.

## Data model — blocks and trees

Journeys are composed of **blocks** in a tree structure. Key concepts:

- `TreeBlock` type from `@core/journeys/ui/block` — blocks with resolved children
- `blockHistoryVar` — Apollo reactive variable tracking navigation history
- `useBlocks()` — hook for block state management (`setTreeBlocks`, `blockHistory`, `showHeaderFooter`)
- Block hierarchy: `StepBlock` → `CardBlock` → children (Typography, Radio, Video, Image, etc.)

## Internationalization

- Hook: `useTranslation('apps-journeys')`
- Namespace files: `libs/locales/{locale}/apps-journeys.json` and `libs-journeys-ui.json`
- **Convention:** Use inline English strings as keys — `t('Next Steps')`, not `t('app.nextSteps')`
- Interpolation: `t('NextSteps {{year}}', { year: 2024 })`
- Server-side: `serverSideTranslations(locale, ['apps-journeys', 'libs-journeys-ui'], i18nConfig)`
- Supported locales: en, es, fr, id, th, ja, ko, ru, tr, zh, zh-Hans-CN

## GraphQL & data fetching

- Apollo Client with Firebase JWT auth via `setContext` link
- Client header: `x-graphql-client-name: 'journeys'`
- Schema source: `apis/api-gateway/schema.graphql`
- Codegen: `pnpm dlx nx run journeys:codegen` after GraphQL changes
- Queries use `gql` template strings
- Anonymous visitors: `signInAnonymously` with localStorage persistence to prevent duplicate visitor records

## Routing

Pages Router with static generation:

- `pages/[hostname]/[journeySlug].tsx` — main journey page
- `pages/[hostname]/[journeySlug]/[stepSlug].tsx` — step-specific
- `pages/[hostname]/embed/[journeySlug].tsx` — embedded view
- `pages/home/[journeySlug].tsx` — home-hosted journeys
- `getStaticProps` with `revalidate: 60`, `getStaticPaths` with `fallback: 'blocking'`

## RTL and locale

- `getJourneyRTL(journey)` utility returns `{ locale, rtl }` based on journey language
- RTL affects layout direction (e.g., `NavigationButton` reverses positions)
- Emotion cache created with `createEmotionCache({ rtl })` when needed

## Testing

- Framework: Jest + `@testing-library/react`
- Setup: `setupTests.ts` configures `asyncUtilTimeout: 2500`, mocks `next/router`
- CI retries: 3 attempts
- Required providers in tests: `MockedProvider`, `SnackbarProvider`, `JourneyProvider` (see provider stack above)
- Mock data: `src/libs/testData/storyData.ts` provides `basic`, `imageBlocks`, `videoBlocks` fixtures
- Mock patterns: Apollo `MockedProvider` with explicit request/result objects, `jest.fn()` for UUID generation

## Quality gates

```bash
pnpm dlx nx run journeys:lint
pnpm dlx nx run journeys:type-check
pnpm dlx nx run journeys:test
pnpm dlx nx run journeys:codegen          # after GraphQL changes
pnpm dlx nx run journeys:extract-translations  # after i18n changes
pnpm dlx nx run journeys-e2e:e2e          # end-to-end tests
```

## Imports

- Shared UI: `@core/shared/ui/*`
- Journeys UI: `@core/journeys/ui/*`
- MUI: `@mui/material/*`
- Apollo: `@apollo/client`
- i18n: `next-i18next`
