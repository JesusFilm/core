import { prisma } from '@core/prisma/media/client'

import { videoVariantContainsMedia } from '../schema/videoVariantReconciliation/videoVariantContainsMedia'

export type ParentVariantAuditEntry = {
  parentVideoId: string
  childVideoId: string
  languageId: string
  variantId: string
  action: 'createGeneratedParentVariant' | 'addParentLanguage'
  result: 'proposed'
}

export type ParentVariantAmbiguity = {
  parentVideoId: string
  languageId: string
  variantId: string
  reason: string
}

export type ParentVariantAuditResult = {
  applied: false
  deterministicGaps: ParentVariantAuditEntry[]
  ambiguous: ParentVariantAmbiguity[]
}

export async function auditParentVariants(): Promise<ParentVariantAuditResult> {
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
        const containsMedia = videoVariantContainsMedia(existingParentVariant)

        if (containsMedia) {
          ambiguous.push({
            parentVideoId: parentVideo.id,
            languageId,
            variantId: existingParentVariant.id,
            reason: 'existing parent Variant contains media'
          })
        }
        if (
          !containsMedia &&
          !parentVideo.availableLanguages.includes(languageId)
        ) {
          deterministicGaps.push({
            parentVideoId: parentVideo.id,
            childVideoId: qualifyingVariant.childVideoId,
            languageId,
            variantId: existingParentVariant.id,
            action: 'addParentLanguage',
            result: 'proposed'
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
        result: 'proposed'
      })
    }
  }

  return {
    applied: false,
    deterministicGaps,
    ambiguous
  }
}
