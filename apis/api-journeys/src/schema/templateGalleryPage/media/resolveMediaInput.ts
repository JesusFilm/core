import { GraphQLError } from 'graphql'

import { linkValidate } from './linkValidate'
import { mediaInputSchema } from './mediaInputSchema'
import { muxValidate } from './muxValidate'

// The scalar columns of one TemplateGalleryPageMedia row.
export type MediaRowColumns = {
  type: 'link' | 'mux' | 'none'
  embedUrl: string | null
  muxVideoId: string | null
  muxPlaybackId: string | null
  muxName: string | null
  muxDuration: number | null
}

// A validated media input with each payload slot's three-way merge intent:
//   undefined → leave the stored slot unchanged
//   null      → clear the slot
//   object    → set/replace the slot (already validated/normalized)
export type ResolvedMediaInput = {
  type: 'link' | 'mux' | 'none'
  link: { embedUrl: string } | null | undefined
  mux:
    | {
        muxVideoId: string
        muxPlaybackId: string
        muxName: string | null
        muxDuration: number | null
      }
    | null
    | undefined
}

/**
 * Validates a TemplateGalleryPageMediaInput and resolves each provided payload
 * slot, returning the active `type` plus per-slot merge intents. Shared by the
 * Create and Update mutations.
 *
 * Returns `null` when `media` is null or undefined (the page input omitted it) —
 * the caller leaves any existing media untouched. There is no mutual-exclusion
 * check: both slots may be set, and `type` alone decides what renders.
 *
 * MUST be called BEFORE opening the prisma transaction: it performs external IO
 * (provider oEmbed fetches, the cross-DB Mux read) which must not run inside a
 * tx. Throws `BAD_USER_INPUT` / `MEDIA_INPUT_SHAPE_MISMATCH` on an invalid
 * `type`; provider/helper errors propagate unchanged.
 */
export async function resolveMediaInput(
  media: unknown
): Promise<ResolvedMediaInput | null> {
  if (media == null) return null

  const parsed = mediaInputSchema.safeParse(media)
  if (!parsed.success) {
    throw new GraphQLError('media input is not a valid shape', {
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'MEDIA_INPUT_SHAPE_MISMATCH'
      }
    })
  }

  const { type, url, muxVideoId } = parsed.data

  let link: ResolvedMediaInput['link']
  if (url === undefined) link = undefined
  else if (url === null) link = null
  else link = await linkValidate(url)

  let mux: ResolvedMediaInput['mux']
  if (muxVideoId === undefined) mux = undefined
  else if (muxVideoId === null) mux = null
  else mux = await muxValidate(muxVideoId)

  return { type, link, mux }
}

// Full column set for creating a fresh media row. On a brand-new row there is
// nothing to retain, so both "leave" (undefined) and "clear" (null) collapse to
// null; only an explicit set carries a value.
export function mediaCreateData(resolved: ResolvedMediaInput): MediaRowColumns {
  return {
    type: resolved.type,
    embedUrl: resolved.link?.embedUrl ?? null,
    muxVideoId: resolved.mux?.muxVideoId ?? null,
    muxPlaybackId: resolved.mux?.muxPlaybackId ?? null,
    muxName: resolved.mux?.muxName ?? null,
    muxDuration: resolved.mux?.muxDuration ?? null
  }
}

// Partial column set for updating an existing row: a slot left as `undefined`
// is omitted entirely (its stored columns are untouched); `null` clears the
// slot's columns; an object sets them.
export function mediaUpdateData(
  resolved: ResolvedMediaInput
): Partial<MediaRowColumns> {
  const data: Partial<MediaRowColumns> = { type: resolved.type }
  if (resolved.link !== undefined) {
    data.embedUrl = resolved.link?.embedUrl ?? null
  }
  if (resolved.mux !== undefined) {
    data.muxVideoId = resolved.mux?.muxVideoId ?? null
    data.muxPlaybackId = resolved.mux?.muxPlaybackId ?? null
    data.muxName = resolved.mux?.muxName ?? null
    data.muxDuration = resolved.mux?.muxDuration ?? null
  }
  return data
}
