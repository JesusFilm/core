---
title: 'feat: NES-1707 frontend embed picker in CollectionDialog + multi-type public renderer'
type: feat
status: active
date: 2026-06-02
deepened: 2026-06-02
origin: https://linear.app/jesus-film-project/issue/NES-1707
---

# feat: NES-1707 frontend embed picker in CollectionDialog + multi-type public renderer

## Summary

Restore and expand the gallery-page embed editing surface that NES-1682 hid. Replace the admin `mediaUrl: string` flow with a typed picker (Mux upload / Canva / YouTube) backed by a tagged `media` form union, wire it to the new `TemplateGalleryPageMediaInput` GraphQL surface (already shipped by NES-1706 on this branch's parent commit), add a live preview pane, and rewrite the public `TemplateGalleryMedia` renderer to dispatch on `media.type`. Visuals stay intentionally plain per the ticket; the maintainer iterates on polish later.

---

## Problem Frame

NES-1682 commented out the "Add PDF/Video with instructions" `TextField` at `CollectionDialog.tsx` and the preview's Strategy block, leaving the form round-tripping a `mediaUrl: string` with no editing surface. The public renderer still reads `gallery.mediaUrl` through the shared `StrategySection` (single iframe, hard-coded Canva/Slides rewriting). NES-1706 (backend) replaced this with a 1:1 `TemplateGalleryPageMedia` model and a discriminated `TemplateGalleryPageMediaInput`, server-validating/normalizing Canva (oEmbed), YouTube (oEmbed), Google Slides, and Mux, and **deprecated** `mediaUrl`. This plan is the frontend half: expose the picker and render all types on the public page.

---

## Requirements

- R1. Admin CollectionDialog shows a type picker (Mux / Canva / YouTube) replacing the NES-1682 comment block. Google Slides is NOT in the picker.
- R2. Mux upload: file picker, progress UI, processing indicator; Save gated until the upload is durably ready (the persisted Formik `media.muxVideoId` is set via `onComplete`, with live `status` not in `waiting|uploading|processing|error`); cancel/retry works. NOTE: `UploadTask` has no `readyToStream` field and is deleted ~1s after completion — readiness is derived from the captured `muxVideoId`, not from the task.
- R3. Canva URL input with inline "Anyone with the link" helper copy; backend errors surfaced on the field.
- R4. YouTube URL input accepting all common shapes (validated server-side); backend errors surfaced on the field.
- R5. `useCollectionForm` carries a tagged `media` object (`'none' | 'mux' | 'link'`); legacy `mediaUrl` is removed from form values.
- R6. Save-diff emits `media` in the mutation input only when it differs from persisted state; `media: null` clears it.
- R7. Preview pane shows a live preview mirroring the public renderer for the chosen type.
- R8. Public `TemplateGalleryMedia` dispatches on `media.type` — Mux player for `mux`, host-specific iframes for `link`.
- R9. Public page query selects `media { id type embedUrl muxPlaybackId }` instead of `mediaUrl`.
- R10. Legacy rows (only `mediaUrl` set, no `media` row) render nothing on the public page and present as empty (`{ type: 'none' }`) in the dialog.
- R11. Shared `StrategySection` is not modified.
- R12. Switching picker type clears the prior selection's value from form state.
- R13. Visuals remain intentionally plain — no custom CSS, no decorative work.
- R14. Public `TemplateGalleryMedia` renders Google Slides embeds (`docs.google.com`) when a `link` row's `embedUrl` is a Slides URL. The backend stores/normalizes Slides even though the admin picker does not expose it (R1); the renderer must not break on Slides-typed legacy/admin-stored rows.

**Origin actors:** A1 (collection publisher / admin author), A2 (public gallery viewer).
**Origin flows:** F1 (author attaches Mux/Canva/YouTube media and saves), F2 (viewer loads public gallery page and sees the embed), F3 (author edits a legacy collection — empty media slot, no crash).

---

## Scope Boundaries

- Google Slides admin **picker** option (backend accepts it; not exposed in v1). Note: the public **renderer** does support Slides `link` rows (R14) — only the admin picker UI is out.
- PDF (out of NES-1704).
- Beta-mode toggle, "point-toward-beta" popup, onboarding tour (separate ticket pair).
- Visual polish, micro-interactions, custom styling (maintainer's follow-up pass).
- Legacy `mediaUrl` data cleanup / backfill (deferred).
- All backend work (NES-1706, already landed).

### Deferred to Follow-Up Work

- Coordination with NES-1694 (public-page restyle, in review): if NES-1694 merges first, the v2 renderer drops into the new layout; otherwise leave room for the restyle to re-flow. Tracked separately — do not block on it.

---

## Context & Research

### Relevant Code and Patterns

- **Backend GraphQL contract (already shipped, this branch):** `apis/api-journeys-modern/schema.graphql` — `TemplateGalleryPage.media: TemplateGalleryPageMedia`; `TemplateGalleryPageMedia { id, type: link|mux, embedUrl, muxPlaybackId }`; `TemplateGalleryPageMediaInput { type, url, muxVideoId }`. Admin input types already generated in `apps/journeys-admin/__generated__/globalTypes.ts` (`TemplateGalleryPageMediaInput`, `TemplateGalleryPageMediaType`).
- **Form/submit/diff:** `apps/journeys-admin/.../CollectionDialog/useCollectionForm/useCollectionForm.ts` — `CollectionFormValues`, `buildSchema`, `handleSubmit` (create input build + edit diff at lines 250–252), error mapping at lines 322–333.
- **Dialog media section:** `apps/journeys-admin/.../CollectionDialog/CollectionDialog.tsx` — `SECTION_HEADER` pattern, NES-1682 comment block ~line 385/520; `CollectionPreviewPane` mounted at line 231 with `values={values}`.
- **Preview pane:** `apps/journeys-admin/.../CollectionDialog/CollectionPreviewPane/CollectionPreviewPane.tsx` — `CollectionPreviewValues`, mobile card, NES-1682 hidden Strategy block at line 381.
- **Mux upload:** `apps/journeys-admin/src/components/MuxVideoUploadProvider/MuxVideoUploadProvider.tsx` — `useMuxVideoUpload()` exposes `addUploadTask(key, file, langCode?, langName?, onComplete(videoId))`, `getUploadStatus(key)`, `cancelUploadForBlock`. Provider is mounted **only inside the Editor** (`Editor.tsx:56`), NOT app-wide. Best UI reference: `apps/journeys-admin/.../VideoLibrary/VideoFromMux/AddByFile/AddByFile.tsx`.
- **Mux public render pattern:** `libs/journeys/ui/src/components/Video/Video.tsx:278` and `.../TemplateVideoPlayer/TemplateVideoPlayer.tsx:115` use **video.js** with an HLS source `https://stream.mux.com/<playbackId>.m3u8`. Thumbnails available via `https://image.mux.com/<playbackId>/thumbnail.jpg`. No `@mux/mux-player` dependency exists (`@mux/mux-node`, `@mux/upchunk`, `video.js` only).
- **Public renderer + query:** `apps/journeys/src/components/TemplateGalleryView/TemplateGalleryMedia/TemplateGalleryMedia.tsx` (reads `mediaUrl`, renders `StrategySection`); `apps/journeys/src/libs/getTemplateGalleryPage/getTemplateGalleryPage.ts`; `apps/journeys/.../TemplateGalleryView.tsx:20,28` (`hasMedia`/pass-through); fixture `apps/journeys/.../galleryFixture.ts:49`.
- **Admin mutation docs:** `apps/journeys-admin/src/libs/useTemplateGalleryPageCreateMutation/...ts` and `useTemplateGalleryPageUpdateMutation/...ts` — both currently select `mediaUrl` in the response.

### Institutional Learnings

- `project_nes1706_doppler_embed_hosts` — `TEMPLATE_LIBRARY_EMBED_HOSTS` secret is dev-only; must be added to stage + prod before deploy. Frontend cannot validate hosts (server does); but QA on stage will fail for new hosts until the secret is set.
- `project_intra_lib_imports` — inside an Nx lib import siblings with relative paths, not `@core/*`.
- `feedback_i18n_extract_command` — don't hand-edit locale JSONs; run the extract-translations Nx target so `t()` calls are the source of truth. All new copy must go through `t()`.

### External References

- YouTube embed reference: https://support.google.com/youtube/answer/171780
- Canva embed help: https://www.canva.com/help/embed-designs/ (recommended `padding-top: 56.2225%` aspect-ratio wrapper, `allow="fullscreen"`).

---

## Key Technical Decisions

- **Mux is rendered with the existing video.js + `stream.mux.com/<playbackId>.m3u8` pattern, NOT a new Mux Player web component.** The ticket suggests the "Mux Player web component," but no such dependency exists in the repo; the established public pattern is video.js HLS (`Video.tsx:278`). Following the repo pattern avoids a new dependency and matches watch/editor consistency in practice. For processing/preview states a static `image.mux.com/<playbackId>/thumbnail.jpg` is acceptable.
- **The media save-diff lives in `useCollectionForm.handleSubmit`, not `useCollectionMutations`.** The ticket references `useCollectionMutations`, but that hook only owns publish/unpublish/delete. The create-input build (line ~225) and edit-diff (lines 250–252) for media are in `useCollectionForm`. This is where R6 is implemented.
- **Backend media errors carry `extensions.reason`, not `extensions.field`.** The existing error mapping (lines 322–333) keys on `extensions.field` and a `FIELD_ERROR_KEYS` set; media validation errors throw `BAD_USER_INPUT` with a structured `reason` (`YOUTUBE_PRIVATE`, `CANVA_UNAVAILABLE`, `MEDIA_INPUT_SHAPE_MISMATCH`, etc.). A new `reason → human message` map must surface these on the media field, separate from the existing `field`-based path.
- **All link types submit as `{ type: 'link', url }`.** The picker (Canva vs YouTube) only chooses which input UI + helper copy to show; the discriminator on submit is always `link`. The backend infers the provider from the URL host.
- **Form union shape:** `type CollectionMediaValues = { type: 'none' } | { type: 'mux'; muxVideoId: string } | { type: 'link'; url: string }`. `mediaUrl` is dropped from `CollectionFormValues` entirely; legacy rows initialize to `{ type: 'none' }`.
- **Provider scoping:** wrap the **whole** CollectionDialog content in `MuxVideoUploadProvider` — it must sit **above** the type-toggle AND above `CollectionPreviewPane`. If the provider lived inside the toggle subtree, switching away from Mux mid-upload would unmount it and silently abort the in-flight upload (its polling/upchunk state is per-instance React state); and the preview pane needs the same context. It is not mounted app-wide (`Editor.tsx:56` only). Use a stable synthetic upload key (e.g. the collection id, or a `useRef`-generated key for create mode) in place of the editor's `videoBlockId`.
- **Mux readiness signal:** `getUploadStatus(key)` returns an `UploadTask` whose only state field is `status: 'waiting'|'uploading'|'processing'|'completed'|'error'` — there is **no** `readyToStream` field, and the task is deleted ~1s after completion. The durable readiness signal is the captured `muxVideoId` written to Formik by `onComplete` (the provider fires `onComplete` only after it has internally confirmed `readyToStream` via its `GetMyMuxVideoQuery` poll). Save-gating reads `media.muxVideoId` plus live `status` (block while `waiting|uploading|processing|error`), never a task `readyToStream`.
- **Preview must not iframe the raw user URL:** the preview pane validates before embedding — require `https:`, parse and check the host against the known embed set, and **client-normalize YouTube** (`watch?v=`/`youtu.be`/`shorts`/`embed`/`live` → `youtube-nocookie.com/embed/<id>`) so the preview matches the public render. Canva needs the server's oEmbed normalization (unavailable client-side), so the Canva preview shows a "Preview available after saving" placeholder rather than a broken iframe. This closes both the broken-preview gap (raw `watch?v=`/share URLs return X-Frame-Options and won't embed) and a client-side injection surface (arbitrary host / `javascript:`/`data:` loaded in the admin app pre-validation).
- **Iframes are sandboxed:** the U5 helper returns a per-host `sandbox` value applied by both the preview (U6) and the public renderer (U8). Without `sandbox`, embedded third-party content can run scripts, open popups, and navigate top-level freely.
- **Full set of backend `reason`s to map** (superset of the ticket text): `CANVA_UNAVAILABLE`, `EMBED_HOST_BLOCKED`, `EMBED_HOST_NOT_ALLOWED`, `GOOGLE_SLIDES_INVALID_URL`, `GOOGLE_SLIDES_NOT_PUBLISHED`, `MEDIA_INPUT_SHAPE_MISMATCH`, `MUX_NOT_FOUND`, `MUX_NOT_READY`, `YOUTUBE_INVALID_URL`, `YOUTUBE_PRIVATE`, `YOUTUBE_UNAVAILABLE`. Provide a sensible generic fallback for any unmapped reason.

---

## Open Questions

### Resolved During Planning

- Which hook owns media diff? → `useCollectionForm.handleSubmit` (not `useCollectionMutations`).
- How are media errors shaped? → `extensions.reason` on a `BAD_USER_INPUT` GraphQLError; no `field`.
- Which Mux renderer? → existing video.js HLS pattern; no new web component.
- Is the Mux provider available to the dialog? → No; must wrap the dialog subtree.

### Deferred to Implementation

- Cancel API shape: the provider exposes only `cancelUploadForBlock(block: TreeBlock)` (no string-key overload), and `AddByFile.tsx` implements no cancel/retry. At implementation, decide whether to call cancel with a minimal `{ id: uploadKey } as TreeBlock` shim or add a `cancelUploadByKey(key)` overload to the provider — confirm the chosen approach against `cancelUploadForBlock.ts` (reads `block.id`).
- Whether NES-1694's restyle has merged — branch off current state; re-flow only if it lands first.
- Debounce interval for the live URL preview (start ~500ms; tune during manual QA).

---

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

```
CollectionDialog (wrapped in MuxVideoUploadProvider)
  └─ MediaSection (U3)
       ├─ ToggleButtonGroup: [ Video upload | Canva | YouTube ]   (picker → form.media.type UI mode)
       ├─ type=mux  → MuxUploadField  → useMuxVideoUpload(): addUploadTask(key,file,_,_,onComplete)
       │                                onComplete(videoId) ⇒ setFieldValue media={type:'mux',muxVideoId}
       │                                Save gated on persisted media.muxVideoId (durable) + live status≠in-flight/error
       ├─ type=link(Canva)  → TextField + helper copy  ⇒ media={type:'link',url}
       └─ type=link(YouTube)→ TextField                 ⇒ media={type:'link',url}
  └─ CollectionPreviewPane (U6): mirrors public renderer from form.media
       (link: https+host-gate, client-normalize YouTube, Canva→"preview after save"; debounced)
  (MuxVideoUploadProvider wraps the WHOLE dialog content — above the toggle AND the preview pane)

useCollectionForm (U1/U2): CollectionFormValues.media: CollectionMediaValues
  initialValues: collection.media ? toFormMedia(media) : {type:'none'}
  submit: diff(form.media, persisted.media) ⇒ input.media = {type,url|muxVideoId} | null | omit
  error: extensions.reason ⇒ mediaErrorMessage(reason) ⇒ setFieldError('media', msg)

Public: getTemplateGalleryPage (U7) selects media{id type embedUrl muxPlaybackId}
  TemplateGalleryView → TemplateGalleryMedia (U8) dispatch on media.type:
     mux  → video.js <video> src=stream.mux.com/<muxPlaybackId>.m3u8
     link → <iframe src=embedUrl> with host-derived allow attrs (U5 shared helper)
```

A small shared helper (U5) derives iframe `allow`/wrapper attributes from the embed URL host, consumed by both the preview pane (U6) and the public renderer (U8) so the two surfaces cannot drift.

---

## Implementation Units

- U1. **Form media union: reshape `CollectionFormValues` + schema + initial values**

**Goal:** Replace `mediaUrl: string` with `media: CollectionMediaValues` across the form's type, Yup schema, and `initialValues`; map legacy rows to `{ type: 'none' }`.

**Requirements:** R5, R10, R12

**Dependencies:** None

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.ts`
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.spec.tsx`

**Approach:**

- Define and export `CollectionMediaValues` tagged union. Add `media` to `CollectionFormValues`; remove `mediaUrl`.
- `buildSchema`: replace the `mediaUrl` string rule with a Yup `object`/`lazy` discriminated on `type` (`none` | `mux` requires non-empty `muxVideoId` | `link` requires non-empty `url`). Keep validation lenient — the server is the source of truth; the schema only guards "don't submit an empty url/upload".
- `initialValues`: derive from `collection?.media` (the new GraphQL field once U7-admin types regenerate) → `toFormMedia()`; fall back to `{ type: 'none' }` when `media == null` (covers legacy `mediaUrl`-only rows).
- Drop `mediaUrl` from `FIELD_ERROR_KEYS`.

**Patterns to follow:** existing `useMemo(initialValues)` identity-stability comment; existing Yup `buildSchema` structure.

**Test scenarios:**

- Happy path: collection with `media.type==='link'` → `initialValues.media` is `{type:'link',url}`. Covers F1.
- Happy path: collection with `media.type==='mux'` → `{type:'mux',muxVideoId}`.
- Edge case: `collection.media == null` (legacy row) → `{type:'none'}`. Covers F3 / AE.
- Edge case: schema rejects `{type:'link',url:''}` and `{type:'mux',muxVideoId:''}`; accepts `{type:'none'}`.

**Verification:** Form type-checks with no `mediaUrl` references; spec covers the three initial shapes.

---

- U2. **Submit diff + reason-based error surfacing in `handleSubmit`**

**Goal:** Emit `media` in create/update input only when changed (`null` clears, omit when unchanged); map backend `extensions.reason` to a human message on the media field.

**Requirements:** R6, R3, R4

**Dependencies:** U1

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.ts`
- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/mediaErrorMessage.ts` (reason → `t()` message map + fallback)
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.spec.tsx`, `.../mediaErrorMessage.spec.ts`

**Approach:**

- `toInput(media)`: `none → null`; `mux → { type:'mux', muxVideoId }`; `link → { type:'link', url }`.
- Create branch: set `input.media = toInput(values.media)` (or omit when `none` to avoid creating an empty row — `null` and omit are equivalent on create).
- Edit branch: compare `values.media` against `toFormMedia(collection.media)`; only set `input.media` when changed. Changed-to-`none` → `input.media = null` (clear). Unchanged → omit.
- Error path: in the `catch`, read `error.graphQLErrors?.[0]?.extensions?.reason`; if present, `setFieldTouched('media')` + `setFieldError('media', mediaErrorMessage(reason, t))`. Keep the existing `extensions.field` path for slug/title/creatorImageSrc.

**Patterns to follow:** existing per-field diff blocks (lines 235–266); existing ApolloError mapping (322–333).

**Test scenarios:**

- Happy path: unchanged media → `input.media` omitted from update.
- Happy path: `link → none` → `input.media === null`.
- Happy path: new `mux` on create → `input.media === { type:'mux', muxVideoId }`.
- Error path: GraphQLError `reason:'YOUTUBE_PRIVATE'` → media field error renders the private-video message.
- Error path: `reason:'CANVA_UNAVAILABLE'` and `MEDIA_INPUT_SHAPE_MISMATCH` → mapped messages.
- Edge case: unmapped reason → generic fallback message, not a crash.

**Verification:** Diff emits `media` only on change; private-YouTube/Canva errors appear inline on the field, not just as a snackbar.

---

- U3. **CollectionDialog media section: type picker + per-type inputs + Save gating**

**Goal:** Replace the NES-1682 comment block with a `ToggleButtonGroup` picker (Video upload / Canva / YouTube) and per-type inputs; wrap the whole dialog in `MuxVideoUploadProvider`; gate Save on the durable Mux readiness signal. `MuxUploadField` itself is specified in U4 — this unit owns only the integration contract with it.

**Requirements:** R1, R2, R3, R4, R12, R13

**Dependencies:** U1, U2

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/CollectionDialog.tsx`
- Create: `apps/journeys-admin/.../CollectionDialog/MediaSection/MediaSection.tsx` (+ `index.ts`)
- Test: `apps/journeys-admin/.../CollectionDialog/MediaSection/MediaSection.spec.tsx`
- (`MuxUploadField.tsx` + its spec are created in U4, not here.)

**Approach:**

- `MediaSection` reads Formik `values.media` + helpers. A local UI-mode state tracks which of `mux | canva | youtube` is selected (Canva/YouTube both map to `media.type==='link'`).
- **Initial UI-mode inference (edit mode):** on open, derive the tab from `values.media`: `type==='mux'` → Video upload; `type==='link'` → parse the host of `media.url`/`embedUrl` — `youtube-nocookie.com`/`youtube.com`/`youtu.be` → YouTube tab, `canva.com` → Canva tab, anything else (incl. unparseable) → Canva tab as the safe default; `type==='none'` → default to Video upload (or Canva — pick one and assert it).
- `ToggleButtonGroup` with three `ToggleButton`s. **Accessibility:** group gets `aria-label="Media type"`; each `ToggleButton` gets an `aria-label` matching its visible text. State clears **only on explicit activation** (click/Enter/Space `onChange`), never on focus traversal — otherwise a keyboard user tabbing through silently wipes a typed URL (R12 clears state). On change: set UI mode AND clear form media to a fresh empty shape for that mode (`{type:'mux',muxVideoId:''}` / `{type:'link',url:''}`).
- Canva mode: `TextField` bound to `media.url`; helper copy: _"Paste a Canva design link. In Canva: Share → set to Anyone with the link before pasting."_ (via `t()`). Surface `errors.media` as `helperText`.
- YouTube mode: `TextField` bound to `media.url`; helper copy listing accepted shapes; surface `errors.media`.
- Mux mode: render `MuxUploadField` (see U4). Contract: pass the synthetic upload key; receive `onComplete(videoId)` → `setFieldValue('media', {type:'mux',muxVideoId:videoId})`, and an `onReadyStateChange(isReady)` (or equivalent) used for Save-gating.
- **Save gating:** OR a media-not-ready signal into the dialog footer's `disabled` binding (alongside `isSubmitting`/`isUnpublishing`). In Mux mode, Save is disabled until the persisted `media.muxVideoId` is set and the live upload `status` is not `waiting|uploading|processing|error`. (See Key Technical Decisions — there is no task `readyToStream` field.)
- Wrap the whole CollectionDialog content (above the toggle AND above `CollectionPreviewPane`) in `MuxVideoUploadProvider`.
- Match `SECTION_HEADER` typography/spacing; no custom CSS (R13).

**Patterns to follow:** existing `SECTION_HEADER`/`Stack spacing={1}` sections in `CollectionDialog.tsx`; footer disabled-OR pattern from `useCollectionForm` doc comments; repo a11y rule (`aria-label`/keyboard on all interactive elements).

**Test scenarios:**

- Happy path: select Canva → type URL → `media` is `{type:'link',url}`; helper copy present.
- Happy path: select YouTube → type URL → `media.url` updates.
- Edge case: switching Canva→Video upload clears `media.url` (R12); switching back clears `muxVideoId`.
- Edge case (a11y): tabbing focus across toggle buttons does NOT clear state; only activation does. Group/buttons expose `aria-label`s.
- Edge case (edit-mode infer): a saved YouTube row (`embedUrl` host `youtube-nocookie.com`) opens on the YouTube tab; a Canva row opens on the Canva tab.
- Error path: `errors.media` set → rendered as `helperText` under the active input.
- Integration: Mux `onComplete(videoId)` sets `media={type:'mux',muxVideoId}` and Save becomes enabled once ready; Save stays disabled while `status` is in-flight or `error`.

**Verification:** Picker renders three options (no Slides); each input shows/clears correctly on activation only; Save cannot fire with an in-flight or failed Mux upload; edit-mode reopens on the correct tab.

---

- U4. **MuxUploadField: file picker, progress, processing indicator, cancel/retry** _(child of U3, broken out for testability)_

**Goal:** A self-contained upload control over `useMuxVideoUpload` with a stable synthetic key, surfacing progress/processing/error and cancel/retry.

**Requirements:** R2

**Dependencies:** U3 (provider wrap)

**Files:**

- Create: `apps/journeys-admin/.../CollectionDialog/MediaSection/MuxUploadField/MuxUploadField.tsx`
- Test: `.../MuxUploadField/MuxUploadField.spec.tsx`

**Approach:**

- Generate a stable upload key once (`useRef`) — collection id in edit mode, generated id in create mode — in place of the editor's `videoBlockId`.
- File `<input>`/MUI button → `addUploadTask(key, file, undefined, undefined, onComplete)`.
- Read `getUploadStatus(key)` for `status`/`progress`/`error`; render progress bar (`status==='uploading'`), processing indicator (`status==='processing'`), a ready indicator once `onComplete` has fired (the task is deleted ~1s after `completed`, so do NOT rely on reading `status==='completed'` back — capture readiness from `onComplete`), and an error state (`status==='error'`).
- **No fresh-upload thumbnail:** the form holds only `muxVideoId`; `playbackId` (needed for `image.mux.com/...`) is not known until after save. The ready indicator is a confirmation, not a thumbnail. (Edit-mode preview thumbnails come from the persisted `media.muxPlaybackId` in U6.)
- Cancel: call the provider's cancel path; retry: re-add the task. (Confirm exact task fields against `MuxVideoUploadProvider/utils/types.ts`.) Note: `AddByFile.tsx` does not itself implement cancel/retry, so this UI is net-new — model the states on the task `status` enum.
- Readiness signal to the parent (U3): when `onComplete(videoId)` fires, the parent writes `media.muxVideoId`; expose an `onReadyStateChange(isReady)` (or have the parent derive readiness from `media.muxVideoId` + live `status`). Do NOT route per-tick upload progress through Formik state — keep progress local and lift only the boolean ready/in-flight signal, to avoid Formik re-renders on every progress tick.

**Patterns to follow:** `apps/journeys-admin/.../VideoLibrary/VideoFromMux/AddByFile/AddByFile.tsx` (`addUploadTask` + `status`-driven UI; note it has no cancel/retry — those are net-new here).

**Test scenarios:**

- Happy path: choose file → `addUploadTask` called with the synthetic key; progress renders; on complete, `onComplete(videoId)` fires and the ready indicator shows.
- Error path: `status==='error'` → error UI + retry control; retry re-invokes `addUploadTask`.
- Edge case: cancel mid-upload → task cleared, field returns to empty, ready signal false.
- Integration: parent ready signal flips true only after `onComplete`, and false again on a fresh file selection / error.

**Verification:** Upload happy/cancel/retry all work against a mocked provider; readiness is sourced from `onComplete`/`muxVideoId`, not a task `readyToStream` field.

---

- U5. **Shared embed `allow`-attribute helper (host → iframe attrs)**

**Goal:** One pure helper mapping an embed URL host to iframe `allow`/`allowFullScreen`/`referrerPolicy`/`sandbox` and aspect-ratio wrapper needs, reused by preview (U6) and public renderer (U8) so they can't drift.

**Requirements:** R8, R7, R14

**Dependencies:** None

**Files:**

- Create: `libs/journeys/ui/src/components/TemplateGalleryMedia/embedAttrs.ts` — placed in the shared lib (not in `apps/journeys`) so both `apps/journeys` (U8) and `apps/journeys-admin` (U6) import it via `@core/journeys/ui`. Verified: `libs/journeys/ui` has no Nx scope/type tag restricting consumers, so the cross-app import is allowed — there is no boundary fork to resolve.
- Test: `libs/journeys/ui/src/components/TemplateGalleryMedia/embedAttrs.spec.ts`

**Approach:**

- Parse the host from `embedUrl`. Return per-host config including a `sandbox` token string:
  - `youtube-nocookie.com` → `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`, `allowFullScreen`, `referrerPolicy="strict-origin-when-cross-origin"`, `sandbox="allow-scripts allow-same-origin allow-popups allow-presentation allow-fullscreen"`, wrapper `16/9`.
  - `canva.com` → `allow="fullscreen"`, `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-fullscreen"`, wrapper `padding-top: 56.2225%`.
  - `docs.google.com` (Slides, R14) → same `allow`/wrapper as Canva; `sandbox="allow-scripts allow-same-origin allow-popups allow-fullscreen"`.
  - default/unknown allowlisted host → minimal `allow`, most-restrictive `sandbox="allow-scripts allow-same-origin"`, 16/9 wrapper.
- Validate the chosen `sandbox` tokens don't break the functional embed (especially Canva interaction) when implementing.

**Patterns to follow:** small pure-function + table; `project_intra_lib_imports` (relative sibling imports inside the lib, not `@core/*`).

**Test scenarios:**

- Happy path: youtube-nocookie host → expected `allow` string + `referrerPolicy` + `sandbox`.
- Happy path: canva.com → `allow="fullscreen"` + 56.2225% wrapper flag + Canva `sandbox`.
- Edge case: docs.google.com → Slides config (Canva-equivalent allow/wrapper, R14).
- Edge case: unknown host / unparseable URL → safe default + most-restrictive `sandbox`, no throw.

**Verification:** Helper returns correct attrs (incl. `sandbox`) per host; both consumers import the same source.

---

- U6. **CollectionPreviewPane: live media preview mirroring the public renderer**

**Goal:** Replace the hidden Strategy block with a live preview driven by `values.media`: Mux thumbnail/player for `mux`, iframe (via U5 attrs) for `link`; debounced for URL typing.

**Requirements:** R7, R10, R13

**Dependencies:** U1, U5

**Files:**

- Modify: `apps/journeys-admin/.../CollectionDialog/CollectionPreviewPane/CollectionPreviewPane.tsx`
- Test: `apps/journeys-admin/.../CollectionDialog/CollectionPreviewPane/CollectionPreviewPane.spec.tsx`

**Approach:**

- Change `CollectionPreviewValues` from `mediaUrl: string` to `media: CollectionMediaValues` (parent already passes `values`). In edit mode the persisted `media.muxPlaybackId` must also reach the pane (thread it via the parent) so a `mux` row can show a real thumbnail.
- `none` → render nothing (no Strategy label).
- `mux` → **edit-only thumbnail:** when a persisted `media.muxPlaybackId` is available (edit mode), render `image.mux.com/<muxPlaybackId>/thumbnail.jpg`. For a fresh upload the form holds only `muxVideoId` (no `playbackId` until after save), so show a "Processing video…" placeholder through save — do NOT attempt a thumbnail from `muxVideoId`. (Preview does not need the full video.js player.)
- `link` → **validate before embedding:** require `https:`, parse the host and check it against the known embed set; **client-normalize YouTube** (`watch?v=`/`youtu.be`/`/shorts/`/`/embed/`/`/live/`/`m.youtube.com` → `https://www.youtube-nocookie.com/embed/<id>`) so the preview matches the public render and the U5 host map resolves to the YouTube config (not the default branch). For **Canva** (and any host requiring server oEmbed normalization), do not iframe the raw share URL — it returns X-Frame-Options and won't embed; instead show a "Preview available after saving" placeholder. Only render the `<iframe>` (with U5 attrs incl. `sandbox`) for an https URL whose host is in the known set and is directly embeddable (YouTube after normalization). Debounce URL → iframe `src` (~500ms).
- Keep `React.memo`; ensure new `media` prop has stable identity considerations.

**Patterns to follow:** existing preview card structure; `aria-hidden` duplicate-content handling; `embedAttrs` (U5); backend YouTube normalization (`youTubeOEmbed.ts`) for the client-side id-extraction shapes.

**Test scenarios:**

- Happy path: `media.type==='link'` YouTube `watch?v=` URL → normalized to `youtube-nocookie.com/embed/<id>` and iframed with YouTube `allow`/`sandbox`.
- Happy path: `media.type==='link'` Canva share URL → "Preview available after saving" placeholder, NOT a raw iframe.
- Happy path (edit): `media.type==='mux'` with persisted `muxPlaybackId` → thumbnail `img`.
- Edge case: fresh `mux` upload (no `playbackId`) → processing placeholder, no thumbnail request.
- Edge case (security): non-https or non-allowlisted host (e.g. `javascript:`, arbitrary domain) → no iframe; placeholder only.
- Edge case: `media.type==='none'` → no media node rendered.
- Edge case: empty `link` url → no iframe (placeholder only).

**Verification:** Preview updates as the user picks a type / types a URL; YouTube previews live; Canva shows the save-first placeholder; no non-allowlisted URL is ever loaded in the iframe; legacy `none` shows empty slot.

---

- U7. **GraphQL operations: select `media { … }` and reshape inputs; regenerate codegen**

**Goal:** Update all gallery operations (admin create/update responses, admin list query, public page query) to read `media { id type embedUrl muxPlaybackId }` instead of `mediaUrl`; regenerate generated types for both apps.

**Requirements:** R5, R6, R9

**Dependencies:** None to author — but consumed by U1/U2/U6/U8, and **not independently mergeable**: removing `mediaUrl` from selections breaks every consumer that still reads it (e.g. `TemplateGalleryView.tsx:20,28` reads `gallery.mediaUrl`), so U7 must land in the **same PR/commit set** as U1/U2/U6/U8. A standalone U7 commit leaves a red branch.

**Files:**

- Modify: `apps/journeys-admin/src/libs/useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.ts`
- Modify: `apps/journeys-admin/src/libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation.ts`
- Modify: `apps/journeys-admin/src/libs/useTemplateGalleryPagesQuery/useTemplateGalleryPagesQuery.ts` (and the `GetTemplateGalleryPages` fragment/shape consumed by `useCollectionForm`)
- Modify: `apps/journeys-admin/src/libs/useTemplateGalleryPageReorderTemplateMutation/useTemplateGalleryPageReorderTemplateMutation.ts` (+ `.mock.ts`) — also selects `mediaUrl` today (line ~36)
- Modify: `apps/journeys-admin/src/libs/useTemplateGalleryPageAssignJourneyMutation/useTemplateGalleryPageAssignJourneyMutation.ts` (+ `.mock.ts`) — also selects `mediaUrl` today (line ~41)
- Modify: `apps/journeys/src/libs/getTemplateGalleryPage/getTemplateGalleryPage.ts`
- Modify (regenerated, do not hand-edit): `apps/journeys-admin/__generated__/*`, `apps/journeys/src/**/__generated__/*` as produced by the Nx graphql codegen target
- Modify: remaining mutation/query mock files under `apps/journeys-admin/src/libs/.../*.mock.ts` that reference `mediaUrl`

**Approach:**

- Add the `media { id type embedUrl muxPlaybackId }` selection to **every** gallery operation that currently selects `mediaUrl` (create, update, list, reorder, assignJourney, public page); remove `mediaUrl` from the selections (legacy rows return `media == null`, which R10 maps to "render nothing"/`{type:'none'}`).
- Run the repo's GraphQL codegen Nx target for `api-journeys`/apps (per `docs/solutions` and `653cf8873` Prisma 7 + Nx codegen notes — use `--skip-nx-cache` to avoid stale-type cache hits) to regenerate operation types and `globalTypes`. Do not hand-edit generated files.
- Update the `TemplateGalleryPage` fragment type imported by `useCollectionForm` so `collection.media` is typed.

**Execution note:** Primarily a contract+codegen change. It is the seam the typed consumers compile against, but it cannot merge alone (see Dependencies) — sequence it first within the combined PR so U1/U2/U6/U8 compile against real generated types rather than hand-written shims.

**Patterns to follow:** existing operation docs; the Nx codegen workflow captured in `docs/plans/2026-05-29-001-feat-nes-1706-backend-embed-section-plan.md` and commit `653cf8873`.

**Test scenarios:** `Test expectation: none — codegen + selection-set change.` Behavior is exercised through U1/U2/U6/U8 specs and their updated mocks. (Verify `npx tsc`/build passes and no `mediaUrl` references remain in non-deprecated paths.)

**Verification:** Codegen output includes `media` on the gallery types; all consuming specs compile; mocks updated.

---

- U8. **Public `TemplateGalleryMedia` v2: dispatch on `media.type`; drop `StrategySection`**

**Goal:** Rewrite the public renderer to read `gallery.media` and dispatch — Mux via video.js HLS, `link` via iframe with U5 host attrs — and stop importing `StrategySection`. Update `TemplateGalleryView` pass-through + fixture.

**Requirements:** R8, R9, R10, R11, R13, R14

**Dependencies:** U5, U7

**Files:**

- Modify: `apps/journeys/src/components/TemplateGalleryView/TemplateGalleryMedia/TemplateGalleryMedia.tsx`
- Modify: `apps/journeys/src/components/TemplateGalleryView/TemplateGalleryView.tsx` (pass `gallery.media`; recompute `hasMedia` from `media != null`)
- Modify: `apps/journeys/src/components/TemplateGalleryView/galleryFixture.ts` (add `media` cases: mux, link-youtube, link-canva, link-slides, null)
- Test: `apps/journeys/src/components/TemplateGalleryView/TemplateGalleryMedia/TemplateGalleryMedia.spec.tsx`, `apps/journeys/.../TemplateGalleryView.spec.tsx`

**Approach:**

- Props become `media: TemplateGalleryPageMedia | null`. `null` → render nothing (covers legacy rows, R10).
- `media.type==='mux'` → render the existing video.js mux pattern from `media.muxPlaybackId` (`stream.mux.com/<playbackId>.m3u8`), mirroring `TemplateVideoPlayer`. Consider reusing/extracting that player; do not modify shared components beyond what's safe.
- `media.type==='link'` → `<iframe src={media.embedUrl}>` wrapped per U5 attrs **including `sandbox`** (aspect-ratio wrapper for Canva/Slides, full `allow` for YouTube). `embedUrl` is the server-normalized URL, so no client-side normalization is needed here (unlike the preview). Slides (`docs.google.com`) renders through the same `link` branch (R14).
- Remove the `StrategySection` import (do NOT modify `StrategySection` itself — R11).

**Patterns to follow:** `libs/journeys/ui/.../TemplateVideoPlayer/TemplateVideoPlayer.tsx` (video.js + m3u8); `embedAttrs` (U5).

**Test scenarios:**

- Happy path: `media.type==='link'` (youtube-nocookie embedUrl) → iframe with YouTube `allow` + `referrerPolicy` + `sandbox`. Covers F2.
- Happy path: `media.type==='link'` (canva.com) → iframe in 56.2225% wrapper, `allow="fullscreen"` + Canva `sandbox`.
- Happy path: `media.type==='link'` (docs.google.com Slides embedUrl) → iframe with Slides config. Covers R14.
- Happy path: `media.type==='mux'` → video element sourced from `stream.mux.com/<muxPlaybackId>.m3u8`.
- Edge case: `media == null` (legacy row) → renders nothing. Covers F3.
- Regression: `StrategySection` no longer imported/rendered here.

**Verification:** All types (mux / YouTube / Canva / Slides) render correctly on the public page; legacy rows render nothing; iframes carry `sandbox`; `StrategySection` untouched.

---

## System-Wide Impact

- **Interaction graph:** `CollectionDialog` Formik `values` flow into both `MediaSection` (edit) and `CollectionPreviewPane` (preview) — both must consume the new `media` shape. The dialog footer's `disabled` binding gains a Mux-upload gate (OR with `isSubmitting`/`isUnpublishing`).
- **Error propagation:** media errors arrive as `BAD_USER_INPUT` GraphQLErrors with `extensions.reason`; mapped to inline field errors (U2) rather than only snackbars.
- **State lifecycle risks:** in-flight Mux uploads must block Save (via persisted `muxVideoId` + live `status`, not a task `readyToStream`); the `MuxVideoUploadProvider` must sit above the type-toggle so switching type mid-upload does not unmount it and abort the upload; switching picker type must clear stale values (no leftover `url` when submitting `mux`); cancel must fully reset upload state.
- **API surface parity:** every gallery operation that selected `mediaUrl` (create, update, list, public page, and their mocks) must switch to `media { … }`; missing one leaves a stale `mediaUrl` read.
- **Integration coverage:** Mux `onComplete → muxVideoId → submit → public muxPlaybackId render` crosses the upload provider, Formik, the mutation, and the public renderer — exercise end-to-end in manual QA.
- **Unchanged invariants:** shared `StrategySection` (still used by the template editor) is not modified; `mediaUrl` remains in the schema as deprecated for legacy rows but is no longer read/written by the new UI.

---

## Risks & Dependencies

| Risk                                                                                                       | Mitigation                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TEMPLATE_LIBRARY_EMBED_HOSTS` is dev-only — Canva/YouTube/Slides validation fails on stage/prod until set | Per `project_nes1706_doppler_embed_hosts`, add the secret to stage + prod before QA/deploy; flag to maintainer.                                                                                                                                                                                                                                                                        |
| Ticket says "Mux Player web component" but repo has no such dep                                            | Use the existing video.js HLS pattern (Key Decision); call it out in the PR so reviewers expect video.js, not `@mux/mux-player`.                                                                                                                                                                                                                                                       |
| Codegen drift / unrelated regenerated diffs (Prisma 7 + Nx, per `653cf8873`)                               | Run the documented codegen target only; review generated diffs to ensure they're scoped to the new `media` field.                                                                                                                                                                                                                                                                      |
| Cross-app shared `embedAttrs` placement                                                                    | Placed in `libs/journeys/ui` (no Nx tag restricts consumers — verified), imported by both apps via `@core/journeys/ui`. Single source prevents preview/public drift.                                                                                                                                                                                                                   |
| MuxVideoUploadProvider keyed by `videoBlockId`, not a dialog concept                                       | Use a stable synthetic key (collection id / generated ref); readiness derives from `onComplete`/`muxVideoId`, not a task `readyToStream` field (which doesn't exist).                                                                                                                                                                                                                  |
| Preview iframe could load a client-typed URL pre-validation                                                | Preview only iframes https + allowlisted + directly-embeddable URLs (YouTube normalized client-side); Canva shows a save-first placeholder; all iframes carry `sandbox` (U5).                                                                                                                                                                                                          |
| Public page embeds third-party iframes / is itself embeddable                                              | Defense-in-depth (low-confidence, defer if Next.js headers already cover it): consider a `Content-Security-Policy` `frame-src` allowlist + `frame-ancestors` on the public gallery page; guard `muxPlaybackId` against a strict format regex before interpolating into `stream.mux.com/<id>.m3u8`. Confirm whether existing `apps/journeys` CSP headers already constrain `frame-src`. |
| NES-1694 restyle may merge first and re-flow this component                                                | Keep `TemplateGalleryMedia` self-contained; coordinate timing; re-flow only if NES-1694 lands first.                                                                                                                                                                                                                                                                                   |

---

## Documentation / Operational Notes

- Run the i18n extract-translations Nx target after adding `t()` copy (helper text, error messages) — do not hand-edit locale JSONs (`feedback_i18n_extract_command`).
- Before merging the frontend branch: confirm `TEMPLATE_LIBRARY_EMBED_HOSTS` exists in stage + prod Doppler.
- Branch workflow (per maintainer): frontend work lives on `siyangcao/nes-1707-...` (already created off backend HEAD); the final PR should contain only frontend changes — backend (NES-1706) ships first.

---

## Sources & References

- **Origin issue:** [NES-1707](https://linear.app/jesus-film-project/issue/NES-1707)
- Backend sibling: [NES-1706](https://linear.app/jesus-film-project/issue/NES-1706) — commit `be07bbace`; plan `docs/plans/2026-05-29-001-feat-nes-1706-backend-embed-section-plan.md`
- Backend contract: `apis/api-journeys-modern/schema.graphql` (TemplateGalleryPageMedia / …Input / …Type)
- Error reasons: `apis/api-journeys-modern/src/schema/templateGalleryPage/media/*` (`resolveMediaInput.ts`, `youTubeOEmbed.ts`, `canvaOEmbed.ts`, `googleSlidesValidate.ts`, `muxValidate.ts`, `linkValidate.ts`)
- Mux render pattern: `libs/journeys/ui/src/components/Video/Video.tsx:278`, `.../TemplateVideoPlayer/TemplateVideoPlayer.tsx:115`
- Mux upload reference: `apps/journeys-admin/.../VideoLibrary/VideoFromMux/AddByFile/AddByFile.tsx`
- Related: [NES-1694](https://linear.app/jesus-film-project/issue/NES-1694) (public-page restyle), [NES-1682](https://linear.app/jesus-film-project/issue/NES-1682) (hidden the section)
