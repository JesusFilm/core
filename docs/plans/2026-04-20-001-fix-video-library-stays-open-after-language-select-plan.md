---
title: 'fix: Video Library drawer stays open after language Select'
type: fix
status: active
date: 2026-04-20
---

# fix: Video Library drawer stays open after language Select

## Overview

When a Journey Builder user edits an existing JF Internal video block and changes only the **audio language** (not the video itself), the final click on **Select** correctly persists the language change but leaves the parent **Video Library** drawer open. The user is then confronted with the library browse tabs (Library / YouTube / Upload) and a full video list, which looks as though the UI is asking them to pick a different video. They have to click the `X` to dismiss it.

Reported by Lucinda Mason while preparing 34 World Cup journey translations; confirmed by Siyang Cao as a bug in the April 17 2026 `#nextsteps-bugs` thread. Linear ticket: [NES-1568](https://linear.app/jesus-film-project/issue/NES-1568). Related broader UX ticket: [QA-221](https://linear.app/jesus-film-project/issue/QA-221).

## Problem Frame

The `VideoLibrary` component renders two stacked MUI `Drawer`s:

1. The **outer Library drawer** with the Library / YouTube / Upload tabs and the full video browse experience
2. An **inner VideoDetails drawer** that displays whenever `selectedBlock.videoId != null` on mount

When a user opens the Video Library on a block that already has a JF Internal video, both drawers mount at once and the user sees the inner VideoDetails on top. Clicking **Select** in `LocalDetails` calls the cascading `onSelect` chain, which closes `VideoDetails` via `setOpenVideoDetails(false)` **but never calls** the outer `onClose?.()`. The outer Library drawer therefore remains visible underneath, and the user is stuck on the library browse list until they manually click the close affordance.

A successful selection is semantically a terminal action — the user has picked their video and language and signalled "I'm done". Leaving the outer drawer open violates that expectation and is especially confusing in the language-only-change flow, because it implies they must still pick a video.

## Requirements Trace

- **R1.** After a user confirms a video block update via **Select** (from `LocalDetails`, `MuxDetails`, or `YouTubeDetails`), both the inner `VideoDetails` drawer and the outer `VideoLibrary` drawer must close, returning focus to the journey editor.
- **R2.** Existing flows that feed into `VideoLibrary.onSelect` must continue to work: (a) selecting a brand-new video from the Library tab, (b) uploading a MUX video and selecting it, (c) selecting a YouTube video, (d) clearing a video via the trash icon in `VideoDetails`.
- **R3.** Background MUX upload completion paths must not be regressed. They **do** flow through `VideoLibrary.onSelect` (chain: `processUpload.onComplete` → `AddByFile.onChange(videoId, false)` → `VideoFromMux.handleChange` → `VideoLibrary.onSelect(block, false)`). The `shouldCloseDrawer` parameter — already wired through the chain — must gate the outer `onClose?.()` call so a background completion cannot yank the drawer from under a user who has since navigated to a different block.
- **R4.** Regression coverage: a test must assert the outer drawer closes on Select for the existing-video-edit flow.

## Scope Boundaries

- The broader UX redesign of the language picker (remove Apply/Select redundancy, convert side panel to dropdown) — tracked in [QA-221](https://linear.app/jesus-film-project/issue/QA-221) and explicitly **out of scope** here.
- Changing the behavior of the `Change Video` button in `VideoDetails` (it correctly only closes the inner details drawer and returns the user to the browse tabs) — out of scope.
- Any change to the new-video-browse flow's **VideoListItem-embedded** `VideoDetails` (lives at `VideoList/VideoListItem/VideoListItem.tsx`) — its outer close is already coordinated via the `VideoListItem.onSelect` handler; out of scope.

### Deferred to Separate Tasks

- Reducing clicks required to change the language (Apply + Select): tracked in QA-221.

## Context & Research

### Relevant Code and Patterns

Primary file:

- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLibrary.tsx` — owns the two-drawer layout and the `onSelect` handler that is missing the `onClose?.()` call.

Parent / caller files (understanding only, no changes expected):

- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoBlockEditor/Source/Source.tsx` — instantiates `VideoLibrary`, supplies `onClose={() => setOpen(false)}`. This is the `onClose` that must fire.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions.tsx` — wraps Source via `VideoBlockEditor` and wires `onChange` → `handleSelect`.

Inner drawer and language picker:

- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoDetails/VideoDetails.tsx` — dispatches to LocalDetails / MuxDetails / YouTubeDetails based on `source`.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails.tsx` — renders the language `Chip` and the `Select` button; calls its `onSelect` prop on Select click.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLanguage/VideoLanguage.tsx` — the `Apply` button here simply calls `onClose` to dismiss the language picker (intentional; Apply is a close-only action today).

### Key pattern observation

The `onSelect` chain bubbles:

    LocalDetails.handleSelect
      → VideoDetails.onSelect (prop)
        → VideoLibrary.onSelect
          → parent onSelect (mutation: update the block)

In `VideoLibrary.onSelect`, the current code closes only the inner drawer. The fix is to close the outer drawer in the same handler, because reaching this code path means "the user has confirmed a block update" — which is always a terminal action for the Video Library UI.

### Institutional Learnings

- `docs/solutions/` searched for prior learnings on drawer lifecycle or video block editing — none directly applicable. No prior fix has addressed this particular close-coordination gap.

### External References

- Not required. Local patterns, existing tests, and the code path are sufficient.

## Key Technical Decisions

- **Close the outer drawer inside `VideoLibrary.onSelect` rather than in each child component.** Centralising the close behaviour in the one place that already handles the final `handleSelect` invocation keeps the children (LocalDetails, MuxDetails, YouTubeDetails, VideoListItem) unchanged and prevents drift. Rationale: children should not know about the existence of the outer drawer; that is a composition concern of `VideoLibrary`.
- **Do not gate the close on `selectedBlock?.videoId`.** The existing-video-edit and new-video-browse flows both reach `VideoLibrary.onSelect` on a terminal user action. Closing in both cases is the correct terminal behaviour and matches user expectation (the action completes the task). This also means no new branching logic is introduced.
- **Gate the new `onClose?.()` call on the existing `shouldCloseDrawer` parameter.** The parameter was already threaded from `AddByFile` (which sets it to `false` on background upload completion) through `VideoFromMux` into `VideoLibrary.onSelect`, but it was only aliased to `shouldFocus` and never actually gated drawer closing. Gating the new `onClose?.()` on `shouldCloseDrawer` both restores the background-completion contract and aligns the parameter name with real behaviour. This mirrors the existing pattern in `handleVideoDetailsClose` (`if (closeParent === true) onClose?.()`).
- **No change to `VideoLanguage`.** Its "Apply" button remains a close-only affordance; the broader Apply/Select redesign is QA-221's responsibility.

## Open Questions

### Resolved During Planning

- **Q: Should the outer drawer close only when editing an existing video, not when browsing for a new one?**
  A: No. Both flows end with a user-confirmed Select that persists the block. Closing after any successful Select is the terminal behaviour. Staying open after browsing would be equally surprising.
- **Q: Does closing the outer drawer break the MUX upload flow where a background upload completion triggers `onSelect`?**
  A: It would if the `onClose?.()` call were unconditional, because background completions **do** flow through `VideoLibrary.onSelect` (via `AddByFile` → `VideoFromMux` → `VideoLibrary`). `AddByFile` passes `shouldCloseDrawer = false` for exactly this reason. The fix therefore gates the new `onClose?.()` on `shouldCloseDrawer`, consistent with the pattern in `handleVideoDetailsClose`.

### Deferred to Implementation

- None. The fix is localised and all planning-time uncertainties are resolved.

## Implementation Units

- [ ] **Unit 1: Close the outer VideoLibrary drawer on successful Select**

**Goal:** After `handleSelect` is invoked inside `VideoLibrary.onSelect`, also dismiss the outer Library drawer so that both drawers close together and the user returns to the journey editor.

**Requirements:** R1, R2, R3

**Dependencies:** None

**Files:**

- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLibrary.tsx`
- Test: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLibrary.spec.tsx`

**Approach:**

- In `VideoLibrary.onSelect`, after the existing `setOpenVideoDetails(false)` line, call the optional `onClose?.()` supplied by the parent — but gate it on the existing `shouldCloseDrawer` parameter so background MUX upload completions (which pass `shouldCloseDrawer = false`) do not yank the drawer from under a user who has navigated away. The gate mirrors the pattern in `handleVideoDetailsClose`.
- No changes required in `LocalDetails`, `MuxDetails`, `YouTubeDetails`, `VideoDetails`, `VideoLanguage`, `VideoFromLocal`, or `VideoListItem`. The cascade is already correct; only the final (gated) close step is missing.

**Patterns to follow:**

- The existing `handleVideoDetailsClose` already shows the pattern of calling `onClose?.()` when a close is final (see `closeParent === true` branch in `VideoLibrary.tsx`). This unit applies the same pattern to the success/selection path.

**Test scenarios:**

- **Happy path — edit existing video language:** When `selectedBlock` has `videoId` set and the user triggers `onSelect` via the inner details flow, both the inner `VideoDetails` drawer and the outer `VideoLibrary` drawer should close. Assert `onClose` prop is invoked exactly once.
- **Happy path — select a brand-new video from the Library tab:** When `selectedBlock` is null (no existing video) and a selection is made via `VideoFromLocal` → `onSelect`, the outer drawer should close. Assert `onClose` prop is invoked exactly once.
- **Happy path — select via YouTube tab:** `VideoFromYouTube` → `onSelect` also triggers the outer close.
- **Happy path — select via Upload (MUX) tab after upload completes:** `VideoFromMux` → `onSelect` triggers outer close.
- **Edge case — clearing a video via the trash icon in `VideoDetails`:** `handleClearVideo` calls `onSelect` with null fields; verify the outer drawer also closes (this matches user intent: "remove this video and get me out").
- **Edge case — `onClose` prop is not supplied:** `onClose?.()` short-circuits gracefully. Render without an `onClose` prop and assert no throw.
- **Regression guard — Change Video button in VideoDetails:** Clicking `Change Video` (which calls `onClose(false)` on the inner details) does NOT close the outer drawer. Cover all three source types (internal, YouTube, MUX) so a future unconditional-close regression is caught on every path.
- **Regression guard — background MUX upload completion:** `VideoLibrary.onSelect(block, shouldCloseDrawer=false)` must NOT call `onClose`. Simulate by mocking `VideoFromMux` to expose a button that fires `onSelect(block, false)` and assert the outer close is suppressed.

**Verification:**

- Manual reproduction of the bug (see Problem Frame) now ends with both drawers closed and the editor visible, language saved.
- All existing `VideoLibrary.spec.tsx` tests still pass.
- New test scenarios above pass.

## System-Wide Impact

- **Interaction graph:** `VideoLibrary` is the single choke-point for all video-block "I'm done selecting" events. Closing the outer drawer here affects every entry point that routes through it: `Source` (in `VideoBlockEditor`), card background video, and any future caller. No other entry points bypass `VideoLibrary.onSelect`.
- **Error propagation:** `onClose` is optional and safely short-circuits if undefined; no new failure mode.
- **State lifecycle risks:** The outer `open` state is owned by the parent (`Source.tsx`). Calling `onClose` delegates the close to the parent's `setOpen(false)`, which already works for the "X" close affordance. No split-brain state.
- **API surface parity:** The `VideoLibrary` prop contract is unchanged. No consumer update needed.
- **Integration coverage:** The inner flow `LocalDetails → VideoDetails → VideoLibrary → Source → VideoOptions (mutation)` is covered by existing integration tests in `VideoLibrary.spec.tsx` and `Source.spec.tsx`. A new assertion that the outer drawer closes on Select strengthens this coverage.
- **Unchanged invariants:** `VideoLanguage.Apply` continues to close only the language picker. `VideoDetails.onClose(false)` ("Change Video") continues to return the user to the library browse tabs without closing the outer drawer. MUX background-upload completions continue to bypass `VideoLibrary.onSelect`.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| A rare caller might rely on the outer drawer staying open after Select (e.g. a preview-multiple-videos flow). | None found in the codebase after reviewing `VideoLibrary` consumers (`Source`, `BackgroundMediaVideo`, `VideoOptions`). Test coverage will catch any hidden coupling. |
| Snapshot or storybook tests asserting the pre-bug DOM state could break. | Run `VideoLibrary.stories.tsx` and `VideoLibrary.spec.tsx` after the change and update any snapshots that reflect the new (correct) behaviour, with a note in the PR. |
| Background MUX upload completion inadvertently triggers `VideoLibrary.onSelect`. | Confirmed in Phase 1 research it does not — it goes through `VideoOptions.handleChange` directly. A test asserts upload-completion paths don't invoke `onClose`. |

## Documentation / Operational Notes

- No docs update required — this is an internal component fix with no public API surface.
- QA scenarios will be posted on the Linear ticket covering: edit language of existing video, replace video via browse, MUX upload flow, YouTube flow, trash/clear video, and verifying the "Change Video" button still keeps the outer drawer open.

## Sources & References

- **Linear ticket (this work):** [NES-1568 — fix: video library drawer pops up after changing video language via Select](https://linear.app/jesus-film-project/issue/NES-1568)
- **Related broader UX ticket:** [QA-221 — Changing video language - too many clicks](https://linear.app/jesus-film-project/issue/QA-221)
- **Slack — Lucinda's original report (2026-04-17 NZ time):** https://jfp-digital.slack.com/archives/C02T3E4FTQF/p1776368646830479
- **Slack — Siyang confirms the bug:** https://jfp-digital.slack.com/archives/C02T3E4FTQF/p1776373499439419
- **Slack — Siyang notes an existing ticket may exist (→ QA-221):** https://jfp-digital.slack.com/archives/C02T3E4FTQF/p1776375296207359
- Primary file to modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLibrary.tsx`
- Primary test file: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLibrary.spec.tsx`
