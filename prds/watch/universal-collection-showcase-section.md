# Universal Collection Showcase Section PRD

## Background & Problem Statement
- The Easter landing page (`pages/watch/easter.html/english.html/index.tsx`) renders a hard-coded `OtherCollectionsCarousel` component (`src/components/CollectionsPage/OtherCollectionsCarousel/OtherCollectionsCarousel.tsx`).
- All display copy (subtitle, title, mission text) and the carousel entries are manually defined, making the section non-reusable for other themed pages or future seasonal campaigns.
- Content editors need a way to surface any combination of collections and individual videos by simply specifying the IDs used by the video GraphQL API, without touching component code.
- The existing implementation does not leverage collection metadata already managed in the CMS, and every locale requires custom strings, increasing translation effort and risk of inconsistency.

## Goals
1. Deliver a universal section component that can be instantiated on any `/watch` page to showcase a curated set of content with the same poster carousel layout shown on the Easter page.
2. Allow marketing / content teams to configure the section through props that accept one or more collection IDs and optional single video IDs from the video API.
3. Automatically hydrate section copy (subtitle, title, description/mission text) from the primary collection's metadata while permitting overrides via component props for edge cases.
4. Preserve the existing design language (gradient background, headline stack, CTA button, poster cards with hover affordance) and ensure parity with the current Easter experience across breakpoints.
5. Provide a scalable data-fetching approach that works for localized pages by respecting locale-specific metadata and remains performant for carousels with many entries.

## Non-Goals
- Rewriting the entire Collections landing page experience beyond this section.
- Building new CMS tooling or authoring UIs; configuration is code-driven for now.
- Redesigning the poster card visuals or Swiper interaction (only refactor for reusability and data-driven content).
- Solving content scheduling / publishing workflows beyond leveraging the existing video API metadata.

## User Stories
- **Content Strategist**: "As a content strategist, I want to feature a themed set of videos by just listing our collection IDs so the page auto-populates with the right posters and copy."
- **Translator / Localization Manager**: "As a localization manager, I want the section to automatically pull translated metadata for a locale so I do not have to retranslate hard-coded strings."
- **Frontend Engineer**: "As an engineer, I want a single reusable section component that I can drop into seasonal pages with minimal glue code, mixing both collection bundles and individual spotlight videos."
- **Visitor**: "As a visitor, I want to skim a visually rich carousel of related videos with clear titles and CTAs, regardless of the campaign page I landed on."

## Functional Requirements
1. **Configurable Content Sources**
   - Accept a `sources` prop consisting of objects with `{ id, type: 'collection' | 'video', idType?: 'slug' | 'databaseId', limitChildren?: number }`.
   - The first `collection` entry acts as the "primary" collection whose metadata populates the section-level copy by default.
   - Optional `video` entries should appear in the carousel alongside collection children in the order provided, deduplicated by slug.

2. **Automatic Metadata Hydration**
   - Fetch the following from the API for the primary collection (or first video if no collection provided):
     - `title(languageId)`, `snippet(languageId)`, `description(languageId)`.
     - `imageAlt(languageId)` for accessible text.
   - Map metadata to UI fields:
     - Subtitle → `snippet` (fallback to label or prop override).
     - Headline → `title`.
     - Mission copy → `description` (support splitting bold lead-in vs. remainder similar to current layout).
   - Provide props to override each string (`subtitleOverride`, `titleOverride`, `descriptionOverride`, `ctaLabelOverride`, `ctaHrefOverride`). Overrides should take precedence over API values.

3. **Carousel Population Rules**
   - For each `collection` source, fetch its children (respect `limitChildren` if provided). Use existing `VIDEO_CHILD_FIELDS` fragment for consistent data (includes `title`, `images`, `slug`, etc.).
   - For `video` sources, fetch metadata via `videos(where: { ids: [...] })` or `GET_VIDEO_CONTENT`-style query and shape it to the same card interface.
   - Combine all fetched items into a single ordered list consumed by the Swiper carousel. Ensure each slide exposes:
     - Poster image URL (prefer portrait poster if available; fallback to `mobileCinematicHigh`).
     - Accessible alt text from `imageAlt` or `title` fallback.
     - Destination URL built with `getWatchUrl` utility using slug & label.
     - Optional snippet or label to show as badge (`VideoLabel` mapping via `getLabelDetails`).

4. **CTA Behavior**
   - Maintain the "Watch" button UI. Default link should resolve to:
     - Provided `ctaHrefOverride` if present, else
     - Primary collection's canonical `/watch/{slug}.html/{locale}.html` route (use `getWatchUrl`).
   - Track button analytics with existing GTM event utilities if available.

5. **Loading & Error States**
   - Display a skeleton shimmer for the title block and placeholder poster cards while data is loading.
   - If API returns zero items, hide the section and optionally log a warning (so empty sections never render).
   - On partial data failure (e.g., some videos missing images), drop those slides gracefully and continue rendering the rest.

6. **Localization**
   - Determine `languageId` via `getLanguageIdFromLocale` using the page locale.
   - Ensure all API requests include the `languageId` so translated metadata is returned. Expose fallback logic: if localized text missing, fall back to primary language.
   - Support per-locale overrides through props to allow marketing copy variation when needed.

7. **Accessibility**
   - Preserve semantic headings (`h2`/`h3` as appropriate), maintain button labels, and ensure slides are keyboard navigable.
   - Provide `aria-live` updates or visually hidden text for carousel navigation instructions if necessary.
   - Confirm color contrast and hover states remain accessible.

## Data & API Requirements
- Create a consolidated GraphQL query `GetCollectionShowcaseContent` under `src/components/CollectionsPage/CollectionShowcaseSection/queries.ts` (or similar) that accepts arrays of collection IDs and video IDs plus `languageId`.
  - Example structure:
    ```graphql
    query GetCollectionShowcaseContent($collectionIds: [ID!], $videoIds: [ID!], $languageId: ID!) {
      collections: videos(where: { ids: $collectionIds, labels: [collection], availableVariantLanguageIds: [$languageId] }) {
        id
        slug
        label
        title(languageId: $languageId, primary: true) { value }
        snippet(languageId: $languageId, primary: true) { value }
        description(languageId: $languageId, primary: true) { value }
        imageAlt(languageId: $languageId, primary: true) { value }
        images(aspectRatio: poster) { mobileCinematicHigh }
        childrenCount
      }
      singles: videos(where: { ids: $videoIds, availableVariantLanguageIds: [$languageId] }) {
        ...VideoContentFields
      }
    }
    ```
- For each collection returned, trigger a follow-up query (batched via `Promise.all` or Apollo `@defer` when available) using the existing `GetVideoChildren` pattern to load its `children` with `VIDEO_CHILD_FIELDS`.
- Reuse existing GraphQL fragments (`VIDEO_CONTENT_FIELDS`, `VIDEO_CHILD_FIELDS`) to stay aligned with generated TypeScript types.
- Update `codegen` configuration if new fragments require regeneration.
- Ensure Apollo cache keys differentiate between `slug` and `databaseId` identifiers to avoid stale data.
- Consider adding a new fragment `VideoPosterFields` if poster-specific image ratios require a different field set.

## UI & UX Specifications
- Match the current gradient background (`from-blue-950/10 via-purple-950/10 to-[#91214A]/90`), overlay texture, and section padding.
- Maintain existing typography scale and responsive breakpoints (subtitle uppercase small-caps, headline 2xl/3xl/4xl).
- Preserve the Swiper configuration: `slidesPerView="auto"`, `mousewheel.forceToAxis = true`, free mode, spacing consistent with `OtherCollectionsCarousel`.
- Poster cards should retain bevel shadow, hover play icon, and outline focus states.
- Provide responsive spacing adjustments (e.g., extra left padding on the first slide for xl/2xl as implemented today).
- Support optional mission-highlight styling (bold leading words). When description override includes `<strong>` HTML, respect formatting; otherwise, automatically bold the first sentence similar to current `CollectionVideoContentCarousel` logic.

## Technical Approach & Implementation Plan
1. **Component Scaffold**
   - Create `CollectionShowcaseSection` directory under `src/components/CollectionsPage/` with component, styles (Tailwind classes), hooks, and tests following the existing pattern (`ComponentName/ComponentName.tsx` + `index.ts`).
   - Component signature example:
     ```ts
     interface CollectionShowcaseSectionProps {
       id?: string
       sources: CollectionShowcaseSource[]
       subtitleOverride?: string
       titleOverride?: string
       descriptionOverride?: string
       ctaLabelOverride?: string
       ctaHrefOverride?: string
       watchButtonIcon?: 'Play3' | 'ArrowRight' // optional future-proofing
       analyticsTag?: string
     }
     ```

2. **Data Hook**
   - Build a dedicated hook (`useCollectionShowcaseContent`) colocated with the component or under `src/libs/` to encapsulate GraphQL fetching, transformation, and loading/error state aggregation.
   - Hook responsibilities:
     - Normalize IDs (strip `/english` suffix if necessary) and dedupe.
     - Invoke `GetCollectionShowcaseContent` query.
     - For each collection, call `useVideoChildren` or a new helper to fetch children respecting `limitChildren` and returning poster-friendly data.
     - Merge results into a `slides` array with consistent fields: `{ slug, label, title, imageUrl, alt, duration?, variantLanguage?, sourceCollectionId? }`.

3. **Prop Overrides & Defaults**
   - Within the component, compute `subtitle`, `title`, `description`, and `cta` values by checking override props first, then API metadata, then fallback copy (e.g., translation key `collectionsPage.watchSectionFallbackSubtitle`).
   - Provide optional ability to override background gradient via prop for future campaigns.

4. **Refactoring Existing Usage**
   - Replace the hard-coded `OtherCollectionsCarousel` invocation in `CollectionsPage/languages/en/CollectionsPage.tsx` (and other locale variants) with the new component once feature-complete.
   - Keep the legacy component temporarily if other locales rely on static copy, but plan removal once new component supports overrides.

5. **Testing**
   - Unit tests for the hook (mock Apollo responses) verifying:
     - Metadata hydration from collection.
     - Mixing collection children and standalone videos.
     - Override precedence.
   - Component tests (React Testing Library) ensuring layout renders with mocked data, CTA uses correct href, and slides count matches data set.
   - Snapshot or visual regression test optional (Storybook story recommended).

6. **Performance Considerations**
   - Guard against large payloads by allowing `limitChildren` default (e.g., first 12 children per collection) and lazy-loading additional slides on demand (future enhancement).
   - Use `cache-and-network` policy to keep UI responsive while ensuring fresh data.
   - Memoize transformation logic to prevent unnecessary re-renders.

## Content & Localization Strategy
- Provide documentation for content editors on how to supply IDs and optional overrides when instantiating the component.
- Encourage storing locale-specific overrides in translation files (`apps-watch.json`) when necessary rather than inline strings.
- When multiple collections are provided, allow optional prop `primaryCollectionId` to explicitly choose which collection's metadata drives section copy.

## Analytics & Tracking
- Emit GTM events mirroring current behavior for:
  - CTA button click (include section ID, primary collection ID).
  - Carousel slide click (include video slug, parent collection if applicable).
- Ensure events reuse existing helpers (`sendGTMEvent`) to remain consistent with analytics dashboards.

## Dependencies & Impacted Areas
- Apollo GraphQL codegen (may require regenerating types).
- Swiper styles are already globally imported; confirm no regressions.
- Potential updates to `getWatchUrl` if new use cases (e.g., linking to collections) require adjustments.
- Localized Collections pages (English, Spanish, etc.) to adopt new component.

## QA Plan
- **Unit Testing**: Validate hook and component logic with mocked GraphQL results (success, empty, partial error).
- **Integration Testing**: Add Storybook stories for default and overridden scenarios to aid visual QA.
- **Responsive QA**: Manually verify layout at `sm`, `md`, `lg`, `xl`, `2xl` breakpoints using `pnpm dlx nx run watch:serve` locally.
- **Accessibility QA**: Keyboard navigation across slides, screen reader announcement of headings/buttons, color contrast audit.
- **Regression QA**: Ensure other sections using Swiper remain unaffected (shared CSS / configuration).

## Rollout & Milestones
1. **Phase 1 – Data Layer (1 sprint)**
   - Implement GraphQL query, hook, and unit tests.
   - Validate data shape in Storybook/console with real IDs (Easter collection as baseline).
2. **Phase 2 – UI Component (1 sprint)**
   - Build new section component with loading/error states and override logic.
   - Create Storybook stories and component tests.
3. **Phase 3 – Page Integration & Cleanup (0.5 sprint)**
   - Replace legacy `OtherCollectionsCarousel` in Easter EN page, behind feature flag if desired.
   - Update other locales to use same component, leveraging metadata translations.
   - Remove or deprecate old component once parity confirmed.
4. **Phase 4 – Analytics & Polish (0.5 sprint)**
   - Hook up GTM events, finalize documentation, and address QA feedback.

## Risks & Mitigations
- **Incomplete Metadata**: Some collections might lack description/snippet. Mitigation: add fallback copy and highlight to content team.
- **Large Collections**: Collections with many children could produce heavy carousels. Mitigation: default `limitChildren`, consider pagination or "See All" CTA linking to collection page.
- **ID Format Ambiguity**: Mix of slug vs. database IDs could cause query failures. Mitigation: expose `idType` prop, add runtime warnings if response empty, document expected format.
- **Design Drift**: Reimplementation may diverge visually. Mitigation: compare against screenshot, capture Storybook reference, involve design review.

## Open Questions
1. Do we need to support mixing multiple primary collections (e.g., one for copy, another for slides) or is one primary sufficient?
2. Should the CTA always link to an internal watch route, or do marketing teams require custom external URLs per campaign?
3. Are portrait poster assets guaranteed via `images(aspectRatio: poster)` for all videos, or do we need a fallback cropping strategy?
4. Should we expose configuration to change background gradient per instantiation?
5. How do we handle content ordering when multiple collections supply children—concatenate in provided order or interleave by publish date?

## Next Steps
- Align with design/content stakeholders to confirm metadata mapping (which field maps to mission highlight, etc.).
- Validate GraphQL schema supports `aspectRatio: poster`; if not, determine fallback approach.
- Finalize component API and document usage in the `/prds/watch` README after implementation.
