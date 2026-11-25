/**
 * Reconciles the Algolia languages index with the languages database.
 *
 * Two passes, removal first:
 *
 * 1. Remove languages that have video variants but are flagged hasVideos:
 *    false. The sync is otherwise upsert-only, so anything indexed while it was
 *    visible stays in search after being turned off.
 * 2. Push every publicly visible language (hasVideos: true). Languages default
 *    to hasVideos: true in the schema, so the incremental sync (which only
 *    fired on a false -> true transition) never pushed them and they are
 *    missing from search.
 *
 * Removal runs first so a stale hidden-id list can never delete a language
 * that became visible mid-run: the push reads current state after the delete
 * has finished, so anything promoted before it is re-indexed.
 *
 * The api-media Algolia key cannot browse the index, so there is no way to ask
 * which objectIDs are really in it; the removal pass has to delete a candidate
 * set instead. It is scoped to languages with variants: languages that were
 * never indexed are the overwhelming majority and deleting them would be ~90k
 * pointless operations. Deleting an absent objectID is a harmless no-op, so the
 * smaller candidate set costs nothing in correctness. A language with no
 * variants that was indexed and later set to hasVideos: false is not caught
 * here; the language-visibility redesign (#10631) replaces this with an exact
 * rebuild.
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
 * hasVideos: false, so must not be publicly visible.
 */
export async function findHiddenLanguageIds(): Promise<string[]> {
  const withVariants = await mediaPrisma.videoVariant.groupBy({
    by: ['languageId']
  })
  const candidateIds = withVariants.map(({ languageId }) => languageId)

  if (candidateIds.length === 0) return []

  const hidden = await languagesPrisma.language.findMany({
    where: { id: { in: candidateIds }, hasVideos: false },
    select: { id: true }
  })

  return hidden.map(({ id }) => id)
}

export async function main(): Promise<void> {
  logger.info('reindexing languages with videos in algolia')

  const hiddenIds = await findHiddenLanguageIds()
  const { removed } = await removeLanguagesFromAlgolia(hiddenIds, logger)

  const { count } = await reindexLanguagesWithVideosInAlgolia(logger)

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
