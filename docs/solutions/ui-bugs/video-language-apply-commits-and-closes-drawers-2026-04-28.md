---
title: 'Apply button in language picker is a dead-end action that strands the user in the Video Library drawer'
date: 2026-04-28
last_updated: 2026-04-29
ticket: NES-1568
category: ui-bugs
module: journeys-admin
problem_type: 'ui_bug'
severity: medium
root_cause: logic_error
resolution_type: code_fix
tags:
  - video-block
  - audio-language
  - drawer
  - apply-button
  - on-select
  - should-close-drawer
  - journey-builder
  - mui
symptoms:
  - 'Clicking Apply in the language picker dismissed the picker but did not commit the new language to the video block'
  - 'Users had to click Select in the Video Details panel as a redundant second step to actually persist the language change'
  - 'After clicking Select, the outer Video Library browse list (Library / YouTube / Upload tabs) was visible underneath, looking like the UI was asking for a different video'
components:
  - 'apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLibrary.tsx'
  - 'apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLanguage/VideoLanguage.tsx'
  - 'apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails.tsx'
  - 'apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoDetails/VideoDetails.tsx'
---

# Apply button in language picker is a dead-end action that strands the user in the Video Library drawer

## Problem

When a Journey Builder user changed the audio language of an existing JF Internal video block, the language picker's **Apply** button only dismissed the picker — it didn't commit the change. The user then had to click **Select** in the Video Details panel as a second confirmation, which (a) felt redundant and (b) exposed the underlying Video Library browse list, making it look like the UI was asking them to pick a different video. Reported by Lucinda while preparing 34 World Cup journey translations, where this two-click dead-end multiplied across every translation.

## Symptoms

- Clicking Apply closed only the language picker drawer; the new language was not persisted.
- After Apply, the user landed on the Video Details panel with the _outer_ Video Library browse list visible behind it.
- Persisting the change required a second click on **Select** — undocumented and not signalled by the UI.
- The flow was perceived as broken even after Select, because the browse list flashed underneath before the user manually closed it.

## What Didn't Work

**Attempt 1 — Surface fix on Select (PR #9043, closed).** Closed the outer Video Library drawer when the user clicked **Select**. This hid the jarring browse-list flash but left the underlying problem in place: Apply was still a dead-end action, Select was still a redundant second click. Treated the symptom (drawer visibility) without addressing the root cause (Apply not committing). Closed in favour of the chosen approach once we agreed Apply itself was the wrong shape.

**Attempt 2 — Inline Popover redesign (PR #9090, parked for QA-221).** Replaced the side-drawer language picker with an MUI `Popover` anchored to the language Chip — closer to the broader [QA-221](https://linear.app/jesus-film-project/issue/QA-221) redesign goal. In practice, disproportionate complexity for a bug fix: an Apollo refetch in a `useEffect` could overwrite the staged language before commit; the popover's `anchorEl` could unmount mid exit-transition causing positioning glitches; and `LocalDetails` ran in a dual-mode (drawer-or-popover) shape that was hard to test. Parked as a QA-221 prototype rather than the NES-1568 fix.

## Solution

Make **Apply** the commit affordance. The same `onSelect` chain that **Select** uses now fires on Apply, and the chain closes all three drawers — language picker, Video Details, Video Library — returning the user to the video properties panel. Outer-drawer close is gated on a `shouldCloseDrawer` parameter so background callers (MUX upload completion) can keep the library open, and so the Trash/Clear-Video icon can keep the library open while the user picks a replacement.

**`VideoLanguage.tsx`** — add an optional `onApply` prop; fall back to `onClose` when not supplied.

```tsx
interface VideoLanguageProps {
  // ...
  onClose: () => void
  onChange: (language: LanguageOption) => void
  onApply?: () => void // commits + closes when provided
}

const handleApplyClick = (): void => {
  if (onApply != null) {
    onApply()
    return
  }
  onClose()
}
// ...
;<Button onClick={handleApplyClick}>{t('Apply')}</Button>
```

**`LocalDetails.tsx`** — extract `commitSelection` so both Select and Apply share one commit path; wire `handleApplyLanguage` to `VideoLanguage.onApply`.

```tsx
const commitSelection = (language: LanguageOption): void => {
  onSelect({
    videoId: id,
    videoVariantLanguageId: language?.id,
    duration: time,
    source: VideoBlockSource.internal,
    startAt: videoBlock?.videoId === id ? videoBlock?.startAt : 0,
    endAt: videoBlock?.videoId === id ? videoBlock?.endAt : time
  })
}

const handleSelect = (): void => commitSelection(selectedLanguage)

const handleApplyLanguage = (): void => {
  commitSelection(selectedLanguage)
  setOpenLanguage(false)
}

;<VideoLanguage
  open={openLanguage}
  onClose={() => setOpenLanguage(false)}
  onChange={handleChange}
  onApply={handleApplyLanguage}
  // ...
/>
```

**`VideoLibrary.tsx`** — close the outer drawer at the end of the user-driven commit path, gated on `shouldCloseDrawer`.

```tsx
// in onSelect handler:
if (handleSelect != null) handleSelect(block, shouldFocus)
setOpenVideoDetails(false)
// Close the outer Video Library drawer when select originated from a
// user commit (Select / Apply). Background paths such as MUX upload
// completion pass shouldCloseDrawer=false to keep the library open.
if (shouldCloseDrawer) onClose?.()
```

**`VideoDetails.tsx`** — `handleClearVideo` (trash icon) must NOT close the outer drawer; pass `shouldCloseDrawer=false` explicitly. (This was a regression introduced by the new gate parameter and caught by `ce-code-review`'s correctness persona before merge — see Prevention.)

```tsx
onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) =>
  void (
    // in handleClearVideo:
    onSelect(
      {
        videoId: null,
        videoVariantLanguageId: null,
        posterBlockId: null,
        source: VideoBlockSource.internal,
        startAt: null,
        endAt: null
      },
      false
    )
  )
```

## Why This Works

The original bug wasn't a missing close-drawer call — it was that **Apply was a dead-end action**. The picker offered two terminal-looking buttons (Apply, Select) but only one (Select) actually committed. Routing Apply through the same `onSelect` pipeline as Select collapses a two-click flow into one and removes the conceptual ambiguity between the two affordances.

Gating outer-drawer close on `shouldCloseDrawer` rather than always closing keeps a single `onSelect` handler usable by two distinct caller classes:

- **Terminal user actions** (Apply, Select, YouTube/MUX Select) — `shouldCloseDrawer=true` (the default), tear the whole stack down and return the user to the properties panel.
- **Non-terminal callers** (background MUX upload completion; trash/clear-video) — `shouldCloseDrawer=false`, commit the state change but leave the Library open so the user keeps their place.

One handler, one parameter, two correct behaviours — instead of duplicating the commit logic per caller.

## Prevention

**Audit every caller — including intermediate wrappers — when adding a behavioural gate parameter.** The MUX upload caller correctly opted out of outer-close with `shouldCloseDrawer=false`, but two callers were missed in the first pass:

- The trash-icon `handleClearVideo` caller in `VideoDetails.tsx` would have unexpectedly closed the outer Video Library drawer when a user just wanted to clear the current video. `ce-code-review`'s correctness persona caught this before merge.
- A `handleSelect` wrapper at `VideoDetails.tsx:87-89` silently dropped the new arg (`onSelect(block)` instead of `onSelect(block, shouldCloseDrawer)`). The type system didn't complain because the narrower function is assignable to the wider signature. Caught in PR review by Siyang.

**Watch for latent bugs that become reachable when a no-op action is promoted to a commit action.** A separate `getVideoVariantLanguage` helper returned the closed-over `id` prop (the video id) as `LanguageOption.id` instead of `videoVariant.id`. Pre-PR this was harmless because Apply was a no-op — the user always picked a fresh language via the autocomplete (which produced a properly-shaped `LanguageOption`) before Select would commit. Post-PR, Apply commits, which made the buggy path reachable: opening the picker on an existing video block and clicking Apply without changing anything would commit `videoVariantLanguageId` equal to the video id. Dormant bugs in the downstream code path of an affordance can become live the moment the affordance changes shape — when promoting an action from "dismiss" to "commit", scan the data shapes the new commit path now carries.

**Propagate the new type signature through every intermediate layer, not just the endpoints.** The optional `shouldCloseDrawer` parameter was added to `VideoLibrary.onSelect` and `VideoDetails.onSelect`, but `VideoFromLocal`, `VideoFromYouTube`, `VideoList`, and `VideoListItem` continued to type their `onSelect` prop as `(block) => void`. TypeScript didn't complain because the narrower function is assignable, but it meant callers reaching `VideoLibrary.onSelect` through those layers literally could not opt out of closing the drawer. Widen the type at every layer so the contract matches reality at the entry, the exit, and every wrapper in between.

**Suggested regression-test pattern.** When a parameter gates a side effect, write a unit test that asserts on the parameter value at each call site:

```tsx
// Trash icon must keep the outer drawer open
fireEvent.click(getByRole('button', { name: 'clear-video' }))
expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ videoId: null }), false)

// Apply / Select must close the outer drawer
fireEvent.click(getByRole('button', { name: 'Apply' }))
expect(onSelect).toHaveBeenCalledWith(
  expect.objectContaining({ videoId: '...' }),
  true // or omit and let it default
)
```

**Cheap heuristic.** Any time a function signature gains an optional flag, grep every caller of that function in the same PR and explicitly justify (in code or test) which flag value each caller uses and why. The diff that adds the flag should also touch every call site, even if just to confirm the default is correct.

**On UI bugs that look like layout problems.** When users describe a UI bug as "X drawer pops up" or "Y panel appears unexpectedly", consider whether the root cause is **a button doing the wrong thing** rather than **a panel not closing**. The first instinct here was to fix the visible drawer (PR #9043). The actual fix was to make the button commit. Bug reports describe the visible symptom — not always the operational cause.

## Related Issues

- [NES-1568](https://linear.app/jesus-film-project/issue/NES-1568) — this fix.
- [QA-221](https://linear.app/jesus-film-project/issue/QA-221) — broader redesign of the language picker (replace side drawer with inline popover). Prototype lives in PR #9090, parked.
- PR #9043 — original surface-fix attempt; closed in favour of PR #9089.
- PR #9089 — the fix documented here. Two follow-up commits (`fix: commit matching language id from getVideoVariantLanguage`, `refactor: forward shouldCloseDrawer through onSelect chain`) addressed PR-review feedback from Siyang covering the dormant-bug and contract-honesty insights captured above.
- Sibling docs in `docs/solutions/ui-bugs/` — `mobile-snackbar-blocking-ui-no-dismiss-button.md` shares the "audit every callsite" prevention rule.
