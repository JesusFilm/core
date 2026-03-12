import { prisma } from '@core/prisma/journeys/client'

const CUSTOMIZABLE_LINK_BLOCK_TYPES = [
  'ButtonBlock',
  'RadioOptionBlock',
  'VideoBlock',
  'VideoTriggerBlock'
]

const CUSTOMIZABLE_MEDIA_BLOCK_TYPES = ['ImageBlock', 'VideoBlock']

/**
 * Iteratively removes blocks whose parentBlockId references a block not in the
 * set. This handles children of soft-deleted parents: the parent is excluded by
 * the `deletedAt: null` query, so its children become orphans and must also be
 * excluded.
 *
 * e.g. A StepBlock is deleted (soft-deleted), but its child CardBlock and
 * grandchild ImageBlock remain with `deletedAt: null`. This filter ensures
 * those orphaned descendants are not considered when checking for customizable
 * content.
 */
function removeOrphanedBlocks<
  T extends { id: string; parentBlockId: string | null }
>(blocks: T[]): T[] {
  let filteredBlocks = blocks
  let length = filteredBlocks.length
  do {
    length = filteredBlocks.length
    const idsSet = new Set(filteredBlocks.map((b) => b.id))
    filteredBlocks = filteredBlocks.filter(
      (b) => b.parentBlockId == null || idsSet.has(b.parentBlockId)
    )
  } while (length !== filteredBlocks.length)
  return filteredBlocks
}

/**
 * Keeps `journey.customizable` in sync by recalculating it from blocks,
 * actions, and customization fields.
 *
 * Mirrors the logic in JourneyCustomizableService.recalculate() from
 * api-journeys. If you update the detection logic there, update it here too.
 */
export async function recalculateJourneyCustomizable(
  journeyId: string
): Promise<void> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: {
      template: true,
      customizable: true,
      journeyCustomizationDescription: true,
      logoImageBlockId: true,
      website: true,
      _count: { select: { journeyCustomizationFields: true } }
    }
  })
  if (journey == null) return
  if (journey.template !== true) return

  const allBlocks = await prisma.block.findMany({
    where: { journeyId, deletedAt: null },
    include: { action: true }
  })
  const blocks = removeOrphanedBlocks(allBlocks)

  const fieldsCount = journey._count.journeyCustomizationFields

  const hasEditableText =
    (journey.journeyCustomizationDescription ?? '').trim().length > 0 &&
    fieldsCount > 0

  const hasCustomizableLinks = blocks.some(
    (block) =>
      CUSTOMIZABLE_LINK_BLOCK_TYPES.includes(block.typename) &&
      block.action != null &&
      block.action.customizable === true &&
      block.action.blockId == null // excludes NavigateToBlockAction
  )

  const hasCustomizableLogo =
    journey.website === true &&
    journey.logoImageBlockId != null &&
    blocks.some(
      (block) =>
        block.id === journey.logoImageBlockId && block.customizable === true
    )

  const hasCustomizableMedia =
    hasCustomizableLogo ||
    blocks.some(
      (block) =>
        block.id !== journey.logoImageBlockId &&
        CUSTOMIZABLE_MEDIA_BLOCK_TYPES.includes(block.typename) &&
        block.customizable === true
    )

  const newCustomizable =
    hasEditableText || hasCustomizableLinks || hasCustomizableMedia

  if (newCustomizable !== (journey.customizable ?? false)) {
    await prisma.journey.update({
      where: { id: journeyId },
      data: { customizable: newCustomizable }
    })
  }
}
