/**
 * Reconciles the Algolia languages index with the languages database.
 *
 * Two passes:
 *
 * 1. Push every publicly visible language (hasVideos && searchable). Languages
 *    default to hasVideos: true in the schema, so the incremental sync (which
 *    only fired on a false -> true transition) never pushed them and they are
 *    missing from search.
 * 2. Remove languages that have video content but are not publicly visible,
 *    either hidden by an operator (searchable: false) or not yet promoted
 *    (hasVideos: false). The sync is otherwise upsert-only, so anything indexed
 *    while it was visible stays searchable after being turned off.
 *
 * The second pass is scoped to languages that actually have variants because
 * the api-media Algolia key cannot browse the index, so there is no way to ask
 * which objectIDs are really in it. Languages that were never indexed are the
 * overwhelming majority and deleting them would be ~90k pointless operations;
 * deleting an absent objectID is a harmless no-op, so the smaller candidate set
 * costs nothing in correctness.
 *
 * Errors are not caught: the run stops on the first failing batch and exits
 * non-zero. Re-running is safe, because saveObjects upserts derived data and
 * deleteObjects is idempotent.
 *
 * Usage: nx run api-media:reindex-languages-algolia
 */

import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma as mediaPrisma } from '@core/prisma/media/client'

import {
  reindexLanguagesWithVideosInAlgolia,
  removeLanguagesFromAlgolia
} from '../../lib/languages/updateLanguageInAlgolia'
import { logger } from '../../logger'

/**
 * Languages that have at least one video variant but must not be publicly
 * visible -- either hidden by an operator (searchable: false) or not yet
 * promoted (hasVideos: false).
 */
async function findHiddenLanguageIds(): Promise<string[]> {
  const withVariants = await mediaPrisma.videoVariant.groupBy({
    by: ['languageId']
  })
  const candidateIds = withVariants.map(({ languageId }) => languageId)

  if (candidateIds.length === 0) return []

  const hidden = await languagesPrisma.language.findMany({
    where: {
      id: { in: candidateIds },
      OR: [{ hasVideos: false }, { searchable: false }]
    },
    select: { id: true }
  })

  return hidden.map(({ id }) => id)
}

async function main(): Promise<void> {
  logger.info('reindexing languages with videos in algolia')

  const { count } = await reindexLanguagesWithVideosInAlgolia(logger)

  const hiddenIds = await findHiddenLanguageIds()
  const { removed } = await removeLanguagesFromAlgolia(hiddenIds, logger)

  logger.info(
    `reindexed ${count} languages and removed ${removed} hidden languages in algolia`
  )
}

if (require.main === module) {
  main().catch((error) => {
    logger.error(error, 'failed to reindex languages in algolia')
    process.exit(1)
  })
}
