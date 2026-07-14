---
title: 'Plausible stats silently use a 30-day window when period/date is omitted'
category: integration-issues
date: '2026-07-02'
module: 'apps/journeys-admin, apis/api-journeys'
problem_type: integration_issue
component: 'journeys-admin analytics components, api-journeys plausible schema'
symptoms:
  - 'Analytics counts (e.g. template card Views) go DOWN over time for a fixed journey'
  - 'Numbers on one analytics surface disagree with another surface for the same journey'
  - 'Stats look correct for recently active journeys but shrink for older ones'
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags:
  - plausible
  - analytics
  - date-range
  - template-card
  - journeys-admin
  - api-journeys
  - all-time
---

# Plausible stats silently use a 30-day window when period/date is omitted

## Problem

Template card analytics (`TemplateAggregateAnalytics`) showed a **declining Views count** over time. Users reported analytics numbers "going down" (QA-536: Decisions for Christ declining Friday → Monday), which should be impossible for an all-time count over immutable event data. The template card query sent an empty filter (`where: {}`), so the Plausible Stats API applied its own default period: **the last 30 days**. As high-traffic days aged out of the rolling window, the displayed number dropped.

## Symptoms

- A count that should be monotonically increasing (all-time visitors) decreases day over day.
- The same journey shows different totals on different analytics surfaces (e.g. template card vs. breakdown dialog).
- No error anywhere: the query succeeds, the resolver succeeds, Plausible returns 200.

## What Didn't Work

- Hunting for Plausible-side data loss (ClickHouse TTL/retention, sampling, salt rotation) or backend subtractive steps. Those were plausible for the _breakdown_ surface but the template card decline had a much simpler cause: the frontend never sent a date range at all.
- Expecting the type system to catch it: `period` and `date` are optional on `PlausibleStatsAggregateFilter`, so `where: {}` compiles and passes GraphQL validation.

## Solution

Always send an explicit all-time range. Every Plausible stats query in journeys-admin must pass `period: 'custom'` with a date range built from the shared `earliestStatsCollected` constant (`'2024-06-01'`, exported from `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/buildPresetDateRange.tsx`).

Before (`TemplateAggregateAnalytics.tsx`):

```ts
void getTemplateStats({
  variables: {
    id: journeyId,
    idType: IdType.databaseId,
    where: {}
  }
})
```

After — both template-stats call sites share one builder, `libs/buildAllTimeStatsFilter` (its own module, NOT exported from the hook lib: ~10 specs mock the hook module with `vi.mock` factories, and adding a new export there crashed every tree that consumed it):

```ts
export function buildAllTimeStatsFilter(): PlausibleStatsAggregateFilter {
  return {
    period: 'custom',
    date: `${earliestStatsCollected},${formatISO(new Date(), {
      representation: 'date'
    })}`
  }
}

// TemplateAggregateAnalytics.tsx and refetchTemplateStats both use:
where: buildAllTimeStatsFilter()
```

The first fix pass changed only the component's initial query and **missed the second call site in the same lib**: `refetchTemplateStats` (run after duplicate/trash/restore/translate/copy-to-team across many components) still sent `where: {}`. Caught in PR review. Beyond re-introducing the 30-day window, the mismatch had a second consequence: Apollo keys `templateFamilyStatsAggregate` by its `where` args, so the refetch wrote a **different cache entry** than the card was reading — making the refetch a silent UI no-op.

Audit of all four analytics surfaces (QA-540, 2026-07-02):

| Surface                           | Component                               | Date range                                |
| --------------------------------- | --------------------------------------- | ----------------------------------------- |
| Journey card analytics            | `AnalyticsItem` (via `JourneyCardInfo`) | ✅ all time (explicit custom range)       |
| Template card analytics           | `TemplateAggregateAnalytics`            | ⚠️ was `where: {}` → fixed in PR #9340    |
| Template breakdown analytics      | `TemplateBreakdownAnalyticsDialog`      | ✅ all time (explicit custom range)       |
| Analytics dialog (editor overlay) | `AnalyticsOverlaySwitch`                | ✅ all time by default (`allTime` preset) |

When updating call sites, remember Apollo `MockedProvider` matches variables **exactly**: update spec mocks to the new `where`, and mock `formatISO` for determinism (see `AnalyticsItem.spec.tsx` for the pattern) or compute the expected date under the suite's faked system time (see `JourneyCard.spec.tsx`).

## Why This Works

The chain has no default on our side: the frontend `where` is spread by the api-journeys resolver (`{ metrics, ...where }`) straight into the Plausible HTTP request params (`getJourneyStatsBreakdown` / `journeysPlausibleStatsAggregate`). When `period`/`date` are absent from the request, [Plausible's Stats API defaults to `30d`](https://plausible.io/docs/stats-api#time-periods) — the GraphQL filter's own doc string says so. Sending `period: 'custom'` with an explicit `earliestStatsCollected..today` range pins the window to all recorded history, so counts can only grow.

## Prevention

- Any new frontend query against `journeysPlausibleStatsAggregate`, `journeysPlausibleStatsBreakdown`, `templateFamilyStatsAggregate`, or `templateFamilyStatsBreakdown` must pass an explicit `period`/`date`. Never send an empty `where` — it compiles, runs, and silently means "last 30 days".
- Build the range from `earliestStatsCollected`, not a hardcoded date, so the floor stays consistent across surfaces. For template stats specifically, reuse `buildAllTimeStatsFilter()` from `libs/buildAllTimeStatsFilter`.
- When changing a query's variables, grep for **every** use of the query document (the `GET_*` constant) — imperative `client.query` refetch call sites are easy to miss, and a `where` mismatch between query and refetch splits the Apollo cache entry, silently breaking the refresh.
- If declining analytics numbers are reported again, check the date range each surface actually sends **first** — it is far cheaper to verify than Plausible-side data-loss theories.
- Frontend-only enforcement was evaluated and deliberately skipped (few call sites): baking the filter into hooks doesn't bind future queries, and lint can't see runtime variable values. If this recurs, the real fix is server-side — make `period`/`date` required on the filter inputs (codegen then makes `where: {}` a frontend compile error) or default omitted filters to all-time in the resolvers.
- `PlausibleEmbedDashboard` (the reports-page iframe) also opens on Plausible's own 30-day UI default; known, unaddressed as of 2026-07-02.

## Related Issues

- Linear QA-536 — [NextSteps] decisions for Christ go down (parent investigation)
- Linear QA-540 — audit of the four analytics surfaces (this fix)
- JesusFilm/core#9340 — fix(journeys-admin): use all-time range for template card analytics
- JesusFilm/core#9339 — capture-goal counting + Plausible breakdown pagination (related QA-536 work)
