/**
 * Reconciles the Algolia languages index with the languages database.
 *
 * Two passes:
 *
 * 1. Push every language with hasVideos: true. Languages default to
 *    hasVideos: true in the schema, so the incremental sync (which only fired
 *    on a false -> true transition) never pushed them and they are missing
 *    from search.
 * 2. Remove languages that have video content but hasVideos: false. Hiding a
 *    language is done by hand-editing hasVideos to false, and the sync is
 *    otherwise upsert-only, so a language indexed while the flag was true stays
 *    searchable after it is turned back off.
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
 * Languages that have at least one video variant but are flagged
 * hasVideos: false, so they must not be searchable.
 */
async function findSuppressedLanguageIds(): Promise<string[]> {
  const withVariants = await mediaPrisma.videoVariant.groupBy({
    by: ['languageId']
  })
  const candidateIds = withVariants.map(({ languageId }) => languageId)

  if (candidateIds.length === 0) return []

  const suppressed = await languagesPrisma.language.findMany({
    where: { id: { in: candidateIds }, hasVideos: false },
    select: { id: true }
  })

  return suppressed.map(({ id }) => id)
}

async function main(): Promise<void> {
  logger.info('reindexing languages with videos in algolia')

  const { count } = await reindexLanguagesWithVideosInAlgolia(logger)

  const suppressedIds = await findSuppressedLanguageIds()
  const { removed } = await removeLanguagesFromAlgolia(suppressedIds, logger)

  logger.info(
    `reindexed ${count} languages and removed ${removed} suppressed languages in algolia`
  )
}

if (require.main === module) {
  main().catch((error) => {
    logger.error(error, 'failed to reindex languages in algolia')
    process.exit(1)
  })
}
