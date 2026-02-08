import type { Core } from '@strapi/strapi'
import { Input } from '@strapi/types/dist/modules/documents/params/data'

import { PrismaClient } from '.prisma/api-media-client'

const mediaPrisma = new PrismaClient()

const BATCH_SIZE = 1000

export async function importVideoEditions(
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

  const where = lastMediaImport ? { updatedAt: { gte: lastMediaImport } } : {}
  const editionsCount = await mediaPrisma.videoEdition.count({ where })
  strapi.log.info(
    `VideoEditionImport: Importing ${editionsCount} video editions`
  )

  try {
    let skip = 0
    let hasMore = true
    while (hasMore) {
      const editions = await mediaPrisma.videoEdition.findMany({
        where,
        skip,
        take: BATCH_SIZE,
        include: {
          video: {
            select: { published: true }
          },
          videoSubtitles: true
        }
      })

      if (editions.length === 0) {
        hasMore = false
        break
      }

      for (const edition of editions) {
        if (!edition.video.published) continue

        const videoDocumentId = videoMap[edition.videoId]
        if (!videoDocumentId) {
          errors.push(
            `VideoEdition ${edition.id}: video ${edition.videoId} not found in Strapi`
          )
          continue
        }

        try {
          const existing = await strapi
            .documents('api::video-edition.video-edition')
            .findFirst({
              filters: {
                video: { documentId: { $eq: videoDocumentId } },
                name: { $eq: edition.name }
              }
            })

          const subtitles = edition.videoSubtitles
            .map((s) => {
              const languageDocumentId = languageMap[s.languageId]
              if (!languageDocumentId) return null
              return {
                vttSrc: s.vttSrc ?? undefined,
                srtSrc: s.srtSrc ?? undefined,
                language: languageDocumentId
              }
            })
            .filter((s): s is NonNullable<typeof s> => s != null)

          const data: Input<'api::video-edition.video-edition'> = {
            name: edition.name,
            video: videoDocumentId,
            publishedAt: new Date(),
            subtitles
          }

          if (existing) {
            await strapi
              .documents('api::video-edition.video-edition')
              .update({
                documentId: existing.documentId,
                data
              })
          } else {
            await strapi
              .documents('api::video-edition.video-edition')
              .create({
                data
              })
          }

          imported++
        } catch (error) {
          const errorMessage = `VideoEditionImport: Failed to import edition ${edition.id} (${edition.name}): ${
            error instanceof Error ? error.message : String(error)
          }`
          errors.push(errorMessage)
          strapi.log.error(errorMessage, error)
        }
      }

      skip += editions.length
      if (editions.length < BATCH_SIZE) {
        hasMore = false
      }

      strapi.log.info(
        `VideoEditionImport: ${imported} / ${editionsCount} imported`
      )
    }
  } catch (error) {
    const errorMessage = `VideoEditionImport: Failed to query video editions: ${
      error instanceof Error ? error.message : String(error)
    }`
    errors.push(errorMessage)
    strapi.log.error(errorMessage, error)
  }

  return { imported, errors }
}
