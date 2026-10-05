/**
 * Pushes every language with videos into the Algolia languages index.
 *
 * Languages default to hasVideos: true in the schema, so the incremental sync
 * (which only fired on a false -> true transition) never pushed them and they
 * are missing from search. This repairs the index in one pass.
 *
 * Errors are not caught: the run stops on the first failing batch and exits
 * non-zero. Re-running is safe, because saveObjects upserts derived data.
 *
 * Usage: nx run api-media:reindex-languages-algolia
 */

import { reindexLanguagesWithVideosInAlgolia } from '../../lib/languages/updateLanguageInAlgolia'
import { logger } from '../../logger'

async function main(): Promise<void> {
  logger.info('reindexing languages with videos in algolia')

  const { count } = await reindexLanguagesWithVideosInAlgolia(logger)

  logger.info(`reindexed ${count} languages in algolia`)
}

if (require.main === module) {
  main().catch((error) => {
    logger.error(error, 'failed to reindex languages in algolia')
    process.exit(1)
  })
}
