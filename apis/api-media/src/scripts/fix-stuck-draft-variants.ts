import { prisma } from '@core/prisma/media/client'

import { videoCacheReset } from '../lib/videoCacheReset'
import { logger } from '../logger'

import { hasFlag } from './cliFlags'

/**
 * One-off repair for two production VideoVariants left in Draft that the
 * videos-admin publish toggle cannot recover on main:
 *
 * - R4: a Collection's own Variant has no media, so its reconciliation row
 *   trips the two-hour Mux timeout on every retry (the row's createdAt is
 *   stale) and never reaches the step that publishes the Variant.
 * - R2: reconciliation is blocked by the "parent contains media" guard,
 *   because parent Variant 7_529-KnowGodBP has mistaken media. That parent
 *   is deliberately left alone.
 *
 * Publishes each Variant, adds the language to R2's Video availableLanguages
 * and marks each reconciliation row complete. It does not publish the Videos
 * (done in the UI afterwards) and does not touch Algolia.
 *
 * Defaults to dry-run. Pass --apply to write.
 */

type StuckDraftVariantFix = {
  label: string
  videoVariantId: string
  videoId: string
  languageId: string
  addAvailableLanguage: boolean
}

export const STUCK_DRAFT_VARIANT_FIXES: StuckDraftVariantFix[] = [
  {
    label: 'R4',
    videoVariantId: '529_Next_Gen_Media_ASF_Collection',
    videoId: 'Next_Gen_Media_ASF_Collection',
    languageId: '529',
    addAvailableLanguage: false
  },
  {
    label: 'R2',
    videoVariantId: '7_529-KnowGodBPFull',
    videoId: '7_KnowGodBPFull',
    languageId: '529',
    addAvailableLanguage: true
  }
]

const COMPLETED_RECONCILIATION = {
  status: 'complete',
  published: true,
  retryAt: null,
  errorMessage: null
} as const

async function loadVariant(fix: StuckDraftVariantFix) {
  return await prisma.videoVariant.findUnique({
    where: { id: fix.videoVariantId },
    select: {
      id: true,
      videoId: true,
      languageId: true,
      published: true,
      video: {
        select: { id: true, published: true, availableLanguages: true }
      },
      reconciliation: {
        select: {
          id: true,
          status: true,
          published: true,
          retryAt: true,
          errorMessage: true,
          createdAt: true
        }
      }
    }
  })
}

type LoadedVariant = Awaited<ReturnType<typeof loadVariant>>

function format(value: unknown): string {
  return JSON.stringify(value) ?? 'undefined'
}

function findPreconditionFailures(
  fix: StuckDraftVariantFix,
  variant: LoadedVariant
): string[] {
  if (variant == null) {
    return [`VideoVariant ${fix.videoVariantId} not found`]
  }

  const failures: string[] = []
  if (variant.videoId !== fix.videoId) {
    failures.push(
      `VideoVariant ${fix.videoVariantId} videoId is ${format(variant.videoId)}, expected ${format(fix.videoId)}`
    )
  }
  if (variant.languageId !== fix.languageId) {
    failures.push(
      `VideoVariant ${fix.videoVariantId} languageId is ${format(variant.languageId)}, expected ${format(fix.languageId)}`
    )
  }
  if (variant.published) {
    failures.push(
      `VideoVariant ${fix.videoVariantId} published is true, expected false`
    )
  }
  if (variant.video == null) {
    failures.push(`Video ${fix.videoId} not found`)
  } else if (
    fix.addAvailableLanguage &&
    variant.video.availableLanguages.includes(fix.languageId)
  ) {
    failures.push(
      `Video ${fix.videoId} availableLanguages already contains ${fix.languageId}`
    )
  }
  if (variant.reconciliation == null) {
    failures.push(
      `VideoVariantReconciliation for ${fix.videoVariantId} not found`
    )
  } else if (variant.reconciliation.status === 'complete') {
    failures.push(
      `VideoVariantReconciliation ${variant.reconciliation.id} status is already complete`
    )
  }
  return failures
}

function describeRecord(
  fix: StuckDraftVariantFix,
  variant: NonNullable<LoadedVariant>
): string[] {
  const { video, reconciliation } = variant
  if (video == null || reconciliation == null) return []

  const lines = [
    `[${fix.label}] VideoVariant ${variant.id} (Video ${video.id}, language ${variant.languageId})`,
    '  Before:',
    `    VideoVariant.published: ${format(variant.published)}`,
    `    Video ${video.id} published: ${format(video.published)}`,
    `    Video ${video.id} availableLanguages: ${format(video.availableLanguages)}`,
    `    VideoVariantReconciliation ${reconciliation.id}: status: ${format(reconciliation.status)}, published: ${format(reconciliation.published)}, retryAt: ${format(reconciliation.retryAt)}, errorMessage: ${format(reconciliation.errorMessage)}, createdAt: ${format(reconciliation.createdAt)}`,
    '  Intended changes:',
    `    VideoVariant.published: ${format(variant.published)} -> true`
  ]
  if (fix.addAvailableLanguage) {
    lines.push(
      `    Video ${video.id} availableLanguages: ${format(video.availableLanguages)} -> ${format([...video.availableLanguages, fix.languageId])}`
    )
  }
  lines.push(
    `    VideoVariantReconciliation ${reconciliation.id}: status ${format(reconciliation.status)} -> "complete", published ${format(reconciliation.published)} -> true, retryAt ${format(reconciliation.retryAt)} -> null, errorMessage ${format(reconciliation.errorMessage)} -> null`
  )
  return lines
}

function assertSingleRowUpdated(count: number, description: string): void {
  if (count !== 1) {
    throw new Error(
      `${description} changed after the precondition check (${count} rows matched); transaction rolled back`
    )
  }
}

/**
 * Returns false when any record is no longer in the expected broken state,
 * in which case nothing is written for either record.
 */
export async function fixStuckDraftVariants(apply: boolean): Promise<boolean> {
  const loaded = await Promise.all(
    STUCK_DRAFT_VARIANT_FIXES.map(async (fix) => ({
      fix,
      variant: await loadVariant(fix)
    }))
  )

  const failures = loaded.flatMap(({ fix, variant }) =>
    findPreconditionFailures(fix, variant).map(
      (failure) => `[${fix.label}] ${failure}`
    )
  )
  if (failures.length > 0) {
    console.log(
      'ABORTED: records are not in the expected broken state; nothing was written.'
    )
    for (const failure of failures) console.log(`  - ${failure}`)
    return false
  }

  for (const { fix, variant } of loaded) {
    if (variant == null) continue
    console.log(describeRecord(fix, variant).join('\n'))
  }

  if (!apply) {
    console.log('DRY RUN: no changes written. Re-run with --apply to write.')
    return true
  }

  await prisma.$transaction(async (tx) => {
    for (const fix of STUCK_DRAFT_VARIANT_FIXES) {
      // Each write re-asserts its precondition in the WHERE clause, so a
      // record that changed since it was read rolls the whole transaction
      // back instead of being overwritten.
      const variantUpdate = await tx.videoVariant.updateMany({
        where: {
          id: fix.videoVariantId,
          videoId: fix.videoId,
          languageId: fix.languageId,
          published: false
        },
        data: { published: true }
      })
      assertSingleRowUpdated(
        variantUpdate.count,
        `VideoVariant ${fix.videoVariantId}`
      )

      if (fix.addAvailableLanguage) {
        const videoUpdate = await tx.video.updateMany({
          where: {
            id: fix.videoId,
            NOT: { availableLanguages: { has: fix.languageId } }
          },
          data: { availableLanguages: { push: fix.languageId } }
        })
        assertSingleRowUpdated(videoUpdate.count, `Video ${fix.videoId}`)
      }

      const reconciliationUpdate = await tx.videoVariantReconciliation.updateMany(
        {
          where: {
            videoVariantId: fix.videoVariantId,
            status: { not: 'complete' }
          },
          data: COMPLETED_RECONCILIATION
        }
      )
      assertSingleRowUpdated(
        reconciliationUpdate.count,
        `VideoVariantReconciliation for ${fix.videoVariantId}`
      )
    }
  })

  for (const fix of STUCK_DRAFT_VARIANT_FIXES) {
    await videoCacheReset(fix.videoId)
  }

  console.log(
    'APPLIED: both records updated in one transaction; Video caches reset.'
  )
  return true
}

async function main(): Promise<void> {
  const apply = hasFlag(process.argv, 'apply')

  try {
    const succeeded = await fixStuckDraftVariants(apply)
    if (!succeeded) process.exitCode = 1
  } catch (error) {
    logger.error({ error }, 'Script failed')
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
