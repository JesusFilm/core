import { prisma } from '@core/prisma/media/client'

import {
  type VideoPublishMode,
  executeVideoPublishChildren
} from '../schema/video/videoPublishChildren.mutation'

const PARENT_VARIANTS_ONLY_MODE: VideoPublishMode = 'parentVariantsOnly'
const DEFAULT_PARENT_VIDEO_ID = '6_Acts'

/**
 * Operator command wrapping the videoPublishChildren mutation's
 * parentVariantsOnly mode. Reusable for any parent Video ID; the initial
 * production audit target is `6_Acts`.
 *
 * Defaults to dry-run. Set PARENT_VARIANT_RECOVERY_APPLY=true to write.
 * Set PARENT_VARIANT_RECOVERY_ID to target a different parent Video.
 */
export async function recoverParentVariants(
  parentId: string,
  dryRun: boolean
): Promise<void> {
  console.log(
    `Parent Variant recovery for "${parentId}" (${dryRun ? 'dry-run' : 'apply'})`
  )

  const result = await executeVideoPublishChildren(
    parentId,
    PARENT_VARIANTS_ONLY_MODE,
    dryRun
  )

  if (result.missingParentLanguageIds.length === 0) {
    console.log(
      `No missing parent language Variants found for "${parentId}".`
    )
    return
  }

  console.log(
    `${dryRun ? 'Found' : 'Recovered'} ${result.missingParentLanguageIds.length} missing parent language Variant(s) for "${parentId}": ${result.missingParentLanguageIds.join(', ')}`
  )
}

async function main(): Promise<void> {
  const parentId =
    process.env.PARENT_VARIANT_RECOVERY_ID?.trim() || DEFAULT_PARENT_VIDEO_ID
  const dryRun = process.env.PARENT_VARIANT_RECOVERY_APPLY !== 'true'

  try {
    await recoverParentVariants(parentId, dryRun)
    console.log('Script completed successfully!')
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
