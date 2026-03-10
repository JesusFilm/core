/**
 * One-time migration script to backfill `journey.customizable` for all
 * existing template journeys.
 *
 * This script replicates the detection logic from
 * JourneyCustomizableService.recalculate() to compute the correct value of
 * `customizable` for every journey where `template = true`.
 *
 * Usage:
 *   npx nx backfill-journey-customizable api-journeys
 *
 * This script is intended to be run once by a senior developer after review.
 * It is NOT part of the automated migration pipeline.
 */

import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

// Block types whose actions can contribute to hasCustomizableLinks
const CUSTOMIZABLE_LINK_BLOCK_TYPES = [
  'ButtonBlock',
  'RadioOptionBlock',
  'VideoBlock',
  'VideoTriggerBlock'
]

// Block types that can contribute to hasCustomizableMedia
const CUSTOMIZABLE_MEDIA_BLOCK_TYPES = ['ImageBlock', 'VideoBlock']

const BATCH_SIZE = 100

interface BackfillStats {
  total: number
  updated: number
  skipped: number
  errors: number
}

/**
 * Computes `customizable` for a single template journey.
 *
 * Logic mirrors JourneyCustomizableService.recalculate() exactly:
 * - hasEditableText: description is non-empty AND customization fields exist
 * - hasCustomizableLinks: link-type blocks with a customizable external action
 * - hasCustomizableMedia: customizable media blocks (logo only counts if website=true)
 */
async function computeCustomizable(journey: {
  id: string
  journeyCustomizationDescription: string | null
  logoImageBlockId: string | null
  website: boolean | null
}): Promise<boolean> {
  // Fetch all non-deleted blocks with their actions
  const blocks = await prisma.block.findMany({
    where: { journeyId: journey.id, deletedAt: null },
    include: { action: true }
  })

  // Count customization fields for this journey
  const fieldsCount = await prisma.journeyCustomizationField.count({
    where: { journeyId: journey.id }
  })

  // hasEditableText: description is non-empty AND at least one customization field exists
  const hasEditableText =
    (journey.journeyCustomizationDescription ?? '').trim().length > 0 &&
    fieldsCount > 0

  // hasCustomizableLinks: any link-type block has a customizable external action
  // (blockId == null excludes NavigateToBlockAction)
  const hasCustomizableLinks = blocks.some(
    (block) =>
      CUSTOMIZABLE_LINK_BLOCK_TYPES.includes(block.typename) &&
      block.action != null &&
      block.action.customizable === true &&
      block.action.blockId == null
  )

  // hasCustomizableLogo: logo block is customizable, but only when website mode is enabled
  const hasCustomizableLogo =
    journey.website === true &&
    journey.logoImageBlockId != null &&
    blocks.some(
      (block) =>
        block.id === journey.logoImageBlockId && block.customizable === true
    )

  // hasCustomizableMedia: either the logo (website-only) or any non-logo ImageBlock/VideoBlock
  const hasCustomizableMedia =
    hasCustomizableLogo ||
    blocks.some(
      (block) =>
        block.id !== journey.logoImageBlockId &&
        CUSTOMIZABLE_MEDIA_BLOCK_TYPES.includes(block.typename) &&
        block.customizable === true
    )

  return hasEditableText || hasCustomizableLinks || hasCustomizableMedia
}

async function backfillJourneyCustomizable(): Promise<BackfillStats> {
  const stats: BackfillStats = { total: 0, updated: 0, skipped: 0, errors: 0 }

  // Count total template journeys for progress tracking
  const totalTemplates = await prisma.journey.count({
    where: { template: true }
  })
  console.log(`Found ${totalTemplates} template journeys to process`)

  let cursor: string | undefined
  let processed = 0

  // Process template journeys in batches using cursor-based pagination
  while (true) {
    const journeys = await prisma.journey.findMany({
      where: { template: true },
      select: {
        id: true,
        customizable: true,
        updatedAt: true,
        journeyCustomizationDescription: true,
        logoImageBlockId: true,
        website: true,
        title: true
      },
      take: BATCH_SIZE,
      ...(cursor != null
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
      orderBy: { id: 'asc' }
    })

    if (journeys.length === 0) break

    for (const journey of journeys) {
      stats.total++
      processed++

      try {
        const newCustomizable = await computeCustomizable(journey)
        const currentCustomizable = journey.customizable ?? false

        if (newCustomizable !== currentCustomizable) {
          await prisma.journey.update({
            where: { id: journey.id },
            data: { customizable: newCustomizable, updatedAt: journey.updatedAt }
          })
          stats.updated++
          console.log(
            `  Updated: "${journey.title}" (${journey.id}) — ${currentCustomizable} -> ${newCustomizable}`
          )
        } else {
          stats.skipped++
        }
      } catch (error) {
        stats.errors++
        console.error(
          `  Error processing journey "${journey.title}" (${journey.id}):`,
          error
        )
      }

      // Log progress every 50 journeys
      if (processed % 50 === 0) {
        console.log(`  Progress: ${processed}/${totalTemplates}`)
      }
    }

    cursor = journeys[journeys.length - 1].id
  }

  return stats
}

async function main(): Promise<void> {
  try {
    console.log('Starting backfill of journey.customizable for template journeys...')
    console.log('---')

    const stats = await backfillJourneyCustomizable()

    console.log('---')
    console.log('Backfill complete:')
    console.log(`  Total processed: ${stats.total}`)
    console.log(`  Updated:         ${stats.updated}`)
    console.log(`  Skipped (no change): ${stats.skipped}`)
    console.log(`  Errors:          ${stats.errors}`)

    if (stats.errors > 0) {
      process.exitCode = 1
    }
  } catch (error) {
    console.error('Migration failed with error:', error)
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
