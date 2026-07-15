---
area: journeys-admin
domain_ref: ./CONTEXT.md
code_paths:
  - apps/journeys-admin/src/components/Editor/**
  - apps/journeys-admin/src/components/JourneyList/**
  - apps/journeys-admin/src/components/TemplateCustomization/**
trigger_phrases:
  - "block won't save"
  - "changes not showing in preview"
  - "have to refresh to see it"
  - "can't translate into <language>"
  - "template won't let me customize"
  - "transfer ownership"
  - "analytics numbers are wrong"
  - "historical data disappeared"
type_tags: [T1, T2, T3, T4, T5, T8, T11]
updated: 2026-07-15
---

> Diagnosis layer for reported bugs in journeys-admin. Read this when triaging or debugging a
> reported issue — not for feature work. Domain model: ./CONTEXT.md.
> Failure types (T1–T11) reference the shared taxonomy in the repo-root AGENTS.md.
> Each entry: what it looks like → the question that localizes it (reporter can answer) →
> where the fixer looks first → whether it is safe for an autonomous agent.

## Saving / preview / cache — T4 (cache) · T5 (optimistic drift)
**Signatures:** a block edit doesn't save (most visible on typography, image, video blocks); an
edit shows in the Editor but not on the journey preview; a newly-created block needs a refresh.
**Localizing question (reporter): does a refresh fix it?**
- refresh fixes it → cache bug (the manual Apollo cache update on block-create was wrong)
- refresh doesn't fix it, the change is gone → it genuinely didn't save
- saved, correct in the Editor, wrong only in preview → rendering bug, not here — see
  `apps/journeys/CONTEXT-intake.md`
**Look first (fixer):** Network tab → the block create/update mutation (did it fire? payload
correct? error code?); if it fired cleanly but the UI is stale → the manual cache `update` in
`Editor/utils/useBlockCreateCommand` and `Editor/utils/blockCreateUpdate`.
**Handoff:** agent-able.

## Data semantics / historical data disappearing — T1
**Status:** quiet lately, but a latent structural risk — kept here *because* it is rare enough to
forget. Any future migration can reintroduce it.
**Signatures:** "all my historical X is gone, recent ones are fine," a list silently drops older
rows — usually shortly after a schema change / migration.
**Localizing question (reporter):** is it *all* the old data and only the old data (recent fine)?
That "all-historical-vs-recent-fine" split is the tell.
**Look first (fixer):** the recent migration + the query filter on the affected list. Classic cause:
a new column is `NULL` on existing rows but the query filters `column = false/true`, and `NULL`
matches neither in SQL, so old rows vanish.
**Handoff:** agent-able (real backend defect when it occurs).

## Analytics correctness — T3
**Status:** known-fuzzy. Stats are **never** live/real-time; some mismatch is expected. Events get
"squished/unsquished" over a time window (aggregation behavior). Not every discrepancy is a bug.
**Signatures:** numbers don't add up (many arrive but few reach the first card; "this many clicked
the button, why don't that many show on the next card?"), drop-off rate looks off, card-duration
looks off.
**Localizing question (reporter):** which surface (summary vs card analytics), what did you expect
it to count (raw events vs unique users), and — for template families — "are you 100% sure this is
the only journey from that template?" (aggregate-vs-child mix-ups are common).
**Heuristic:** an analytics discrepancy is almost always a **name/unit mismatch, not bad math.**
**Look first (fixer):** drop-off % and time-on-card are computed **client-side** in
`libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformJourneyAnalytics/transformJourneyAnalytics.ts`
(these are the numbers shown in reports); the underlying Plausible aggregates come from
`apis/api-journeys/src/schema/plausible/journeysPlausibleStatsAggregate.query.ts` + `plausible/service.ts`;
the event-sync worker is `apis/api-journeys/src/workers/plausible/service.ts`.
**Handoff:** route to a human — not safe for autonomous fixing.

## Translation & language lists — T8 (largest historical cluster)
**Signatures:** "can't translate into X"; text not translated, or translated incorrectly.
**Disambiguate FIRST — there are four different language lists (constantly conflated):**
- builder = the full language library (`libs/journeys/ui/src/libs/useLanguagesQuery`, `limit: 5000`,
  narrowed per screen by a `where` filter)
- AI-translation = the hardcoded allowlist `SUPPORTED_LANGUAGE_IDS` (currently 58) in
  `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/supportedLanguages.ts`
- website / UI strings = Crowdin
- template-gallery filter = the gallery's own list
**Localizing question (reporter):** is the wrong/missing text the *journey's own content* (blocks,
titles) or the *app's UI/labels*? And which language?
**Look first (fixer):** content translation → `apis/api-journeys/.../journeyAiTranslate.ts` +
`translateCustomizationFields`. "Can't translate into language X" is usually X not being in
`SUPPORTED_LANGUAGE_IDS` — the fix is often just adding the ID.
**Handoff:** allowlist gap → agent-able; translation *quality* → human.
**Stale-report note:** the old same-language-id duplication collision (T9) was resolved by removal
in #9151 (child translation templates deleted). Do **not** diagnose new duplication issues as that
class; those reports are stale.

## Customizable templates (how-to) — the gate is derived, not a toggle
**Question people ask:** "what has to be enabled for a template to be customizable?"
**Answer:** `journey.customizable` is **auto-derived**, recalculated by
`recalculateJourneyCustomizable` (`apis/api-journeys/src/lib/recalculateJourneyCustomizable/`) on
block/action changes. The journey must be a `template`; then it becomes customizable if **any** of:
1. editable text — a customization *description* AND ≥1 customization *field* (both required)
2. a customizable *link* — a button / radio-option / video block whose action is `customizable`
   (a plain "navigate to next card" action does **not** count)
3. customizable *media* — an image/video marked customizable, or the website logo (logo only counts
   when the journey is in `website` mode)
**Common "why won't it customize?" answers:** it isn't a template; the marked thing is a navigation
action; or the logo isn't counting because website mode is off.
**Handoff:** how-to / FAQ.

## Header / footer settings ("where do I change this?") — how-to
**Signatures:** "how do I change the title / host / logo / microwebsite?"
**Answer (route to the surface):** journey-wide look-and-feel (chat buttons, display title, Host,
logo, menu) lives in **Journey Appearance** in the Drawer; the shared-on-social mock-up is **Social
Preview**; custom-domain / microwebsite settings live in the hosting/custom-domain settings.
**Handoff:** how-to / FAQ.

## Submit-button / action logic — FLAGGED (low frequency; signatures unconfirmed)
**Signatures (suspected):** questions about how submit buttons behave — the action/logic wiring is
complex on the code side.
**Mental model:** every button/submit is a block **Action**. The viewer dispatches them in
`libs/journeys/ui/src/libs/action/action.ts` + `components/Actions/Actions.tsx` (resolves
NavigateToBlock / link / email / phone); the text-answer submit is
`libs/journeys/ui/src/components/TextResponse/TextResponse.tsx`.
**Look first (fixer):** viewer dispatch → `libs/journeys/ui/src/libs/action/action.ts`,
`components/Actions/Actions.tsx`; server action schema → `apis/api-journeys/src/schema/action/`
(`navigateToBlockAction/`, `linkAction/`, …); editor-side edits →
`apps/journeys-admin/src/components/Editor/utils/useActionCommand/` + `src/libs/useBlockAction*UpdateMutation/`.
**Handoff:** navigation/dispatch defects → agent-able; "how does X action work" → how-to.

## Teams / access / ownership — T11 (ACL)
**Signatures:** invite email not arriving; "requested access" not showing; confusion over who can
edit; "I want to transfer ownership to someone else."
**Known non-bug (set expectation):** transferring a journey's ownership does **not** move it to
another team — it stays in its owning team. This is by design (a known limitation), and is
frequently reported as a bug.
**High severity:** any cross-team data exposure ("I can see another team's data") → escalate to a
human, never auto-fix.
**Look first (fixer):** the resolver auth guard + `UserJourney` / `UserTeam` roles in api-journeys;
for invite emails, the invite-email pipeline.
**Handoff:** how-to / access → human or FAQ; invite-email pipeline → agent-able; cross-team exposure
→ human.

## Sign-in & the Firebase desync — T2 (auth)
**Signatures:** sign-in doesn't work; "name shows Unknown"; unexpected behavior for a specific user.
**Mental model:** the app's user record (Users context) is a **read-through projection of Firebase
Auth** — the two can diverge (a record existing in one but not the other causes odd behavior).
**Localizing question (reporter): does it work in incognito?** Incognito working ⇒ a stale token —
the single most diagnostic auth signal.
**Look first (fixer):** `getAuthTokens.ts`, `checkConditionalRedirect.ts`, `verify.tsx`,
`SignIn.tsx`, `findOrFetchUser.ts`, `firebase.ts` (the projection reconciliation lives around
`findOrFetchUser`).
**Handoff:** agent-able for token/redirect defects; account-identity issues → human.

## Integrations — Google Sheets Sync live; Growth Spaces dormant
**Google Sheets Sync (real):** recurring **auth** (OAuth) issues and **sync reliability** (rows not
created / sync not running).
- Look first (fixer): OAuth connection → `apis/api-journeys/src/schema/integration/google/`
  (`googleCreate.mutation.ts`, `googleUpdate.mutation.ts`); the sync worker →
  `apis/api-journeys/src/workers/googleSheetsSync/`; the row/header build + write-to-sheet →
  `apis/api-journeys/src/schema/journeyVisitor/export/googleSheetsLiveSync.ts`.
- Handoff: OAuth reconnect → often human; sync-job defects → agent-able.
**Growth Spaces:** dormant — no recent reports, believed unused. Map stays thin; route to a human.

## Email notifications
**Signatures:** journey-event emails not arriving; unsubscribe vs the per-journey toggle confusion.
**Status:** had issues historically; relatively quiet recently.
**Handoff:** delivery defects → agent-able; preference confusion → FAQ.
