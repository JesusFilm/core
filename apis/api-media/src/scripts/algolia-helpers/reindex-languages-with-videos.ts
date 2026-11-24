/**
 * Reconciles the Algolia languages index with the languages database.
 *
 * Two passes:
 *
 * 1. Push every publicly visible language (hasVideos && searchable). Languages
 *    default to hasVideos: true in the schema, so the incremental sync (which
 *    only fired on a false -> true transition) never pushed them and they are
 *    missing from search.
 * 2. Remove languages that are not publicly visible: every language hidden by
 *    an operator (searchable: false), plus languages that have video content
 *    but are flagged hasVideos: false. The sync is otherwise upsert-only, so
 *    anything indexed while it was visible stays searchable after being turned
 *    off.
 *
 * The api-media Algolia key cannot browse the index, so there is no way to ask
 * which objectIDs are really in it; the second pass has to delete a candidate
 * set instead. searchable: false is included unconditionally because pass 1
 * indexes visible languages whether or not they have variants, so a hidden
 * language may be in the index with no variants at all. The hasVideos: false
 * half is scoped to languages with variants: languages that were never indexed
 * are the overwhelming majority and deleting them would be ~90k pointless
 * operations. Deleting an absent objectID is a harmless no-op, so the smaller
 * candidate set costs nothing in correctness.
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
 * Languages that may be in the index but must not be publicly visible: every
 * language hidden by an operator (searchable: false), whether or not it has
 * variants, plus languages that have at least one video variant but are
 * flagged hasVideos: false.
 */
export async function findHiddenLanguageIds(): Promise<string[]> {
  const withVariants = await mediaPrisma.videoVariant.groupBy({
    by: ['languageId']
  })
  const idsWithVariants = withVariants.map(({ languageId }) => languageId)

  const hidden = await languagesPrisma.language.findMany({
    where: {
      OR: [
        { searchable: false },
        { id: { in: idsWithVariants }, hasVideos: false }
      ]
    },
    select: { id: true }
  })

  return hidden.map(({ id }) => id)
}

export async function main(): Promise<void> {
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
