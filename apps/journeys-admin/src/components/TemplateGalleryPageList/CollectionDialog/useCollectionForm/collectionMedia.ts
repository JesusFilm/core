import { GetTemplateGalleryPages_templateGalleryPages_media as TemplateGalleryPageMedia } from '../../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageMediaInput,
  TemplateGalleryPageMediaType
} from '../../../../../__generated__/globalTypes'

/**
 * Media value carried by the collection form. Mirrors the backend's
 * retained-both-slots model: `type` selects which payload renders, while the
 * link slot (`url`) and the upload slot (`muxVideoId` + denormalized
 * `muxPlaybackId`/`muxName`/`muxDuration`) are held independently and survive
 * switching `type`. An empty link slot is `url: ''`; an empty upload slot is
 * `muxVideoId: '' && muxPlaybackId: null`. `type: none` renders nothing while
 * keeping both parked slots intact.
 *
 * The denormalized mux fields are display-only (preview thumbnail + attached
 * metadata); only `type`, `url`, and `muxVideoId` map to the write input.
 */
export interface CollectionMediaValues {
  type: TemplateGalleryPageMediaType
  url: string
  muxVideoId: string
  muxPlaybackId: string | null
  muxName: string | null
  muxDuration: number | null
}

export const EMPTY_MEDIA: CollectionMediaValues = {
  type: TemplateGalleryPageMediaType.none,
  url: '',
  muxVideoId: '',
  muxPlaybackId: null,
  muxName: null,
  muxDuration: null
}

/**
 * Maps a persisted admin media row (or null) to the form value used for
 * `initialValues` and as the diff baseline. Both slots are seeded regardless
 * of the active `type` so a parked link/upload is preserved and restorable.
 * A null row (legacy `mediaUrl`-only or no media) presents as `none` with
 * empty slots.
 */
export function collectionMediaToFormValues(
  media: TemplateGalleryPageMedia | null | undefined
): CollectionMediaValues {
  if (media == null) return { ...EMPTY_MEDIA }
  return {
    type: media.type,
    url: media.embedUrl ?? '',
    muxVideoId: media.muxVideoId ?? '',
    muxPlaybackId: media.muxPlaybackId,
    muxName: media.muxName,
    muxDuration: media.muxDuration
  }
}

/**
 * True when the form's media differs from the persisted baseline in `type` or
 * either slot. Drives whether `media` is included in the update and the
 * dialog's unsaved-changes guard. Derived from `formMediaToInput` so the
 * "what counts as a change" rule lives in one place: dirty iff the built input
 * changes `type` or carries any slot key beyond `type`.
 */
export function mediaDirty(
  current: CollectionMediaValues,
  persisted: CollectionMediaValues
): boolean {
  const input = formMediaToInput(current, persisted)
  return current.type !== persisted.type || Object.keys(input).length > 1
}

/**
 * Builds the tri-state write input by diffing the form's slots against the
 * persisted baseline, per the backend contract:
 *   - `type` is always sent (it selects what renders).
 *   - `url` / `muxVideoId`: OMIT when unchanged, `null` when cleared, value
 *     when set/replaced.
 * The denormalized mux metadata is never sent — the backend re-denormalizes
 * from `muxVideoId`. Links are trimmed at this boundary (pasted links often
 * carry whitespace and the preview trims internally).
 */
export function formMediaToInput(
  current: CollectionMediaValues,
  persisted: CollectionMediaValues
): TemplateGalleryPageMediaInput {
  const input: TemplateGalleryPageMediaInput = { type: current.type }

  const url = current.url.trim()
  if (url !== persisted.url.trim()) {
    input.url = url === '' ? null : url
  }

  if (current.muxVideoId !== persisted.muxVideoId) {
    input.muxVideoId = current.muxVideoId === '' ? null : current.muxVideoId
  }

  return input
}
