# Tools Visuals AI Generator – Implementation Strategy

## 0. Summary
A single-screen Visuals/Thumbnail generation tool for Watch (Next.js Pages Router) that accepts uploaded imagery or a Watch video slug and produces branded visuals variations using Gemini AI. The surface lives at `/watch/tools/visuals`, is public, and balances client-side generation (with BYO keys). The experience leans on shadcn/ui + Tailwind primitives with Watch spacing tokens, persists user presets locally, and supports shortlist/download workflows for multiple output formats.

## 1. Constraints, goals, and guardrails
- **Monorepo reality:** Nx-managed workspace with pnpm. Watch’s source lives under `apps/watch`. Keep changes within the Watch app surface and reuse existing libs where possible.
- **Design system:** shadcn/ui primitives are allowed; no new MUI usage. Reuse existing Tailwind tokens defined in `apps/watch/styles/globals.css` and shared config.
- **API usage:** Users supply provider keys that stay in browser storage for v1.
- **Goals:** Public tool with paste/upload/slug intake, Gemini image generation, preset management, target-format fan-out, shortlist & download flows, and reuse of the libraries used in journeys-admin for uploading media where feasible.
- **Non-goals:** No server persistence, no external URLs, no telemetry, no safe-zone overlays for v1.

## 2. Experience design & information architecture
- **Route placement:** Create Pages Router entry `apps/watch/pages/watch/tools/visuals/index.tsx` using SSR (`getServerSideProps`) for SEO and initial content rendering. Provide loading/error boundaries as needed via client components and suspense-friendly wrappers.
- **Layout:** 3-column desktop grid (`PanelOriginal` | `PanelSettings` | `PanelResults`) collapsing to stacked sections on tablet/mobile using CSS grid + responsive Tailwind classes. Add generous spacing consistent with Watch marketing pages.
- **Column behaviors:**
  - *PanelOriginal:* Dropzone/paste area, slug input, image metadata, clear/reset.
  - *PanelSettings:* Provider selector with API key reveal toggle, presets carousel (scrollable), custom prompt overrides, output formats (checkbox list), advanced controls gated by provider capabilities.
  - *PanelResults:* Generate button, status indicator, masonry/grid gallery, shortlist toggle, action menu per item (download/star/delete).
- **States:** Informative empty state with sample asset CTA, inline errors + toast notifications.
- **Accessibility:** All interactive elements include `tabindex="0"`, ARIA labels, keyboard navigation support, focus management, and `cursor:pointer` for clickable elements. Screen reader announcements for status changes and generation progress.

## 3. Technical architecture & data flow
```
Client page (Pages Router)
  ├─ Local store (React Context or custom hook backed by useReducer + localStorage helpers)
  ├─ Gemini image generation adapter (`gemini-2.5-flash-image-preview`) invoked directly with BYO key
  ├─ Optional fetch layer → `/api/watch/tools/visuals` (feature-flagged)
  ├─ Media slug helper → Watch media service (existing GraphQL/REST)
  └─ Results cached in memory
```
- Prefer colocated hooks for async flows (e.g., `useToolsVisualsActions.ts`).
- Leverage Gemini's multimodal capabilities for image-to-image generation and analysis.

## 4. Module & file plan
```
apps/watch/pages/watch/tools/visuals/index.tsx
  # PageToolsVisuals component that composes layout shell + panels

apps/watch/src/components/ToolsVisuals/
  LayoutToolsVisuals.tsx           # LayoutToolsVisuals wrapper applying grid + responsive behavior
  PanelOriginal.tsx                # Client component for intake
  PanelSettings/
    PanelSettings.tsx
    FormProviderKey.tsx
    CarouselPreset.tsx
    GroupCheckboxFormat.tsx
  PanelResults/
    PanelResults.tsx
    CardResult.tsx
  index.ts                         # Export all components alphabetically

apps/watch/src/hooks/tool-visuals/
  useToolsVisualsStore.ts         # Central client store (context + reducer/localStorage sync)
  useLocalStorageValue.ts          # Shared hook if not already present

apps/watch/src/utils/tool-visuals/
  toolVisualsTargets.ts            # Format dimension map & helpers
  blob.ts                          # createImageBitmap helpers, URL cleanup

apps/watch/src/constants/tool-visuals/
  presets.ts                       # Built-in preset definitions

libs/shared/ai/src/image-generation/  # Extend existing shared AI lib
  index.ts                        # Image generation exports
  gemini.ts                       # Gemini image generation adapter
  types.ts                        # Image generation types
  tool-visuals-targets.ts         # Tools visuals format definitions

apps/watch/pages/api/watch/tools/visuals.ts
  # Optional proxy handler (Pages Router API route) respecting feature flag

libs/watch/media/ (if needed)
  src/getCanonicalThumbnail.ts      # Helper to fetch canonical thumbnail for slug using existing Watch services
```
- Before creating new libs, confirm no equivalent exists under `libs/shared` or `libs/watch`. If suitable helper exists, reuse rather than duplicating.
- Update `apps/watch/project.json` test targets if we add component tests colocated with page.

## 5. Provider abstraction & storage
- Define `ImageGenerationRequest`, `ImageGenerationResponse`, and tool-visuals-specific types inside `libs/shared/ai/src/image-generation`. Leverage existing Gemini integration for consistency.
- Use `gemini-2.5-flash-image-preview` model for image generation with support for various aspect ratios, quality settings, and image-to-image generation.
- **BYO key implementation:** Accept `apiKey?: string` parameter in all image generation functions for client-side dynamic key support.
- Store Gemini API keys & user presets in `localStorage` namespaced (e.g., `watch.tool-visuals.keys.v1`). Provide migration guard for future schema versions.

## 6. Presets, output formats, and brand constraints
- Hard-code v1 presets in `constants/presets.ts` with metadata (name, prompt template, default dimensions, capability requirements).
- Manage user-defined presets via store actions + `localStorage`. Validate prompt strings to prevent empty submissions.
- Output formats stored in `toolVisualsTargets.ts` with `id`, `label`, `width`, `height`, `aspectRatio`. Provide helper `getTargetDimensions(targetId)` and `formatDownloadName({ title, targetId, provider, index, timestamp })`.

## 7. State management approach
- Use React context + reducer or `useReducer` hook for deterministic state transitions (no Zustand dependency in repo yet).
- Store shape:
  - `source`: `{ type: 'upload' | 'paste' | 'slug', blob?: Blob, dataUrl?: string, slug?: string, meta?: { width: number; height: number; size: number; mime: string } }`
  - `provider`: `{ model: 'gemini-2.5-flash-image-preview'; key: string; advanced: { seed?: number; aspectRatio?: string; quality?: 'standard' | 'hd' } }`
  - `presetId`, `customPrompt`
  - `targets`: `Set<TargetId>`
  - `results`: `ToolsVisualsResult[]` (including shortlist flag)
  - `status`: `'idle' | 'generating' | 'error' | 'complete'`
  - `error`: optional error payload
- Persist `provider.key` + custom presets via effect hook syncing to storage.

## 8. External integrations
- **Slug lookup:** Investigate existing GraphQL queries/utilities for fetching canonical thumbnails (search `apps/watch` services). If none, create a helper hitting Watch’s media API endpoint (ensure environment variables documented in `docs/ENV.md`). Add mock service for tests.
- **Uploader:** implement a lean dropzone using `react-dropzone` (already in workspace).

## 9. Performance, accessibility, and security
- Downscale large images client-side before sending to provider respecting provider caps (document thresholds per provider adapter).
- Release object URLs after usage; leverage `createImageBitmap` for snappy previews when available.
- **Accessibility requirements:** Build accessible experiences as part of every component including:
  - ARIA labels and `role="status"` live region for progress announcements
  - Keyboard navigation support with `tabindex="0"` for interactive elements
  - Focus management and visual focus states
  - `cursor:pointer` for all clickable elements
  - Screen reader announcements for status changes and generation progress
  - Semantic HTML structure with proper heading hierarchy
- Mask API keys in UI with toggle. Validate slug input to prevent SSRF; only call trusted internal endpoints.

## 9.1 Component Structure & TypeScript Requirements
- **Component exports:** Export all components through `index.ts` files with alphabetical ordering
- **Import/export ordering:** Use alphabetical order for all imports and exports
- **TypeScript interfaces:** Name interfaces with component name prefix (e.g., `PanelOriginalProps`)
- **Component props:** Include `className?: string` prop for extensibility and `children?: ReactNode` for content slots
- **Server-first architecture:** Use `'use client'` components only when necessary; prefer server components where possible

## 9.2 Architecture & refactoring agreements
- **Small, focused modules:** Favor small, focused modules; extract shared logic into hooks or utilities when duplication appears.
- **Refactoring plan:** After implementing features, outline concrete plans to split services into smaller units, execute achievable refactors within the same effort, and document future steps.
- **Library organization:** The `libs/shared/ai/image-generation/` module extends the shared AI library for image generation; avoid expanding scope to include UI components or state management.
- **Future considerations:** Document architectural decisions and plan for potential extraction of shared utilities to `libs/shared/` if used across multiple apps.

## 10. Testing & verification strategy
- **Unit tests (vitest):**
  - Provider factory selection & error handling.
  - Preset CRUD reducers + localStorage adapters (mock storage).
  - Target sizing utilities & download filename formatter.
- **Component tests (React Testing Library):**
  - **Component Testing Checklist for each component:**
    - Rendering: Component renders without crashing
    - Props: All props work correctly with various inputs
    - Interactions: User interactions (clicks, keyboard, form inputs)
    - Accessibility: ARIA labels, keyboard navigation, semantic HTML
    - Conditional logic: Different states and prop combinations
    - CSS classes: Correct Tailwind classes applied
  - `PanelSettings` interactions (provider switch, preset selection, format toggles).
  - `PanelOriginal` dropzone/paste/slug flows with mocked helpers.
  - `PanelResults` shortlist + download button visibility (mock download util).
  - **Test patterns:** Use `describe/it` structure, mock network traffic with MSW handlers, wrap component specs with `MockedProvider`, `VideoProvider`, and `WatchProvider` when needed.
- **E2E (Playwright in `apps/watch-e2e`):**
  - Happy path with stubbed provider API (mock via intercepts) producing multiple formats.
  - Shortlist filter scenario.
  - Slug fetch scenario verifying canonical thumbnail retrieval.
- **Visual regression:** Add baseline for desktop + mobile (update existing Playwright visual suite if available).
- **Manual QA checklist:** Running `pnpm dlx nx run watch:serve`, navigate to `/watch/tools/visuals`, verify layout + a11y (Lighthouse ≥90).

## 11. Implementation phases & checklists
### Phase A – Discovery & scaffolding
- [ ] Audit existing uploader utilities & media services.
  - `apps/journeys-admin` exposes an `UploadCard` abstraction that wraps `react-dropzone`, but it is tightly coupled to Apollo mutations and Admin-only theming. For Watch we should extract only the reusable pieces (drop handling + preview rendering) into a lightweight hook (`useFileDropzone`) rather than pulling the full component. Reuse of `react-dropzone` is viable because the dependency already exists in the workspace.
  - Media helpers in `libs/journeys/api-media` offer slug-based thumbnail lookups via `getVideoVariant`. They target legacy endpoints that remain compatible with the Watch frontend. We can wrap this logic in a new helper (`getCanonicalThumbnail`) that normalizes the response to `{ url, width, height, alt }`.
- [ ] Confirm required env vars/endpoints for slug thumbnail fetch.
  - The media service relies on `process.env.WATCH_API_BASE_URL` with `/journeys/video-variant/:slug` routes. Document this requirement in `docs/ENV.md` during the implementation phase and provide mock URLs for local development (e.g., `http://localhost:4000`).
  - No additional secrets are necessary because the endpoint is public; ensure we gate calls with a slug allowlist to prevent SSRF.
- [ ] Extend `@core/shared/ai` library with image generation module.
  - Add `image-generation/` folder with Gemini adapter and tool-visuals-specific types.
  - Structure: `src/image-generation/index.ts`, `src/image-generation/gemini.ts`, `src/image-generation/types.ts`, and `src/image-generation/tool-visuals-targets.ts`.
  - **Client-side BYO key support:** Create separate adapter from existing server-side Gemini integration.
  - **API key parameter:** Modify `gemini.ts` to accept `apiKey?: string` parameter for dynamic key support.
  - **Model selection:** Use `gemini-2.5-flash-image-preview` with conditional API key: `google(modelName, apiKey ? { apiKey } : undefined)`.
  - **Backward compatibility:** Keep existing `@core/shared/ai` functions unchanged for server-side usage.
- [ ] Scaffold Pages Router route structure with placeholder components + responsive grid.
  - Directory: `apps/watch/pages/watch/tools/visuals`. Create `index.tsx` that composes three client components (`OriginalPanel`, `SettingsPanel`, `ResultsPanel`) inside a responsive CSS grid (`grid-cols-1 md:grid-cols-[minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,360px)_minmax(0,1fr)]`).
  - Introduce placeholder content with TODO comments describing responsibilities so future phases can replace them incrementally. Ensure loading and error boundaries are handled via component-level Suspense and error boundaries.

### Phase B – Intake workflow
- [ ] Implement dropzone/paste using shared uploader or new abstraction.
- [ ] Build slug lookup helper + hook up to Original panel.
- [ ] Display metadata & reset controls; ensure sample asset available.

### Phase C – State & presets
- [ ] Implement central store with persistence sync.
- [ ] Wire built-in presets + carousel UI; add custom preset CRUD dialogs.
- [ ] Implement output format selection + helper utilities.

### Phase D – Provider integrations
- [ ] Implement image generation types in `@core/shared/ai/image-generation`.
- [ ] Build Gemini adapter using `gemini-2.5-flash-image-preview` for tool visuals generation with BYO key support.
- [ ] Implement dynamic API key parameter: `generateImage(prompt, options, apiKey?)`.
- [ ] Support image-to-image generation and various aspect ratios/sizes.
- [ ] Connect Settings panel to Gemini capabilities & key storage UI.

### Phase E – Generation flow & results
- [ ] Implement request fan-out per selected format with concurrency cap.
- [ ] Render results grid with status feedback & error handling.
- [ ] Support shortlist toggles, delete, and downloads (single + bulk ZIP using existing util or lightweight JSZip already in repo).

### Phase F – Optional proxy & configuration
- [ ] Scaffold API route with feature flag (env-driven) and pass-through to provider adapters.
- [ ] Add rate limiting + auth guard placeholder (disabled by default).

### Phase G – Testing, polish, and docs
- [ ] Add unit/component/E2E tests described above.
- [ ] Capture visual baselines.
- [ ] Run `pnpm dlx nx run-many -t lint,test --projects=watch`.
- [ ] Update `docs/ENV.md` and this PRD with decisions (uploader reuse, provider quirks).
- [ ] Verify dev server logs (`dev-server.log`) for new warnings/errors.

## 12. Acceptance criteria
- `/watch/tools/visuals` route accessible publicly with responsive 3-column layout and Watch styling using SSR.
- Users can upload/paste images or provide Watch slug to auto-fetch canonical thumbnail.
- Gemini API key storage works (localStorage) and supports image generation settings.
- Preset selection & custom presets persist; output format choices drive generated image sizes.
- Generate flow returns previews per target (with mockable adapters) and supports shortlist + download (ZIP + single).
- All components follow AGENTS.md naming conventions (`PanelOriginal`, `PanelSettings`, etc.) and export patterns.
- Comprehensive accessibility implemented: `tabindex="0"`, ARIA labels, keyboard navigation, focus management, `cursor:pointer`.
- Component structure follows requirements: index.ts exports, alphabetical ordering, TypeScript interface naming.
- No new console errors; Lighthouse accessibility ≥ 90. Tests outlined in Phase G are green.

## 13. Verification & success criteria
An implementation is **not considered complete** unless it can prove correctness with measurable evidence. Any response that provides code, config, or a "solution" must also include at least one of the following forms of verification:

- **Console Output / Logs**: Show the result of running the code, including relevant debug or test logs.
- **Measured Data**: Performance metrics, counts, or state values that demonstrate the code executes as intended.
- **Automated Tests**: Passing unit, integration, or end-to-end tests with clear output.
- **Screenshots or Artifacts** (when visual/UI): Evidence that the feature behaves correctly in context.

If no measurable verification is provided, the task is considered **failed** and must be revised until proof exists.

## 14. Risks & mitigations
- **Provider API drift:** Encapsulate provider-specific payloads; add version comments + TODOs for upcoming API changes. Provide graceful error messaging if API rejects requests.
- **Large source files:** Downscale client-side with canvas to provider max; surface warning when original exceeds limit.
- **Uploader reuse friction:** If journeys-admin uploader is tightly coupled, scope a lightweight wrapper and document divergence to revisit later.
- **Storage quotas:** Monitor size of cached blobs; provide "Clear results" action freeing memory/object URLs.

