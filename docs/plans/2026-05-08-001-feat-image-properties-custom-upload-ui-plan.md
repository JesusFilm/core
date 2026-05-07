---
title: "feat: Simplify Image Properties Custom upload UI"
type: feat
status: active
date: 2026-05-08
---

# feat: Simplify Image Properties Custom upload UI

## Summary

Plan two small Media Library Picker UI tickets for the Image Properties Custom tab: remove the low-use URL upload affordance, then fold the file-picker button into the existing dropzone so the upload surface works both by drag-and-drop and by click.

## Requirements

- R1. Remove "Add image by URL" from the Image Properties Custom tab.
- R2. Keep direct device upload available from the Custom tab.
- R3. Redesign the dropzone so "Upload file" is inside the drop area while preserving drag-and-drop behavior.
- R4. Preserve existing accepted image types, 10 MB max-size behavior, loading, success, and error states.
- R5. Keep this work scoped to the existing Image Properties Custom tab; do not introduce broader media history grid, backend, or asset-library behavior.

## Scope Boundaries

- Do not change Gallery, AI, Unsplash, or media-library history-grid behavior.
- Do not refactor image upload business logic into `useImageUpload`; that remains covered by existing tech-debt context.
- Do not add or change backend/API behavior for upload-by-file or upload-by-URL.
- Do not update Media Library Picker team-shared visibility or rollout flag behavior.

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomImage.tsx` composes `ImageUpload`, a divider, and `CustomUrl`.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomUrl/CustomUrl.tsx` owns the "Add image by URL" accordion and `createCloudflareUploadByUrl` mutation.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.tsx` already uses `react-dropzone` with `noClick: true`, a separate `open` callback, and the current "Drop an image here" dropzone plus separate "Upload file" button.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.spec.tsx` covers upload success, loading, error, rejected file type, oversize file, Cloudflare error, and retry behavior.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomImage.spec.tsx` currently asserts the URL accordion opens.

### Institutional Learnings

- No `docs/solutions/` directory or repo-local strategy document was present during planning.

### Linear Context

- Media Library Picker project: reusable uploads picker for reselecting previously uploaded images and videos without re-uploading.
- Project requirement R6: no regression in existing Upload / Unsplash / URL / YouTube / AI flows. For this follow-up, URL removal is an explicit product change, so the no-regression concern applies to the remaining upload, Unsplash, AI, and picker-history surfaces.
- NES-1628 covers image picker history grids for Custom + AI tabs and should remain separate from these UI tweaks.
- ENG-3571 tracks a future `ImageUpload` refactor to `useImageUpload`; keep that refactor out of these tickets.

## Key Technical Decisions

- Split into two tickets: URL removal can land independently from the dropzone redesign, matching the user's request for two individual tickets.
- Remove `CustomUrl` from the Custom tab composition rather than hiding it behind styling or feature flags, because the desired behavior is to remove the unused flow.
- Keep `ImageUpload`'s existing `react-dropzone` upload pipeline and move only the button placement/markup, because the business behavior is already covered and should not be reworked for a UI-only tweak.
- Keep `noClick: true` unless implementation confirms a cleaner equivalent, so clicking non-button space in the dropzone does not accidentally open the file picker if the intended clickable target is the nested button.

## Open Questions

### Resolved During Planning

- Should these be one or two implementation tickets? Two tickets, per user direction.
- Should Linear context influence scope? Yes: this belongs under the Media Library Picker project context, but it should not absorb NES-1628 history-grid work or ENG-3571 upload refactor work.

### Deferred to Implementation

- Exact spacing and responsive values for the nested button: choose values by matching the existing drawer density and verifying desktop/mobile visual fit.
- Whether to delete `CustomUrl` files immediately or leave them temporarily unused: prefer deleting only if no other imports remain after implementation search.

## Implementation Units

### U1. Remove URL Upload From Custom Tab

**Goal:** Remove the "Add image by URL" accordion from the Image Properties Custom tab so the tab focuses on device upload and any separately planned media-history surfaces.

**Requirements:** R1, R5

**Dependencies:** None

**Files:**
- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomImage.tsx`
- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomImage.spec.tsx`
- Potentially delete if unused: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomUrl/CustomUrl.tsx`
- Potentially delete if unused: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomUrl/CustomUrl.spec.tsx`
- Potentially delete if unused: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomUrl/data.ts`
- Potentially delete if unused: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomUrl/index.ts`

**Approach:**
- Remove the `CustomUrl` render path and the visual divider that only separated URL upload from file upload.
- Search for other `CustomUrl` imports before deleting files; delete the component/spec/index only if this Custom tab is the sole consumer.
- Update `CustomImage` test coverage from "opens URL accordion" to "renders upload UI and does not render URL upload affordance."
- Avoid locale cleanup in this ticket unless the repo's translation extraction workflow naturally removes unused strings; translation catalog churn is not needed for behavior.

**Patterns to follow:**
- Existing component composition in `CustomImage.tsx`.
- Existing Testing Library style in `CustomImage.spec.tsx`.

**Test scenarios:**
- Happy path: rendering `CustomImage` shows the file upload UI.
- Happy path: rendering `CustomImage` does not show a button named "Add image by URL."
- Edge case: URL input placeholder text "Paste URL of image..." is absent after render.
- Integration: `ImageUpload` still receives `onChange`, `selectedBlock`, `setUploading`, `loading`, and `error` props from `CustomImage`.

**Verification:**
- The Custom tab no longer exposes URL upload UI.
- Existing file-upload behavior remains reachable through `ImageUpload`.
- No unused `CustomUrl` import remains.

### U2. Move Upload File Button Inside Dropzone

**Goal:** Redesign the dropzone so the "Upload file" button is inside the dashed upload area while preserving drag-and-drop upload behavior and explicit file picker opening.

**Requirements:** R2, R3, R4

**Dependencies:** U1 can be independent, but implementing after U1 gives a cleaner Custom tab layout to verify.

**Files:**
- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.tsx`
- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.spec.tsx`
- Review: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.stories.tsx`

**Approach:**
- Move the existing `Upload file` button into the `data-testid="drop zone"` container below the icon/status copy.
- Keep the button wired to `open` from `useDropzone` and disabled while `loading === true`.
- Preserve the hidden file input, accepted MIME types, max-size handling, error messaging, success state, and `onDrop` upload flow.
- Adjust dropzone layout spacing so icon, status text, nested button, and helper/error text do not overlap on narrow drawer widths.
- Keep helper/error text below the dropzone unless visual design review shows it belongs inside; the requested change is specifically to include the button inside the drop area.

**Patterns to follow:**
- Existing `ImageUpload.tsx` use of `useDropzone`, `open`, `getRootProps`, and `getInputProps`.
- Existing state assertions in `ImageUpload.spec.tsx`.
- Drawer UI density and MUI styling already used in this component.

**Test scenarios:**
- Happy path: the dropzone contains a button named "Upload file."
- Happy path: dropping a valid PNG on the dropzone still uploads through `createCloudflareUploadByFile`, posts to Cloudflare, and calls `onChange` with the uploaded `src`, `scale`, `focalLeft`, and `focalTop`.
- Happy path: clicking the nested "Upload file" button calls the dropzone `open` path without requiring the entire dropzone to be clickable.
- Edge case: while `loading` is true, the nested button is disabled and the "Uploading..." state remains visible.
- Error path: oversized files still show the 10 MB error and re-enable the nested upload button.
- Error path: invalid file types still show the accepted-types error without calling `onChange`.
- Error path: Cloudflare upload errors still show "Upload Failed!" and preserve existing error messaging.
- Integration: retrying with a valid file after a rejection clears the previous error and shows success.

**Verification:**
- Drag-and-drop and button-triggered file selection both remain available from one visual dropzone surface.
- Upload loading, success, and failure states remain visually distinct.
- The component story still renders useful default/loading/error states for visual review.

## Ticket Drafts

### Ticket 1: Remove Add Image by URL From Image Properties Custom Tab

**Goal**

Remove the "Add image by URL" accordion from the Image Properties Custom tab because the flow is low-use and should no longer be part of the custom upload surface.

**Acceptance**

- [ ] The Custom tab no longer shows "Add image by URL."
- [ ] The URL input and "Paste URL of image..." field are no longer reachable from the Custom tab.
- [ ] File upload remains visible and wired through the existing upload flow.
- [ ] Tests cover the absence of the URL affordance and the continued presence of file upload.

### Ticket 2: Move Upload File Button Into Image Dropzone

**Goal**

Redesign the Image Properties Custom tab upload dropzone so users can drag an image into the drop area or click an "Upload file" button inside that same area to open the file picker.

**Acceptance**

- [ ] The "Upload file" button appears inside the dropzone area.
- [ ] Dragging and dropping a valid image into the dropzone still uploads successfully.
- [ ] Clicking the nested "Upload file" button opens the file picker.
- [ ] Loading, success, oversize-file, invalid-file-type, and Cloudflare error states continue to behave as they do today.
- [ ] The nested button is disabled while upload loading is active.

## System-Wide Impact

- **Interaction graph:** Limited to the Image Properties Custom tab and its `ImageUpload` child component. No backend mutation behavior should change.
- **Error propagation:** Existing local `errorCode`, `success`, `setUploading`, and parent `error` behavior should remain unchanged.
- **State lifecycle risks:** Removing URL upload also removes any URL mutation success path from the Custom tab; ensure no media-history refetch logic in related branches depends exclusively on `CustomUrl`.
- **API surface parity:** Upload-by-file remains; upload-by-URL API may remain server-side for other flows or future cleanup.
- **Integration coverage:** Component tests should prove `CustomImage` composition and `ImageUpload` behavior after the UI move.
- **Unchanged invariants:** Accepted file types, maximum file size, generated Cloudflare delivery URL shape, and image focal defaults stay unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Removing `CustomUrl` conflicts with Media Library Picker "no URL regression" wording | Treat URL removal as this ticket's explicit product change; keep other Media Library Picker flows untouched. |
| Nested button click interferes with dropzone drag handling | Keep `useDropzone` as the owner of root/input props and use the existing `open` callback for the nested button. |
| UI becomes cramped in the drawer after moving the button | Verify Storybook/default rendering and add responsive spacing constraints in `ImageUpload`. |
| Over-deleting URL upload code breaks an unseen import | Search imports before deleting `CustomUrl` files; otherwise leave unused cleanup to a follow-up. |

## Documentation / Operational Notes

- If these are created in Linear, attach them to the Media Library Picker project and the v1 frontend milestone unless product wants them as separate polish tickets.
- No migration, feature flag, or rollout work is required for these UI-only changes.

## Sources & References

- Linear project: [Media Library Picker](https://linear.app/jesus-film-project/project/media-library-picker-228148395f4e)
- Linear issue: [NES-1628 FE-1: Image picker history grids (Custom + AI tabs)](https://linear.app/jesus-film-project/issue/NES-1628/fe-1-image-picker-history-grids-custom-ai-tabs)
- Linear issue: [ENG-3571 Tech Debt - Refactor Image Upload, implement useImageUpload hook](https://linear.app/jesus-film-project/issue/ENG-3571/tech-debt-refactor-image-upload-implement-useimageupload)
- Related code: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomImage.tsx`
- Related code: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.tsx`
- Related tests: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/CustomImage.spec.tsx`
- Related tests: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.spec.tsx`
