---
title: "CollectionDialog Mux upload state machine: latch errors, preserve committed values, guard every submit path"
date: 2026-06-08
category: ui-bugs
module: journeys-admin/CollectionDialog
problem_type: ui_bug
component: journeys-admin/TemplateGalleryPageList
symptoms:
  - "Upload error UI disappears ~1s after failure because it derives from a provider task that self-deletes (TASK_CLEANUP_DELAY)"
  - "Save stays permanently disabled with no on-screen reason after a failed upload's error UI is lost"
  - "Enter key submits the form mid-replacement-upload, bypassing the disabled footer buttons and silently dropping the new video"
  - "A failed replacement upload overwrites the committed video value — unrecoverable in create mode (no server row)"
  - "A Publish click short-circuited by a busy guard leaks 'publish' intent into the next plain Save or Enter submit"
root_cause: async_timing
resolution_type: code_fix
severity: high
related_components:
  - MuxVideoUploadProvider
  - useCollectionForm
  - MediaSection
tags:
  - mux-upload
  - state-machine
  - formik
  - async-timing
  - error-latching
  - replacement-upload
  - enter-submit
  - collection-dialog
---

# CollectionDialog Mux upload state machine: latch errors, preserve committed values, guard every submit path

## Problem

In the CollectionDialog media picker (NES-1707), async upload state lives in the shared `MuxVideoUploadProvider` task map, which garbage-collects terminal states — errored/completed tasks are deleted ~1s after they finish (`cleanupUploadTask`, `TASK_CLEANUP_DELAY = 1000`). The durable, saveable value lives in Formik form state. Naively wiring the transient provider signal to the form — deriving UI and guards from the task, and overwriting form values on async-start — produced stuck forms, silent data loss, and guards the keyboard path bypassed. Found and fixed across three self-review rounds on PR JesusFilm/core#9282.

## Symptoms

- The upload error UI ("Upload failed. Try another file.") and its action buttons vanished ~1 second after the failure — the provider deleted the errored task out from under the component.
- Save stayed disabled forever with no on-screen reason once the error UI was lost (e.g. after a tab switch), because the form still held an incomplete `{ type: 'mux', muxVideoId: '', muxPlaybackId: null }` value.
- Pressing Enter during a *replacement* upload passed schema validation (the prior `playbackId` was still present), saved mid-upload, closed the dialog, and silently dropped the new video.
- A failed replacement upload in create mode corrupted the committed video: `onUploadStart` had overwritten the form with an empty placeholder, and there was no server row to recover the `muxVideoId` from.
- A Publish click that short-circuited (parent busy / double-submit) left a stale `'publish'` in the intent ref, which the next plain Save or Enter inherited — and published.

## What Didn't Work

- **Adding a Remove button to the error UI** (review round 1) — correct idea, defeated by the provider's `TASK_CLEANUP_DELAY` cleanup: the errored task (and with it the error branch, including the new Remove button) disappeared ~1s after failure, before the user could act.
- **Resetting the submit-intent ref in `finally`** — the early-return guards (`submittingRef`, `parentBusy`) sit *before* the `try` block, so a short-circuited submit returned without ever reaching `finally`, leaking the stale intent.
- **Deriving `errored`/`hasVideo` purely from the transient provider task** — the task map is in-flight progress, not durable state; once GC'd, the derived flags flipped back while the form's real (incomplete) value was no longer reflected anywhere in the UI.

## Solution

Five fixes, one principle: durable state lives in the form / local component; the provider task is only a live "is something happening right now" gate.

**1. Latch terminal error state locally** (`MuxUploadField.tsx`) — the provider GC's errored tasks:

```tsx
const [uploadFailed, setUploadFailed] = useState(false)
const status = task?.status
useEffect(() => {
  if (status === 'error') setUploadFailed(true)
}, [status])
// ...
const errored = status === 'error' || uploadFailed
```

Cleared only on user action (retrying a pick, or the error-state Remove).

**2. Never overwrite a committed form value when a replacement async op starts** (`MediaSection.tsx`) — only a *fresh* upload writes the incomplete placeholder; the in-flight provider task is what gates Save during a replacement:

```tsx
// Empty-string playbackId deliberately counts as "no saved video".
const savedPlaybackId =
  media.type === 'mux' && media.muxPlaybackId != null && media.muxPlaybackId !== ''
    ? media.muxPlaybackId
    : null
const committedVideo =
  media.type === 'mux' && (media.muxVideoId !== '' || savedPlaybackId != null)

// before: onUploadStart overwrote with { muxVideoId: '', muxPlaybackId: savedPlaybackId }
onUploadStart={() => {
  if (!committedVideo) {
    onChange({ type: 'mux', muxVideoId: '', muxPlaybackId: null })
  }
}}
onCancel={() => {
  if (!committedVideo) onChange({ type: 'none' })
}}
```

**3. Guard the form's `onSubmit` with the same predicate as the disabled buttons** (`CollectionDialog.tsx`) — the Enter key submits the form directly, bypassing button `disabled` props:

```tsx
function isMediaBlocked(media: CollectionFormValues['media']): boolean {
  const task = getUploadStatus(uploadKey)
  const inFlight = task?.status === 'uploading' || task?.status === 'processing'
  return (
    inFlight ||
    (media.type === 'mux' &&
      media.muxVideoId === '' &&
      (media.muxPlaybackId == null || media.muxPlaybackId === ''))
  )
}

// Formik — keyboard path:
onSubmit={async (vals, helpers) => {
  if (isMediaBlocked(vals.media)) return
  await handleSubmit(vals, helpers)
}}
// footer buttons — same predicate:
const mediaBlocked = isMediaBlocked(values.media)
```

**4. Read-and-consume one-shot intent refs at function entry, not in `finally`** (`useCollectionForm.ts`):

```tsx
// FIRST lines of handleSubmit — before the early-return guards
const intent = submitIntentRef.current
submitIntentRef.current = 'save'
if (submittingRef.current) return
if (parentBusy) { /* short-circuit with snackbar */ }
// ...later: const shouldPublish = intent === 'publish'
```

**5. Always provide an escape hatch for any blocked state** — error-state Remove clears to `none` (label-accurate even for failed replacements, since the committed video is no longer overwritten), and a hint covers the stuck case where the error UI was lost to cleanup + tab remount:

```tsx
) : media.type === 'mux' ? (
  <Typography variant="caption" color="error">
    {t("This video didn't finish uploading. Remove it or try again.")}
  </Typography>
) : ( /* normal "Click the box to upload" hint */ )
```

## Why This Works

The provider's task map is a *transient signal* — in-flight upload progress, intentionally garbage-collected once terminal. Every bug came from treating it as durable state: as the source of truth for the error UI (vanished on GC), as the trigger to overwrite the form (lost the committed id), and as the only gate the buttons read (keyboard bypassed it). Relocating durable state to the form and latched local state, and reducing the task to an "in flight right now" gate, removes the entire bug class. Equally: a guard that only disables buttons doesn't guard the *operation* — it must sit on the submit handler so buttons, Enter, and programmatic submits all pass through it.

## Prevention

- **Treat provider/task queues as transient.** If a queue deletes terminal entries, never read a final outcome from it after the fact — latch it: `useEffect(() => { if (status === 'error') setFailed(true) }, [status])`, cleared only by explicit user action.
- **Never destructively overwrite a committed value on async-start.** Gate the write (`if (!committedVideo) onChange(placeholder)`); in create flows there is no server row to recover from.
- **Guards belong on the submit handler, not just the buttons.** Extract one predicate and call it from both the `disabled` props and the form's `onSubmit` — Enter submits the form directly.
- **One-shot refs are read-and-consumed at function entry**, before any early-return guard, so short-circuited calls can't leak the value. (Supersedes the `finally`-reset approach in the [formik-intent-ref pattern doc](../design-patterns/formik-intent-ref-multi-button-submit-2026-05-24.md).)
- **Every blocked state needs an escape hatch** the user can see: an enabled Remove plus a one-line explanation of *why* the action is blocked.
- **Write regression tests that simulate the provider cleanup** — mock the status getter returning `null` after an error:
  - `MuxUploadField.spec.tsx` › "keeps the error UI after the provider cleans up the errored task"
  - `useCollectionForm.spec.tsx` › "does not leak a publish intent through a short-circuited submit"
  - `MediaSection.spec.tsx` › "leaves the committed video untouched when a replacement upload starts" / "keeps the committed video when a replacement upload is cancelled" / "writes the incomplete placeholder when a fresh upload starts"

Key files:

- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MuxUploadField/MuxUploadField.tsx`
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MediaSection.tsx`
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/CollectionDialog.tsx`
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.ts`
- `apps/journeys-admin/src/components/MuxVideoUploadProvider/utils/processUpload/cleanupUploadTask.ts` (`TASK_CLEANUP_DELAY = 1000`)

## Related Issues

- [formik-intent-ref-multi-button-submit-2026-05-24.md](../design-patterns/formik-intent-ref-multi-button-submit-2026-05-24.md) — documents the intent-ref + unified-disabled design this work patched; its `finally`-reset and "disabled flag closes the race" claims are superseded by fixes 3 and 4 above.
- [subscription-bridged-dialog-orchestration-nes1637.md](../best-practices/subscription-bridged-dialog-orchestration-nes1637.md) — sibling async-safety patterns for the same dialog family (mounted-ref, guarded close, single-flight).
- [template-gallery-page-collections-patterns-nes1539.md](../best-practices/template-gallery-page-collections-patterns-nes1539.md) — the CollectionDialog pattern catalog this doc extends.
- [safe-third-party-embed-allowlist-and-fail-closed-normalizers-2026-06-03.md](../architecture-patterns/safe-third-party-embed-allowlist-and-fail-closed-normalizers-2026-06-03.md) — the backend half of the same feature (NES-1706).
- JesusFilm/core#8554 — earlier "Mux video uploads on journeys-admin leading to blank video" bug in the same upload subsystem.
- JesusFilm/core#9282 — the PR containing these fixes (review rounds 1–3).
