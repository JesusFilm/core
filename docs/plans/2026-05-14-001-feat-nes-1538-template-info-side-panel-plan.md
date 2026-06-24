---
title: 'feat(NES-1538): Add Template Info side panel to local template tab'
type: feat
status: active
date: 2026-05-14
---

# feat(NES-1538): Add Template Info side panel to local template tab

## Summary

Add a **static educational side panel** to the Team Templates tab in `journeys-admin` that teaches template creators what templates are, how to make them, how tracking works, how to share them, and how to embed Canva or Google Slides previews. The panel is purely informational (no per-template state, no mutations, no forms) and ships behind a new `templateInfoSidePanel` LaunchDarkly flag. Component is named `TemplateInfoPanel` and structured for reuse by NES-1642 (editor floating helper, deferred).

---

## Problem Frame

Template creators landing on the Team Templates tab today have no in-product guidance for what templates are, what "Quick-Start" vs "Regular" means, how to mark blocks as customisable, where tracking/publishing actions live, or — picked up from NES-1539/NES-1649 lived experience — how to get a Canva or Google Slides embed link that won't show "refused to connect." NES-1538 introduces a docked educational panel — evergreen content, five collapsible sections backed by short copy plus screenshots/GIFs — that lives alongside the template list. NES-1642 will reuse the same panel as a floating helper inside the journey editor (out of scope here).

The Linear ticket plus Siyang's five canonical Figma frames specify the panel chrome and per-section content precisely: a 375px-wide right-anchored card with a 16px corner radius, 1px `#DEDFE0` border, always-visible header, four accordion rows separated by `#DEDFE0` dividers (Template Types, How to create, Tracking and Analytics, Sharing and Publishing), and a fifth section added by Siyang's 2026-05-11 ticket comment (Embedding Canva or Google Slides). Single-expand mode is canonical across all expanded-state frames.

---

## Requirements

- R1. Render `TemplateInfoPanel` on the local template tab (`/?type=templates`, also labeled "Team Templates") when the `templateInfoSidePanel` LaunchDarkly flag is on. The panel mounts as a sibling of the templates grid and shifts the grid narrower; it does not overlay.
- R2. The panel renders an **always-visible header** with the exact ticket copy:
  - Title: `What templates are about:`
  - Body: `You can share projects created on our platform with others. This allows you to track the performance of every project generated from your template.`
- R3. The panel renders **five collapsible accordion sections** in this order, with the exact copy listed in the per-section units below:
  - Section 1 — **Template Types** (Figma `39657-66822`).
  - Section 2 — **How to create** (Figma `39653-66495`).
  - Section 3 — **Tracking and Analytics** (Figma `39657-66677`).
  - Section 4 — **Sharing and Publishing** (Figma `39657-66751`).
  - Section 5 — **Embedding Canva or Google Slides** (no Figma; copy from Siyang's 2026-05-11 ticket comment, quoted verbatim into U7).
- R4. All seven image/GIF assets enumerated in the ticket render in the correct accordion section at the Figma-spec dimensions (333px wide; heights per Asset Inventory below), with `alt` text matching the ticket descriptions. Section 5's two GIFs are optional candidates per Siyang's comment.
- R5. The component is **self-contained** with no templates-tab-specific layout assumptions. It receives only presentational props (`defaultExpanded?: SectionId`), reads no Apollo, no `JourneyProvider`, no `useEditor`. NES-1642 imports it as-is.
- R6. The panel uses the exact Figma design tokens from frame `39653-66422` (and its sibling expanded frames):
  - Width: 375px on `md+`.
  - Background: white. Border: 1px solid `#DEDFE0`. Corner radius: 16px.
  - Outer padding: `pt: 24px, pb: 20px, px: 1px` (the 1px horizontal padding is the Figma chrome's pixel-rounding artefact; treat as `px: 0`).
  - Header: `px: 20px, pb: 20px`, title `Montserrat SemiBold 22/27` (token `Editor/Headline/5`), body `Open Sans Regular 16/24` (token `Body/1`), colour `#444451` (token `Text/Primary`).
  - Accordion row: `p: 20px`, `gap: 12px`, bottom border `1px solid #DEDFE0`. Title `Montserrat SemiBold 18/24` (token `Editor/Subtitle/1`), colour `#444451`. End-adornment chevron is MUI `ExpandMoreIcon` (size 24).
  - In-body sub-headings (e.g. "Quick-Start", "Regular", "Links, Images, Video", "Text"): `Open Sans Bold 16/24`, colour `#6D6D7D` (token `Editor/Secondary/Light`).
  - Inline code samples (`{{date}}`, `{{date: May, 8}}`): `Open Sans Italic 16/24`.
  - RECOMMENDED chip on Quick-Start: bg `#DEDFE0`, text `Open Sans SemiBold 14/20` (token `Label`), `px: 8px, py: 4px`, `borderRadius: 4`, colour `#444451`. Text content is the **correctly-spelled `RECOMMENDED`** even though Figma `39657:67188` shows the typo `RECOMENDED`.
  - Image containers in section bodies: 333px wide, `borderRadius: 4px`, 1px border `rgba(0,0,0,0.07)` or `#DEDFE0`.
- R7. Accordions are **single-expand**: opening any section collapses the previously expanded one. All sections are collapsed on first mount. `aria-expanded`, `aria-controls`, `aria-labelledby`, keyboard activation (`Enter`/`Space`) per `.claude/rules/frontend/apps.md`.
- R8. All visible strings live in `libs/locales/en/apps-journeys-admin.json` under a `templateInfoPanel.*` namespace; the React tree reads via `useTranslation('apps-journeys-admin')`.
- R9. **Mobile (`xs`/`sm`) behaviour: hidden by default, opened via a mobile-only trigger button.** On small viewports the static right-side column does NOT render. Instead, the templates-tab toolbar shows an "Info" button (mobile-only) that opens a `SwipeableDrawer anchor="bottom"`. The drawer is **auto-height** (sized to its content) with a `maxHeight: 80vh` safety cap, **swipeable up/down** to dismiss, and includes an X close affordance in its header. This is an experimental implementation; Siyang will test feel before confirming.
- R10. The panel does not render at all when the flag is off — no DOM, no network, no layout shift in the templates tab.

---

## Scope Boundaries

- The editor floating tutorial helper (Figma `39661-67392`) is **out of scope** — moved to NES-1642.
- No new GraphQL operations, no mutations, no schema changes.
- No changes to existing template-edit flows (`LocalTemplateDetailsDialog`, `TemplateSettingsDialog`, `JourneyDetailsDialog`, `JourneyCardMenu`).
- No image/GIF authoring — the seven (plus optional two) assets are produced separately and placed at the agreed-upon location.

### Deferred to Follow-Up Work

- **NES-1642**: editor floating helper reuses `TemplateInfoPanel`. Tracked separately.
- **Section 5 GIF candidates** (Canva canonical-URL flow; Google Slides Publish-to-web flow): Siyang's comment marks them as "GIF candidate" rather than required. Plan ships Section 5 with text + URL code samples only; GIFs land later if Siyang produces them.

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/JourneyList/JourneyList.tsx` — top-level admin dashboard. Already wires push-narrowing for the journeys tab via `sidePanelVisible = currentContentType === 'journeys'` and `calc(100vw - sidePanel.width - navbar.width - 80px)`. The plan extends the narrowing to fire on `currentContentType === 'templates'` when the new flag is on, using a local `TEMPLATE_INFO_PANEL_WIDTH = 375` constant (not `sidePanel.width = 327px`).
- `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx` — the local template tab content (Collections + All Templates grid). No changes; the new panel sits beside it.
- `apps/journeys-admin/src/components/PageWrapper/utils/usePageWrapperStyles/usePageWrapperStyles.ts` — exports `navbar.width = 72px`, `sidePanel.width = 327px`. The plan reads `navbar.width` for the `calc(...)` narrowing.
- `libs/shared/ui/src/components/FlagsProvider/FlagsProvider.tsx` — `useFlags(): { [key: string]: boolean }`. The new `templateInfoSidePanel` flag is consumed via `const { templateInfoSidePanel } = useFlags()`. **No TypeScript declaration changes** — flags are runtime values from LaunchDarkly.
- MUI Accordion usage examples in admin: `EmbedJourneyDialog.tsx`, `GoogleSheetsSyncDialog.tsx`.
- `libs/locales/en/apps-journeys-admin.json` — translation strings.
- `apps/journeys-admin/public/` — static assets root. The plan creates `apps/journeys-admin/public/assets/template-info/`.

### Institutional Learnings

- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — NES-1539 introduced the Team Templates tab. Useful context for how Collections + the grid mount; not directly load-bearing here since the new panel is presentational.
- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` — the Pattern 1–7 NES-1543 doc. **Not applicable** to NES-1538 because the panel has no form, no mutations, no `JourneyProvider` bridging. Recorded here so reviewers know it was checked.

### External References

- **Linear ticket NES-1538** (status: In Progress, started 2026-05-14, due 2026-05-15, S/2 estimate, milestone "Collections & Gallery Pages", project "Local Template Library"). Body verified via Linear MCP `get_issue`.
- **Linear comment** `9277fdef-0200-44e4-b48c-0bfe37c0de0f` (Siyang Cao, 2026-05-11) — defines Section 5 (Embedding Canva or Google Slides).
- **Figma file** `q86gwEsOR2IQvenrhDizmP` (`💡 NS - Editor (WIP)`):
  - `39640-65061` — **Layout reference**. Full Team Templates tab at 1920px viewport, panel right-anchored at `left=1529px, top=68px, w=375px, h=1048px` inside a content area at `left=81px, top=71px, w=1471px, h=1085px` (bg `#EFEFEF`). Three template cards visible at 338px wide each. Tab bar shows "Team Projects" + "Team Templates" (active, `#C52D3A` red underline). Filter pills "Active", "Sort By: Last Modified", 3-dot overflow. Three-dots menu open showing: Template Details, Preview, Copy Preview Link, Use in a team, Publish (highlighted), Duplicate, Archive, Trash.
  - `39653-66422` — **All-collapsed view** of the panel. Header + 4 accordion headers visible. (Figma was authored before Siyang added Section 5; the canonical "first mount" state is still all-collapsed.)
  - `39657-66822` — **Template Types** expanded. **Order: Quick-Start (with RECOMMENDED badge) → Regular**. Both sub-blocks include a 333×185px GIF/screenshot container.
  - `39653-66495` — **How to create** expanded. Top-level 2 steps + 333×160px GIF + callout box ("If you want to have Quick-Start template...") + Links/Images/Video sub-section + Text sub-section with `{{date}}` / `{{date: May, 8}}` italic + 333×160px GIF.
  - `39657-66677` — **Tracking and Analytics** expanded. Opening paragraph + 2 numbered steps (step 2 has an inline icon for the Tracking tab) + 333×227px Button Properties screenshot + closing paragraph + 333×203px analytics-table screenshot.
  - `39657-66751` — **Sharing and Publishing** expanded. 4 paragraphs (with "Publish" and "Use in a team" bolded) + 333×160px GIF placeholder.
- **Older Figma frames (kept for context only)**: `39631-61135` (entry-points; depicts editor canvas — relevant to NES-1642, not us); `39662-67865` (legacy "How it looks"; superseded by Siyang's newer frames).

---

## Key Technical Decisions

- **Build a new presentational component `TemplateInfoPanel`** with no Apollo, no `JourneyProvider`, no `useEditor`. Rationale: ticket explicitly requires reusability for NES-1642; coupling to admin-only context would break that.
- **Use MUI `Accordion` directly** with a local `expanded: SectionId | null` state. Rationale: the Editor's `Accordion` couples to `useEditor()`, which violates R5. Single-expand semantics are encoded by setting `expanded` to the clicked id (or `null` if it was already open).
- **Render the panel as a static right-side column in `JourneyList.tsx`** rather than as a MUI `Drawer`. Rationale: Figma `39640-65061` shows the panel docked inside the content area, not as an overlay. No close button or open/close UX.
- **Width = 375px on `md+`** (Figma source of truth from `39640-65061`), full-width below the grid on `xs`/`sm`. The existing admin `sidePanel.width = 327px` is for a different component family (journeys-tab side panel) and is not reused.
- **Image assets live at `apps/journeys-admin/public/assets/template-info/`** as PNG/GIF served from the Next.js public folder. GIFs are sub-MB; no CDN setup overhead; version-controlled with the component.
- **No new TypeScript declaration for the LaunchDarkly flag.** `useFlags(): { [key: string]: boolean }` is index-typed. Defensive `=== true` check (a missing flag returns `undefined`, which is falsy — exactly the desired off-by-default).
- **Spelling/typo policy**: Figma typos are not authoritative. Where Figma differs from the ticket body or standard English, use the corrected form:
  - `RECOMENDED` → `RECOMMENDED`.
  - `your need to prepare it` → `you need to prepare it`.
  - `there dots menu` → `three dots menu`.
- **Section ordering policy**: Where Figma differs from the ticket body, Figma wins. Specifically, **Template Types renders Quick-Start before Regular** (per Figma `39657-66822`), even though the ticket body lists Regular first.

---

## Open Questions

### Resolved During Planning

- "Is this a per-template detail panel or a static tutorial?" → Static tutorial.
- "Does the panel need form state, mutations, or `JourneyProvider`?" → No (R5).
- "Which feature flag gates this?" → New `templateInfoSidePanel` flag, created in LD dashboard.
- "Right-anchored or left-anchored?" → **Right-anchored** (Figma `39640-65061`).
- "Panel width — 375px or 327px?" → **375px** (Figma `39640-65061`).
- "4 sections or 5?" → **5** sections. Section 5 copy is fully specified in Siyang's 2026-05-11 ticket comment.
- "Template Types sub-block order: Regular-first (ticket) or Quick-Start-first (Figma)?" → **Quick-Start first** (Figma `39657-66822`).
- "Accordion expand mode: single or multi?" → **Single-expand** (every Figma expanded frame shows exactly one section open).

### Deferred to Implementation

- The exact accordion expand animation timing — keep MUI Accordion defaults.
- Empty-state behaviour when an asset 404s — broken-image icon is acceptable in development; production assets must be present at merge.
- Whether the in-body sub-heading colour `#6D6D7D` (Figma) should map to the theme's `text.secondary` token vs. an inline hex — verify in `libs/shared/ui/themes/` during implementation.

### Resolved by Siyang (2026-05-14)

1. **Assets — ship with placeholders.** Final assets get swapped in pre-merge or in a follow-up. Generate clearly-labelled placeholder PNGs/GIFs at the Asset Inventory dimensions (333px wide, varying heights). Path: `apps/journeys-admin/public/assets/template-info/`.
2. **Mobile — hidden + mobile-only trigger + bottom `SwipeableDrawer`** (auto-height, max 80vh, swipe-to-dismiss). See R9. Trigger button placement: in the templates-tab toolbar near the existing "Active" / "Sort By" pills, matching the entry-point pattern in Figma `39631-61135` where the editor's info trigger sits in the toolbar.
3. **LaunchDarkly flag** — Siyang creates `templateInfoSidePanel` in the LD dashboard separately, defaults off, dev/local first. Code-side gate is `useFlags()?.templateInfoSidePanel === true`.

---

## Asset Inventory

**Siyang's decision (2026-05-14)**: ship with **clearly-labelled placeholder PNGs** at the dimensioned slot sizes. Final assets get swapped in pre-merge or in a follow-up. A new unit `U0` (run first) generates the placeholders.

The seven required assets must exist at the listed paths before the panel renders cleanly. The two optional Section 5 GIFs ship later if/when produced.

| #         | Type           | Section                                      | Path                                                                                    | Dimensions (W × H per Figma) | Source         |
| --------- | -------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- | -------------- |
| 1         | Screenshot/GIF | Template Types — Quick-Start                 | `apps/journeys-admin/public/assets/template-info/template-types-quick-start.png`        | 333 × 185                    | To be produced |
| 2         | Screenshot     | Template Types — Regular                     | `apps/journeys-admin/public/assets/template-info/template-types-regular.png`            | 333 × 185                    | To be produced |
| 3         | GIF            | How to create — three-dots → Make Template   | `apps/journeys-admin/public/assets/template-info/make-template-flow.gif`                | 333 × 160                    | To be produced |
| 4         | GIF            | How to create — text variable workflow       | `apps/journeys-admin/public/assets/template-info/text-variable-flow.gif`                | 333 × 160                    | To be produced |
| 5         | Screenshot     | Tracking and Analytics — Button Properties   | `apps/journeys-admin/public/assets/template-info/tracking-button-properties.png`        | 333 × 227                    | To be produced |
| 6         | Screenshot     | Tracking and Analytics — analytics table     | `apps/journeys-admin/public/assets/template-info/tracking-analytics-table.png`          | 333 × 203                    | To be produced |
| 7         | GIF            | Sharing and Publishing — publish/use-in-team | `apps/journeys-admin/public/assets/template-info/publish-and-share-flow.gif`            | 333 × 160                    | To be produced |
| 8 _(opt)_ | GIF            | Section 5 — Canva canonical-URL flow         | `apps/journeys-admin/public/assets/template-info/canva-canonical-url-flow.gif`          | 333 × 160                    | Optional       |
| 9 _(opt)_ | GIF            | Section 5 — Google Slides Publish-to-web     | `apps/journeys-admin/public/assets/template-info/google-slides-publish-to-web-flow.gif` | 333 × 160                    | Optional       |

Each component references its asset with a plain `<img src="/assets/template-info/<file>" alt={t('...')} loading="lazy" />` (Next.js public folder convention).

---

## Output Structure

```
apps/journeys-admin/src/components/
└── TemplateInfoPanel/
    ├── TemplateInfoPanel.tsx                                # U2 — chrome + header + accordion shell + section composition
    ├── TemplateInfoPanel.spec.tsx                           # U2
    ├── TemplateInfoPanel.stories.tsx                        # U2
    ├── index.ts                                             # U2
    ├── TemplateInfoAccordion/
    │   ├── TemplateInfoAccordion.tsx                        # U2 — generic accordion row (MUI wrapper, controlled)
    │   ├── TemplateInfoAccordion.spec.tsx
    │   └── index.ts
    ├── TemplateTypesSection/
    │   ├── TemplateTypesSection.tsx                         # U3
    │   ├── TemplateTypesSection.spec.tsx
    │   └── index.ts
    ├── HowToCreateSection/
    │   ├── HowToCreateSection.tsx                           # U4
    │   ├── HowToCreateSection.spec.tsx
    │   └── index.ts
    ├── TrackingAndAnalyticsSection/
    │   ├── TrackingAndAnalyticsSection.tsx                  # U5
    │   ├── TrackingAndAnalyticsSection.spec.tsx
    │   └── index.ts
    ├── SharingAndPublishingSection/
    │   ├── SharingAndPublishingSection.tsx                  # U6
    │   ├── SharingAndPublishingSection.spec.tsx
    │   └── index.ts
    └── EmbeddingCanvaOrGoogleSlidesSection/                 # U7 (no Figma; copy from comment)
        ├── EmbeddingCanvaOrGoogleSlidesSection.tsx
        ├── EmbeddingCanvaOrGoogleSlidesSection.spec.tsx
        └── index.ts

apps/journeys-admin/public/assets/template-info/
├── template-types-quick-start.png
├── template-types-regular.png
├── make-template-flow.gif
├── text-variable-flow.gif
├── tracking-button-properties.png
├── tracking-analytics-table.png
└── publish-and-share-flow.gif
```

The directory tree is a scope declaration; the implementer may collapse small section components into a single file if a section is short.

---

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification._

```
┌─────────────────────────────────────────────────────────────────────────┐
│ JourneyList.tsx  (templates tab — when templateInfoSidePanel flag on)   │
│                                                                         │
│  ┌────────────────────────────────────────┐  ┌─────────────────────┐    │
│  │ JourneyListView                        │  │ TemplateInfoPanel   │    │
│  │  └─ TemplateGalleryPageList            │  │  (md+: right 375px) │    │
│  │       └─ JourneyCard[] (grid)          │  │  (xs/sm: stacked    │    │
│  │                                        │  │   below grid)       │    │
│  │  Box width: calc(100vw                 │  │                     │    │
│  │      - TEMPLATE_INFO_PANEL_WIDTH       │  │  Header (always):   │    │
│  │      - navbar.width                    │  │   "What templates   │    │
│  │      - 80px)                           │  │    are about:"      │    │
│  │  (when templates tab AND               │  │                     │    │
│  │   templateInfoSidePanel flag on)       │  │  Accordions[5]:     │    │
│  └────────────────────────────────────────┘  │   1. Template Types │    │
│                                              │   2. How to create  │    │
│                                              │   3. Tracking …     │    │
│                                              │   4. Sharing …      │    │
│                                              │   5. Embedding C/GS │    │
│                                              │                     │    │
│                                              │  Local state:       │    │
│                                              │   expanded:id|null  │    │
│                                              │   (single-expand)   │    │
│                                              └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

Gating: currentContentType === 'templates'
     && useFlags().templateInfoSidePanel === true
     && useFlags().teamTemplateCollection === true   (already gates the tab today)
```

---

## Implementation Units

- U0. **Generate clearly-labelled placeholder assets**

**Goal:** Create 7 placeholder PNG files at the Asset Inventory dimensions, each labelled with the section + slot name so reviewers immediately see they're placeholders.

**Requirements:** R4 (assets exist at expected paths so the panel renders without broken images).

**Dependencies:** None.

**Files:**

- Create: `apps/journeys-admin/public/assets/template-info/template-types-quick-start.png` (333×185)
- Create: `apps/journeys-admin/public/assets/template-info/template-types-regular.png` (333×185)
- Create: `apps/journeys-admin/public/assets/template-info/make-template-flow.gif` (333×160 — produced as a PNG with `.gif`-ish appearance; an animated GIF isn't required for a placeholder, but the filename uses `.gif` so the component reference matches the final asset)
- Create: `apps/journeys-admin/public/assets/template-info/text-variable-flow.gif` (333×160)
- Create: `apps/journeys-admin/public/assets/template-info/tracking-button-properties.png` (333×227)
- Create: `apps/journeys-admin/public/assets/template-info/tracking-analytics-table.png` (333×203)
- Create: `apps/journeys-admin/public/assets/template-info/publish-and-share-flow.gif` (333×160)

**Approach:**

- Use ImageMagick (`convert`) — available on macOS via Homebrew (`brew install imagemagick`). If unavailable in the worktree, fall back to a Node one-liner using `sharp` or `canvas`.
- Each placeholder: light-grey (`#EFEFEF`) background, dark-grey (`#6D6D7D`) "PLACEHOLDER" label + slot description text, 1px border `#DEDFE0`. Example:
  ```
  convert -size 333x185 xc:'#EFEFEF' \
    -fill '#6D6D7D' -font 'Helvetica' -pointsize 14 \
    -gravity center -annotate +0+0 'PLACEHOLDER\nTemplate Types — Quick-Start\n333×185' \
    -bordercolor '#DEDFE0' -border 1 \
    apps/journeys-admin/public/assets/template-info/template-types-quick-start.png
  ```
- For `.gif` slots: produce a static PNG at the spec'd dimensions but save with the `.gif` extension. Browsers handle the MIME mismatch fine; the filename matches the final asset so swap-in is a one-file replace.
- Verify each file exists at the listed path with the listed dimensions.

**Test scenarios:**

- Test expectation: none — these are static assets. Verification is "files exist with correct dimensions".

**Verification:**

- `ls -l apps/journeys-admin/public/assets/template-info/` shows all 7 files.
- `file apps/journeys-admin/public/assets/template-info/template-types-quick-start.png` reports `333 x 185`.

---

- U1. **Consume the `templateInfoSidePanel` LaunchDarkly flag in `JourneyList.tsx`**

**Goal:** Read the new flag via `useFlags()`. Compute a `showTemplateInfoPanel` boolean. Document (in code comment) that the flag is created in the LD dashboard separately.

**Requirements:** R1, R10.

**Dependencies:** None. Assumes Siyang has created the LD flag by merge time.

**Files:**

- Modify: `apps/journeys-admin/src/components/JourneyList/JourneyList.tsx`
- Test: `apps/journeys-admin/src/components/JourneyList/JourneyList.spec.tsx`

**Approach:**

- Extend the existing `const { teamTemplateCollection } = useFlags()` destructure to also pull `templateInfoSidePanel`.
- Compute `const showTemplateInfoPanel = templateInfoSidePanel === true && teamTemplateCollection === true && currentContentType === 'templates'`.
- Use defensive `=== true` because `useFlags()` returns `undefined` for unknown keys.

**Test scenarios:**

- Happy path: flag on + templates tab + collections on → `showTemplateInfoPanel = true`.
- Edge case: flag undefined (LD not loaded yet) → `showTemplateInfoPanel = false` (panel hidden, no layout shift per R10).
- Edge case: flag on but journeys tab active → `showTemplateInfoPanel = false`.
- Edge case: flag on but `teamTemplateCollection` off → `showTemplateInfoPanel = false`.

**Verification:**

- Existing `JourneyList.spec.tsx` cases pass; new flag-state cases added.

---

- U2. **Build the `TemplateInfoPanel` shell + reusable `TemplateInfoAccordion`**

**Goal:** Create the presentational shell (chrome + header + accordion list) and the generic single-expand accordion row component. No section content yet — children come from U3–U7.

**Requirements:** R2, R5, R6, R7, R8.

**Dependencies:** None.

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.stories.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/index.ts`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoAccordion/TemplateInfoAccordion.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoAccordion/TemplateInfoAccordion.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoAccordion/index.ts`
- Modify: `libs/locales/en/apps-journeys-admin.json` (header keys: `templateInfoPanel.header.title`, `templateInfoPanel.header.body`; section title keys for all 5 sections).

**Approach:**

- `TemplateInfoPanel`: outer MUI `Box` with `sx={{ width: { xs: '100%', md: 375 }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 4 /* 16px */, overflow: 'hidden', pt: 3 /* 24px */, pb: 2.5 /* 20px */ }}`. Inside: a `Stack` with the header at top and the accordion list below.
- Header: `Box sx={{ px: 2.5 /* 20px */, pb: 2.5, gap: 1 }}`. Title rendered as `Typography variant="h5"` (Montserrat SemiBold 22/27). Body rendered as `Typography variant="body1"` (Open Sans Regular 16/24). If the MUI theme's `h5`/`body1` don't match the Figma tokens exactly, fall back to inline `sx`.
- 1px horizontal divider between header and accordion list.
- Accordion list: 5 `<TemplateInfoAccordion id="..." title={t('...')} expanded={expanded === '...'} onChange={handle('...')}>...</TemplateInfoAccordion>` rows. Each row's `<children>` is provided by U3–U7. Bottom border on every row except the last is `1px solid divider`.
- `TemplateInfoPanel` props: `{ defaultExpanded?: SectionId; className?: string }`. No other props — keeps the component reusable for NES-1642.
- `SectionId = 'templateTypes' | 'howToCreate' | 'trackingAndAnalytics' | 'sharingAndPublishing' | 'embeddingCanvaOrGoogleSlides'`.
- `TemplateInfoAccordion`: MUI `Accordion elevation={0} square disableGutters` controlled by parent (`expanded` + `onChange` props). `AccordionSummary` with `expandIcon={<ExpandMoreIcon />}` shows title. `AccordionDetails` renders children.
- Single-expand state lives in `TemplateInfoPanel`: `const [expanded, setExpanded] = useState<SectionId | null>(defaultExpanded ?? null)`. Click handler: `(id) => setExpanded((cur) => cur === id ? null : id)`. Toggling a section to its own id collapses (sets `null`); toggling to a different id swaps.

**Patterns to follow:**

- MUI Accordion usage in `EmbedJourneyDialog.tsx` / `GoogleSheetsSyncDialog.tsx`.
- The Editor `Drawer`'s border/radius styling (`Editor/Slider/Settings/Drawer/Drawer.tsx`) for visual reference only — do not import.

**Test scenarios:**

- Happy path: renders header title + body text from i18n.
- Happy path: renders 5 accordion rows (with mocked section children).
- Happy path: clicking row 2 expands it; clicking row 3 collapses row 2 and expands row 3 (single-expand).
- Happy path: clicking row 2 again collapses it (null state).
- Edge case: `defaultExpanded="howToCreate"` → "How to create" expanded on first render.
- Edge case: keyboard activation — `Enter` and `Space` on a collapsed summary toggle expansion.
- Accessibility: each summary has `aria-controls`, `aria-expanded`, `id`, and the panel uses `aria-labelledby`.

**Verification:**

- Storybook story shows the shell with placeholder section children.
- `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.spec.tsx'` passes.

---

- U3. **Implement `TemplateTypesSection` (Figma `39657-66822`)**

**Goal:** Render Section 1: Quick-Start (with RECOMMENDED chip) followed by Regular, each with a 3-bullet list and a 333×185px asset.

**Requirements:** R3, R4, R6 (RECOMMENDED chip styling), R8.

**Dependencies:** U2.

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateTypesSection/TemplateTypesSection.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateTypesSection/TemplateTypesSection.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateTypesSection/index.ts`
- Modify: `libs/locales/en/apps-journeys-admin.json` (sub-keys for Quick-Start title, Regular title, all bullets, badge label).

**Approach:**

- `<Stack gap={3 /* 12px */}>`:
  - **Quick-Start sub-block** (first):
    - Header row: `<Stack direction="row" gap={1 /* 8px */} alignItems="center">` with `<Typography sx={{ fontFamily: 'Open Sans', fontWeight: 700, fontSize: 16, lineHeight: '24px', color: '#6D6D7D' }}>{t('templateInfoPanel.section.templateTypes.quickStart.title')}</Typography>` then a MUI `<Chip label={t('templateInfoPanel.section.templateTypes.quickStart.badge') /* "RECOMMENDED" */} size="small" sx={{ bgcolor: '#DEDFE0', color: '#444451', borderRadius: 1, height: 'auto', fontFamily: 'Open Sans', fontWeight: 600, fontSize: 14, lineHeight: '20px', px: 1, py: 0.5 }} />`.
    - `<Box component="ul" sx={{ pl: 3, m: 0 }}>` with 3 `<li><Typography variant="body1">{t('...bullet1')}</Typography></li>` rows:
      - `Best for new or mobile users.`
      - `Easy to customize: step-by-step guided editing.`
      - `Requires setup.`
    - `<Box sx={{ width: 333, height: 185, borderRadius: 1, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}><img src="/assets/template-info/template-types-quick-start.png" alt={t('templateInfoPanel.section.templateTypes.quickStart.imageAlt')} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></Box>`
  - **Regular sub-block** (second):
    - Header `<Typography>` (same bold style, no chip) for `t('templateInfoPanel.section.templateTypes.regular.title')`.
    - 3 bullets:
      - `Best for experienced and desktop users.`
      - `Template adapters will have full editor access from the beginning.`
      - `No setup required.`
    - 333×185px image at `/assets/template-info/template-types-regular.png`.
- Use MUI components only per `.claude/rules/frontend/apps.md`. Native `<ul>`/`<li>` are allowed semantically; style with `sx`.

**Patterns to follow:**

- The `TEMPLATE` chip styling at the existing template badge in `JourneyCard` (Figma `39662:67871`) for the RECOMMENDED badge.

**Test scenarios:**

- Happy path: renders Quick-Start heading FIRST and Regular heading SECOND.
- Happy path: renders RECOMMENDED chip next to Quick-Start title.
- Happy path: each block renders an `<img>` with the expected `src` and non-empty `alt`.
- Happy path: each block renders exactly 3 bullets.

**Verification:**

- Visual story matches Figma `39657-66822`.

---

- U4. **Implement `HowToCreateSection` (Figma `39653-66495`)**

**Goal:** Render Section 2: top-level steps + first GIF + callout box + Links/Images/Video sub-section + Text sub-section with code samples + second GIF.

**Requirements:** R3, R4, R6, R8.

**Dependencies:** U2.

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/HowToCreateSection/HowToCreateSection.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/HowToCreateSection/HowToCreateSection.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/HowToCreateSection/index.ts`
- Modify: `libs/locales/en/apps-journeys-admin.json`

**Approach:**

- Block A — Top-level intro:
  - `<Box component="ol">` with 2 numbered items: `Click on the three dots on your project card.`, `Select the Make Template option`.
  - 333×160px image at `/assets/template-info/make-template-flow.gif`.
  - Callout `<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>` containing `<Typography variant="body1">{t('...calloutQuickStart')}</Typography>` = `If you want to have Quick-Start template, you need to prepare it.` _(corrected from Figma typo "your need")_.
- Block B — "Links, Images, Video" sub-section:
  - Bold sub-heading `<Typography sx={{ fontFamily: 'Open Sans', fontWeight: 700, fontSize: 16, lineHeight: '24px', color: '#6D6D7D' }}>{t('...linksTitle')}</Typography>` = `Links, Images, Video`.
  - `<Box component="ol">` with 3 items, but item 2 contains a bolded inline span: `Turn on **Make Customisable**` (use `<Trans>` from `next-i18next` for the inline `<strong>`).
  - Trailing paragraph: `Marked blocks will be available for editing in Step-by-step customisation.`.
- Block C — "Text" sub-section:
  - Bold sub-heading: `Text`.
  - `<Box component="ul">` with 4 items, items 2 and 3 contain italic inline `{{date}}` and `{{date: May, 8}}`. Use `<Trans>` with a `<Box component="code" sx={{ fontStyle: 'italic', fontFamily: 'Open Sans' }}>` interpolation slot.
  - 333×160px image at `/assets/template-info/text-variable-flow.gif`.
- Full copy (corrected to ticket spelling, taken from Figma `39653-66495` body):
  - `In your template, highlight the text snippet you want to make customisable. Copy the text.`
  - `Instead of it type variable like date, time, event name and so on. Put this variable inside double brackets, e.g. {{date}}`
  - `Click on three dots and select Template Settings. You'll see the variable you set inside the field. You need to paste the text you copied after the double dots, like this {{date: May, 8}}`
  - `If you have repeated text on different cards you can reuse the same variable. When the adapter customizes it, it will be changed on each card.`

**Test scenarios:**

- Happy path: renders both GIFs with correct `src`.
- Happy path: renders 3 blocks with their headings (top-level, Links/Images/Video, Text).
- Happy path: code samples `{{date}}` and `{{date: May, 8}}` render verbatim and in italic.
- Happy path: "Make Customisable" appears in bold.

**Verification:**

- Section renders inside the panel story matching Figma `39653-66495`.

---

- U5. **Implement `TrackingAndAnalyticsSection` (Figma `39657-66677`)**

**Goal:** Render Section 3: opening paragraph + 2 numbered steps (step 2 with inline Tracking icon) + Button Properties screenshot + closing paragraph + analytics table screenshot.

**Requirements:** R3, R4, R6, R8.

**Dependencies:** U2.

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TrackingAndAnalyticsSection/TrackingAndAnalyticsSection.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TrackingAndAnalyticsSection/TrackingAndAnalyticsSection.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/TrackingAndAnalyticsSection/index.ts`
- Modify: `libs/locales/en/apps-journeys-admin.json`

**Approach:**

- Opening paragraph: `Track more than just views and responses. To track specific button clicks, video views, or card visits, you must tag those elements as "trackable."`.
- `<Box component="ol">` with 2 items:
  - `Select blocks or cards you want to track`
  - Item 2 with inline icon: render step text as `<Trans>` with an icon slot, producing `Choose an event in <icon /> <strong>Tracking</strong>`. The icon is the existing analytics/tracking icon used in the editor's right-rail "Tracking" tab. **Use `@core/shared/ui/icons/Data01` if present; otherwise import MUI's `EqualizerIcon` (which renders as the analytics bars Figma shows).** Verify the icon source during implementation.
- 333×227px screenshot at `/assets/template-info/tracking-button-properties.png`.
- Closing paragraph: `After your shared projects generate activity, you will be able to see the statistics for your selected events in a detailed table.`.
- 333×203px screenshot at `/assets/template-info/tracking-analytics-table.png`.

**Test scenarios:**

- Happy path: renders opening + closing paragraphs and both screenshots.
- Happy path: step 2 renders an inline icon followed by the bolded word "Tracking".
- Edge case: image paths match the Asset Inventory.

**Verification:**

- Section renders inside the panel story matching Figma `39657-66677`.

---

- U6. **Implement `SharingAndPublishingSection` (Figma `39657-66751`)**

**Goal:** Render Section 4: four paragraphs + the publish/use-in-team GIF.

**Requirements:** R3, R4, R6, R8.

**Dependencies:** U2.

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/SharingAndPublishingSection/SharingAndPublishingSection.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/SharingAndPublishingSection/SharingAndPublishingSection.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/SharingAndPublishingSection/index.ts`
- Modify: `libs/locales/en/apps-journeys-admin.json`

**Approach:**

- `<Stack gap={1}>` of 4 paragraphs:
  - `When your template is ready (you set trackable and customizable items) you can publish it.`
  - `Select **Publish** in three dots menu to get a link to share. Anyone with the link can use your project as template, and you can track its impact.` _(corrected from Figma typo "there dots menu")_
  - `You can add as many templates as you want!`
  - `You also can use your template with any team you have access to. No publishing needed in this case. Select **Use in a team** in three dots menu.` _(corrected)_
- Use `<Trans>` for the two paragraphs with inline `<strong>` (Publish, Use in a team).
- 333×160px image at `/assets/template-info/publish-and-share-flow.gif`.

**Test scenarios:**

- Happy path: renders four paragraphs and the GIF.
- Happy path: "Publish" and "Use in a team" render as bold.
- Edge case: ensure "three dots menu" (not "there dots menu") is the rendered text.

**Verification:**

- Section renders inside the panel story matching Figma `39657-66751`.

---

- U7. **Implement `EmbeddingCanvaOrGoogleSlidesSection` (no Figma; copy from Linear comment `9277fdef-…`)**

**Goal:** Render Section 5: 3 sub-blocks (Canva, Google Slides, Troubleshooting) using the verbatim copy from Siyang's 2026-05-11 ticket comment.

**Requirements:** R3, R4, R6, R8.

**Dependencies:** U2.

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/EmbeddingCanvaOrGoogleSlidesSection/EmbeddingCanvaOrGoogleSlidesSection.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/EmbeddingCanvaOrGoogleSlidesSection/EmbeddingCanvaOrGoogleSlidesSection.spec.tsx`
- Create: `apps/journeys-admin/src/components/TemplateInfoPanel/EmbeddingCanvaOrGoogleSlidesSection/index.ts`
- Modify: `libs/locales/en/apps-journeys-admin.json`

**Approach:**

- Section accordion title: `Embedding Canva or Google Slides`.
- Header copy (inside the accordion body, above the sub-blocks): `Two places in the admin accept an embed URL: **Template Settings → Strategy** (case study preview) and **New Collection → Add PDF/Video with instructions**. Only **Canva** and **Google Slides** links can render. The link must be the canonical view URL, not a share-shortened URL.` (Bold markers via `<Trans>`; "canonical view URL" italic via `<em>`.)
- **Sub-section 5a — Canva**:
  - Bold sub-heading `Canva`.
  - 6 numbered steps. Step 2 includes a code sample URL; step 3 has inline bold "Change `/edit` to `/view`" with `<code>` for the path tokens; step 5 has the example final URL as a `<Box component="pre">` block.
  - MUI `<Alert severity="warning" variant="outlined" icon={...}>` callout: `**Don't use Canva short links** (canva.link/…). They redirect to /edit URLs and drop our embed parameter through the redirect — the preview shows "refused to connect."`. Use `<Trans>` for the bolded fragment and inline `<code>` for `canva.link/…`.
  - Optional GIF placeholder (`<Box>` with text "Canva canonical URL flow"): only rendered if asset #8 from the inventory exists. Plan default: render the placeholder text; replace with `<img>` when the asset lands.
- **Sub-section 5b — Google Slides**:
  - Bold sub-heading `Google Slides`.
  - 4 numbered steps. Step 2 has inline emphasis on `File → Share → Publish to web → Embed`. Step 3 has the example URL in a `<Box component="pre">` block: `https://docs.google.com/presentation/d/e/2PACX-1vS…/pub?start=false&loop=false&delayms=3000`.
  - Trailing paragraph in parens: `(File → Share → "Copy link" gives a different URL that can't embed — make sure you use **Publish to web**.)`.
  - Optional GIF placeholder for asset #9.
- **Sub-section 5c — Troubleshooting**:
  - Bold sub-heading `Troubleshooting`.
  - Intro: `If the preview shows "refused to connect":`.
  - `<Box component="ul">` with 3 items:
    - `Confirm the Canva design is publicly shareable (Share → "Anyone with the link can view").`
    - `Confirm the URL ends in /view for Canva, or /pub?… for Google Slides — not /edit or short links.`
    - `Strip any ?utm_content=… or other query params after /view.`

**Test scenarios:**

- Happy path: renders 3 sub-blocks (Canva, Google Slides, Troubleshooting).
- Happy path: example URL code blocks render verbatim including the ellipsis characters.
- Happy path: the orange warning callout renders with the "Don't use Canva short links" text.
- Happy path: bold inline emphases ("Publish to web", "Don't use Canva short links", etc.) render.
- Edge case: when assets #8 / #9 are absent, the GIF placeholders render as text-only boxes (no broken images).

**Verification:**

- Visual story matches the comment's prose.

---

- U8. **Mount `TemplateInfoPanel` in `JourneyList.tsx` + extend templates-tab width narrowing + mobile trigger + bottom `SwipeableDrawer`**

**Goal:** Render the panel as a static right-side column on `md+` (narrowing the templates grid). On `xs`/`sm`, render a mobile trigger button instead; opening it shows the panel content inside a swipeable bottom drawer.

**Requirements:** R1, R6, R9, R10.

**Dependencies:** U1, U2, U3, U4, U5, U6, U7.

**Files:**

- Modify: `apps/journeys-admin/src/components/JourneyList/JourneyList.tsx`
- Modify: `apps/journeys-admin/src/components/JourneyList/JourneyListView/JourneyListView.tsx` (add a mobile-only "Info" trigger button to the toolbar row — confirm exact placement during implementation; the existing toolbar is where Active / Sort-By pills live).
- Test: `apps/journeys-admin/src/components/JourneyList/JourneyList.spec.tsx`

**Approach:**

**Desktop (`md+`):**

- Import `TemplateInfoPanel`. Render `{showTemplateInfoPanel && <Box sx={{ display: { xs: 'none', md: 'block' }, ... }}><TemplateInfoPanel /></Box>` beside the templates grid.
- Constant: `const TEMPLATE_INFO_PANEL_WIDTH = 375` at top of `JourneyList.tsx`.
- Extend the width `calc(...)` on the main wrapper `Box`:
  - Today: `md: sidePanelVisible ? calc(100vw - sidePanel.width - navbar.width - 80px) : calc(100vw - navbar.width - 80px)`.
  - New: when `showTemplateInfoPanel` is true AND viewport is `md+`, `md: calc(100vw - TEMPLATE_INFO_PANEL_WIDTH - navbar.width - 80px)`.
- Positioning: `<Box sx={{ display: { xs: 'none', md: 'block' }, position: 'fixed', right: 40, top: <header offset tuned in dev>, width: TEMPLATE_INFO_PANEL_WIDTH }}>`. Implementer can pivot to a flex parent if positioning is awkward.

**Mobile (`xs`/`sm`):**

- Hidden by default — desktop column does NOT render (`display: { xs: 'none', md: 'block' }`).
- Add a mobile-only trigger button in `JourneyListView.tsx`'s toolbar row (the row that holds Active / Sort-By pills). Render only when `showTemplateInfoPanel` is true AND viewport is `xs`/`sm`. Use a MUI `IconButton` with `<InfoOutlinedIcon />` (matching the editor's info-button pattern from Figma `39631-61135`) and `aria-label={t('templateInfoPanel.mobile.openButtonLabel')}` = `Open template info`.
- Trigger state lives in `JourneyList.tsx` as `const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)`. Pass `onOpenInfoPanel` callback down to `JourneyListView` (optional prop; only forwarded when `showTemplateInfoPanel` is true and on xs/sm).
- Render `<SwipeableDrawer anchor="bottom" open={mobileDrawerOpen} onOpen={() => setMobileDrawerOpen(true)} onClose={() => setMobileDrawerOpen(false)} disableSwipeToOpen disableDiscovery sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { maxHeight: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflowY: 'auto' } }}>`.
  - `disableSwipeToOpen` because there's no edge-swipe affordance — the trigger button is the only open path.
  - `disableDiscovery` to avoid the iOS Safari "discovery" peek behaviour.
- Drawer content:
  - A drag-handle pill at the top (visual affordance for swipe-to-dismiss — 4px tall × 32px wide, `#DEDFE0`, centered, with 12px top padding).
  - A header row with an `IconButton` X close button (top-right) so users have a non-swipe close path.
  - Below: the same `<TemplateInfoPanel />` component (R5 keeps it self-contained — no drawer-mode prop needed).
- Auto-height: by default, MUI `SwipeableDrawer` paper grows to its content; the `maxHeight: 80vh` cap prevents overflow. Children scroll inside `overflowY: 'auto'`.

**Test scenarios:**

- Happy path (desktop, `md+`): flag on + templates tab + collections on → panel renders as a right column, main `Box` width includes the narrowing `calc`. No mobile trigger button rendered.
- Happy path (mobile, `xs`/`sm`): flag on + templates tab + collections on → no desktop column. Mobile trigger button visible in the toolbar. Clicking it opens the `SwipeableDrawer`; panel content visible; can close via X or swipe down.
- Edge case: flag off → no desktop column, no mobile trigger, no `SwipeableDrawer` in DOM.
- Edge case: flag on but journeys tab → no desktop column, no mobile trigger.
- Edge case: drawer open while user navigates from templates → journeys → drawer auto-closes (cleanup via effect when `currentContentType` changes).
- Edge case: rapidly toggling the trigger button → drawer state stays consistent (no double-open).
- Integration: panel renders alongside `TemplateGalleryPageList` without overlap on `md+`; on mobile, the drawer overlays the grid.
- Accessibility: trigger button has `aria-label`; drawer paper has `role="dialog"` and `aria-labelledby` pointing at the drawer header text.

**Verification:**

- Visual check at viewports 1280, 1440, 1920, 768 (sm), 375 (xs).
- Swipe down on the drawer dismisses it on a touch device (verify via dev tools touch emulation).
- `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/JourneyList/JourneyList.spec.tsx'` passes.

---

- U9. **i18n entries + Storybook story matrix**

**Goal:** Land all `templateInfoPanel.*` translation keys in `apps-journeys-admin.json`, build a story matrix covering each expanded state and the all-collapsed state.

**Requirements:** R4, R8.

**Dependencies:** U2–U7.

**Files:**

- Modify: `libs/locales/en/apps-journeys-admin.json`
- Verify (not modify) existing translation pipeline for other locales — non-English files inherit English by fallback per `next-i18next` config; per-language translation is a follow-up task.

**Approach:**

- All copy lives under one nested key: `templateInfoPanel.header.title`, `templateInfoPanel.header.body`, `templateInfoPanel.section.<sectionId>.title`, `templateInfoPanel.section.<sectionId>.<sub-key>`, etc. Nested keys keep the JSON readable; `next-i18next` supports dotted paths.
- Storybook story matrix: `AllCollapsed` (matches Figma `39653-66422`), `TemplateTypesExpanded` (`39657-66822`), `HowToCreateExpanded` (`39653-66495`), `TrackingAndAnalyticsExpanded` (`39657-66677`), `SharingAndPublishingExpanded` (`39657-66751`), `EmbeddingCanvaOrGoogleSlidesExpanded`, `FlagOff` (sanity), `Mobile` (viewport at 375px).

**Test scenarios:**

- Test expectation: i18n keys exist (covered indirectly by U3–U7 specs that render `t()` and assert visible strings).
- Test expectation: stories build without error.

**Verification:**

- `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/TemplateInfoPanel'` passes.
- Local dev server returns 200 for all asset paths listed in Asset Inventory items 1–7.

---

## System-Wide Impact

- **Interaction graph:** `JourneyList` mounts `TemplateInfoPanel` as a sibling of `JourneyListView`. The panel has no callbacks, no Apollo subscriptions, no `JourneyProvider` consumption. `TemplateGalleryPageList`, `JourneyCard`, `JourneyCardMenu` are unchanged.
- **Error propagation:** None — the panel makes no network calls. Asset 404s surface as broken-image icons; not blocking.
- **State lifecycle risks:** None — single `useState` for accordion expand, no async, no race conditions.
- **API surface parity:** No GraphQL changes.
- **Integration coverage:** U8's `JourneyList.spec.tsx` cases cover the mount/unmount cross-cutting paths.
- **Unchanged invariants:**
  - Existing `usePageWrapperStyles()` return values unchanged.
  - Existing journeys-tab side panel chrome and width unchanged.
  - `LocalTemplateDetailsDialog`, `TemplateSettingsDialog`, `JourneyDetailsDialog`, all template mutations unchanged.
  - `teamTemplateCollection` LD flag scope unchanged.

---

## Risks & Dependencies

| Risk                                                                                                                                                                                                 | Mitigation                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The seven required image/GIF assets are not yet produced; merging without them ships a panel with broken images                                                                                      | Asset Inventory listed in plan with exact paths and dimensions. Plan blocks merge on asset availability or asks Siyang for placeholders.                                                        |
| LaunchDarkly flag `templateInfoSidePanel` must be created in the LD dashboard before this PR is useful                                                                                               | Documented in U1 and in the ticket. Acceptable: merging dark and enabling later is the intent.                                                                                                  |
| Mobile behaviour not in Figma — stacking below the grid may degrade UX on small screens with long-form content                                                                                       | Open Question 2 (R9). Default stack, with `maxHeight` if needed during dev.                                                                                                                     |
| NES-1642 will consume `TemplateInfoPanel` later; today's component shape might miss a constraint NES-1642 needs                                                                                      | Component is designed with zero side effects, only presentational props, no admin-context coupling (R5). NES-1642's PR owns its mount-point translation.                                        |
| GIF assets may be large; loading on every templates-tab render could slow page load                                                                                                                  | All `<img>` use `loading="lazy"`; only the expanded section's images are needed eagerly. Single-expand UX means at most one section's media is visible at a time, naturally throttling network. |
| Tracking icon (U5 step 2) — the exact icon used in the editor's right-rail Tracking tab needs to be located in `@core/shared/ui/icons/`                                                              | U5 verifies during implementation; falls back to MUI `EqualizerIcon` if not found. Low risk.                                                                                                    |
| Figma `39653-66495` shows the "If you want to have Quick-Start template" callout AFTER the make-template GIF; the ticket body lists it before the Links/Images/Video sub-section. Plan follows Figma | Documented in U4 approach.                                                                                                                                                                      |

---

## Documentation / Operational Notes

- **LaunchDarkly action (Siyang):** create the `templateInfoSidePanel` flag in the LD dashboard. Default: off. Rollout: enable for the team account first, then broader rollout per the team's normal flag-management process.
- No env vars, no migrations, no new GraphQL operations.
- After merge, a follow-up may consider whether the "static educational panel with feature-flag gating" pattern belongs in `docs/solutions/`.

---

## Sources & References

- **Linear ticket:** [`NES-1538 — Add template info side panel to local template tab`](https://linear.app/jesus-film-project/issue/NES-1538/add-template-info-side-panel-to-local-template-tab) (verified via Linear MCP; status: In Progress, started 2026-05-14, due 2026-05-15, S/2 estimate)
- **Linear comment (Section 5 spec):** Siyang Cao, comment `9277fdef-0200-44e4-b48c-0bfe37c0de0f`, 2026-05-11 — "Proposed Accordion Section 5: Embedding Canva or Google Slides"
- **Figma file:** `q86gwEsOR2IQvenrhDizmP` (`💡 NS - Editor (WIP)`)
  - Layout reference: frame `39640-65061`
  - Section frames (Siyang's canonical 5): `39653-66422` (all collapsed), `39657-66822` (Template Types), `39653-66495` (How to create), `39657-66677` (Tracking and Analytics), `39657-66751` (Sharing and Publishing)
  - Older context-only frames: `39631-61135` (entry points — relevant to NES-1642), `39662-67865` (legacy "how it looks")
- **Code anchors:**
  - `apps/journeys-admin/src/components/JourneyList/JourneyList.tsx`
  - `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`
  - `apps/journeys-admin/src/components/PageWrapper/utils/usePageWrapperStyles/usePageWrapperStyles.ts`
  - `libs/shared/ui/src/components/FlagsProvider/FlagsProvider.tsx`
  - `libs/locales/en/apps-journeys-admin.json`
  - `apps/journeys-admin/public/`
- **Related tickets (read-only context):** NES-1539 (Team Templates tab foundation), NES-1543 (template-dialog consolidation), NES-1547 (gallery API), NES-1548 (gallery group menu), NES-1549 (TEMPLATE badge), NES-1607 (LTL roadmap), NES-1642 (editor floating helper — follow-up reuse), NES-1649 (PDF/Video embed "refused to connect" — motivation for Section 5).
- **Institutional learnings checked:**
  - `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` (Team Templates tab structure)
  - `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` (checked; **not applicable** — no form, no mutation, no provider bridging in this plan)
