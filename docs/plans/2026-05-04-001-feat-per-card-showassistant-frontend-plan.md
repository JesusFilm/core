---
title: 'Frontend: Per-card showAssistant + expandChatByDefault (NES-1622)'
type: feat
status: active-partial
date: 2026-05-04
linear: https://linear.app/jesus-film-project/issue/NES-1622/frontend-per-card-showassistant-expandchatbydefault
scope: frontend-only
depends_on:
  - NES-1556 (backend) — must be deployed before this ticket merges so the new GraphQL fields exist on the supergraph and codegen produces the types this PR consumes.
  - NES-1617 / PR #9122 — adds the mobile sheet state machinery (`AiChat.onSheetStateChange`, `variant: 'panel' | 'overlay'`, `DragHandle`, `ChatHeader`, idle/collapsed/active sheet heights). Mobile `expandChatByDefault` semantics described below cannot be implemented until that PR lands — see "Implementation status" below.
related:
  - NES-1554 — Slice 1 prototype base (apologist chat)
  - NES-1557 — Editor UI for per-card controls (deferred)
  - NES-1585 — Production showAssistant migration script (7 journeys)
  - NES-1603 — Footer spacing reconciliation (hasAiChatButton vs flag) — resolved here
  - NES-1617 — Claude Design mobile UX (PR #9122) — provides the sheet-state primitives needed for the mobile auto-expand semantics in this plan
backend_plan: docs/plans/2026-05-03-001-feat-per-card-showassistant-and-expand-chat-plan.md
---

## Implementation status (2026-05-06)

> This section was added after the initial implementation (commit `5f5844fccf`) was found to be partial during local QA. The plan body below remains the source of truth for **intent**; this section captures the **delta** between intent and what shipped.

### Shipped correctly in commit `5f5844fccf`

- `CardFields` fragment selects `showAssistant` and `expandChatByDefault` (`libs/journeys/ui/src/components/Card/cardFields.ts`).
- `Journey.showAssistant` retained in the journey fragment as the transitional fallback (`libs/journeys/ui/src/libs/JourneyProvider/journeyFields.tsx`).
- `hasAiChatButton({ journey, variant, card })` now reads `(card?.showAssistant ?? journey?.showAssistant) === true`.
- `getCardChild(step)` helper extracted to `libs/journeys/ui/src/libs/block/`.
- `ChatOverlayProvider` exists with `open` / `setOpen` / `shouldAutoOpen(cardId)` / `markAutoOpened(cardId)` and the sessionStorage dedup described in this plan.
- `AiChatButton` is controlled — consumes `useChatOverlay()` instead of owning local state.
- `Card → {Website,Contained,Expanded}Cover → OverlayContent` threads the `card` prop end-to-end.
- `StepFooter` derives `card = getCardChild(selectedStep)` and forwards to `hasAiChatButton`.
- All ~100 fixture files updated to declare the new nullable booleans (TS satisfaction, no runtime behaviour change).
- Codegen output regenerated cleanly across consumers; gateway supergraph exposes both fields with `@deprecated` on `Journey.showAssistant` (verified: `apis/api-gateway/schema.graphql` lines 685, 763, 767).

### Gaps found during 2026-05-06 QA

These are **all** specified in the plan body below but did not land in the implementation. Each is reachable today only by direct DB `UPDATE` (Prisma Studio / SQL) since NES-1557 (editor UI) is deferred — meaning the gaps are silently latent until a creator (or QA) sets a per-card value and the chat fails to behave as documented.

| #   | Gap                                                                                                                                                                                                                                                                                                                            | Symptom                                                                                                                                                                                                                                                                                                                                                  | Plan reference                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `Conductor.tsx` was **not modified at all** in commit `5f5844fccf`. `showPinnedChat` still reads `journey?.showAssistant === true` instead of `hasAiChatButton({ journey, variant, card: getCardChild(activeBlock) })`.                                                                                                        | Per-card `showAssistant` does not gate the mobile `PinnedChatBar`.                                                                                                                                                                                                                                                                                       | "### `apps/journeys/src/components/Conductor/Conductor.tsx`" — first edit, lines 100–108 of the plan body.                                                                                                                                                                                                                        |
| 2   | `Conductor.tsx` does not pass `selectedStep={activeBlock}` to `<StepFooter />`. `StepFooter` falls back to `useEditor().state.selectedStep`, which is `undefined` in `apps/journeys` (no `EditorProvider` in that tree) → `card` is `null` for every render → `hasAiChatButton` only ever sees the (deprecated) journey value. | Per-card `showAssistant` does not gate the desktop `AiChatButton` either. The per-card path is reachable in tests (which pass `selectedStep` directly) but unreachable at runtime.                                                                                                                                                                       | Implicit in "### Other call sites" (StepFooter receives `card` derived from `selectedStep`) — the chokepoint that supplies `selectedStep` was not called out as an explicit Conductor edit. **Plan body now updated to make this explicit.**                                                                                      |
| 3   | `ChatOverlayProvider` is **never wrapped** around the `apps/journeys` page tree. `useChatOverlay()` returns its `FALLBACK_CONTEXT` (`open: false`, `setOpen: () => {}`, `shouldAutoOpen: () => false`) for every consumer.                                                                                                     | Clicking the desktop `AiChatButton` does nothing — `setOpen(true)` is the no-op fallback, `open` stays `false`, and `ChatOverlay` returns `null`. The lifted-state architecture is in place but disconnected.                                                                                                                                            | "### Lifted overlay state" — "Wrap `apps/journeys`' page tree in the provider (sibling of `JourneyProvider`)." Not done. The natural site is `apps/journeys/src/components/JourneyPageWrapper/JourneyPageWrapper.tsx`.                                                                                                            |
| 4   | The auto-open `useEffect` for `expandChatByDefault` was **not added** to `Conductor.tsx`. Nothing in non-generated source reads `expandChatByDefault` to drive open state — `rg "expandChatByDefault"` returns only fixture declarations and the `getCardChild.spec.ts` literal.                                               | `expandChatByDefault: true` on a card has zero effect — the desktop overlay never auto-opens.                                                                                                                                                                                                                                                            | "### `apps/journeys/src/components/Conductor/Conductor.tsx`" — second edit, lines 110–124 of the plan body.                                                                                                                                                                                                                       |
| 5   | `PinnedChatBar` does not consume `useChatOverlay()` and does not accept any prop driven by `expandChatByDefault`. It always renders `<AiChat />` with the internal `collapsed` state initialised to `false` — i.e. always expanded.                                                                                            | Mobile `expandChatByDefault` semantics (collapsed unless `true`) cannot be expressed. **However**: the underlying sheet-state primitives this requires (`AiChat.onSheetStateChange`, idle/collapsed/active heights, `DragHandle`) are added by **NES-1617 / PR #9122**, which is not yet merged. This gap is therefore blocked on that PR landing first. | "### Other call sites" — "the secondary `StepFooter` rendered alongside `PinnedChatBar` does not own its own state". Plan did not specify the `expandChatByDefault → initialCollapsed` mapping for `PinnedChatBar` because at draft time the sheet state machine in #9122 was not yet on `main`. **Plan body now amended below.** |

### Why the gaps slipped review

Captured here as a post-mortem so the same shape of gap is harder to ship next time.

1. **Plan presented Conductor edits as prose snippets, not diff hunks.** Adversarial reviewers can challenge a diff that exists; they cannot challenge a missing-edit when the plan reads "do this in `Conductor.tsx`" and the PR diff simply has no `Conductor.tsx` entry. Future fix: convert the "files-touched checklist" in this plan into an explicit pre-merge gate the reviewer ticks against the actual `git diff --name-only` output.
2. **Unit specs constructed `selectedStep` directly** (`renderStepFooter({ selectedStep: buildStep({ showAssistant: true }) })`), so the per-card path was test-green even though the runtime wiring that supplies `selectedStep` from `Conductor → StepFooter` was missing. Future fix: at least one **integration spec** that boots `Conductor` with a `CardBlock` fixture having `showAssistant: true` and asserts `AiChatButton` renders. See "### Tests — additions" below.
3. **No spec exercised `useChatOverlay()` end-to-end with the actual provider in the tree** — `AiChatButton.spec.tsx` wraps it in its own `ChatOverlayProvider`, masking the fact that the provider is never wrapped in `apps/journeys`. Future fix: assert `ChatOverlayProvider` presence in `JourneyPageWrapper.spec.tsx` (or equivalent root render).
4. **CodeRabbit / persona reviewers focused on the diff that exists**, not the plan-vs-diff delta. The plan→diff conformance check is a separate review pass and was not run.

## Follow-up work to close the gaps

This work must land **before** NES-1622 can be marked complete and **before** any production direct-`UPDATE` of per-card values is run. Items 1–4 are unblocked today on the current branch; item 5 is blocked on PR #9122.

### 1. Wrap `ChatOverlayProvider` in the journeys page tree (unblocked)

Edit `apps/journeys/src/components/JourneyPageWrapper/JourneyPageWrapper.tsx` to render `<ChatOverlayProvider journeyId={journey.id}>` as a sibling of `JourneyProvider` (per the original plan). Without this, every other item in this list is a no-op at runtime.

```tsx
<JourneyProvider value={{ journey, variant: variant ?? 'default' }}>
  <ChatOverlayProvider journeyId={journey.id}>
    <ThemeProvider {...}>
      {children}
    </ThemeProvider>
  </ChatOverlayProvider>
</JourneyProvider>
```

Mirror the same wrap in `apps/journeys/src/components/EmbeddedPreview/` and `apps/journeys/src/components/WebView/` if they bypass `JourneyPageWrapper`. Confirm before editing.

### 2. Wire `Conductor.tsx` end-to-end (unblocked, partially applied 2026-05-06)

Three edits, all in `apps/journeys/src/components/Conductor/Conductor.tsx`:

1. **Pass `selectedStep={activeBlock}`** to both `<StepFooter />` instances. **Already applied 2026-05-06** as the smallest viable patch to unblock per-card `showAssistant` for desktop. Keep this in the follow-up PR — it should not be reverted.
2. **Replace `journey?.showAssistant === true`** in the `showPinnedChat` derivation with `hasAiChatButton({ journey, variant, card: getCardChild(activeBlock) })` so the mobile pinned chat respects per-card opt-in/out.
3. **Add the auto-open `useEffect`** for `expandChatByDefault` exactly as written in the plan body below (lines 110–124). This requires `useChatOverlay()` to be wired (item 1 above) — without the provider, `setOpen(true)` is a no-op.

Imports to add:

```ts
import { getCardChild } from '@core/journeys/ui/block'
import { useChatOverlay } from '@core/journeys/ui/ChatOverlayProvider'
```

### 3. Mobile `PinnedChatBar` semantics for `expandChatByDefault` (blocked on PR #9122)

After PR #9122 (NES-1617) merges, `AiChat` exposes `onSheetStateChange` and an internal sheet state of `'idle' | 'collapsed' | 'active'`. The mapping required by NES-1622:

| `card.expandChatByDefault` | Initial mobile sheet state                                     |
| -------------------------- | -------------------------------------------------------------- |
| `true`                     | `'active'` (expanded, hugging top)                             |
| `false` / `null`           | `'idle'` (default, collapsed-but-input-visible per #9122 spec) |

Implementation shape (to be confirmed against the final API of #9122 once merged):

- Add an `initialSheetState?: 'idle' | 'collapsed' | 'active'` prop to `AiChat` (or accept `defaultExpanded` / `defaultCollapsed` — pick the name that mirrors #9122's existing vocabulary).
- Add a matching prop to `PinnedChatBar` and forward.
- In `Conductor.tsx`, derive `initialSheetState = card?.expandChatByDefault === true ? 'active' : 'idle'` and pass to `<PinnedChatBar />`.
- The auto-open `useEffect` in item 2 should **only** drive desktop overlay open state. Mobile is driven by initial sheet state, not by `setOpen` (the overlay is desktop-only). Add an inline comment in the effect making this explicit.

### 4. Integration spec to fence the regression class (unblocked)

Add `apps/journeys/src/components/Conductor/Conductor.perCardChat.spec.tsx` (or extend `Conductor.apologistChat.spec.tsx`) covering:

- `card.showAssistant: true`, `journey.showAssistant: null` → `AiChatButton` renders.
- `card.showAssistant: false`, `journey.showAssistant: true` → `AiChatButton` does not render (per-card opt-out wins).
- `card.expandChatByDefault: true` on initial mount → `ChatOverlay` is rendered with `open=true` (or, post-#9122, the mobile pinned bar mounts in `'active'` sheet state).
- `card.expandChatByDefault: true` on a prefetched neighbour while viewer is on a different card → no auto-open.
- Reload-equivalent scenario → auto-open fires again per the sessionStorage semantics.

The spec **must boot the real `Conductor`** with a `JourneyProvider` + `ChatOverlayProvider` wrapper, exercising the same wiring path as the runtime. Stubbing `selectedStep` directly on `StepFooter` (as the existing unit specs do) reproduces the false-green that masked this regression.

### 5. Update `JourneyPageWrapper.spec.tsx` (unblocked)

Add an assertion that `<ChatOverlayProvider>` is present in the rendered tree. Cheap and prevents the provider from being deleted accidentally in a future refactor.

## Pre-merge checklist update

Add the following to "## Acceptance criteria" in the plan body before this ticket can be re-claimed as done:

- [ ] `apps/journeys/src/components/JourneyPageWrapper/JourneyPageWrapper.tsx` renders `<ChatOverlayProvider journeyId={journey.id}>` as a sibling of `JourneyProvider`. Verified by `JourneyPageWrapper.spec.tsx`.
- [ ] `apps/journeys/src/components/Conductor/Conductor.tsx` modified in this PR (must appear in `git diff --name-only`). Specifically: (a) `selectedStep={activeBlock}` on both `<StepFooter />` calls, (b) `showPinnedChat` derived via `hasAiChatButton({ journey, variant, card: getCardChild(activeBlock) })`, (c) auto-open `useEffect` for `expandChatByDefault` present.
- [ ] An integration spec (`Conductor.perCardChat.spec.tsx` or equivalent) boots `Conductor` with a real `CardBlock` fixture (not a hand-built `selectedStep` injected directly into `StepFooter`) and asserts the per-card visibility / auto-open behaviour.
- [ ] If PR #9122 has merged at the time of this PR: `PinnedChatBar` accepts an initial sheet state derived from `card.expandChatByDefault` and the integration spec covers the mobile mapping. If PR #9122 has not merged: this checklist item is deferred to a follow-up ticket explicitly tracking the dependency, and the deferral is called out in the PR description.

---

> The plan body below is the original 2026-05-04 draft. Items above supersede or extend it where they conflict.

## Scope

**Frontend-only.** Splits from NES-1556 per the team's deploy-order convention (one ticket → one PR; backend ships first). When this PR opens, `CardBlock.showAssistant` and `CardBlock.expandChatByDefault` already exist on the deployed supergraph, `Journey.showAssistant` is `@deprecated` but still readable, and the production behaviour is unchanged. This PR makes the frontend read the new card-level fields, falls back to the journey value, and wires up the auto-open drawer behaviour.

After this PR merges and deploys, **production behaviour is still unchanged** until either (a) the World-Cup direct-`UPDATE` runs (handled out of band, runbook in the backend plan), or (b) NES-1585 backfills the 7 opt-in journeys. With both still pending, every card has `showAssistant = null`, the fallback returns `journey.showAssistant`, and the chat renders exactly as it does today.

This frontend ticket is the lift point: once it's live, engineers can flip per-card values via SQL and see immediate effect.

## Problem Statement / Motivation

Backend ticket NES-1556 added per-card schema and API surface. The frontend still reads `Journey.showAssistant`. This ticket completes the swap: the chat button gates on `(card.showAssistant ?? journey.showAssistant) === true` and the drawer auto-opens once when the active card has `expandChatByDefault === true`.

The auto-open behaviour is the riskier half — multiple navigation entry points (`NavigationButton`, `SwipeNavigation`, `HotkeyNavigation`, deep-link), prefetched neighbours via `DynamicCardList`, dual overlay state in `AiChatButton` + `PinnedChatBar`, and React StrictMode double-invokes all conspire to make a naïve `useEffect`-driven auto-open pop the drawer at the wrong time. Plan addresses this with a lifted `ChatOverlayProvider` + navigation-chokepoint trigger + `sessionStorage` dedup.

## Decisions

1. **Read-time fallback `(card.showAssistant ?? journey.showAssistant) === true`.** Earns its complexity because `apps/journeys` is a public no-auth viewer (memory: `apps/journeys` is a public no-auth viewer) — a deploy that silently disables chat on the 7 existing opt-in journeys would be visible to end users. Fallback is removed in the deferred PR (NES-???? "Fallback removal") once verification SQL confirms zero remaining nulls.
   - **Alternative considered and rejected:** ship NES-1585 backfill first, then ship this PR with no fallback. Rejected because it requires tight cross-team coordination on the data-script timing and provides no safety margin if the backfill misses cards.
2. **Auto-open semantics — once per `(journeyId, cardId)` per browser tab**, persisted in `sessionStorage`. Manual close on visit N suppresses auto-open on visit N+1 in the same tab. Closing the tab resets it. Implementation lives in `Conductor`'s navigation effect (single chokepoint), not in a downstream `useEffect`. Must also fire on initial mount (deep-linked share URLs are the most common entry point for World Cup).
3. **`expandChatByDefault=true` with `showAssistant=false`** is silently ignored at render time — no drawer, no console warning. Matches the backend's silent persistence.
4. **Lift overlay open/close state out of `AiChatButton` and `PinnedChatBar`** into a new `ChatOverlayProvider`. Both components become controlled. Without this lift, a viewer who dismisses the auto-opened drawer in `PinnedChatBar` and then taps the floating `AiChatButton` would see nothing happen on the first tap (split-brain state).
5. **Trigger lives in `Conductor`, not in card subtrees.** `DynamicCardList` mounts neighbour cards off-screen for transition smoothness. An effect inside `OverlayContent` keyed on its own `card.expandChatByDefault` would fire when prefetched neighbours mount.

## Frontend changes

### Single fragment edit (codebase has one source of truth)

`libs/journeys/ui/src/components/Card/cardFields.ts` — the canonical `CardFields` fragment. Add `showAssistant` and `expandChatByDefault`. The 25+ inline `BlockFields` / `RestoredBlock` / `NewBlock` fragments scattered across `apps/journeys-admin/**` all spread `${BLOCK_FIELDS}` (which spreads `${CARD_FIELDS}`), so they propagate automatically. **Do not** edit the inline fragments individually — the precedent is single-source-of-truth.

`libs/journeys/ui/src/libs/JourneyProvider/journeyFields.tsx:124` — leave `showAssistant` in the journey fragment for the fallback. Add a comment line marking it as transitional and tied to the fallback-removal ticket.

After fragment edit, run `nx run-many -t codegen` to regenerate frontend types. The new fields will appear in `CardFields.ts`, `JourneyFields.ts`, and downstream consumer types.

### Helper — `libs/journeys/ui/src/components/Card/utils/getFooterElements/getFooterElements.ts:47`

Add an optional `card` to the **shared** `JourneyInfoProps` (so `getFooterMobileSpacing`, `getFooterMobileHeight`, which compose `hasAiChatButton`, see consistent per-card semantics — addresses NES-1603). Tighten the type to the generated fragment.

```ts
import type { TreeBlock } from '../../../../libs/block'
import type { CardFields } from '../../__generated__/CardFields'

interface JourneyInfoProps {
  journey?: JourneyFields | null
  variant?: JourneyVariant
  card?: TreeBlock<CardFields> | null // NEW
}

export function hasAiChatButton({ journey, variant = 'default', card }: JourneyInfoProps): boolean {
  if (variant === 'admin' || variant === 'embed') return false
  // Per-card overrides per-journey; nullish fallback to the (deprecated) journey value
  // for the NES-1585 transition window. Removal tracked in <follow-up ticket id>.
  return (card?.showAssistant ?? journey?.showAssistant) === true
}
```

Also extract a small `getCardChild(step): TreeBlock<CardFields> | undefined` helper to `libs/journeys/ui/src/libs/block/` so the three call sites (Conductor, StepFooter, OverlayContent) that derive the active card don't open-code the same `children.find(b => b.__typename === 'CardBlock')` type guard.

### Lifted overlay state

Add `libs/journeys/ui/src/libs/ChatOverlayProvider/` (small Provider + `useChatOverlay()` hook) exposing:

```ts
interface ChatOverlayContext {
  open: boolean
  setOpen: (next: boolean) => void
  /** Returns true the first time it's called per (journeyId, cardId) per tab. */
  shouldAutoOpen: (cardId: string) => boolean
  /** Marks (journeyId, cardId) as auto-opened in sessionStorage. */
  markAutoOpened: (cardId: string) => void
}
```

`shouldAutoOpen` reads `sessionStorage.getItem('apologistChat:autoOpened:' + journeyId + ':' + cardId)`. `markAutoOpened` writes the key. Wrap `apps/journeys`' page tree in the provider (sibling of `JourneyProvider`).

`AiChatButton` and `PinnedChatBar` become controlled — they consume `useChatOverlay()` and render the `ChatOverlay` against `open`/`setOpen`. Their previous local `useState` is removed.

Provider must close the overlay on journey change in the same tab — `useEffect([journey?.id])` calling `setOpen(false)`.

### `apps/journeys/src/components/Conductor/Conductor.tsx`

Two edits at the navigation chokepoint:

```ts
// Replace: const showPinnedChat = ... journey?.showAssistant ...
const activeCard = getCardChild(activeBlock)
const showPinnedChat = apologistChatEnabled && hasAiChatButton({ journey, variant, card: activeCard }) && variant !== 'admin' && variant !== 'embed'
```

Auto-open trigger — fire from the same effect that already runs on `blockHistory` change:

```ts
const chatOverlay = useChatOverlay()

useEffect(() => {
  if (!apologistChatEnabled) return
  const card = getCardChild(activeBlock)
  if (!card || card.expandChatByDefault !== true) return
  if (!hasAiChatButton({ journey, variant, card })) return
  if (!chatOverlay.shouldAutoOpen(card.id)) return
  chatOverlay.markAutoOpened(card.id)
  chatOverlay.setOpen(true)
}, [activeBlock?.id]) // intentionally only on card change
```

This runs **once per navigation transition**. It does not run when `DynamicCardList` mounts off-screen neighbours (because the trigger checks `activeBlock`, not "this subtree's card"). It does fire on initial mount for deep-linked URLs.

### Other call sites

- `libs/journeys/ui/src/components/StepFooter/StepFooter.tsx:56-57` — pass `card` derived from `selectedStep` via `getCardChild`. Forward to `hasAiChatButton`. The button itself becomes controlled by `useChatOverlay()` so the secondary `StepFooter` rendered alongside `PinnedChatBar` does not own its own state.
- `libs/journeys/ui/src/components/Card/OverlayContent/OverlayContent.tsx:77` — same `card` swap. **Critically: do not host the auto-open trigger here.** This file renders inside per-card subtrees and would fire for prefetched neighbours.
- `apps/journeys-admin` editor consumers — variant `admin` short-circuits in `hasAiChatButton`, so admin editor stays unchanged.

## Tests

Use `@testing-library/react` per `.claude/rules/frontend/apps.md`. Run with `npx jest --config <app-path>/jest.config.ts --no-coverage <spec>` per `.claude/rules/running-jest-tests.md`.

- `libs/journeys/ui/src/components/StepFooter/StepFooter.apologistChat.spec.tsx`:
  - Per-card opt-in: card with `showAssistant: true`, journey with `showAssistant: null` → button renders.
  - Fallback: card with `showAssistant: null`, journey with `showAssistant: true` → button renders.
  - Per-card opt-out wins: card with `showAssistant: false`, journey with `showAssistant: true` → no button.
  - Variant suppression: `variant: 'admin'` and `variant: 'embed'` both suppress regardless of card value.
  - Existing spec mocks `AiChatButton` as a `data-testid` div; mirror that.
- `apps/journeys/src/components/Conductor/Conductor.apologistChat.spec.tsx`:
  - All four cases above (mirrored for `PinnedChatBar`).
  - `expandChatByDefault: true` on active card → `setOpen(true)` is called once on initial render.
  - Manual close → navigate away → return to the same card: drawer stays closed (sessionStorage assertion).
  - Prefetched neighbour with `expandChatByDefault: true` while viewer is on a different card: drawer stays closed.
  - Deep-link to mid-journey card with `expandChatByDefault: true`: drawer auto-opens on initial mount.
  - StrictMode-on test: assert `setOpen` is called exactly once on the double-invoke.
  - LD-flag override: `card.showAssistant: true` + `apologistChat: false` flag → no chat.
- `libs/journeys/ui/src/libs/ChatOverlayProvider/ChatOverlayProvider.spec.tsx` (new):
  - `shouldAutoOpen(cardId)` returns `true` on first call, `false` thereafter for same `(journeyId, cardId)`.
  - `markAutoOpened(cardId)` writes the expected `sessionStorage` key.
  - Different `journeyId` does not collide with same `cardId`.
  - Provider clears `open` on journey change.
- `libs/journeys/ui/src/components/AiChatButton/AiChatButton.spec.tsx` — adapt to controlled props (consumes `useChatOverlay()`); button click calls `setOpen(true)`.
- Menu-step suppression spec (StepFooter) — even with `showAssistant: true` on the menu-step's CardBlock, no chat button renders. Mirrors the existing menu-step suppression in `StepFooter.tsx:66-72`.
- `libs/journeys/ui/src/libs/block/getCardChild.spec.ts` (new) — small unit test for the new helper.

## Acceptance criteria

### Visibility / gating

- [ ] Frontend reads `showAssistant` from the active card with documented nullish-coalesced fallback to `Journey.showAssistant`.
- [ ] LD-flag override is honoured: `apologistChat: false` suppresses chat regardless of card value (regression spec).
- [ ] `variant: 'admin'` and `variant: 'embed'` suppress chat regardless of card value (regression specs).
- [ ] Menu step's CardBlock with `showAssistant: true` does **not** render chat over the menu (regression spec).

### Auto-open behaviour

- [ ] Frontend respects `expandChatByDefault` for initial drawer state; auto-open fires exactly once per `(journeyId, cardId)` per browser tab (verified by `sessionStorage` key).
- [ ] Auto-open is driven from the `Conductor` navigation transition, not from a `useEffect` in any card subtree.
- [ ] Closing the overlay on visit N suppresses auto-open on visit N+1 in the same tab; full page reload resets the per-tab dedup.
- [ ] Prefetched neighbour card with `expandChatByDefault: true` does not open the overlay while viewer is on a different card.
- [ ] Deep-link to a card with `expandChatByDefault: true` auto-opens on initial mount.
- [ ] StrictMode double-mount fires the auto-open exactly once.
- [ ] `expandChatByDefault: true` with `showAssistant: false` → no drawer, no console warning.

### State lifecycle

- [ ] Single source of truth for overlay open state — `AiChatButton` and `PinnedChatBar` are controlled by `useChatOverlay()`, neither owns local state.
- [ ] Overlay closes when the journey changes in the same tab.

### Codegen / fragment

- [ ] `CardFields` fragment selects both new fields. `nx run-many -t codegen` regenerates types cleanly.
- [ ] No edits to inline `BlockFields` fragments in `apps/journeys-admin/**` — they propagate via spread.

## System-wide impact

- **Interaction graph.** A card flip in `DynamicCardList` updates `blockHistory`. `Conductor` recomputes `activeBlock`, derives `activeCard` via `getCardChild`, re-evaluates `showPinnedChat`, and runs the auto-open effect on `activeBlock?.id` change. The effect calls `chatOverlay.shouldAutoOpen(card.id)` which checks `sessionStorage`; on `true`, it writes the key and sets `open=true`. `PinnedChatBar` and the `StepFooter`'s `AiChatButton` (now controlled) re-render against the new `open` state.
- **Error propagation.** None — frontend changes only.
- **State lifecycle risks.** Auto-open dedup must reset cleanly on cardId change (handled by `sessionStorage` key including `cardId`) and not fire for prefetched neighbours (handled by trigger living at the navigation chokepoint, not in subtrees). The lifted state in `ChatOverlayProvider` survives the per-card remounts that would have killed a `useRef`-only approach.
- **Apollo client cache normalisation.** `CardBlock` is keyed by `id`. Existing visitors with a cached `CardFields` fragment will return `undefined` for the new fields and trip the fallback path on first load — benign. No cache version bump.
- **CDN-cached SSR HTML on `apps/journeys` (no-auth viewer).** After NES-1585 runs (separately), stale ISR HTML can render with the old per-journey decision until revalidate fires. Final NES-1585 step is to bump the ISR revalidate key for affected slugs.
- **Footer spacing (NES-1603).** This PR threads the new `card` arg through `getFooterMobileSpacing` / `getFooterMobileHeight` so footer height stays in sync with chat-button presence on the per-card boundary. Marks NES-1603 resolvable.
- **Integration test scenarios.**
  1. Engineer sets `Block.showAssistant = true` on one card via direct SQL → frontend journey shows the chat button only on that card (with `apologistChat` flag on).
  2. Existing journey with `Journey.showAssistant = true` and **no** per-card values (column `null`) → all cards still show the chat (fallback path).
  3. `expandChatByDefault = true` on card A only → drawer auto-opens on A, viewer dismisses, navigates to B (drawer closed), back to A (drawer stays closed); page reload → drawer auto-opens on A again.
  4. Card B has `expandChatByDefault=true`; viewer is on card A; assert overlay is closed even after `DynamicCardList` has prefetched card B's subtree.
  5. Deep-link to mid-journey card with `expandChatByDefault=true` → drawer auto-opens on initial mount.
  6. Menu step has `showAssistant=true` → opening the menu does **not** render the chat button over the menu.
  7. Journey-admin editor and embed preview render unchanged (variant `admin` / `embed` short-circuit).

## Deployment & rollback

### Pre-deploy verification

- Confirm NES-1556 (backend) is deployed. Probe the gateway:
  ```bash
  curl -s "$GATEWAY_URL" -X POST -H 'content-type: application/json' \
    -d '{"query":"{ __type(name:\"CardBlock\") { fields { name } } }"}' \
    | jq '.data.__type.fields[].name' | grep -E "showAssistant|expandChatByDefault"
  # Expect both fields. If missing, do not merge — the backend has not deployed.
  ```

### Strict deploy order (within this ticket)

1. Verify backend pre-deploy check passes.
2. Deploy **frontend** (`apps/journeys` + `journeys-admin` codegen output is included in the build). Reads new card field with fallback to `journey.showAssistant`.
3. (Out of band — NES-1585 / World-Cup runbook) populate per-card values.

### Rollback

- **Chat disappears on the 7 existing opt-in journeys after deploy:** the fallback path is the suspect. Roll **frontend only** back to the prior commit. Backend stays as-is — schema is forward-compatible.
- **Auto-open misfires (drawer pops at wrong moments):** guarded behind the `apologistChat` LD flag — flip the flag off for affected segments via LaunchDarkly to neutralise without a deploy. Then ship a frontend fix.
- **Overlay state divergence (button click does nothing because state is split):** would surface as Sentry breadcrumbs from `AiChatButton` not matching `PinnedChatBar`. Revert frontend.

### Monitoring (first hour, then +4h, +24h)

| Signal                                            | Source                                        | Alert if                                                             |
| ------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| GraphQL `unknown field showAssistant` errors      | apps/journeys browser-Sentry                  | any occurrence (gateway/frontend skew — backend not deployed)        |
| Chat-button render count on the 7 legacy journeys | GTM `chat_button_visible`                     | drops > 20 % vs 24h prior baseline (fallback misconfigured)          |
| Chat-open events on World-Cup journey             | GTM `chat_drawer_opened`                      | absent for >15 min after announce (auto-open broken)                 |
| Auto-open spam (same `cardId` opening repeatedly) | front-end Sentry breadcrumb on `AiChatButton` | > 1 auto-open per `cardId` per session (sessionStorage dedup broken) |
| Footer-spacing layout shift CLS                   | Web-vitals on `apps/journeys`                 | > 0.05 increase vs 24h prior (NES-1603 regression)                   |

## Sources & References

### Internal references

- Backend plan: `docs/plans/2026-05-03-001-feat-per-card-showassistant-and-expand-chat-plan.md` — must be deployed first.
- Conductor (per-journey gate today): `apps/journeys/src/components/Conductor/Conductor.tsx:76-80`
- `hasAiChatButton` helper: `libs/journeys/ui/src/components/Card/utils/getFooterElements/getFooterElements.ts:47`
- StepFooter chat gate: `libs/journeys/ui/src/components/StepFooter/StepFooter.tsx:56-57`
- OverlayContent pinned-chat gate: `libs/journeys/ui/src/components/Card/OverlayContent/OverlayContent.tsx:77-81`
- `AiChatButton` (state to be lifted): `libs/journeys/ui/src/components/AiChatButton/AiChatButton.tsx:14`
- Canonical CardFields fragment: `libs/journeys/ui/src/components/Card/cardFields.ts`
- Journey fragment with `showAssistant`: `libs/journeys/ui/src/libs/JourneyProvider/journeyFields.tsx:124`
- Existing apologist-chat specs: `apps/journeys/src/components/Conductor/Conductor.apologistChat.spec.tsx`, `libs/journeys/ui/src/components/StepFooter/StepFooter.apologistChat.spec.tsx`
- Menu-step suppression precedent: `libs/journeys/ui/src/components/StepFooter/StepFooter.tsx:66-72`

### Rules

- `.claude/rules/frontend/apps.md` — MUI components; `handle*` event names; `aria-label` + `tabIndex` on interactive elements; `@testing-library/react` for tests.
- `.claude/rules/running-jest-tests.md` — `npx jest --config <app>/jest.config.ts --no-coverage <file>`; never `nx test`.

### Past learnings (`docs/solutions/`)

- `ui-bugs/mui-tabs-snapping-to-first-tab-router-sync.md` — `useEffect`-driven resets that overwrite user state on unstable dependency changes. Reinforces Decision 5: auto-open trigger lives at the navigation chokepoint with `sessionStorage` dedup, never as a `useEffect` on a derived prop in a card subtree.
- `ui-bugs/video-language-apply-commits-and-closes-drawers-2026-04-28.md` — silent type-narrowing through wrapper components forwarding callbacks. When threading `card` / `cardId` props through `Card → OverlayContent / StepFooter → AiChatButton / PinnedChatBar`, widen / preserve the type at every layer so intermediate components don't drop them.

### External best-practice references

- React community pattern for "auto-open once per key" — `useRef<string | null>` keyed on the changing identity is idiomatic; `key={id}` re-mount reset costs animation/focus; `sessionStorage` is the right choice when the dedup must survive remounts. See: [How to use the React useRef Hook effectively (LogRocket)](https://blog.logrocket.com/react-useref/).

### Related Linear work

- NES-1556 (backend) — schema, API, mutation input, `@deprecated` on `Journey.showAssistant`. **Must be deployed before this PR merges.**
- NES-1554 — Slice 1 prototype base.
- NES-1557 — Editor UI (deferred).
- NES-1585 — Production migration script + Prisma `Block.create` middleware for the 7 opt-in journeys.
- NES-1603 — Footer spacing reconciliation. **Resolved here** by threading `card` through the spacing helpers.
- **New: Fallback removal ticket** (TBD) — removes `Journey.showAssistant` and the nullish-coalesced fallback once NES-1585 is verified complete.

### Memory carried forward

- `apologistChat` flag (engineering rollout) AND `showAssistant` (creator opt-in) are both required to render the chat — both checks remain after this swap.
- `apps/journeys` is a public no-auth viewer; LD flags keyed anonymously. CDN-cached HTML is a real concern when NES-1585 backfills.
