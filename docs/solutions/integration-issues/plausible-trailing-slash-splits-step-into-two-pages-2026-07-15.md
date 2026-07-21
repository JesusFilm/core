---
title: 'Plausible split one journey step into two pages by a trailing slash; the admin dropped the extra page'
category: integration-issues
date: '2026-07-15'
module: 'libs/journeys/ui, apps/journeys-admin'
problem_type: integration_issue
component: 'Step pageview emitter, useJourneyAnalyticsQuery transform'
symptoms:
  - 'journeys-admin analytics showed ~7k visitors for a journey while the Plausible dashboard showed ~99k'
  - 'Plausible Top Pages listed the same step as two pages differing only by a trailing slash (/journeyId/blockId vs /journeyId/blockId/)'
  - 'Per-step visitor numbers in the editor analytics overlay looked far too low or effectively missing, even though the step block exists and is not deleted'
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plausible
  - analytics
  - trailing-slash
  - url-normalization
  - query-string
  - step-analytics
  - data-loss
---

# Plausible split one journey step into two pages by a trailing slash; the admin dropped the extra page

## Problem

A single journey step was being recorded by Plausible as **two different pages** whose paths differed only by a trailing slash. journeys-admin then counted only one of the two pages, so per-step analytics were massively undercounted (a journey with ~99k real visitors displayed ~7k). Two bugs compounded: our client emitted an inconsistent page URL, and our own transform silently discarded the variant it couldn't match.

## Symptoms

- journeys-admin analytics showed ~7k visitors while Plausible showed ~99k for the same journey.
- Plausible **Top Pages** listed the entry step twice: `/{journeyId}/{blockId}` and `/{journeyId}/{blockId}/`.
- The step block existed in the DB (`parentOrder` 0, `deletedAt` null, valid child card), yet its overlay number was tiny or appeared absent.

## What Didn't Work

- **"The block must be deleted / missing from the journey."** The first hypothesis was that traffic hit a step that no longer existed. A DB query proved the step block was present, `parentOrder` 0 (the entry step), not soft-deleted, with a healthy child CardBlock. The data was fine — the bug was in URL construction and matching, not the journey structure.
- **Blaming the Plausible breakdown row cap.** The per-journey breakdown is unpaginated (Plausible's default 100 rows), which looked like a possible undercount source. It was a red herring here: the Plausible queries pull all-time correctly, and the row cap only bites journeys with >100 steps/event-keys.
- **Suspecting the `totalVisitors` tile.** The headline tile reads Plausible's site-wide aggregate and was already correct. Only the **per-step** numbers were wrong, which pointed at the page-path matching, not the aggregate.

## Solution

Two changes — one at the source, one at the consumer.

**1. Source — stop emitting the trailing slash.** In `libs/journeys/ui/src/components/Step/Step.tsx`, the query string was appended with a leading slash, so a visitor arriving with a query string produced `.../{blockId}/?utm=...`:

```ts
// Before — leading slash turns into a trailing-slash pathname after Plausible strips the query
const search = window.location.search === '' || window.location.search == null ? '' : `/${window.location.search}`
// u = `${origin}/${journeyId}/${blockId}${search}`  →  .../{blockId}/?utm=...  →  page /{journeyId}/{blockId}/

// After — append directly; no trailing slash
const search = window.location.search === '' || window.location.search == null ? '' : window.location.search
// u = .../{blockId}?utm=...  →  page /{journeyId}/{blockId}
```

**2. Consumer — normalize and merge the two variants.** In `transformJourneyAnalytics.ts`, `getStepId` stripped only the `/{journeyId}/` prefix, so `"{blockId}/"` never `===` the real block id and its row was dropped:

```ts
// getStepId — also drop a trailing slash so both page variants collapse onto one id
return property.replace(`/${journeyId}/`, '').replace(/\/$/, '')
```

Because months of history are already stored under both paths, the two rows per step are merged rather than picking one: visitors and exits summed, `timeOnPage` combined as a visitor-weighted mean (with a `totalVisitors === 0 ? 0` divide-by-zero guard). `getStepExits` was likewise changed to sum by normalized id so exit lookups resolve regardless of which slash variant recorded the exit.

## Why This Works

- Plausible strips the query string from `event:page`, so the _only_ thing that distinguished the two pages was the trailing slash our own code introduced. Removing the leading slash makes the pageview path match every other event emitter (Button, RadioQuestion, VideoEvents, SignUp, ChatButtons, Card all already emit the bare `/{journeyId}/{stepId}`), so **new** data lands in a single bucket.
- Normalizing the trailing slash in `getStepId` reunites the historical split so old reporting windows count both buckets.

**Known limitation (partially resolved by PR #9398):** summing the two variants is a _best-effort_ reconciliation of historical data, not an exact figure. The `event:page` visitor metric also counts custom events, and a visitor whose pageview landed on the slash page but who also fired a non-pageview event (recorded on the slash-free page) is counted in both buckets, so summing **over-counted** historical visitors — observed at roughly 30–50% on journeys with heavy query-string (social/UTM) traffic, since every such visitor who clicked anything appeared in both buckets. The true unique-visitor union cannot be recovered from two separate `event:page` aggregate counts.

PR [#9398](https://github.com/JesusFilm/core/pull/9398) resolved this for the **visitors** field without a server-side query: the transform now overrides each step's visitor count with the pageview uniques keyed by `event:props:simpleKey` (already fetched via `journeyActionsSums`), which are pathname-independent, so Plausible deduplicates them across the split; the summed `event:page` figure remains only as a fallback when no keyed pageview row exists (pre-key historical data). **Still subject to the original caveat:** `timeOnPage` (visitor-weighted mean over the summed `event:page` rows — Plausible exposes the metric nowhere else) and `visitorsExitAtStep` (`visit:exit_page` uniques summed across both variants). The exit count is capped at the step's reported visitor count — on both the override and fallback paths — so the exit rate cannot render above 100%.

## Prevention

- **Build analytics page paths from IDs only; never fold `window.location.search` (or any raw URL fragment) into the path segment.** Query strings belong after `?`, appended verbatim — a stray `/` before them silently forks one logical page into two in Plausible.
- **Keep every event emitter's `u` path construction identical.** The pageview path drifted from the click/nav paths by one slash; a shared helper for the synthetic `/{journeyId}/{stepId}` path would have prevented it. When touching one emitter, grep the others (`grep -rn "u: \`" libs/journeys/ui/src`) and confirm they still agree.
- **When mapping a Plausible page property back to an entity id, normalize before matching** (trim trailing slash) and treat an unmatched row as a signal, not silent zero. Exact-string `.find()` on an un-normalized property will drop data without erroring.
- **Regression tests added:** a running Step test asserts the pageview URL appends the query string with no trailing slash (`expect(u).not.toContain('Step1/?')`); transform tests cover merging both slash variants, the zero-visitor / both-zero weighting branches, cross-variant exit matching, and order-independence of the weighted mean. PR #9398 added coverage for the pageview-key visitor override (including the zero-visitors-is-authoritative case), the summed-visitors fallback when no keyed row exists, per-step override/fallback independence, and the exit-count cap on both paths (triggering and no-op cases).

## Related Issues

- PR [#9370](https://github.com/JesusFilm/core/pull/9370) — the fix and its review hardening.
- PR [#9398](https://github.com/JesusFilm/core/pull/9398) — follow-up: card visitor counts switched to pathname-independent `event:props:simpleKey` pageview uniques, resolving the historical over-count for the visitors field (verified against Plausible CE v2.1.1 source: `event:page` visitors is `uniq(user_id)` over all events on a pathname, custom events included).
- `docs/solutions/integration-issues/plausible-default-30-day-window-when-period-omitted.md` — another Plausible-integration bug that also manifested as journeys-admin analytics disagreeing across surfaces / shrinking over time.
- `docs/solutions/logic-errors/plausible-analytics-event-name-mismatch-qa359.md` — related class of bug: a Plausible key/name mismatch causing analytics to under-report.
