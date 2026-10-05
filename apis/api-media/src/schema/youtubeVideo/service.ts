import { GraphQLError } from 'graphql'

import { YoutubeReviewState, prisma } from '@core/prisma/media/client'

interface VariantReference {
  videoId?: string | null
  languageId?: string | null
}

/**
 * Enforces the status invariant from the PRD:
 * - LINKED   ⇒ variant reference present AND resolvable to an existing variant
 * - DISMISSED ⇒ no variant reference
 * - SKIPPED   ⇒ no variant reference
 *
 * Throws a BAD_USER_INPUT GraphQLError on any violation so a write can never
 * persist a contradictory state.
 */
export async function assertYoutubeVideoInvariant(
  reviewState: YoutubeReviewState,
  { videoId, languageId }: VariantReference
): Promise<void> {
  if (reviewState === 'LINKED') {
    if (videoId == null || languageId == null) {
      throw new GraphQLError(
        'LINKED youtube video requires both videoId and languageId',
        { extensions: { code: 'BAD_USER_INPUT' } }
      )
    }

    const variant = await prisma.videoVariant.findUnique({
      where: { languageId_videoId: { languageId, videoId } },
      select: { id: true }
    })

    if (variant == null) {
      throw new GraphQLError(
        `no catalog variant exists for videoId "${videoId}" and languageId "${languageId}"`,
        { extensions: { code: 'BAD_USER_INPUT' } }
      )
    }

    return
  }

  // DISMISSED and SKIPPED must never point at a variant.
  if (videoId != null || languageId != null) {
    throw new GraphQLError(
      `${reviewState} youtube video must not reference a variant`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    )
  }
}
