/**
 * One-time migration (NES-1591) that backfills the new "Buddhist" JourneyTag
 * onto every journey that is currently tagged with the renamed "Hindu" tag
 * (previously "Hindu/Buddist"). Because the split is not retroactively
 * classifiable, every affected journey receives both tags so template
 * discoverability under the Audience filter is preserved for both religions.
 *
 * Depends on the api-media migration ("split-hindu-buddhist-tag") having run
 * first against the same environment. That migration renames the old tag to
 * "Hindu" and creates "Buddhist". This script looks both up by name in the
 * media database, so no UUIDs need to be threaded between environments.
 *
 * The script is idempotent: the JourneyTag table has a unique constraint on
 * (journeyId, tagId), and `createMany({ skipDuplicates: true })` guarantees
 * existing rows are not duplicated on re-run.
 *
 * Usage (local / stage / prod):
 *   PG_DATABASE_URL_MEDIA=<media-url> \
 *   PG_DATABASE_URL_JOURNEYS=<journeys-url> \
 *   npx nx backfill-buddhist-journey-tag api-journeys
 */

import { prisma as journeysPrisma } from '@core/prisma/journeys/client'
import { prisma as mediaPrisma } from '@core/prisma/media/client'

const HINDU_TAG_NAME = 'Hindu'
const BUDDHIST_TAG_NAME = 'Buddhist'
const BATCH_SIZE = 500

interface BackfillStats {
  sourceRows: number
  created: number
  skippedDuplicates: number
}

async function backfillBuddhistJourneyTag(): Promise<BackfillStats> {
  const hinduTag = await mediaPrisma.tag.findUnique({
    where: { name: HINDU_TAG_NAME }
  })
  const buddhistTag = await mediaPrisma.tag.findUnique({
    where: { name: BUDDHIST_TAG_NAME }
  })

  if (hinduTag == null || buddhistTag == null) {
    throw new Error(
      `Expected Tags named "${HINDU_TAG_NAME}" and "${BUDDHIST_TAG_NAME}" in the media database. ` +
        `Run the api-media migration "split-hindu-buddhist-tag" first against this environment.`
    )
  }

  console.log(
    `Media tag IDs: hindu=${hinduTag.id} buddhist=${buddhistTag.id}`
  )

  const stats: BackfillStats = {
    sourceRows: 0,
    created: 0,
    skippedDuplicates: 0
  }

  let cursor: string | undefined

  while (true) {
    const batch = await journeysPrisma.journeyTag.findMany({
      where: { tagId: hinduTag.id },
      select: { id: true, journeyId: true },
      take: BATCH_SIZE,
      ...(cursor != null ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' }
    })

    if (batch.length === 0) break

    stats.sourceRows += batch.length

    const result = await journeysPrisma.journeyTag.createMany({
      data: batch.map((row) => ({
        journeyId: row.journeyId,
        tagId: buddhistTag.id
      })),
      skipDuplicates: true
    })

    stats.created += result.count
    stats.skippedDuplicates += batch.length - result.count

    console.log(
      `  Batch processed: source=${batch.length} created=${result.count} skipped=${batch.length - result.count}`
    )

    cursor = batch[batch.length - 1].id
  }

  return stats
}

async function main(): Promise<void> {
  try {
    console.log('Starting backfill of Buddhist JourneyTag rows...')
    console.log('---')
    const stats = await backfillBuddhistJourneyTag()
    console.log('---')
    console.log('Backfill complete:')
    console.log(`  Source JourneyTag rows (Hindu):  ${stats.sourceRows}`)
    console.log(`  New JourneyTag rows (Buddhist):  ${stats.created}`)
    console.log(`  Skipped existing Buddhist rows:  ${stats.skippedDuplicates}`)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exitCode = 1
  } finally {
    await Promise.all([
      mediaPrisma.$disconnect(),
      journeysPrisma.$disconnect()
    ])
  }
}

void main()
