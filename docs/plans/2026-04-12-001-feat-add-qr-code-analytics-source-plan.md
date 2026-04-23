---
title: 'feat: Add QR Code as analytics overlay source'
type: feat
status: active
date: 2026-04-12
---

# feat: Add QR Code as analytics overlay source

## Overview

Add QR code as a recognized traffic source in the journey analytics overlay. QR code scan data is already tracked and queried via `journeyUtmCampaign` but is not displayed alongside other referrer sources like Facebook and Direct / None.

## Problem Frame

When users view the analytics overlay on a journey, they see traffic sources (Facebook, Direct / None, etc.) as referrer nodes connected to the Social Preview card. QR code traffic is tracked separately via `utm_source=ns-qr-code` and the data is already fetched by the GraphQL query (`journeyUtmCampaign`), but it is never passed to the referrer transformation pipeline. Users cannot see how many visitors came from QR code scans.

## Requirements Trace

- R1. QR code scan traffic appears as a "QR Code" source node in the analytics overlay
- R2. Multiple QR code campaigns are aggregated into a single "QR Code" entry with summed visitor count
- R3. The QR Code source displays a recognizable QR code icon
- R4. QR Code participates in the existing referrer sorting/collapsing logic (top 2 shown, rest collapsed into "other sources" when 3+ referrers)

## Scope Boundaries

- No changes to the GraphQL query — `journeyUtmCampaign` data is already fetched
- No changes to the QR code generation or URL tracking (`utm_source=ns-qr-code`)
- No backend changes required
- No changes to `transformReferrers` logic — it already handles any referrer array generically

## Context & Research

### Relevant Code and Patterns

- `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformJourneyAnalytics/transformJourneyAnalytics.ts` — orchestrates analytics data transformation; line 107 only passes `journeyReferrer` to `transformReferrers()`
- `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformReferrers/transformReferrers.ts` — generic referrer-to-node transformer, no changes needed
- `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/nodes/ReferrerNode/BaseReferrer/BaseReferrer.tsx` — icon switch for referrer display
- `libs/shared/ui/src/components/icons/FacebookIcon.tsx` — pattern for custom SVG icons using MUI `SvgIcon`
- Icons are imported individually via `@core/shared/ui/icons/<IconName>` path alias

### Institutional Learnings

- `docs/solutions/runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md` — referrer nodes in analytics overlay had re-render issues; the current fix is stable

## Key Technical Decisions

- **Aggregate QR campaigns into one entry**: Multiple `journeyUtmCampaign` entries (one per short link) are summed into a single referrer with `property: 'QR Code'`. This matches the UX intent — users want to see total QR traffic, not per-link breakdown, in the overlay.
- **Merge before transform**: The aggregated QR Code entry is appended to the `journeyReferrer` array before passing to `transformReferrers()`. This lets the existing sorting/collapsing logic handle it naturally without modifying `transformReferrers`.
- **Custom SVG icon**: Create a QR code icon in the shared UI library following the `FacebookIcon.tsx` pattern (MUI `SvgIcon` wrapper), rather than adding `@mui/icons-material` as a dependency.

## Open Questions

### Resolved During Planning

- **Where to aggregate QR data?** In `transformJourneyAnalytics.ts` before calling `transformReferrers()`. This keeps the transform pipeline clean.
- **What label for the QR source?** "QR Code" — consistent with the QR Code dialog naming in the share toolbar.

### Deferred to Implementation

- **Exact SVG path data for QR icon**: Will be determined during implementation using a standard QR code icon design.

## Implementation Units

- [x] **Unit 1: Create QR Code icon**

**Goal:** Add a QR code icon to the shared UI icon library

**Requirements:** R3

**Dependencies:** None

**Files:**

- Create: `libs/shared/ui/src/components/icons/QrCode2.tsx`

**Approach:**

- Follow the `FacebookIcon.tsx` pattern: export a named function component wrapping MUI `SvgIcon`
- Use a standard QR code design (grid pattern with position markers)
- Size to 16x16 viewBox to match `FacebookIcon`

**Patterns to follow:**

- `libs/shared/ui/src/components/icons/FacebookIcon.tsx` — SvgIcon wrapper pattern

**Test expectation:** none — pure presentational SVG icon with no logic

**Verification:**

- Icon file exists and exports a React component
- TypeScript compiles without errors

- [x] **Unit 2: Aggregate QR campaign data into referrers**

**Goal:** Sum `journeyUtmCampaign` entries into a single "QR Code" referrer and merge with `journeyReferrer` before transformation

**Requirements:** R1, R2, R4

**Dependencies:** None

**Files:**

- Modify: `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformJourneyAnalytics/transformJourneyAnalytics.ts`
- Test: `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformJourneyAnalytics/transformJourneyAnalytics.spec.ts`

**Approach:**

- After destructuring `data`, sum all `journeyUtmCampaign` visitors into a single count
- If total QR visitors > 0, create a referrer entry `{ property: 'QR Code', visitors: totalQrVisitors }` and append it to `journeyReferrer` before passing to `transformReferrers()`
- The `__typename` field should match existing referrer entries (`'PlausibleStatsResponse'`)

**Patterns to follow:**

- Existing referrer data shape in mock: `{ __typename: 'PlausibleStatsResponse', property: string, visitors: number }`

**Test scenarios:**

- Happy path: QR campaigns with visitors are aggregated into a single "QR Code" referrer node in the output (existing test data has 3 campaigns totaling 10 visitors — update expected referrers to include QR Code)
- Edge case: Empty `journeyUtmCampaign` array produces no QR Code referrer (verify existing tests with empty arrays still pass)
- Edge case: Single QR campaign entry is still wrapped as "QR Code" referrer

**Verification:**

- `transformJourneyAnalytics` returns referrer nodes that include a "QR Code" entry when `journeyUtmCampaign` has data
- Existing tests still pass with updated expectations
- Tests pass via `npx jest --config libs/journeys/ui/jest.config.ts --no-coverage`

- [x] **Unit 3: Add QR Code icon to BaseReferrer**

**Goal:** Display the QR Code icon when a referrer's property is "QR Code"

**Requirements:** R1, R3

**Dependencies:** Unit 1

**Files:**

- Modify: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/nodes/ReferrerNode/BaseReferrer/BaseReferrer.tsx`
- Test: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/nodes/ReferrerNode/BaseReferrer/BaseReferrer.spec.tsx`

**Approach:**

- Import `QrCode2` icon from `@core/shared/ui/icons/QrCode2`
- Add a `'QR Code'` case to the switch statement, rendering the QR code icon with `iconStyles`

**Patterns to follow:**

- Existing `'Facebook'` case with `FacebookIcon`
- Existing `'Direct / None'` case with `LinkAngled` and `iconStyles`

**Test scenarios:**

- Happy path: Rendering `BaseReferrer` with `property="QR Code"` displays the QR code icon (assert `QrCode2Icon` test ID present)
- Happy path: Visitor count is displayed alongside the icon

**Verification:**

- QR Code referrer renders with correct icon in the analytics overlay
- Tests pass via `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage`

- [x] **Unit 4: Update mock data**

**Goal:** Ensure the shared mock reflects QR Code as a referrer source

**Requirements:** R1

**Dependencies:** Unit 2

**Files:**

- Modify: `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/useJourneyAnalyticsQuery.mock.ts`

**Approach:**

- The mock already includes `journeyUtmCampaign` data. Verify it still works with the updated transformation. No structural changes expected unless downstream Storybook stories need updated mock shapes.

**Test expectation:** none — mock data file, verified through Unit 2 and Unit 3 tests

**Verification:**

- Mock data aligns with the new transformation expectations
- No TypeScript compilation errors

## System-Wide Impact

- **Interaction graph:** The change is contained within the analytics overlay data pipeline. `transformJourneyAnalytics` -> `transformReferrers` -> `ReferrerNode` -> `BaseReferrer`. No callbacks or middleware affected.
- **Error propagation:** If `journeyUtmCampaign` is empty or undefined, the QR Code entry is simply not added — no new failure modes.
- **API surface parity:** No API changes. The GraphQL query already returns the data.
- **Unchanged invariants:** `transformReferrers` logic is not modified — it continues to accept any referrer array and apply its sorting/collapsing rules. The `journeyUtmCampaign` GraphQL query and QR code URL generation are unchanged.

## Risks & Dependencies

| Risk                                                                         | Mitigation                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| QR Code node ID collision if a website referrer is literally named "QR Code" | Extremely unlikely; Plausible referrer properties are domain names, not display labels |

## Sources & References

- Linear ticket: [QA-250](https://linear.app/jesus-film-project/issue/QA-250/add-qr-code-as-one-of-the-sources)
- GitHub issue: [#5431](https://github.com/JesusFilm/core/issues/5431)
- Related fixed blocker: [NES-781](https://linear.app/jesus-film-project/issue/NES-781/analytics-overlay-toggle-on-doesnt-show-the-source-links-anymore)
