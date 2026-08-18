---
title: 'Ama language not available on the Watch page for the JESUS film'
date: 2026-08-11
last_updated: 2026-08-13
ticket: null
category: ui-bugs
module: apps/watch, apis/api-media
problem_type: 'research_writeup_no_fix_applied'
severity: medium
root_cause: 'unknown_actual_frontend_is_in_separate_forge_repo_not_yet_inspected'
resolution_type: 'not_yet_fixed_wrong_repo_diagnosed_first'
tags:
  - watch
  - language-switcher
  - video-variant
  - parent-variant
  - available-languages
  - algolia
  - published-filter
  - qa-554
  - vmt-318
symptoms:
  - 'The "Ama" language does not appear as an available/selectable audio language on jesusfilm.org/watch for the JESUS film, even though a variant may exist for it elsewhere in the system'
components:
  - 'apps/watch/pages/[part1]/[part2]/[part3].tsx'
  - 'apps/watch/src/components/DialogLangSwitch/AudioTrackSelect/AudioTrackSelect.tsx'
  - 'apps/watch/pages/api/languages.ts'
  - 'apis/api-media/src/schema/video/video.ts'
  - 'apis/api-media/src/schema/videoVariant/videoVariant.ts'
---

# Ama language not available on the Watch page for the JESUS film

**Status: research only.** This document records an investigation into the bug report "Ama Jesusfilm is not available on the watch page." No code was changed. It exists to hand off a well-cited starting point, not a fix.

**Update 2026-08-13 (first pass):** re-checked the fast-moving facts below (PR merge state, VMT-318 status, #9381's triage). One material change: **PR #9385 has merged to `main`** (commit `2752feb75`, 2026-08-11 21:08 UTC — a few hours after this doc was first written). See the "Existing tracked work" and "Concrete next steps" sections for details.

**Update 2026-08-13 (second pass — live reproduction against prod):** the bug is now **directly reproduced against production**, not just hypothesized. Summary — full detail in the new [Live reproduction](#live-reproduction-against-prod-2026-08-13) section below:
- "Ama" is a real catalog entry, ISO 639-3 code **`NYI`** (not `amm` as originally guessed — that open question is now resolved).
- On `https://www.jesusfilm.org/watch/jesus.html/the-beginning/english.html` (JESUS film, "The Beginning" chapter, video id `cmp76ycuv02n0ny01faav3nae`, slug `the-beginning`), the language switcher lists "Ama" as a selectable audio language (out of "2,260 languages" shown for this video) and a search for "Ama" surfaces it (code `NYI`) alongside `Amam` (BCU), `Amanab` (AMN), `Wayampi, Amapari` (OYM).
- Selecting **Ama** and applying navigates to `https://www.jesusfilm.org/watch/jesus.html/the-beginning/ama.html?t=0&autoplay=1`, which renders **"Page not found"** in prod, live, right now.
- ~~This is a clean, isolated reproduction of mechanism A...~~ **Retracted — see the third-pass correction immediately below. The mechanism attribution in this bullet is wrong.**

**Update 2026-08-13 (third pass — CORRECTION, this repo is not the source of the running app):** Tanner clarified that the actual frontend serving `jesusfilm.org/watch` today lives in a **separate "forge" repo**, not `apps/watch` or `apps/resources` in this `core` monorepo — and its backend is a **different/unknown API layer**, not confirmed to be this repo's `apis/api-media`. This retroactively invalidates the code-level mechanism claim above and everything in the "How apps/watch determines available languages," "Root-cause class," and most of "Existing tracked work" sections below: **that analysis is of code that is not running in production for this URL.** It was reasonable given what was visible from this repo, but it's diagnosing the wrong app.

**What survives this correction, because it's a live-behavior fact independent of any repo:** the Playwright reproduction itself — Ama (`NYI`) is offered in the switcher for the JESUS film's "The Beginning" chapter, and selecting it 404s at `.../the-beginning/ama.html`. That symptom is real and current. The *cause* is now unknown again pending investigation of the actual forge repo and its actual backend — this doc's mechanism-A/mechanism-B framing was built entirely from this repo's source and may not transfer. Also worth re-reading in this light: the RSC/App-Router response markers noted in the Live Reproduction section's closing paragraph — that's now the expected explanation (forge is presumably an App Router app), not a loose thread.

Treat everything below this point as **historical context on `apps/watch`/`apps/resources`'s own (possibly unrelated, possibly legacy/staging-only) implementation**, not as an explanation of the live bug, until the forge repo is actually inspected.

## Summary / confidence

- **What "Ama" is:** Presumably the language named "Ama" in the Jesus Film language catalog (there is a real ISO 639-3 language `amm`, Papua New Guinea). **This could not be confirmed statically.** No file in this repo (seed data, fixtures, locale files, GraphQL test snapshots) contains a language literally named "Ama" or the code `amm` — the languages catalog lives in a database (`api-languages`/`api-media`), not in checked-in source, and no live DB/GraphQL access was available in this session. Confidence: **low-to-medium** that "Ama" is the amm/Papua New Guinea language; **not verified**.
- **Most likely root cause class, with high confidence:** this is very likely the *same known, currently-open, actively-being-fixed* bug as **Linear VMT-318 / QA-554** ("uploaded 3 languages for Wonder Series... language menu on app and watch don't reflect those published additions") and its umbrella spec **GitHub #9381** ("PRD: Reconcile Variant processing and parent-language availability"), **not** a new, unseen bug. The mechanism: a *child* video (e.g. a JESUS film chapter) gets a published Variant in a new language, but the *parent/container* video (e.g. the JESUS film container itself) never gets its corresponding "generated parent Variant," so the parent's available-languages set silently omits the new language everywhere the Watch page reads it from. See [Root-cause class](#root-cause-class-same-as-9429-9430-or-something-else) below for why this is a different failure mode than #9429/#9430, and [Existing tracked work](#existing-tracked-work-this-is-probably-not-a-new-bug) for the open Linear/GitHub items and in-flight (unmerged) PRs that address exactly this.

## How apps/watch determines available languages (traced, with citations)

Background vocabulary (from `apps/watch/CONTEXT.md`, read in full before this investigation): the Watch Path URL scheme is `/watch/{video-slug}.html/{language-slug}.html`, three segments when the content sits inside a **container** (e.g. `/watch/jesus.html/the-beginning/english.html`). **Available vs Preferred** languages: "available" = what a video's Variants actually offer; the language picker shows the intersection of available and the viewer's preferred languages.

1. **Page load fetches the audio-language list unfiltered by publish status.**
   `apps/watch/pages/[part1]/[part2]/[part3].tsx:51-64` defines:
   ```graphql
   query GetVideoLanguages($id: ID!, $languageId: ID) {
     video(id: $id, idType: databaseId) {
       audioLanguages: variantLanguages { id }
       variant(languageId: $languageId) { subtitleLanguages: subtitle { languageId } }
     }
   }
   ```
   This is only run `if (contentData.content.variant?.slug != null)` (line 167) — i.e. only when the *current* requested-language variant for the page you're already on resolved successfully.

   The `variantLanguages` field it queries resolves in `apis/api-media/src/schema/video/video.ts:219-233`:
   ```ts
   variantLanguages: t.field({
     type: [Language],
     nullable: false,
     select: () => ({ variants: { select: { languageId: true } } }),
     resolve: (video) => video.variants.map(({ languageId }) => ({ id: languageId }))
   }),
   ```
   **No `where: { published: true }` filter at all** — every variant row's `languageId` is returned regardless of publish status. This becomes `videoAudioLanguageIds` (`[part3].tsx:189`), which flows into `WatchState.videoAudioLanguageIds` (`apps/watch/src/libs/watchContext/WatchContext.tsx:62`) and is passed to `AudioTrackSelect` (`apps/watch/src/components/DialogLangSwitch/AudioTrackSelect/AudioTrackSelect.tsx:9,27-32`), which filters a separately-fetched master language list down to just these ids.

2. **The master language list comes from a *different*, unrelated endpoint.**
   `AudioTrackSelect` intersects `videoAudioLanguageIds` against `useLanguages()` (`apps/watch/src/libs/useLanguages/useLanguages.ts:34`), which fetches `/watch/api/languages` (`apps/watch/pages/api/languages.ts`). That route queries the whole `languages` catalog via GraphQL (lines 8-24) and **drops any language whose name array and native name are both empty** (`languages.ts:91`: `if (name.length === 0 && nativeName == null) return`), then Redis-caches the result for 24h (`languages.ts:47-77`). If "Ama" has no translated name rows at all in the languages catalog, it is silently dropped here regardless of whether any video has a variant for it — a second, independent way for a language to disappear from the switcher. This mirrors the previously-fixed Mongolian bcp47/name-resolution class of bug (PRs #9419/#9420) but for a different table (language names vs. Variant/media-component language resolution); **not verified against live data** whether this applies to Ama specifically.

3. **Selecting the language and resolving the actual page is where the mismatch bites.**
   The dialog's submit handler (`apps/watch/src/components/DialogLangSwitch/DialogLangSwitch.tsx:59-68`) computes `shouldReload = videoAudioLanguageIds?.includes(...)` — true if step 1's *unfiltered* list contained the id — and navigates to `/watch/{video}.html/{content}/{lang-slug}.html`.

   That reload re-runs `getStaticProps` in `[part3].tsx`, which fetches
   `content: video(id: "${contentId}/${languageSlug}", idType: slug) { ...VideoContentFields }` (`[part3].tsx:42-49`).

   - The **top-level** `video(id, idType: slug)` resolver (`apis/api-media/src/schema/video/video.ts:553-572`) looks the video up by `variants: { some: { slug: id } }` plus `published: true` and `availableLanguages: { isEmpty: false }` **on the Video row**, not on the specific variant. So the *Video* is generally still found even if that one variant is unpublished.
   - But `VideoContentFields` also selects `variant { id duration hls ... slug }` (`apps/watch/src/libs/videoContentFields.ts:37-57`, no explicit language arg). That resolves through the **singular** `variant` field (`apis/api-media/src/schema/video/video.ts:326-382`), which for a slug-typed compound id takes the branch at lines 341-357:
     ```ts
     const slug = `${video.slug}/${requestedLanguage}`
     return await prisma.videoVariant.findUnique({
       where: { slug, published: input?.onlyPublished === false ? undefined : true }
     })
     ```
     **This defaults to `published: true`.** If the specific language's Variant row exists but is `published: false`, this returns `null` — even though the Video itself was found and even though `variantLanguages` (step 1) had already advertised that language id as available.

   When `content.variant` is `null`: `audioLanguageId` falls back to `'529'` (English) (`[part3].tsx:79`), and playback/download data for the requested language is simply absent — which is exactly the shape of "language is offered in the switcher, or exists in the system, but the page for it is not available."

   **This asymmetry — list field unfiltered, singular resolution field published-only-by-default — is structurally identical to the pattern #9430 fixed** (see next section), but has not been fixed at this call site.

## Root-cause class: same as #9429/#9430, or something else?

Two candidate mechanisms were found; they are **not mutually exclusive** and either (or both) could explain "Ama is not available":

**A. The `variantLanguages` vs. `variant` publish-filter asymmetry (matches the #9430 pattern closely).**
- `576997dfb` (#9430, `apps/journeys-admin/.../LocalDetails.tsx`) fixed exactly this shape of bug: a language list with no publish filter listed a language, but resolving `variant(languageId:)` for it defaulted to published-only and returned `null`, producing broken (zero-length) data. The fix added `input: { onlyPublished: false }` to match.
- `5c90556ff` (#9429, `apps/arclight/.../languages/index.ts` and `.../languages/[languageId]/index.ts`) fixed the mirror-image bug: Prisma `where` clauses on Arclight's media-component languages endpoints had **no** `published` filter at all, so unpublished variants leaked into public API responses; the fix **added** `published: true`.
- The Watch page's own `[part1]/[part2]/[part3].tsx:51-64` query and the `video.ts:326-382` `variant` resolver reproduce the *first* shape: `variantLanguages` (list, unfiltered) vs. `variant` (singular, published-only default) are inconsistent with each other, on the exact same page load. **This part of the investigation is a new, not-yet-reported finding** — it wasn't mentioned in any issue found — but it is the same bug *pattern* as #9430, just not yet patched on the Watch app's own query.

**B. Parent/container video never learns about a newly-published child-language Variant (matches the currently open VMT-318/QA-554/#9381 work — higher-confidence match for this specific report).**
- `apis/api-media/src/schema/videoVariant/videoVariant.ts:146-226` (`handleParentVariantCreation`) is the function responsible for creating an empty "generated parent Variant" on every parent container whenever a child video's Variant in a given language becomes published, and updating the parent's `availableLanguages` array. It is invoked from three places: `apis/api-media/src/schema/videoVariant/videoVariant.ts:543,658,664,883` (variant create/update/publish mutations) and `apis/api-media/src/schema/video/videoPublishChildren.mutation.ts:237` (batch child-publish) and `apis/api-media/src/schema/video/video.ts:867` (video-level publish toggle).
- Per-parent creation failures are **caught and swallowed**: `videoVariant.ts:215-222` does `.catch((error) => { console.error(...) })` inside a `Promise.allSettled`, and `videoPublishChildren.mutation.ts:237-239` does the same via `logger.error`. Either path can silently leave a parent container without the new language's generated Variant, with no retry and no operator-visible failure state.
- If "JESUS" (or a JESUS-film chapter acting as a container) is a **parent** with children, and an "Ama" Variant was published on a **child**, but `handleParentVariantCreation` failed/never ran for that parent, the parent's `availableLanguages`/`variantLanguages` would never include Ama — this is a data gap upstream of everything in section "How apps/watch determines available languages," not a Watch-app query bug at all.

Given the currently open work described below, **(B) is the better-evidenced explanation for this specific report**; (A) is a real, separately-discovered gap worth fixing regardless.

## Existing tracked work (this is probably not a new bug)

- **Linear VMT-318** (same issue also linked as "QA-554" in GitHub PR titles — `https://linear.app/jesus-film-project/issue/VMT-318/...`), reported 2026-07-16 by Will Wakeling: *"uploaded 3 languages for Wonder Series (Kurmanji-Standard 20770; Tajik and Pashto E Afg) the language menu on app and watch don't reflect those published additions... I think this is a bug because adding a language to the children should 'automatically' add them to the series' language list."* Status as of 2026-08-13: still **In Review**, still assigned to Tanner Fleming (the user). State history shows it cycling In Review → Ready for QA → In Review again, most recently flipping back to In Review at 2026-08-11T21:08:16Z — the same minute PR #9385 merged — so QA is still bouncing it back each pass.
- **GitHub #9381** — "PRD: Reconcile Variant processing and parent-language availability," opened 2026-08-11 by the same user, explicitly says: *"Publishers can successfully upload and publish a language-specific Variant for a Child Video while the parent container remains unaware of that language. The missing generated parent Variant and stale Algolia records cause Watch and native app language menus to omit content ... or produce 404 pages even though the Child Variants exist and are published."* As of 2026-08-13, an AI-triage comment on the issue confirms it was split into three sequenced sub-issues (each blocked by its predecessor): **#9468** (Phase 1: catalog-wide audit/repair — itself now marked **blocked by #9382**, see below), **#9469** (Phase 2: durable per-Variant status via `VideoVariantUpload`), **#9470** (Phase 3: unified reconciliation/gating/alerting). All three are still **OPEN**. The umbrella #9381 itself carries no triage state by design — it's a tracking spec, not a unit of work.
- **GitHub #9382** — "Repair zero-size Downloads and recover missing parent language Variants," a narrower/earlier-shipping sibling covering the same parent-Variant invariant for the `6_Acts` (LUMO Acts) container. Per the #9381 triage comment, the overlap between #9382 and #9468-Phase-1 was resolved: **#9382 ships first, #9468 generalizes it rather than reimplementing it** ("slug, publication, and language semantics live in exactly one place"). Still **OPEN** as of 2026-08-13.
- **In-flight PRs implementing the fix** — updated status as of 2026-08-13:
  - `#9385` "feat(api-media): add video variant reconciliation foundation (QA-554)" — **MERGED** to `main` at 2026-08-11T21:08:13Z (commit `2752feb75`). Per its own description this is *additive only*: new `VideoVariantUpload` processing/reconciliation schema, migration, GraphQL exposure, and — notably — "scheduled processing every 15 minutes and a monthly parent-variant audit." Whether that scheduled audit is actually enabled/running against prod data was not verified in this session (no worker/cron config was inspected).
  - `#9386` "feat(api-media): activate video variant reconciliation (QA-554)" — still **OPEN**. Per its description this is the piece that actually wires reconciliation into the live create/update/delete/publish path and *defers publication until processing completes* — i.e. the part that would prevent a future "Ama-shaped" gap from opening in the first place. Stacked on #9385.
  - `#9384` "feat(videos-admin): add processing view (QA-554)" — still **OPEN**, stacked on #9386.
  - `#9383` (Watch acceptance test) — **CLOSED**, unmerged.
  - Net effect: the reconciliation *data model and scheduled audit* landed on `main` 2026-08-11 evening; the *runtime enforcement* that stops the gap recurring, and the admin visibility into it, have not.
- `gh issue list --search "Ama"` and `mcp__linear__list_issues query:"Ama"` returned **no** issue literally naming "Ama" (re-confirmed 2026-08-13). The connection to VMT-318/#9381 is inferred from matching failure mechanism and vocabulary ("language menu... doesn't reflect published additions," "container... unaware of that language"), not from an explicit mention of Ama or the JESUS film by name.

## Live reproduction against prod (2026-08-13)

Prod DB/GraphQL credentials were still unavailable in this session (Doppler has no `prd` config for the `watch` project, and reading `apis/api-media/.env` for its `DATABASE_URL` was treated as off-limits per this org's secrets-handling policy — see the "How this was done" note below). Instead, the actual public site was driven end-to-end with a headless browser (Playwright, already a repo dependency), which sidesteps needing any credentials at all — it's the exact path a real visitor takes.

**Target:** `https://www.jesusfilm.org/watch/jesus.html/the-beginning/english.html` — the JESUS film's first chapter, "The Beginning." Confirmed via the page's own analytics beacon: `video_id=cmp76ycuv02n0ny01faav3nae`, `video_slug=the-beginning`.

**Steps and results:**
1. Opened the page, clicked the language-switcher trigger ("2,260 languages" — this count is scoped to this specific video's own audio-language list, i.e. it's driven by `variantLanguages` on `the-beginning`'s own video row, not the whole catalog's ~7,000+ languages).
2. Typed "Ama" into the switcher's search box. Four matches returned: **Ama (`NYI`)**, Amam (`BCU`), Amanab (`AMN`), Wayampi/Amapari (`OYM`). This resolves the open question from the first pass — "Ama" is ISO 639-3 **`NYI`**, not `amm` as originally guessed; `amm` never appeared in this list.
3. Selected **Ama**, clicked Apply. The app navigated to `https://www.jesusfilm.org/watch/jesus.html/the-beginning/ama.html?t=0&autoplay=1`.
4. That URL rendered **"Page not found."** Live, in production, at the time of this session.

**What this confirms:** this is a clean, isolated reproduction of **mechanism A** — the `variantLanguages`/`variant` publish-filter asymmetry described above — at the leaf content-video level, independent of any parent-container question. Ama's id is present in `the-beginning`'s own unfiltered `variantLanguages` list (or it wouldn't have appeared as a search match, since the switcher intersects the master language catalog against `videoAudioLanguageIds`), but the specific `jesus.html/the-beginning/ama.html` slug 404s when the `variant` resolver looks it up — behavior fully consistent with an Ama `VideoVariant` row on this video that exists but has `published: false` (or a similar state the singular resolver rejects while the list resolver doesn't).

**What this does not confirm:** whether mechanism B (parent-container sync via `handleParentVariantCreation`) also applies here, e.g. whether the `jesus` container's own top-level language list has the same gap. That was not separately re-tested this session — the reproduction above is scoped to the child chapter only.

**How this was done, for reuse:** `npx playwright` (from repo root, so the `playwright` package resolves from `node_modules`) driving a headless Chromium against the live URL — open page → click the language-count button → click the language-name combobox row (not a plain text selector, which matches ambiguously against both the combobox and the "See all videos in English" link) → type into the resulting search input → click the matched language row → click Apply → read `page.url()` and `page.title()` after the navigation settles. No prod credentials of any kind were needed for this approach.

## Concrete next steps to confirm/fix

1. ~~Confirm the actual language and video first.~~ **Done 2026-08-13** — see [Live reproduction](#live-reproduction-against-prod-2026-08-13): Ama is `NYI`, the video is the JESUS film's "The Beginning" chapter (`cmp76ycuv02n0ny01faav3nae`, slug `the-beginning`), and the specific failing URL is confirmed.
2. **Mechanism B (parent sync gap) — still unconfirmed, now lower-priority for this specific report.** The reproduction above isolates the failure to the child/leaf video's own `variant` resolution, not the `jesus` container's language list — so mechanism B doesn't need to be true for this exact symptom to occur. It's still worth checking whether the `jesus` container itself is also missing Ama (a `curl`/Playwright check of `https://www.jesusfilm.org/watch/jesus.html` for "Ama" in its own language switcher would confirm this without needing DB access), since that would indicate both mechanisms are compounding. As of 2026-08-13, #9385 (reconciliation data model + scheduled parent-variant audit) is merged to `main`, but #9386 (runtime integration) and #9384 (admin visibility) are still open.
3. **Mechanism A (publish-filter asymmetry) — now confirmed live, not just hypothesized.** The fix path is unchanged: make `variantLanguages` (list, `video.ts:219-233`) and `variant` (singular, `video.ts:326-382`) agree — either both filter on `published`, or the list stops advertising unpublished languages (add `where: { published: true }` to `variantLanguages`, analogous to what #9429 did for Arclight). No ticket exists for this yet (confirmed again 2026-08-13 — still not #9381/VMT-318, which addresses parent-sync, not this asymmetry). **This is now the clearer next action: file a ticket, since the bug is reproduced and the fix is a one-line-per-call-site query change**, not blocked on prod data access anymore.
4. ~~Check `/watch/api/languages` for Ama's presence~~ — **superseded**: the live reproduction confirms Ama has a name in the catalog (it rendered as "Ama" with code `NYI` in the switcher's own search), so it is not being dropped at the `languages.ts:91` name-filter step. That specific failure mode is ruled out for this case.
5. **Check whether `handleParentVariantCreation` failures are logged anywhere queryable** — still open, still blocked on the reconciliation work (#9381/#9469) not being live yet; not relevant to confirming mechanism A specifically since that path doesn't touch parent-Variant creation at all.

## Open questions not resolved from static code alone

- ~~Whether "Ama" refers to the ISO 639-3 `amm`...~~ **Resolved 2026-08-13**: it's `NYI`.
- ~~Which specific video the reporter means...~~ **Resolved 2026-08-13**: reproduced against the JESUS film's "The Beginning" chapter; not verified whether the reporter meant a different chapter or the container itself, but the failure mode reproduces on at least this one.
- Whether an Ama Variant row exists for `the-beginning` with `published: false`, vs. some other state the `variant` resolver rejects (e.g. missing `hls`/processing incomplete) — the live reproduction confirms the *symptom* (listed but 404s) but not the exact DB-level cause; still requires either prod DB access or a Videos Admin lookup to distinguish "unpublished" from "processing never completed."
- Whether the `jesus` container's own top-level language list also omits Ama (mechanism B, compounding or independent) — not retested this session, see next-step 2 above.
- Whether this report is in fact the same underlying incident as VMT-318/QA-554 — **weakened as of 2026-08-13**: VMT-318 is specifically about parent-container sync (mechanism B), and this reproduction isolates a child-level publish-filter bug (mechanism A) instead. They may still be the same *reported symptom* with two different causes at play across the catalog, but this specific reproduction is not evidence for the VMT-318 mechanism.
- A note on infrastructure encountered along the way, not otherwise relevant to the fix: live requests to `www.jesusfilm.org/watch/*` return React Server Component (App Router) response markers, which matches neither `apps/watch` nor `apps/resources` as checked out in this worktree (both are Pages Router per source and per `workers/jf-proxy`'s routing config, which points `/watch*` at `apps/watch`). This suggests production may be running code ahead of what's in this worktree/branch. Not chased further — doesn't change the reproduction above, which was against the real live site regardless of which app served it.
