import type { Core } from '@strapi/strapi'

import { PrismaClient } from '.prisma/api-media-client'

const mediaPrisma = new PrismaClient()

export async function importVideoVariants(
  strapi: Core.Strapi,
  lastMediaImport: Date | null
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = []
  let imported = 0

  try {
    // Note: VideoVariant model doesn't have updatedAt field, so we import all variants
    // Incremental sync would require updatedAt field in the Prisma schema
    const variants = await mediaPrisma.videoVariant.findMany({
      include: {
        video: true
      }
    })

    for (const variant of variants) {
      try {
        const videoDocuments = await strapi.entityService.findMany(
          'api::video.video',
          {
            filters: { apiMediaId: { $eq: variant.videoId } },
            limit: 1
          }
        )

        if (!videoDocuments || videoDocuments.length === 0) {
          errors.push(
            `Skipping variant ${variant.id}: video ${variant.videoId} not found`
          )
          continue
        }

        const videoId = videoDocuments[0].id

        const data = {
          apiMediaId: variant.id,
          video: videoId,
          languageId: variant.languageId,
          slug: variant.slug,
          duration: variant.duration ?? undefined,
          lengthInMilliseconds: variant.lengthInMilliseconds ?? undefined,
          hls: variant.hls ?? undefined,
          dash: variant.dash ?? undefined,
          share: variant.share ?? undefined,
          downloadable: variant.downloadable,
          published: variant.published,
          version: variant.version,
          edition: variant.edition,
          masterUrl: variant.masterUrl ?? undefined,
          masterWidth: variant.masterWidth ?? undefined,
          masterHeight: variant.masterHeight ?? undefined
        }

        const existing = await strapi.entityService.findMany(
          'api::video-variant.video-variant',
          {
            filters: { apiMediaId: variant.id },
            limit: 1
          }
        )

        if (existing && existing.length > 0) {
          await strapi.entityService.update(
            'api::video-variant.video-variant',
            existing[0].id,
            { data }
          )
        } else {
          await strapi.entityService.create(
            'api::video-variant.video-variant',
            { data }
          )
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
  } catch (error) {
    const errorMessage = `Failed to query video variants: ${
      error instanceof Error ? error.message : String(error)
    }`
    errors.push(errorMessage)
    strapi.log.error(errorMessage, error)
  }

  return { imported, errors }
}
