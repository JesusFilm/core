import { GetTemplateGalleryPages_templateGalleryPages_media as TemplateGalleryPageMedia } from '../../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageMediaInput,
  TemplateGalleryPageMediaType
} from '../../../../../__generated__/globalTypes'

/**
 * Tagged-union media value carried by the collection form. The frontend does
 * not distinguish Canva vs YouTube vs Slides at the value layer — they all
 * submit as `{ type: 'link', url }`; the picker only chooses which input UI to
 * show. `muxPlaybackId` is carried for existing mux rows so the preview can
 * render a thumbnail and the diff can recognise an untouched upload (the read
 * model exposes `muxPlaybackId`, never the original `muxVideoId`). `muxName` and
 * `muxDuration` are the denormalized Mux metadata, carried for display in the
 * attached-video state (both fresh uploads and existing saved rows).
 */
export type CollectionMediaValues =
  | { type: 'none' }
  | {
      type: 'mux'
      muxVideoId: string
      muxPlaybackId?: string | null
      muxName?: string | null
      muxDuration?: number | null
    }
  | { type: 'link'; url: string }

/**
 * Maps a persisted `TemplateGalleryPageMedia` (or null) to the form value used
 * for `initialValues`. Legacy rows — whose only media was the deprecated
 * `mediaUrl` scalar — arrive as `null` and present as `{ type: 'none' }`.
 */
export function collectionMediaToFormValues(
  media: TemplateGalleryPageMedia | null | undefined
): CollectionMediaValues {
  if (media == null) return { type: 'none' }
  if (media.type === TemplateGalleryPageMediaType.mux) {
    // No original muxVideoId in the read model — seed empty; the persisted
    // playbackId both drives the preview thumbnail and marks the row as a
    // valid, already-saved upload. muxName/muxDuration are denormalized onto the
    // row so an existing video shows its metadata without re-reading Mux.
    return {
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: media.muxPlaybackId,
      muxName: media.muxName,
      muxDuration: media.muxDuration
    }
  }
  return { type: 'link', url: media.embedUrl ?? '' }
}

/**
 * Stable comparison key for diffing form media against the persisted value.
 * Two values produce the same key iff they represent the same saved media.
 */
export function mediaKey(media: CollectionMediaValues): string {
  if (media.type === 'none') return 'none'
  if (media.type === 'link') return `link:${media.url}`
  // A fresh upload is keyed by its new videoId; an untouched existing row is
  // keyed by its persisted playbackId — so unchanged rows compare equal.
  return `mux:${media.muxVideoId}:${media.muxPlaybackId ?? ''}`
}

/**
 * Converts the current form media to the mutation input. `none` → `null`
 * (clears / no row). `link` → `{ type: 'link', url }`. `mux` →
 * `{ type: 'mux', muxVideoId }`.
 */
export function formMediaToInput(
  media: CollectionMediaValues
): TemplateGalleryPageMediaInput | null {
  if (media.type === 'none') return null
  if (media.type === 'link') {
    return { type: TemplateGalleryPageMediaType.link, url: media.url }
  }
  return { type: TemplateGalleryPageMediaType.mux, muxVideoId: media.muxVideoId }
}
