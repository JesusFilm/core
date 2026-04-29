---
date: 2026-04-29
topic: signal-usage-analytics
linear: NES-1613
---

# Signal — Internal Usage Analytics

## Problem Frame

The team has no way to answer basic product questions like "how many people clicked Create Journey", "is the Strategy overlay actually used", or "which AI translation languages get picked". Without this signal, decisions about what to invest in, polish, or retire are guesses. Plausible covers end-user journey traffic, but nothing covers admin-app interactions today.

Audience for v1 is internal (engineering + product). Stakeholder-facing dashboards may follow but are explicitly out of scope here.

## Requirements

- **R1.** Capture discrete user-interaction events from `journeys-admin` (and, by design, any other admin app later) and persist them in a queryable store owned by `api-analytics`.
- **R2.** Each event records: `id`, `createdAt`, `eventType` (typed), `userHash` (daily-salted), and a free-form `description` JSON for per-event extras (e.g. `{ templateId, source, journeyId, language }`).
- **R3.** `eventType` is a TypeScript enum/union shared between admin web apps and `api-analytics`. Adding a new event requires a code change + PR. No free-form event names.
- **R4.** Expose a GraphQL query on `api-analytics` that lists events with **filtering** (by `eventType`, date range, optional `description` JSON keys) and **pagination** (cursor-based) from day one.
- **R5.** Attribution uses a Plausible-style daily-salted hash: `hash(daily_salt + domain + ip + user_agent)`. Raw `userId` is never persisted. Distinct-user counts are accurate within a day; cross-day re-identification is intentionally impossible.
- **R6.** Internal/E2E users are excluded **client-side**: admin apps check the logged-in user against a Doppler-managed list and skip the tracking call entirely.
- **R7.** v1 ships tracking for the following events:
  - `journey_create_clicked` — primary "Create Journey" button in `journeys-admin`
  - `journey_create_from_template` — creating a journey via the template route
  - `editor_overlay_opened` — with `description.overlay` ∈ { `analytics`, `strategy`, `helpscout`, `social_media_preview` }
  - `ai_translation_language_picked` — with `description.language`
- **R8.** Tracking failures must not break the user-facing flow. Fire-and-forget; swallow errors after logging to Datadog.

## Success Criteria

- A single SQL/GraphQL query returns event counts per `eventType` for any date range.
- For each v1 event in R7, the team can answer "how many distinct users triggered this in the last 30 days" and "how many total fires".
- Adding a new event end-to-end (admin click → enum entry → server insert → query) takes less than half a day for a familiar engineer.
- Zero raw user identifiers persisted; verified by inspecting the events table schema.

## Scope Boundaries

- **Out of scope:** stakeholder-facing dashboards, charts, or UI on top of the events store.
- **Out of scope:** non-admin apps (`watch`, `journeys`, `arclight`). Event capture there can be added later but isn't part of v1.
- **Out of scope:** retroactive backfill of past usage.
- **Out of scope:** funnel/cohort analysis tooling — Metabase or ad-hoc queries are sufficient for v1.
- **Out of scope:** session replay, error tracking, performance monitoring (Datadog already covers these).

## Key Decisions

- **Storage: own table in `api-analytics`, not Plausible custom events.** *Rationale:* Plausible's API is weak at multi-prop filtering and pagination, both v1 requirements. The analytics DB and Prisma scaffold already exist.
- **Attribution: daily-salted hash only.** *Rationale:* Resolves Jaco/Siyang PII tension, mirrors Plausible's privacy model, and per Anthropic-standard EU/NZ guidance probably exempts us from a T&Cs change. Documented; no T&Cs update planned for v1.
- **Taxonomy: TS enum + JSON description blob.** *Rationale:* Strict event names prevent typos and make queries predictable; JSON blob keeps adding context cheap. Matches Siyang's proposal.
- **Internal-user exclusion: client-side skip.** *Rationale:* Server can't filter on a hash, so the only place the check works is before the call fires. Doppler env var keeps the list maintainable.
- **No T&Cs / privacy update for v1.** *Rationale:* Hashed-only data is treated as non-PII. Re-evaluate if v2 introduces raw user identifiers or stakeholder-facing surfaces.

## Dependencies / Assumptions

- `api-analytics` already has a Prisma datasource we can extend with a new `Event` model (verify in planning).
- Daily salt rotation is a solved pattern (cron / scheduled job in `api-analytics`) — confirm during planning.
- Doppler is already used for env-var management across admin apps.

## Outstanding Questions

### Resolve Before Planning

*(none — all blocking product decisions resolved)*

### Deferred to Planning

- [Affects R7][Needs research] Confirm whether admin UI language tracking already exists somewhere (Ken mentioned at all-staff). If it does, drop or redirect the AI-translation-language tracking accordingly.
- [Affects R5][Technical] Where the daily salt is stored and rotated — Redis with TTL, a `Salt` Prisma table, or in-process cache. Plausible's reference implementation rotates daily.
- [Affects R4][Technical] Auth model on the GraphQL query — admin-only? Specific role? Reuse `api-analytics` existing auth (`apis/api-analytics/src/lib/auth/auth.ts`).
- [Affects R6][Technical] Mechanism of the client-side exclusion list — Doppler env var read at build time vs. runtime, format (emails vs. user IDs).
- [Affects R8][Technical] Should writes be batched/debounced client-side, or one HTTP call per event? Volume estimate needed.

## Next Steps

→ `/ce:plan` for structured implementation planning
