# Home Language Map Section Plan

## Goal

Render a language coverage map on the Watch homepage that visualizes the global reach of our catalog by plotting every available language from the languages API on an interactive world map section.

## Obstacles & Risks

- Pulling several thousand language-country pairs from the languages API could lead to slow API responses or over-fetching if the query is not cached.
- Map rendering libraries typically depend on browser globals; we must avoid server-side evaluation to keep static generation stable.
- Marker clutter can overwhelm the interface without clustering or thoughtful styling.

## Resolutions

- Cached the language map payload in Redis (24h TTL) via a dedicated Next.js API route to keep the response fast and reusable.
- Guarded the MapLibre integration behind a client-only dynamic import with WebGL capability checks to prevent SSR/runtime crashes.
- Aggregated language data per country to colorize country polygons, surface language counts directly on the map, and drive a dedicated detail panel instead of relying on clustered point popups.
- Ingested a simplified GeoJSON of country boundaries to replace bounding boxes with accurate national outlines and kept the triple-click gating logic in sync with polygon highlighting.

## Implementation Steps

- [x] Build a cached `/api/language-map` endpoint that queries the languages API for language-country coordinates and normalizes them for the client.
- [x] Create a `useLanguageMap` hook that consumes the new API, memoizes the points, and surfaces loading/error states.
- [x] Implement a `SectionLanguageMap` home page section with translated copy and a responsive layout shell.
- [x] Add a client-only map component that renders clustered language markers using MapLibre GL with accessibility-friendly controls and popovers.
- [x] Integrate the new section into `WatchHomePage` beneath the existing hero content and ensure fallbacks render while data loads.
- [x] Update English translations for the new section headings and descriptions.
- [x] Limit cluster zoom interactions to two consecutive clicks and present a country-specific language list on the third interaction.
- [x] Replace clustered language pins with country-level fills, overlay language counts, and open a fixed detail panel with language lists when a country is selected.
- [x] Load simplified country polygons from GeoJSON and hydrate the map source with real boundaries instead of synthetic rectangles.
- [ ] Validate the implementation with linting, type-checking, and any relevant component tests.

## Technical Analysis

- Use the existing Apollo client inside the API route so we can leverage the federated gateway and reuse credentials.
- Cache the normalized response in Redis (24h) similarly to `/api/languages` to keep the homepage fast for subsequent requests.
- MapLibre GL offers open-source tiles without requiring new tokens; pair it with a Carto basemap and enable clustering to manage thousands of features.
- The map should be dynamically imported with `ssr: false` so that Next.js static rendering never instantiates the MapLibre bundle on the server.
- Provide ARIA labelling and keyboard focus states for map controls; also expose a static fallback message if WebGL is unavailable.

## Validation

- [ ] `pnpm dlx nx run watch:lint` (fails today because the project has 70+ pre-existing lint violations across unrelated files; see NX output.)
- [ ] `pnpm dlx nx run watch:type-check` (blocked by existing type errors in legacy Watch components and shared UI packages.)
- [ ] Relevant unit or component tests (add or update as needed).

## User Flows

1. Visitor loads the Watch homepage and sees the new "Explore languages worldwide" section below the hero content.
2. After a brief loading state, countries with language coverage glow in distinct colors with numeric badges indicating how many languages are available.
3. Repeatedly clicking a country's label highlights it (first two interactions) and on the third click opens a side panel that summarizes the nation and lists every language represented within our catalog.

## Follow-up Ideas

- Consider adding filters (continent, language family) to highlight subsets of languages.
- Animate counters summarizing total languages and countries above the map for quick scanning.
- Persist map interactions per session so returning visitors resume their previous view.
