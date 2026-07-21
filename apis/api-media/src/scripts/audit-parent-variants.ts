import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../lib/algolia/algoliaVideoVariantUpdate'

export type ParentVariantAuditEntry = {
  parentVideoId: string
  childVideoId: string
  languageId: string
  variantId: string
  action: 'createGeneratedParentVariant'
  result: 'proposed' | 'applied'
}

export type ParentVariantAmbiguity = {
  parentVideoId: string
  languageId: string
  variantId: string
  reason: string
}

export type ParentVariantIndexingFailure = {
  parentVideoId: string
  languageId: string
  variantId: string
  error: string
}

export type ParentVariantAuditResult = {
  applied: boolean
  deterministicGaps: ParentVariantAuditEntry[]
  ambiguous: ParentVariantAmbiguity[]
  indexingFailures: ParentVariantIndexingFailure[]
}

export async function auditParentVariants(
  apply = false
): Promise<ParentVariantAuditResult> {
  const parentVideos = await prisma.video.findMany({
    where: { childIds: { isEmpty: false } },
    select: {
      id: true,
      slug: true,
      published: true,
      availableLanguages: true,
      variants: {
        select: {
          id: true,
          languageId: true,
          hls: true,
          dash: true,
          share: true,
          masterUrl: true,
          duration: true,
          muxVideoId: true,
          assetId: true,
          downloads: { select: { id: true } }
        }
      },
      children: {
        select: {
          id: true,
          published: true,
          variants: {
            where: { published: true },
            select: {
              id: true,
              languageId: true,
              slug: true,
              published: true
            }
          }
        }
      }
    }
  })

  const deterministicGaps: ParentVariantAuditEntry[] = []
  const ambiguous: ParentVariantAmbiguity[] = []
  const indexingFailures: ParentVariantIndexingFailure[] = []

  for (const parentVideo of parentVideos) {
    const qualifyingVariantByLanguage = new Map<
      string,
      { childVideoId: string; languageSlug: string }
    >()

    for (const childVideo of parentVideo.children) {
      for (const childVariant of childVideo.variants) {
        if (!qualifyingVariantByLanguage.has(childVariant.languageId)) {
          qualifyingVariantByLanguage.set(childVariant.languageId, {
            childVideoId: childVideo.id,
            languageSlug:
              childVariant.slug.split('/').filter(Boolean).at(-1) ??
              childVariant.languageId
          })
        }
      }
    }

    for (const [languageId, qualifyingVariant] of qualifyingVariantByLanguage) {
      const existingParentVariant = parentVideo.variants.find(
        (variant) => variant.languageId === languageId
      )
      if (existingParentVariant != null) {
        const containsMedia =
          Boolean(existingParentVariant.hls) ||
          Boolean(existingParentVariant.dash) ||
          Boolean(existingParentVariant.share) ||
          Boolean(existingParentVariant.masterUrl) ||
          Boolean(existingParentVariant.muxVideoId) ||
          Boolean(existingParentVariant.assetId) ||
          (existingParentVariant.duration ?? 0) > 0 ||
          (existingParentVariant.downloads?.length ?? 0) > 0

        if (containsMedia) {
          ambiguous.push({
            parentVideoId: parentVideo.id,
            languageId,
            variantId: existingParentVariant.id,
            reason: 'existing parent Variant contains media'
          })
        }
        continue
      }

      deterministicGaps.push({
        parentVideoId: parentVideo.id,
        childVideoId: qualifyingVariant.childVideoId,
        languageId,
        variantId: `${languageId}_${parentVideo.id}`,
        action: 'createGeneratedParentVariant',
        result: apply ? 'applied' : 'proposed'
      })

      if (!apply) continue

      const variantId = `${languageId}_${parentVideo.id}`
      const statusId = `status_${variantId}`
      const pendingStages = {
        mux: { state: 'notApplicable', attempts: 0 },
        parentSync: { state: 'complete', attempts: 1 },
        downloads: { state: 'notApplicable', attempts: 0 },
        algoliaVideo: { state: 'pending', attempts: 0 },
        algoliaVariant: { state: 'pending', attempts: 0 }
      }

      await prisma.$transaction(async (transaction) => {
        await transaction.videoVariant.create({
          data: {
            id: variantId,
            videoId: parentVideo.id,
            languageId,
            edition: 'base',
            slug: `${parentVideo.slug ?? parentVideo.id}/${qualifyingVariant.languageSlug}`,
            hls: '',
            dash: '',
            share: '',
            published: false,
            downloadable: false,
            duration: 0,
            lengthInMilliseconds: 0
          }
        })
        await transaction.video.update({
          where: { id: parentVideo.id },
          data: {
            availableLanguages: Array.from(
              new Set([...parentVideo.availableLanguages, languageId])
            )
          }
        })
        await transaction.videoVariantUpload.create({
          data: {
            id: statusId,
            source: 'generated-parent',
            status: 'processing',
            canonical: true,
            videoId: parentVideo.id,
            languageId,
            published: true,
            videoVariantId: variantId,
            processingStages: pendingStages
          }
        })
      })

      let algoliaVideoStage: {
        state: 'complete' | 'failed'
        attempts: number
        error?: string
      } = { state: 'complete', attempts: 1 }
      try {
        await updateVideoInAlgolia(parentVideo.id)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        algoliaVideoStage = {
          state: 'failed',
          attempts: 1,
          error: errorMessage
        }
        indexingFailures.push({
          parentVideoId: parentVideo.id,
          languageId,
          variantId,
          error: errorMessage
        })
        await prisma.videoVariantUpload.update({
          where: { id: statusId },
          data: {
            status: 'degraded',
            retryAt: new Date(),
            processingStages: {
              ...pendingStages,
              algoliaVideo: algoliaVideoStage
            }
          }
        })
        continue
      }

      try {
        await prisma.videoVariant.update({
          where: { id: variantId },
          data: { published: true }
        })
        await updateVideoVariantInAlgolia(variantId)
        await prisma.videoVariantUpload.update({
          where: { id: statusId },
          data: {
            status: 'complete',
            processingStages: {
              ...pendingStages,
              algoliaVideo: algoliaVideoStage,
              algoliaVariant: { state: 'complete', attempts: 1 }
            }
          }
        })
      } catch (error) {
        await prisma.videoVariant.update({
          where: { id: variantId },
          data: { published: false }
        })
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        indexingFailures.push({
          parentVideoId: parentVideo.id,
          languageId,
          variantId,
          error: errorMessage
        })
        await prisma.videoVariantUpload.update({
          where: { id: statusId },
          data: {
            status: 'degraded',
            retryAt: new Date(),
            processingStages: {
              ...pendingStages,
              algoliaVideo: algoliaVideoStage,
              algoliaVariant: {
                state: 'failed',
                attempts: 1,
                error: errorMessage
              }
            }
          }
        })
      }
    }
  }

  return {
    applied: apply,
    deterministicGaps,
    ambiguous,
    indexingFailures
  }
}
