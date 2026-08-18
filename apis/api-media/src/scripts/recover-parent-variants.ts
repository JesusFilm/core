import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'
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
 *
 * Returns false when apply mode leaves any requested language unrecovered,
 * so the caller can fail the run instead of reporting success.
 */
export async function recoverParentVariants(
  parentId: string,
  dryRun: boolean
): Promise<boolean> {
  logger.info({ parentId, dryRun }, 'Parent Variant recovery starting')

  const result = await executeVideoPublishChildren(
    parentId,
    PARENT_VARIANTS_ONLY_MODE,
    dryRun
  )

  if (result.missingParentLanguageIds.length === 0) {
    logger.info({ parentId }, 'No missing parent language Variants found')
    return true
  }

  if (dryRun) {
    logger.info(
      {
        parentId,
        missingParentLanguageIds: result.missingParentLanguageIds
      },
      `Found ${result.missingParentLanguageIds.length} missing parent language Variant(s)`
    )
    return true
  }

  const failedLanguageIds = result.missingParentLanguageIds.filter(
    (languageId) => !result.recoveredParentLanguageIds.includes(languageId)
  )

  logger.info(
    {
      parentId,
      attempted: result.missingParentLanguageIds.length,
      recovered: result.recoveredParentLanguageIds.length,
      recoveredParentLanguageIds: result.recoveredParentLanguageIds,
      failedLanguageIds
    },
    `Recovered ${result.recoveredParentLanguageIds.length}/${result.missingParentLanguageIds.length} missing parent language Variant(s)`
  )

  return failedLanguageIds.length === 0
}

async function main(): Promise<void> {
  const parentId =
    process.env.PARENT_VARIANT_RECOVERY_ID?.trim() || DEFAULT_PARENT_VIDEO_ID
  const dryRun = process.env.PARENT_VARIANT_RECOVERY_APPLY !== 'true'

  try {
    const succeeded = await recoverParentVariants(parentId, dryRun)
    if (!succeeded) {
      logger.error(
        { parentId },
        'Parent Variant recovery completed with failures'
      )
      process.exitCode = 1
      return
    }
    logger.info({ parentId }, 'Script completed successfully')
  } catch (error) {
    logger.error({ error, parentId }, 'Script failed')
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
