import type { Core } from '@strapi/strapi'

import { PrismaClient } from '.prisma/api-media-client'

const mediaPrisma = new PrismaClient()

const BATCH_SIZE = 1000

export async function importVideoVariants(
  strapi: Core.Strapi,
  lastMediaImport: Date | undefined
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = []
  let imported = 0

  const videoMap = Object.fromEntries(
    (
      await strapi.documents('api::video.video').findMany({
        fields: ['remoteId', 'documentId']
      })
    ).map(({ documentId, remoteId }) => [remoteId, documentId])
  )

  const languageMap = Object.fromEntries(
    (
      await strapi.documents('api::language.language').findMany({
        fields: ['remoteId', 'documentId']
      })
    ).map(({ documentId, remoteId }) => [remoteId, documentId])
  )

  const videoVariantsMap = Object.fromEntries(
    (
      await strapi.documents('api::video-variant.video-variant').findMany({
        fields: ['remoteId', 'documentId']
      })
    ).map(({ documentId, remoteId }) => [remoteId, documentId])
  )

  const where = lastMediaImport ? { updatedAt: { gte: lastMediaImport } } : {}
  const videoVariantsCount = await mediaPrisma.videoVariant.count({ where })
  strapi.log.info(
    `VideoVariantImport: Importing ${videoVariantsCount} video variants`
  )

  try {
    let skip = 0
    let hasMore = true
    while (hasMore) {
      const variants = await mediaPrisma.videoVariant.findMany({
        where,
        skip,
        take: BATCH_SIZE,
        include: {
          video: {
            select: {
              published: true
            }
          }
        }
      })
      if (variants.length === 0) {
        hasMore = false
        break
      }

      for (const variant of variants) {
        if (!variant.video.published) continue
        try {
          const data = {
            remoteId: variant.id,
            duration: variant.duration,
            lengthInMilliseconds: variant.lengthInMilliseconds,
            hls: variant.hls,
            downloadable: variant.downloadable,
            language: languageMap[variant.languageId],
            video: videoMap[variant.videoId]
          }

          const existingDocumentId = videoVariantsMap[variant.id]

          if (existingDocumentId) {
            await strapi.documents('api::video-variant.video-variant').update({
              documentId: existingDocumentId,
              data
            })
          } else {
            await strapi.documents('api::video-variant.video-variant').create({
              data
            })
          }

          imported++
        } catch (error) {
          const errorMessage = `Failed to import variant ${variant.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
          errors.push(errorMessage)
          strapi.log.error(errorMessage, error)
        }
      }

      skip += variants.length
      if (variants.length < BATCH_SIZE) {
        hasMore = false
      }

      strapi.log.info(
        `VideoVariantImport: ${imported} / ${videoVariantsCount} imported`
      )
    }
  } catch (error) {
    const errorMessage = `VideoVariantImport: Failed to query video variants: ${
      error instanceof Error ? error.message : String(error)
    }`
    errors.push(errorMessage)
    strapi.log.error(errorMessage, error)
  }

  return { imported, errors }
}
