import type { Core } from '@strapi/strapi'

import type { VideoVariantDownload } from '.prisma/api-media-client'
import { PrismaClient } from '.prisma/api-media-client'

const mediaPrisma = new PrismaClient()

const BATCH_SIZE = 1000

type DownloadComponent = {
  quality:
    | 'distroLow'
    | 'distroSd'
    | 'distroHigh'
    | 'low'
    | 'sd'
    | 'high'
    | 'fhd'
    | 'qhd'
    | 'uhd'
    | 'highest'
  size: number
  height: number
  width: number
  bitrate: number
  url: string
}

function mapDownload(d: VideoVariantDownload): DownloadComponent | null {
  if (!d.url) return null
  return {
    quality: d.quality as DownloadComponent['quality'],
    size: d.size ?? 0,
    height: d.height ?? 0,
    width: d.width ?? 0,
    bitrate: d.bitrate ?? 0,
    url: d.url
  }
}

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

  const videoEditions = await strapi
    .documents('api::video-edition.video-edition')
    .findMany({
      fields: ['name', 'documentId'],
      populate: ['video']
    })
  const videoEditionMap = Object.fromEntries(
    videoEditions
      .filter((e) => e.video?.remoteId != null)
      .map((e) => [`${e.video.remoteId}:${e.name}`, e.documentId])
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
          },
          downloads: true
        }
      })
      if (variants.length === 0) {
        hasMore = false
        break
      }

      for (const variant of variants) {
        if (!variant.video.published) continue
        try {
          const videoEditionKey = `${variant.videoId}:${variant.edition}`
          const videoEditionDocumentId = videoEditionMap[videoEditionKey]
          if (!videoEditionDocumentId) {
            errors.push(
              `Variant ${variant.id}: video edition ${videoEditionKey} not found`
            )
            continue
          }

          const downloads = variant.downloads
            .map(mapDownload)
            .filter((d): d is NonNullable<typeof d> => d != null)

          const data = {
            remoteId: variant.id,
            duration: variant.duration,
            lengthInMilliseconds: variant.lengthInMilliseconds,
            hls: variant.hls,
            downloadable: variant.downloadable,
            language: languageMap[variant.languageId],
            video: videoMap[variant.videoId],
            edition: videoEditionDocumentId,
            downloads
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
