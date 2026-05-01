import { GraphQLError } from 'graphql'

import { Prisma } from '@core/prisma/journeys/client'

/**
 * Asserts that the given Block id belongs to a Journey owned by the given team.
 *
 * Without this check, a Team-A publisher could set creatorImageBlockId to a
 * Block from a Team-B private/draft journey; the public templateGalleryPageBySlug
 * query would then expose that Block (its src/alt) to anonymous visitors.
 *
 * Same class of bug as docs/solutions/security-issues/google-sync-missing-integration-ownership-guard.md
 * — accepting a foreign-key id without verifying requester owns the referenced resource.
 */
export async function validateCreatorImageBlock(
  tx: Prisma.TransactionClient,
  teamId: string,
  blockId: string
): Promise<void> {
  const block = await tx.block.findUnique({
    where: { id: blockId },
    select: { journey: { select: { teamId: true } } }
  })

  if (block == null) {
    throw new GraphQLError('creator image block not found', {
      extensions: { code: 'BAD_USER_INPUT', field: 'creatorImageBlockId' }
    })
  }

  if (block.journey?.teamId !== teamId) {
    throw new GraphQLError('creator image block does not belong to your team', {
      extensions: { code: 'FORBIDDEN', field: 'creatorImageBlockId' }
    })
  }
}
