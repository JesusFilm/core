/**
 * Marks currently-hidden languages as searchable: false so the decision sticks.
 *
 * Before `searchable` existed, the only way to hide a language was to set
 * hasVideos to false by hand. That is not durable: the api-media variant hook
 * and the WESS import both write hasVideos, so any variant edit or import would
 * un-hide the language again.
 *
 * This preserves current behaviour exactly. A language that has video content
 * but is flagged hasVideos: false is hidden today, so it gets searchable: false
 * and stays hidden.
 *
 * hasVideos is corrected to true in the same write. The variant hook only sets
 * it when a language gets its first variant, and these languages already have
 * variants, so nothing else would ever fix it. Correcting it here makes
 * searchable the single switch: to un-hide a backfilled language later, set
 * searchable = true and run reindex-languages-algolia.
 *
 * Languages with no variants are not touched: hasVideos: false is simply
 * accurate for them, and they should become visible if they ever gain content.
 *
 * Idempotent. Pass --apply to write; the default is a dry run.
 *
 * Usage: nx run api-media:backfill-language-searchable [--args="--apply"]
 */

import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma as mediaPrisma } from '@core/prisma/media/client'

import { logger } from '../logger'

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')

  const withVariants = await mediaPrisma.videoVariant.groupBy({
    by: ['languageId']
  })
  const candidateIds = withVariants.map(({ languageId }) => languageId)

  if (candidateIds.length === 0) {
    logger.info('no languages have variants, nothing to backfill')
    return
  }

  const hidden = await languagesPrisma.language.findMany({
    where: {
      id: { in: candidateIds },
      hasVideos: false,
      searchable: true
    },
    select: { id: true, iso3: true }
  })

  if (hidden.length === 0) {
    logger.info('no hidden languages to backfill')
    return
  }

  for (const language of hidden) {
    logger.info(
      `${apply ? 'marking' : 'would mark'} language ${language.id} (${language.iso3 ?? 'no iso3'}) searchable: false, hasVideos: true`
    )
  }

  if (!apply) {
    logger.info(
      `dry run: ${hidden.length} languages would be updated, re-run with --apply to write`
    )
    return
  }

  const { count } = await languagesPrisma.language.updateMany({
    where: { id: { in: hidden.map(({ id }) => id) } },
    data: { searchable: false, hasVideos: true }
  })

  logger.info(`marked ${count} languages searchable: false, hasVideos: true`)
}

if (require.main === module) {
  main()
    .then(async () => {
      await mediaPrisma.$disconnect()
      await languagesPrisma.$disconnect()
    })
    .catch(async (error) => {
      logger.error(error, 'failed to backfill language searchable flag')
      await mediaPrisma.$disconnect()
      await languagesPrisma.$disconnect()
      process.exit(1)
    })
}

export { main }
