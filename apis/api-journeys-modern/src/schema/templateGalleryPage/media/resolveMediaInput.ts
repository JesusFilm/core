import { GraphQLError } from 'graphql'

import { linkValidate } from './linkValidate'
import { mediaInputSchema } from './mediaInputSchema'
import { muxValidate } from './muxValidate'

// The data needed to create/upsert one TemplateGalleryPageMedia row, with the
// one-of invariant already resolved (exactly one of embedUrl / muxVideoId set).
export type MediaCreateData = {
  type: 'link' | 'mux'
  embedUrl: string | null
  muxVideoId: string | null
  muxPlaybackId: string | null
}

/**
 * Validates a TemplateGalleryPageMediaInput against the discriminated-union
 * shape and dispatches to the per-type helper, returning the row data to
 * persist. Shared by the Create and Update mutations (separate modules) so the
 * ~30 lines of zod validation + helper dispatch + row composition aren't
 * duplicated and can't drift between the two.
 *
 * Returns `null` when `media` is null or undefined — the caller decides what
 * that means (Create: no row; Update: `null` clears, `undefined` is a no-op).
 *
 * MUST be called BEFORE opening the prisma transaction: it performs external IO
 * (provider oEmbed fetches, the cross-DB Mux read) which must not run inside a
 * tx. Throws `BAD_USER_INPUT` / `MEDIA_INPUT_SHAPE_MISMATCH` on a shape
 * mismatch; provider/helper errors propagate unchanged.
 */
export async function resolveMediaInput(
  media: unknown
): Promise<MediaCreateData | null> {
  if (media == null) return null

  const parsed = mediaInputSchema.safeParse(media)
  if (!parsed.success) {
    throw new GraphQLError(
      'media input does not match the type discriminator',
      {
        extensions: {
          code: 'BAD_USER_INPUT',
          reason: 'MEDIA_INPUT_SHAPE_MISMATCH'
        }
      }
    )
  }

  if (parsed.data.type === 'link') {
    const { embedUrl } = await linkValidate(parsed.data.url)
    return { type: 'link', embedUrl, muxVideoId: null, muxPlaybackId: null }
  }

  const { muxVideoId, muxPlaybackId } = await muxValidate(
    parsed.data.muxVideoId
  )
  return { type: 'mux', embedUrl: null, muxVideoId, muxPlaybackId }
}
