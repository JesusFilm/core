---
title: 'docs(architecture): AI-navigability audit — fourth pass (ENG-3684)'
date: 2026-07-21
type: docs
ticket: ENG-3684
status: audit-input
audit_pass: 4 of 4
scope: apps/journeys · apps/journeys-admin · libs/journeys/ui · apis/api-journeys
method: .agents/skills/improve-codebase-architecture (deep-module lens) + read-only navigability sweep
---

# Architecture review — NextSteps core · fourth pass (AI-navigability)

> **This is the fourth of four architecture-review documents for ENG-3684.** It is a companion to the three that came before it and is meant to read as one set with them:
>
> 1. **Pocock skill run** — `core-ia.html` (8 candidates), the `improve-codebase-architecture` output Mike ran and shared; also carries **Mike's** feedback (his "modularize-in-place / journeys-ui as bounded modules" position).
> 2. **Siyang's feedback notes** — the 58-candidate `architecture-review-jesusfilm-core-2026-07-08.html` (19 Strong · 39 Worth exploring · 4 killed).
> 3. **Mike's feedback notes** — the modularize-in-place approach and the four restructure candidates framed in **ENG-3684** (block-type registry, shared image-mutations hook, derive `selectedBlock`, modularize-in-place).
> 4. **This pass** — the read-only AI-navigability audit below.
>
> **Format note.** The prior three are visual HTML reports. This pass is committed to the repo, where `docs/plans/` is Markdown and a diff must be reviewable, so it mirrors their *structure and heading conventions* (How this was produced → per-candidate cards with Files / Problem / Fix / Why it helps navigability → Top recommendation) in Markdown rather than reproducing the HTML. Nothing in the other three documents was edited.

`2026-07-21` · apps/journeys · apps/journeys-admin · libs/journeys/ui · apis/api-journeys

## How this was produced

The prior three reviews are **deep-module** reviews: they ask "which shallow module should become deep behind a clean seam?" and are excellent at it. This pass deliberately takes the **complementary angle the milestone actually needs** — plain **AI-navigability**: what makes an autonomous bug-fixing agent go to the *wrong place*, *waste its context window*, or *edit the wrong thing*. That angle surfaces mechanical, shippable fixes (renames, moves, dead-code deletion, obvious de-duplication, barrel clarity, doc pointers) that a depth-first review skips because none of them "deepen a module."

Method, using `.agents/skills/improve-codebase-architecture` as the lens and its deletion test as the bar:

1. **Scope + avoid-list.** Every finder was handed the full list of what the two prior reviews already cover (≈70 candidates) and told to report *only* what they missed.
2. **Seven parallel finders.** Four area explorers (`apps/journeys-admin`, `apps/journeys`, `libs/journeys/ui`, `apis/api-journeys`) plus three cross-cutting sweeps (dead-code-that-reads-live, misleading-names/naming-drift, distant-logic/oversized-files). 44 raw findings.
3. **Adversarial verification.** Each finding was re-checked against the code by an independent skeptic agent that opened every cited file, grepped the whole repo for references, and re-counted lines — with a mandate to **reject** false positives, wrong paths, stale counts, and anything the prior reviews already cover. **43 of 44 survived** (one was rejected as duplicative of the covered "journey view-event hook" item).

Five navigability failure modes were hunted: **misleading name** · **distant logic** (behaviour where nobody looks) · **implicit coupling** (change-here-implies-change-there with no compiler link) · **dead code that reads as live** · **oversized file** (exceeds a comfortable working context).

Domain terms are used per the area `CONTEXT.md` glossaries; architecture terms per the `codebase-design` vocabulary.

## Legend & tally

- **Tier 1 — 31 findings** (deduped from 35): mechanical, low-risk, individually shippable, **no QA** — renames, moves/splits, dead-code deletion, de-duplication, barrel clarity, doc pointers.
- **Tier 2 — 8 findings**: structural, carry prod-regression risk, **need QA**.
- **✱ corroboration** — flagged independently by more than one finder (a priority signal). `VideoWrapperPaused` was flagged by **four** agents; `useSortLanguageContinents` and `GoogleSheetsSyncDialog` by two each.
- Every finding was verified `is_new_vs_prior = true` — none duplicates the Pocock-skill or Siyang reviews.
- Effort: **S** ≈ minutes–1h · **M** ≈ 1–4h.

---

## Tier 1 — mechanical navigability wins

### apps/journeys-admin

**A1 · Fix the stale test-framework claim in `AGENTS.md`** — *doc-pointer · S · confirmed*
- **Files:** `apps/journeys-admin/AGENTS.md:156` (says "Framework: Jest") · contradicted by `apps/journeys-admin/project.json:125` (`@nx/vitest:test`), `setupTests.tsx:1` (`@testing-library/jest-dom/vitest`), `vitest.config.mts:20`.
- **Problem:** The app runs **Vitest** (459 files use `vi.*`, 0 use `jest.*`), but the agent-facing doc says Jest.
- **Fix:** Change the Testing line to "Framework: Vitest + @testing-library/react (mocks via `vi.mock`/`vi.fn`)"; the other Testing bullets remain accurate.
- **Why navigability:** An agent told to add/run a test reaches for `jest.mock`/`jest.config`, writes code that throws under Vitest, and burns a full loop before discovering the runtime is `vi.*`.

**A2 · Delete dead lib `findBlocksByTypename`** — *dead-code · S · confirmed*
- **Files:** `apps/journeys-admin/src/libs/findBlocksByTypename/` (impl 15 lines + `index.ts` barrel + 231-line spec).
- **Problem:** A barrel-exported, fully-tested TreeBlock search helper with **zero** repo-wide importers, sitting among ~80 `src/libs/` entries the AGENTS.md tells agents to "check first."
- **Fix:** Delete the directory.
- **Why navigability:** An agent scanning `src/libs/` treats this inert helper as load-bearing shared infrastructure.

**A3 · Rename `CheckBoxOption/` directory to match its `CheckboxOption` component** — *misleading-name · S · adjusted*
- **Files:** dir `.../ExportDialog/CheckBoxOption/` (capital B) holds `CheckboxOption.tsx` (lowercase b), props, and barrel — all lowercase-b. Importers: `FilterForm.tsx:17` **and** `ContactDataForm.tsx:20`.
- **Problem:** Path casing (`CheckBoxOption`) ≠ symbol casing (`CheckboxOption`); violates the PascalCase-dir rule in `AGENTS.md:21`; latent case-sensitive-FS import hazard.
- **Fix:** Rename dir → `CheckboxOption/` and update **both** importers (the finder missed `ContactDataForm`; the verifier caught it).
- **Why navigability:** A symbol search for `CheckboxOption` never lands on the `CheckBoxOption` path, and a path search never matches the symbol — the file is hidden from both strategies.

**A4 · Delete the stray empty file `src/__r`** — *dead-code · S · confirmed*
- **Files:** `apps/journeys-admin/src/__r` (0 bytes, tracked; introduced by `1f435b928`).
- **Problem:** A 0-byte extensionless file next to `components/` and `libs/`; nothing references it.
- **Fix:** `git rm apps/journeys-admin/src/__r`.
- **Why navigability:** An agent listing `src/` wastes a step reasoning about whether `__r` is a generated marker, config, or partial artifact. It is nothing.

**A5 · Reunite `blockDeleteUpdate` with `blockCreateUpdate`** — *distant-logic · M · confirmed*
- **Files:** `src/libs/blockDeleteUpdate/blockDeleteUpdate.ts` (70 lines) vs `src/components/Editor/utils/blockCreateUpdate/blockCreateUpdate.tsx` (29 lines, no JSX).
- **Problem:** Two halves of one Apollo-cache invariant live in different top-level areas, with **flipped argument order** — `blockCreateUpdate(cache, journeyId, data)` vs `blockDeleteUpdate(selectedBlock, response, cache, journeyId)`.
- **Fix:** Move `blockDeleteUpdate/` beside `blockCreateUpdate/` (or both into `src/libs/`), rename `.tsx`→`.ts`, align signatures to `(cache, journeyId, …)`.
- **Why navigability:** An agent fixing a create/delete cache bug finds one updater, assumes its sibling sits beside it, and either misses the other home or calls it with the wrong argument order.

**A6 · Relocate `GoogleSheetsSyncDialog` out of `FilterDrawer/`, fix the barrel-bypassing deep import** — *oversized/mis-nest · M · adjusted · ✱ (also B/T2)*
- **Files:** `.../JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog.tsx` (**1509 lines — the app's largest source file**) · `FilterDrawer.tsx` never imports it (only exposes an `onSyncDialogOpen` callback) · consumers: `reports/visitors.tsx:35` (barrel) and `TemplateCustomization/.../DoneScreen.tsx:24` (**deep-imports the impl across four `../`, bypassing `index.ts`**).
- **Problem:** A Google-Sheets-Sync (Integrations-domain) dialog is buried under a visitors-list `FilterDrawer` that doesn't use it, and one consumer bypasses its barrel — the dependency graph is obscured.
- **Fix (Tier 1 part):** Move the dir up to `JourneyVisitorsList/GoogleSheetsSyncDialog/` (or a shared Integrations location) and point `DoneScreen` at the `index.ts` barrel. *(The internal component split of the 1509 lines is the separate Tier-2 item B8.)*
- **Why navigability:** An agent fixing Google Sheets Sync looks under Integrations or the consuming `DoneScreen`, never under a visitors `FilterDrawer` whose own code doesn't reference the dialog.

**A7 · Delete dead `DiscoveryJourneys` + `EmbedJourney` subtree** — *dead-code · S · confirmed*
- **Files:** `src/components/JourneyList/ActiveJourneyList/DiscoveryJourneys/` including its `EmbedJourney/` child (impl + spec + stories + index for both).
- **Problem:** A whole subtree inside the **live** `ActiveJourneyList` with zero importers repo-wide.
- **Fix:** Delete the `DiscoveryJourneys/` directory.
- **Why navigability:** Nested inside a live component, it reads as a real feature of the journey list.

**A8 · Delete dead `ShareDrawer` + `LanguageScreenCardPreview`** — *dead-code · S · confirmed*
- **Files:** `TemplateCustomization/MultiStepForm/Screens/DoneScreen/ShareDrawer/` and `.../LanguageScreen/LanguageScreenCardPreview/`.
- **Problem:** Two orphaned subcomponents inside the **live** Quick-Start-Customization MultiStepForm feature; neither has an importer.
- **Fix:** Delete both directories.
- **Why navigability:** Being nested in a live, actively-edited feature gives dead code false currency.

**A9 · Collapse the two identical `AddBlock` `data.ts` fixtures** — *duplicate · S · confirmed*
- **Files:** `.../AddBlock/NewMultiselectButton/data.ts` and `.../AddBlock/NewTextResponseButton/data.ts` (byte-identical: same md5, 85 lines).
- **Problem:** Two identical test fixtures; a fixture change must be made twice or silently drifts.
- **Fix:** Move to one shared `AddBlock/submitButtonFixtures.ts`; both specs import it. Test-only, no prod risk.

### apps/journeys

**A10 · Extract the triplicated step-navigation event-create handlers** — *duplicate · M · confirmed · ✱*
- **Files:** near-verbatim `handleNextNavigationEventCreate` / `handlePreviousNavigationEventCreate` in `Conductor/NavigationButton.tsx` (316 lines), `SwipeNavigation.tsx` (286), `HotkeyNavigation.tsx` (252); the `STEP_*_EVENT_CREATE` gql consts already live in `libs/journeys/ui/.../Card/Card.tsx:50` and are imported by all three.
- **Problem:** ~65 lines duplicated three ways, kept in sync only by a hand-written "should match … places used" comment **that has already drifted** (Hotkey's list omits itself; all three point at `Card.tsx` for a fourth matching function that isn't there).
- **Fix:** Extract one `useStepNavigationEvents()` hook beside the constants in `libs/journeys/ui`, call it from all three, delete the copies and stale comments. Also shrinks all three oversized files.
- **Why navigability:** An agent changing how a step-nav event is reported edits one copy, passes tests, and silently leaves swipe + hotkey emitting the old shape — the only "contract" signal is a prose comment that is itself wrong.
- **Caveat:** emits production analytics (Plausible + GTM) with no event-shape parity test — extraction is behaviour-preserving but merits a light check that emitted shapes are unchanged.

**A11 · Delete dead `VideoWrapperPaused` block wrapper** — *dead-code · S · adjusted · ✱✱✱✱ flagged by 4 agents*
- **Files:** `apps/journeys/src/components/VideoWrapperPaused/` (17-line impl + index + 226-line spec).
- **Problem:** Shaped exactly like a live `BlockRenderer` wrapper (`WrapperProps`, renders `<Video … videoId={null}/>`) but **`apps/journeys` never passes a `wrappers=` prop to `BlockRenderer` anywhere** (`wrappers` appears 0× in `apps/journeys/src`); both real call sites render `<BlockRenderer block={…}/>`. Kept alive only by its own passing spec.
- **Fix:** Delete the directory.
- **Why navigability:** An agent on a "video doesn't stay paused in the viewer" bug sees a component literally named `VideoWrapperPaused` with a green spec and edits it — but it is wired into nothing. (The strongest signal in this audit: independently surfaced by four of the seven finders.)

**A12 · Delete dead `useFullscreenStatus` hook (relocate its ambient types)** — *dead-code · S · adjusted*
- **Files:** `apps/journeys/src/libs/useFullscreenStatus/useFullscreenStatus.ts` (86 lines) · live inline logic in `EmbeddedPreview.tsx:22-66`.
- **Problem:** Zero importers; its exit branch even calls `requestFullscreen()` instead of an exit method — a latent bug proving it never ran. The live fullscreen behaviour is inlined in `EmbeddedPreview` under different names.
- **Fix:** Delete the hook — **but** its `declare global` block is the *only* place the vendor-prefixed fullscreen props are declared, and `EmbeddedPreview` type-checks against them, so relocate that ambient augmentation into `EmbeddedPreview.tsx` or a shared `.d.ts` first (the verifier caught this — a naive `rm` breaks the build). Then type-check.
- **Why navigability:** An agent handed "fullscreen is broken in the embed" greps for fullscreen, finds a purpose-built hook, and edits code that has never run.

**A13 · Rename the duplicate `HostJourneyPage` page component** — *misleading-name · S · adjusted*
- **Files:** `pages/[hostname]/index.tsx:27-40` (14-line pass-through wrapper) and `pages/[hostname]/[journeySlug].tsx:32-87` (the real page) — **both** `function HostJourneyPage`; `index.tsx` imports the real one aliased `ImportedHostJourneyPage` and also defines `HostJourneysPage` (plural). `HostJourneyPageProps` is likewise duplicated with different shapes.
- **Fix:** Rename the wrapper to something unique (e.g. `HostSingleJourneyPage`) or inline it; retire the alias.
- **Why navigability:** An agent told to fix `HostJourneyPage` gets two hits in two sibling files and a coin-flip chance of editing the thin wrapper instead of the page that renders.

**A14 · Rename viewer `WebView` → `WebsiteView`** — *misleading-name · S · adjusted*
- **Files:** `apps/journeys/src/components/WebView/` · selected by `JourneyRenderer.tsx` on `journey.website`; 3 live importers.
- **Problem:** `WebView` renders a website-mode journey step directly — it is **not** a native/iframe webview, which is exactly what the name implies.
- **Fix:** Rename `WebView` → `WebsiteView` (or `WebsiteModeRenderer`); update the `JourneyRenderer` import + barrel (~3 files, no runtime strings).
- **Why navigability:** An agent debugging website-mode rendering skips a file named `WebView`; an agent chasing a real webview wastes time here.

### libs/journeys/ui

**A15 · Delete dead duplicate hook `useSortLanguageContinents`** — *duplicate · S · confirmed · ✱✱ flagged by 2 agents*
- **Files:** `libs/journeys/ui/src/libs/useSortLanguageContinents/` (hook + index + spec) — a runtime-identical twin of the **live** `useLanguagesContinentsQuery/sortLanguageContinents/sortLanguageContinents.tsx` (used by `SearchBar.tsx:125`).
- **Problem:** Byte-identical body, `use*`-prefixed but contains no React hook, zero importers, ships a full spec — reads as the canonical implementation while being dead.
- **Fix:** Delete the `useSortLanguageContinents/` directory.
- **Why navigability:** An agent changing continent grouping finds two near-identical bodies, one `use`-prefixed, and can't tell which is authoritative — it may patch the dead copy (no effect).

**A16 · Delete dead `Drawer` / `DrawerContent` component squatting on the domain term** — *dead-code · S · adjusted*
- **Files:** `libs/journeys/ui/src/components/Drawer/Drawer.tsx` (117 lines) + index. Zero importers (`@core/journeys/ui/Drawer` = 0 hits); every live `Drawer` import resolves to the admin editor `Settings/Drawer` instead.
- **Problem:** "Drawer" is a first-class domain term (`ActiveSlide.Drawer`, `CONTEXT.md:63`), so this orphan is a name-magnet pointing nowhere real — a three-way collision (MUI Drawer / live admin Drawer / this dead one).
- **Fix:** Delete `libs/journeys/ui/src/components/Drawer/`.

**A17 · Rename `useNavigationState` — it tracks Next-router route changes, not journey navigation** — *misleading-name · S · confirmed*
- **Files:** `libs/journeys/ui/src/libs/useNavigationState/useNavigationState.tsx` · `CONTEXT.md:34`.
- **Problem:** The hook subscribes to `router.events` and returns `isNavigating` — pure Next.js route-change state. `CONTEXT.md` reserves "navigation" for Block History and explicitly says *avoid "route history (no router involved)."* The name contradicts the lib's own vocabulary. 3 live consumers (loading spinners).
- **Fix:** Rename to `useRouteChangeState` (or `useRouterNavigating`); update 3 import sites.
- **Why navigability:** An agent debugging stuck **playback** navigation opens this expecting Block History logic; an agent debugging a router spinner would never look under "navigation state."

**A18 · Type the `MessageChatIcon` platform map + move it to `components/`** — *implicit-coupling · M · adjusted*
- **Files:** `libs/journeys/ui/src/libs/MessageChatIcon/MessageChatIcon.tsx:50,92` · enum `__generated__/globalTypes.ts:137`.
- **Problem:** A bare untyped `{ facebook: Facebook, … }` object literal, indexed by `platform` with no null guard and **not** typed `Record<MessagePlatform, …>`. It is exhaustive *today* (37/37), so no live crash — but nothing forces it to stay in lockstep with the enum. Also the only leaf presentational component filed under `libs/` instead of `components/`.
- **Fix:** Type the map `Record<MessagePlatform, ComponentType<{sx?: SxProps}>>` (a missing key becomes a compile error) and move the dir to `components/MessageChatIcon/`.
- **Why navigability:** An agent adding a `MessagePlatform` gets zero type signal that this parallel map must change too; an agent hunting the chat-icon component looks in `components/`, not `libs/`.

**A19 · Rename `journeyFields.tsx` → `journeyFields.ts`** — *misleading-name · S · adjusted*
- **Files:** `libs/journeys/ui/src/libs/JourneyProvider/journeyFields.tsx` (pure gql fragment, zero JSX) — the sole `*Fields.tsx` among ~20 sibling `*Fields.ts` fragments; 4 importers.
- **Fix:** Rename to `.ts` and update the 4 importers.
- **Why navigability:** A `.tsx` extension tells an agent (and tooling) the file contains JSX/a component; it doesn't, breaking the "extension = content" heuristic the sibling fragments otherwise uphold.

**A20 · Rename the `Actions` component (an AI-chat copy button) — collides with the block-Action concept** — *misleading-name · S · confirmed*
- **Files:** `libs/journeys/ui/src/components/Actions/` · sole importer `AiChat.tsx:25` · collides with `libs/action/action.ts` and the `Action` block concept.
- **Fix:** Rename to `CopyMessageButton` (or `MessageActions`) and move it under the `AiChat` cluster; update the single import + barrel.
- **Why navigability:** `Action` is one of the most load-bearing nouns in the lib (block Actions, `action.ts`, Action Handling); a top-level component named `Actions` that is actually an AI-chat copy button is a direct trap.

**A21 · Rename the inner `CardTemplates/Templates/` dir → `Layouts`** — *misleading-name · S · adjusted*
- **Files:** `.../Settings/Drawer/CardTemplates/Templates/` (6 `Card*` layout components) · `CardTemplates.tsx` (6 relative imports).
- **Problem:** "Templates" collides head-on with journey **Templates**; `CONTEXT.md` warns *"Card Templates … never shorten to 'templates'."* This inner dir is literally named `Templates`.
- **Fix:** Rename inner dir → `Layouts`; update the 6 imports in `CardTemplates.tsx`.

**A22 · Align `MultiselectBlock` UI naming (`MultiselectQuestion` → `Multiselect`)** — *misleading-name · M · adjusted*
- **Files:** `libs/journeys/ui/.../MultiselectQuestion/` (component + `multiselectQuestionFields` fragment + `MultiselectQuestionWrapper` in `BlockRenderer.tsx`) · admin `Properties/blocks/MultiselectQuestion/` — while the typename, `AddBlock`, util, api, and events all say `Multiselect`.
- **Problem:** `CONTEXT.md` flags this exact "Multiselect naming drift": the `Question` suffix is unreliable (its single-choice sibling is `RadioQuestionBlock`). Half the code says one thing, half the other.
- **Fix:** Rename the component, wrapper, fragment, and admin dir to `Multiselect`; regenerate `MultiselectQuestionFields` → `MultiselectFields`.
- **Why navigability:** An agent goes by typename (`MultiselectBlock`) and can't find the component named for it.

**A23 · Rename `JourneyProvider.variant` → `renderMode`** — *misleading-name · M (large footprint) · adjusted*
- **Files:** `libs/journeys/ui/src/libs/JourneyProvider/JourneyProvider.tsx` + ~179 consumers · `CONTEXT.md:47-49`.
- **Problem:** The render-mode field is named `variant`, colliding with the media-context `Variant` (a language rendition) **and** block style variants (`GridVariant`, `Typography Variant`). `CONTEXT.md` says *avoid bare "variant" — say "render mode."*
- **Fix:** Compiler-guided rename `variant` → `renderMode` (no wire/runtime strings). **This is the largest-footprint Tier-1 item (~179 consumers)** — if too broad for one PR, add `renderMode` as the canonical alias and deprecate `variant`. Recommend sequencing it alone to avoid churn conflicts.
- **Why navigability:** "variant" means three different things on this surface; the most-overloaded word names the render mode.

**A24 · Move story/test scaffolding off the production `@core/journeys/ui/*` surface** — *barrel-gap · M · adjusted*
- **Files:** `StoryCard`, `algolia/InstantSearchTestWrapper`, `journeyUiConfig`, `simpleComponentConfig` (all reachable via the wildcard `@core/journeys/ui/*` export) · `algolia/useAlgoliaVideos/index.ts:1` re-exports a fixture from the production hook barrel · `tsconfig.base.json:20-23`.
- **Problem:** Test/story-only helpers are indistinguishable from production exports through the wildcard subpath; a production hook barrel even re-exports a test fixture.
- **Fix:** Move these into a clearly test-scoped location (or suffix them), and stop re-exporting the `algoliaVideos` fixture from the production hook barrel (import from `./data` in tests). Relates to Siyang's "ui-lib declared interface / 104 wildcard subpaths" (c39) but is the concrete scaffolding-leak instance.

**A25 · Delete dead `LanguageFilterDialog`** — *dead-code · S · confirmed*
- **Files:** `libs/journeys/ui/.../HeaderAndLanguageFilter/LanguageFilterDialog/` (impl + spec + index) — the live language-filter UI is the near-namesake `LanguagesFilterPopper` (used by `HeaderAndLanguageFilter.tsx:30`).
- **Fix:** Delete `LanguageFilterDialog/`.
- **Why navigability:** Two near-identical names (`LanguageFilterDialog` vs `LanguagesFilterPopper`) for one concept, one of them dead — an agent editing "the language filter" has even odds of editing the dead one.

### apis/api-journeys

**A26 · Move the Google-Sheets *sync* write logic next to its schema + worker** — *distant-logic · M · adjusted*
- **Files:** `schema/journeyVisitor/export/googleSheetsLiveSync.ts` (457 lines), `googleSheetsHeader.ts`, `googleSheetsSyncShared.ts` — imported only by `workers/googleSheetsSync/service/service.ts:4`; the sync schema lives at `schema/googleSheetsSync/`.
- **Problem:** The live-sync writer sits under `journeyVisitor/export/` (the *CSV export* area) yet belongs to Google Sheets **Sync**; its file name doesn't match its export.
- **Fix:** Move the three sync files into `schema/googleSheetsSync/` (or `workers/googleSheetsSync/lib`), rename to match the export (e.g. `appendEventToGoogleSheets.ts`), update the single worker import; leave the CSV-only helpers in `export/`.

**A27 · Extract the `journeyVisitorExport` query out of the `journeyVisitor.ts` type file** — *distant-logic · S · confirmed*
- **Files:** `schema/journeyVisitor/journeyVisitor.ts` (424 lines) holds the object type **and** the `journeyVisitorExport` query field (`:216`) + its `getJourneyVisitors` async generator (`:141`).
- **Fix:** Extract the query + generator into `journeyVisitorExport.query.ts` and register it from the domain `index.ts` like the other resolvers; leave `journeyVisitor.ts` as just the type.
- **Why navigability:** An agent hunting the CSV-export resolver looks for a `*.query.ts`/`*.mutation.ts`, not inside the entity-type file.

**A28 · Dedupe the triplicated `parseISO8601Duration` / YouTube-duration fetch** — *duplicate · S · confirmed*
- **Files:** `schema/journey/simple/updateSimpleJourney.ts:114`, `schema/block/video/service.ts:133`, and `apps/journeys-admin/src/libs/parseISO8601Duration/`.
- **Problem:** The same ISO-8601 duration parser is copied three times (two inside the same `api-journeys` deployable, identical but for a `console.error`).
- **Fix:** Reuse `block/video/service`'s parser/`fetchFieldsFromYouTube` from `updateSimpleJourney.ts`; delete its local copies. In-boundary, low-risk.

**A29 · Add a cross-reference for the AI simple-journey image allow-list** — *implicit-coupling · S · adjusted*
- **Files:** `schema/journey/simple/updateSimpleJourney.ts:14-41` (8-host `ALLOWED_IMAGE_HOSTNAMES` + `isValidImageUrl`) silently parallels `apps/journeys-admin/next.config.js:39-56` and `apps/journeys/next.config.js:39-55` (same hosts, already drifted by `cloudflarestream`). Line-15 comment has a typo ("jourenys").
- **Fix (Tier-1 minimal):** Fix the typo and add an explicit cross-reference pointer in each file so the coupling is discoverable. *(The full extraction to one shared SSRF allow-list is the Tier-2 item B7.)*
- **Why navigability:** An agent adding an image host updates `next.config` and never learns the API SSRF guard has its own copy (or vice-versa).

**A30 · Delete dead `getNextParentOrder`** — *dead-code · S · adjusted*
- **Files:** `schema/block/getNextParentOrder.ts` (+ spec) — live block-create ordering uses `getSiblingsInternal` (`block/service.ts:62`); the three `*BlockCreate.mutation.ts` files don't call `getNextParentOrder`.
- **Fix:** Delete `getNextParentOrder.ts` and its spec. (If gap-tolerant ordering is actually wanted, fold it into `getSiblingsInternal` — a separate behaviour change, not this deletion.)
- **Why navigability:** A plausibly-named ordering helper with a spec, adjacent to the live create mutations, that none of them use.

**A31 · Rename `event/utils.ts` → `eventService.ts` and hide its test-only injectors** — *misleading-name · M · adjusted*
- **Files:** `apis/api-journeys/src/schema/event/utils.ts` (341 lines, 8 exported symbols, 17 importers) — a generic "utils" name for what is the event **service**, and it exports `__set*QueueForTests` injectors into the production surface.
- **Fix:** Rename to `event/eventService.ts` (update 17 importers) and move the test injectors behind a test-only entry.
- **Why navigability:** "utils" is where nobody looks for the core event-write service; the exported test hooks read as production API.

---

## Tier 2 — structural navigability issues (need QA)

These carry prod-regression risk and are recorded, not planned in detail — decided ticket-by-ticket.

**B1 · `NewMultiselectButton` inlines its "with submit button" mutations** — *distant-logic · M.* Its TextResponse twin extracts the same three optimistic/undo/redo mutations to `src/libs/useTextResponseWithButton{Create,Delete,Restore}/` hooks; `NewMultiselectButton` inlines them (578-line component, 4 named mutations + optimistic/undo). Fix: extract mirror `useMultiselectWithButton*` hooks. Risk: live optimistic-mutation/undo behaviour → QA. Related to Tier-1 A22 (do the rename first).

**B2 · `apps/journeys` Apollo `possibleTypes` is an unlisted lockstep copy of the block-type registry** — *implicit-coupling · S.* `apps/journeys/src/libs/apolloClient/cache/cache.ts:11-38` hardcodes the 17 Block + 5 Action typenames; identical copies live in `journeys-admin`, `watch`, `resources`. **This is a fresh facet of the block-type-registry restructure (Siyang c01 / Pocock #07):** the four prior "possibleTypes caches" were noted, but not that they are a hand-maintained parallel that drifts silently when a block type is added. Fix: derive `possibleTypes` from the generated schema. Risk: Apollo cache normalization → QA.

**B3 · Split `VideoEvents.tsx` (787 lines)** — *oversized · M.* 9 near-duplicate "register player listener → fire event + Plausible + GTM" effects + 7 inline gql mutation defs. Fix: move mutations to `videoEvents.mutations.ts`; extract one parameterized listener helper. Risk: analytics event firing → QA.

**B4 · Two drifted `customDomain/` service files** — *duplicate · M.* `service.ts` and `customDomain.service.ts` both define `deleteVercelDomain` (identical) and `updateTeamShortLinks` (drifted on the `JOURNEYS_URL` fallback). Fix: collapse to one `service.ts`. Risk: Vercel domain deletion + short-link rewrites on real custom domains → QA.

**B5 · Per-block-type translatable-field vocabulary duplicated with no compiler link** — *implicit-coupling · M.* `journeyAiTranslate.ts:83-90` (`allowedTranslationFieldsByBlockType`) and `blockTranslation.ts:28-70` (`getTranslatableFields`) encode the same typename→field map, provably equal today, held together by nothing. Fix: derive one from the other. Risk: AI-translation field selection → QA.

**B6 · Relocate media-ingestion helpers out of `updateSimpleJourney.ts`** — *distant-logic · M.* The 403-line resolver inlines image processing + YouTube ingestion (`:14-142`). Fix: move to `journey/simple/media.ts`, reuse the shared parser from A28. Risk: image upload + transaction behaviour → QA. (Superset of Tier-1 A28.)

**B7 · Centralize the `ALLOWED_IMAGE_HOSTNAMES` SSRF allow-list** — *implicit-coupling · M.* The full fix behind Tier-1 A29: hoist the host list to one shared module the API guard and both `next.config` files import. Risk: it is an **SSRF guard** crossing app/api → QA.

**B8 · Split `GoogleSheetsSyncDialog.tsx` (1509 lines)** — *oversized · M · ✱ (also A6).* After the Tier-1 relocation (A6), split internally: extract a `useGoogleDrivePicker` hook, lift `RenderMobileSyncCard` into its own file, move the 6 gql docs to a `.graphql.ts` sibling. Risk: live Integrations dialog + Google OAuth Picker → QA. Sequence **after** A6.

---

## What the prior three reviews already own (fourth-pass boundary)

To keep the four reading as one set without overlap, this pass deliberately did **not** re-report: the api-journeys authorization triplication; the `captureEvent`/`upsertBlockAction` seams; the `blockHistoryVar` navigation global + `useBlocks` interface; the block-type registry / `BlockRenderer` switch / `assertNever`; the ~61 single-mutation wrapper hooks + `useActionCommand`; the template-gallery cache invariant; `JourneyListContent`; `EditorProvider` derived-`selectedBlock`; the image-attach lifecycle adapter; `translateJourney`/`journeyDuplicate`/customizable-recalc; the dead-AiChat-overlay / chat-surface cluster; `handleAction` host classification; the SSR/onboarding/createStep/CardPreview/upload-reducer/breakdown/event-descriptor items; `useMyAccess`/`useJourneyAccess`; the integration registry; the typed visitor-filter; the public-URL builder; `CardForm`; the nine one-function TreeBlock helpers; and the ui-lib 104-wildcard-subpath interface. The four items the prior verification **killed** (canonical home for generated block-field types; server-owned customizability flags; `useTeamMembers`; R2 storage lib) were not resurrected.

## Top recommendation

**Start with the dead-code deletions and the doc fix** (A1, A2, A4, A7, A8, A11, A12, A15, A16, A25, A30) — 11 items, mostly S, each a standalone one-file-or-directory delete with the highest navigability-per-effort ratio: every one removes a thing that *actively lies to an agent* about being live. Lead with **A11 `VideoWrapperPaused`** (four independent finders) and **A1 the `AGENTS.md` Jest→Vitest fix** (every agent that touches a test reads it).

Then take the **misleading-name renames** (A3, A13, A14, A17, A19, A20, A21, A22) — small, compiler-checked, each closing a named trap — saving the ~179-consumer **A23 `variant`→`renderMode`** for its own PR.

The **distant-logic / de-duplication moves** (A5, A9, A10, A26, A27, A28, A31) are M-sized but still no-QA and pay off the "logic where nobody looks" tax.

Hold the eight **Tier-2** items for individual tickets; two of them (**B2**, **B8**) are the concrete evidence that most strengthens two of ENG-3684's named restructures — see the synthesis plan.
