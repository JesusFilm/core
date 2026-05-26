---
title: Share a cross-app page via a neutral view-model and variant prop
date: 2026-05-26
category: docs/solutions/architecture-patterns/
module: journeys/ui/PublicGalleryPage
problem_type: architecture_pattern
component: tooling
severity: medium
applies_when:
  - "Two or more apps must render the same conceptual page in different frames (full-screen page vs dialog/thumbnail preview)"
  - "A hand-built preview/mock mirrors a live page and has drifted, or is at risk of drifting"
  - "The surfaces are owned by apps with their own generated/typed data sources (different GraphQL schemas, form state)"
  - "Consolidating shared tokens/types into a single entry component file creates a parent-child import cycle"
tags:
  - shared-component
  - cross-app
  - view-model
  - variant-prop
  - journeys-ui
  - preview-drift
  - circular-import
  - render-time-binding
---

# Share a cross-app page via a neutral view-model and variant prop

## Context

A single conceptual page often needs to appear on more than one surface. The public template-collection page (`/template-gallery/[slug]` in `apps/journeys`) also had to render as a *preview* inside the admin collection dialog (`apps/journeys-admin`) so a publisher could see their edits before publishing.

The admin preview had been a **separate, hand-built mock** (`CollectionPreviewPane`) that copied the public page's layout by hand. The two surfaces shared no code — only a shared mental model — and they had already drifted: NES-1682 removed a section from the public page but left it standing in the preview. Two surfaces, one conceptual page, maintained twice. Hand-mirrored UI does not stay mirrored.

The surfaces also look *very* different: the live page is a full-viewport (`100svh`) scroll experience with parallax and featured rows; the preview is a fixed 287px decorative thumbnail inside a dialog. So the goal was to share a source of truth without forcing one responsive component to contort into serving both shapes.

## Guidance

Extract the page into a shared `@core/journeys/ui` component built around three rules.

**1. Define a neutral view-model — not either app's generated GraphQL types.** The shared component owns a plain interface (`PublicGalleryPageData` / `PublicGalleryPageItem`). Each app keeps a tiny `toData()` mapper from its own generated types into that shape. This decouples the component from both schemas: either app can change its GraphQL query without touching the component.

```ts
// libs/journeys/ui/.../PublicGalleryPage.tsx
export interface PublicGalleryPageItem {
  id: string
  title: string
  description?: string | null
  slug: string
  createdAt?: string | null
  languageName?: ReadonlyArray<{ value: string; primary: boolean }>
  image?: { src: string | null; alt: string } | null
}

export interface PublicGalleryPageData {
  title: string
  description: string
  creatorName: string
  creatorImageSrc?: string | null
  creatorImageAlt?: string | null
  mediaUrl?: string | null
  items: ReadonlyArray<PublicGalleryPageItem>
}
```

Each consumer writes its own thin adapter. `apps/journeys` maps from `GetTemplateGalleryPage`; `apps/journeys-admin` maps from `GetAdminJourneys_journeys` plus Formik form values:

```ts
// apps/journeys-admin/.../CollectionPreviewPane.tsx
function toData(
  values: CollectionPreviewValues,
  journeys: readonly Journey[]
): PublicGalleryPageData {
  return {
    title: values.title,
    description: values.description,
    creatorName: values.creatorName,
    mediaUrl: values.mediaUrl,
    items: journeys.map((journey) => ({
      id: journey.id,
      title: journey.title,
      slug: journey.slug,
      createdAt: journey.createdAt != null ? String(journey.createdAt) : null,
      languageName: journey.language.name,
      image:
        journey.primaryImageBlock != null
          ? { src: journey.primaryImageBlock.src, alt: journey.primaryImageBlock.alt }
          : null
    }))
  }
}
```

**2. Expose one entry component with a `variant` prop that delegates to distinct render trees.** Do *not* build one responsive component littered with `display: { xs, md }` toggles trying to be both a full-screen page and a thumbnail. When the surfaces look fundamentally different, two sibling views sharing the data model is cleaner and drifts less — they share the model and live in one folder.

```ts
export type PublicGalleryPageVariant = 'journey' | 'admin'

export function PublicGalleryPage({
  data,
  variant = 'journey'
}: PublicGalleryPageProps): ReactElement {
  if (variant === 'admin') return <AdminView data={data} />
  return <JourneyView data={data} />
}
```

`JourneyView` is the full-screen, parallax experience; `AdminView` is the compact decorative thumbnail. They share `PublicGalleryPageData` and the visual tokens, nothing else. (Because the admin variant is static, no separate "disable animations" prop was needed — animation lives only in `JourneyView`.)

**3. Keep app-specific chrome in the app.** Only the recreated card *body* moved into the shared `admin` variant. `CollectionPreviewPane` keeps its copy-link / open-in-new-tab controls, its read-only URL field, and the dialog frame — these are admin concerns the public page has no business knowing about. The shared component renders the page content; the app wraps it in app-specific affordances.

### Secondary learning: the parent↔child circular import this creates

Consolidating the shared tokens and types *into the entry file* (`PublicGalleryPage.tsx`) is convenient — one obvious home. But the child views then import them back from the parent, creating a parent↔child cycle (`PublicGalleryPage` → `JourneyView` → `PublicGalleryPage`).

```ts
// Child: JourneyView.tsx imports back from its own parent
import {
  GALLERY_ACCENT,        // runtime const
  GALLERY_CARD_RADIUS,
  PublicGalleryPageData, // type
  PublicGalleryPageItem
} from '../PublicGalleryPage'
```

This is **safe in this repo**, and both conditions must hold:

- **The lint config doesn't forbid it.** `libs/shared/eslint/common.mjs` enables many `import/*` rules but **not** `import/no-cycle`, so the cycle isn't a build error.
- **The tokens are only read at render time, inside component bodies.** Every `GALLERY_ACCENT` reference sits inside a component's JSX / `sx` callback, never at module top level. With ESM live bindings (and Babel/tsc CJS output compiling each reference to a property access at the use site), the value resolves *after* both modules finish loading. By the time a component renders, the cycle is fully initialized.

**The caveat — the one line that would break it:**

```ts
// SAFE — read at render time, after modules load
function SectionLabel() {
  return <Box sx={{ backgroundColor: GALLERY_ACCENT }} />
}

// UNSAFE — read at module top level, during the cyclic load
const accent = GALLERY_ACCENT // ← undefined: binding not yet initialized
```

Never reference a token from the cyclic partner at module scope in a child file. During the circular load the binding is still uninitialized, so you capture `undefined` — with no lint warning.

If a project *does* enable `import/no-cycle` (or you want to avoid the cycle on principle), keep tokens and types in a **leaf module** that imports nothing from the component tree; both parent and children import downward from the leaf and there is no cycle.

## Why This Matters

- **One source of truth eliminates drift.** The NES-1682 regression (a section surviving in the preview after removal from the live page) is structurally impossible once both surfaces consume the same `PublicGalleryPageData` through the same component.
- **The neutral model survives schema churn.** Because the shared component never imports either app's generated types, an Apollo query change in one app cannot break the other or the library — only that app's `toData()` mapper changes, a small type-checked edit.
- **Two variants beat one over-responsive component.** A single component juggling `100svh` parallax sections *and* a 287px thumbnail accumulates conditional branches that are hard to read and easy to break. Two sibling views are each simple and self-contained, while still kept in sync by the shared model.
- **The circular-import gotcha is a silent footgun.** It works only because of a precise combination (no `import/no-cycle` + render-time-only reads). A future developer adding one module-scope `const x = GALLERY_ACCENT` in a child would get `undefined` with no warning. Documenting the rule (and the leaf-module escape hatch) prevents that.

## When to Apply

Apply when **all** of the following hold:

- The same conceptual page/view must appear on two or more surfaces (a live page and an in-app preview, or a web view and an embed/widget).
- Those surfaces are owned by different apps/modules with their **own generated or typed data sources**.
- The surfaces are at risk of drifting if maintained separately — especially if they already drifted once.

Lean toward **separate `variant` render trees** when the surfaces differ dramatically in layout, sizing, or interactivity (full-screen vs thumbnail, interactive vs decorative). Lean toward **one component with responsive props** when the surfaces are genuinely the same layout at different breakpoints.

Keep **app-specific chrome in the app**: URL/copy controls, dialog frames, routing, auth-gated affordances. The shared piece renders only the content that is conceptually "the page."

For the **token/type home**: only consolidate them into the entry component file if (a) cycles are allowed by lint and (b) every cross-reference is read at render time, never at module scope. Otherwise use a leaf module.

## Examples

**Before — admin preview hand-mirrors the public page (drift-prone).** The admin app rebuilt the gallery layout from scratch inside `CollectionPreviewPane`, no shared code. When a section was removed from the live page, the preview kept rendering it (NES-1682).

```ts
// apps/journeys-admin — the old shape (conceptual)
function CollectionPreviewPane({ values, journeys }) {
  return (
    <Box> {/* dialog chrome */}
      {/* ...hand-built copy of title, description, creator, carousel... */}
      {/* ...sections re-implemented here, independent of the live page... */}
    </Box>
  )
}
```

**After — both surfaces render the shared component from a neutral model.**

```ts
// apps/journeys — the live full-screen page
export function TemplateGalleryView({ gallery }: TemplateGalleryViewProps) {
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <PublicGalleryPage variant="journey" data={toData(gallery)} />
    </Box>
  )
}

// apps/journeys-admin — the dialog preview keeps its own chrome,
// shares only the card body via variant="admin"
function CollectionPreviewPaneImpl({ values, selectedJourneysOrdered, publicUrl, slug }) {
  return (
    <Box> {/* gray pane */}
      <Stack>{/* URL field + copy + open-in-new-tab: admin-only chrome */}</Stack>
      <Box aria-hidden="true" sx={{ width: 287 /* mobile-shaped card */ }}>
        <PublicGalleryPage
          variant="admin"
          data={toData(values, selectedJourneysOrdered)}
        />
      </Box>
    </Box>
  )
}
```

**Circular-import consolidation — cycle-free alternative.** If `import/no-cycle` is enforced, move tokens/types to a leaf both sides import downward:

```ts
// galleryTokens.ts (leaf — imports nothing from the component tree)
export const GALLERY_ACCENT = '#C52D3A'
export const GALLERY_CARD_RADIUS = 3
export interface PublicGalleryPageData { /* ... */ }

// PublicGalleryPage.tsx   → import { ... } from './galleryTokens'
// JourneyView.tsx (child) → import { ... } from '../galleryTokens'   // no cycle
```

Verification on the actual change: library `tsc` + Jest (9 tests across both variants), both consumer apps `tsc`, ESLint, and Prettier all clean; the admin `CollectionDialog` suite (28 tests) passed as an integration regression check.

## Related

- `design-patterns/floating-disclosure-mui-journeys-admin-canvas-nes1642.md` — nearest neighbor: another reusable MUI component pattern in the journeys family (single-app, different problem).
- `logic-errors/plausible-analytics-event-name-mismatch-qa359.md` — touches an `import/no-cycle` lint note on a barrel re-export; discoverable alongside this doc's circular-import discussion.
