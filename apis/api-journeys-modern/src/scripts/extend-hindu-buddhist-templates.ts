import { prisma } from '@core/prisma/journeys/client'
import { prisma as prismaMedia } from '@core/prisma/media/client'

const HINDU_TAG_NAME = 'Hindu'
const BUDDHIST_TAG_NAME = 'Buddhist'

interface ExtendResult {
  hinduTagId: string
  buddhistTagId: string
  affectedJourneyIds: string[]
  createdCount: number
  dryRun: boolean
}

/**
 * Script 2 of 2 for the Hindu/Buddhist tag split (NES-1591). Touches the
 * journeys DB for writes; reads tag IDs from the media DB.
 *
 * Must be run AFTER the api-media script `migrate-hindu-buddhist-tags`,
 * which renames the legacy "Hindu/Buddist" tag to "Hindu" (preserving its
 * Tag.id) and creates a new "Buddhist" tag.
 *
 * For every journey currently linked to the Hindu tag via JourneyTag,
 * this script adds a matching JourneyTag row pointing at Buddhist — so
 * every affected template ends up tagged with BOTH Hindu and Buddhist.
 *
 * Dry-run by default. Pass `--apply` to commit the JourneyTag inserts.
 *
 * Steps:
 *   1. Read the Hindu and Buddhist tag IDs from the media DB by name.
 *      If either is absent, throw — Script 1 must be run first.
 *   2. Find every JourneyTag row pointing at Hindu. Its journeyIds are
 *      the templates that need Buddhist added.
 *   3. If empty, log and exit.
 *   4. Inside a journeys $transaction, createMany new JourneyTag rows
 *      with { journeyId, tagId: buddhistId } and `skipDuplicates: true`.
 *      The @@unique([journeyId, tagId]) constraint makes this idempotent
 *      across repeated runs and across concurrent manual edits.
 *
 * Idempotent: safe to re-run. Second run's createMany is a no-op due to
 * skipDuplicates on the unique constraint.
 */
export async function extendHinduBuddhistTemplates(
  dryRun = true
): Promise<ExtendResult> {
  console.log(
    `Starting Hindu/Buddhist JourneyTag extension (api-journeys-modern)${dryRun ? ' [DRY RUN]' : ''}...`
  )

  const hinduTag = await prismaMedia.tag.findUnique({
    where: { name: HINDU_TAG_NAME }
  })
  const buddhistTag = await prismaMedia.tag.findUnique({
    where: { name: BUDDHIST_TAG_NAME }
  })

  if (hinduTag == null || buddhistTag == null) {
    throw new Error(
      `Missing "${HINDU_TAG_NAME}" or "${BUDDHIST_TAG_NAME}" tag in media DB. Run \`nx run api-media:migrate-hindu-buddhist-tags\` first.`
    )
  }

  const journeyTags = await prisma.journeyTag.findMany({
    where: { tagId: hinduTag.id },
    select: { journeyId: true }
  })

  const affectedJourneyIds = journeyTags.map((entry) => entry.journeyId)
  console.log(
    `Found ${affectedJourneyIds.length} journey(s) linked to "${HINDU_TAG_NAME}" (Tag.id ${hinduTag.id}).`
  )

  if (affectedJourneyIds.length === 0) {
    console.log('No journeys to update. Exiting.')
    return {
      hinduTagId: hinduTag.id,
      buddhistTagId: buddhistTag.id,
      affectedJourneyIds: [],
      createdCount: 0,
      dryRun
    }
  }

  for (const journeyId of affectedJourneyIds) {
    console.log(
      `  ${dryRun ? 'Would add' : 'Adding'} Buddhist JourneyTag for journey ${journeyId}.`
    )
  }

  if (dryRun) {
    console.log(
      `\n[DRY RUN] Would create up to ${affectedJourneyIds.length} new JourneyTag row(s) pointing at Buddhist (Tag.id ${buddhistTag.id}). Pass --apply to commit.`
    )
    return {
      hinduTagId: hinduTag.id,
      buddhistTagId: buddhistTag.id,
      affectedJourneyIds,
      createdCount: 0,
      dryRun: true
    }
  }

  const { count } = await prisma.$transaction(async (tx) =>
    tx.journeyTag.createMany({
      data: affectedJourneyIds.map((journeyId) => ({
        journeyId,
        tagId: buddhistTag.id
      })),
      skipDuplicates: true
    })
  )

  console.log(
    `\nCreated ${count} new Buddhist JourneyTag row(s) (of ${affectedJourneyIds.length} candidates; duplicates skipped).`
  )

  return {
    hinduTagId: hinduTag.id,
    buddhistTagId: buddhistTag.id,
    affectedJourneyIds,
    createdCount: count,
    dryRun: false
  }
}

async function main(): Promise<void> {
  const dryRun = !process.argv.includes('--apply')

  if (dryRun) {
    console.log('=== DRY RUN MODE ===')
    console.log('Pass --apply to execute changes.\n')
  } else {
    console.log('=== APPLYING CHANGES ===\n')
  }

  try {
    await extendHinduBuddhistTemplates(dryRun)
    console.log('\nScript completed successfully!')
  } catch (error) {
    console.error('\nScript failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await prismaMedia.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
