import type { Core } from '@strapi/strapi'

import { PrismaClient } from '.prisma/api-media-client'

import { languageIdToLocale } from '../lib/languageMapping'

const mediaPrisma = new PrismaClient()

export async function importVideos(
  strapi: Core.Strapi,
  lastMediaImport: Date | null
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = []
  let imported = 0

  try {
    // Note: Video model doesn't have updatedAt field, so we import all videos
    // Incremental sync would require updatedAt field in the Prisma schema
    const videos = await mediaPrisma.video.findMany({
      include: {
        title: true,
        snippet: true,
        description: true,
        imageAlt: true,
        studyQuestions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    for (const video of videos) {
      try {
        const documentId = `video-${video.id}`

        const groupedByLanguage = new Map<
          string,
          {
            title?: string
            snippet?: string
            description?: string
            imageAlt?: string
            studyQuestions?: string[]
          }
        >()

        for (const title of video.title) {
          if (!groupedByLanguage.has(title.languageId)) {
            groupedByLanguage.set(title.languageId, {})
          }
          const langData = groupedByLanguage.get(title.languageId)
          langData.title = title.value
        }

        for (const snippet of video.snippet) {
          if (!groupedByLanguage.has(snippet.languageId)) {
            groupedByLanguage.set(snippet.languageId, {})
          }
          const langData = groupedByLanguage.get(snippet.languageId)
          langData.snippet = snippet.value
        }

        for (const desc of video.description) {
          if (!groupedByLanguage.has(desc.languageId)) {
            groupedByLanguage.set(desc.languageId, {})
          }
          const langData = groupedByLanguage.get(desc.languageId)
          langData.description = desc.value
        }

        for (const alt of video.imageAlt) {
          if (!groupedByLanguage.has(alt.languageId)) {
            groupedByLanguage.set(alt.languageId, {})
          }
          const langData = groupedByLanguage.get(alt.languageId)
          langData.imageAlt = alt.value
        }

        for (const question of video.studyQuestions) {
          if (!groupedByLanguage.has(question.languageId)) {
            groupedByLanguage.set(question.languageId, {})
          }
          const langData = groupedByLanguage.get(question.languageId)
          if (!langData.studyQuestions) {
            langData.studyQuestions = []
          }
          langData.studyQuestions.push(question.value)
        }

        let firstDocumentId: string | undefined

        for (const [languageId, langData] of groupedByLanguage.entries()) {
          const locale = await languageIdToLocale(languageId)

          if (!locale) {
            errors.push(
              `Skipping video ${video.id} variant for language ${languageId}: no bcp47 mapping found`
            )
            continue
          }

          const baseData = {
            apiMediaId: video.id,
            label: video.label,
            slug: video.slug ?? undefined,
            primaryLanguageId: video.primaryLanguageId,
            published: video.published,
            noIndex: video.noIndex ?? undefined,
            locked: video.locked,
            availableLanguages: video.availableLanguages,
            childIds: video.childIds,
            publishedAt: video.publishedAt ?? undefined,
            originId: video.originId ?? undefined,
            restrictDownloadPlatforms: video.restrictDownloadPlatforms,
            restrictViewPlatforms: video.restrictViewPlatforms,
            title: langData.title ?? undefined,
            snippet: langData.snippet ?? undefined,
            description: langData.description ?? undefined,
            imageAlt: langData.imageAlt ?? undefined,
            studyQuestions: langData.studyQuestions ?? undefined
          }

          const existing = await strapi.documents('api::video.video').findMany({
            filters: {
              $and: [
                { apiMediaId: { $eq: video.id } },
                { locale: { $eq: locale } }
              ]
            },
            limit: 1
          })

          if (existing && existing.length > 0) {
            const existingDoc = existing[0]
            if (!firstDocumentId) {
              firstDocumentId = existingDoc.documentId
            }
            await strapi.documents('api::video.video').update({
              documentId: existingDoc.documentId,
              data: baseData,
              locale
            })
          } else {
            const createOptions: {
              data: typeof baseData
              locale: string
              documentId?: string
            } = {
              data: baseData,
              locale
            }

            if (firstDocumentId) {
              createOptions.documentId = firstDocumentId
            }

            const created = await strapi
              .documents('api::video.video')
              .create(createOptions)

            if (!firstDocumentId && created.documentId) {
              firstDocumentId = created.documentId
            }
          }
        }

        imported++
      } catch (error) {
        const errorMessage = `Failed to import video ${video.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
        errors.push(errorMessage)
        strapi.log.error(errorMessage, error)
      }
    }
  } catch (error) {
    const errorMessage = `Failed to query videos: ${
      error instanceof Error ? error.message : String(error)
    }`
    errors.push(errorMessage)
    strapi.log.error(errorMessage, error)
  }

  return { imported, errors }
}
