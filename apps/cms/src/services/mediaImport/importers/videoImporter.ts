import type { Core } from '@strapi/strapi'

import { PrismaClient } from '.prisma/api-media-client'

const mediaPrisma = new PrismaClient()

export async function importVideos(
  strapi: Core.Strapi,
  lastMediaImport: Date | undefined
): Promise<{ imported: number; errors: string[] }> {
  const localeService = strapi.plugins['i18n'].services.locales
  const locales = await localeService.find()

  const errors: string[] = []
  let imported = 0

  try {
    const where = lastMediaImport ? { updatedAt: { gte: lastMediaImport } } : {}

    const videos = await mediaPrisma.video.findMany({
      where,
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

    strapi.log.info(`VideoImport: Importing ${videos.length} videos`)

    for (const video of videos) {
      if (!video.published) continue
      try {
        const groupedByLanguage = new Map<
          string,
          {
            title?: string
            snippet?: string
            description?: string
            imageAlt?: string
            studyQuestions?: { value: string }[]
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
          langData.studyQuestions.push({ value: question.value })
        }

        let videoDocument = await strapi
          .documents('api::video.video')
          .findFirst({
            filters: {
              remoteId: { $eq: video.id }
            }
          })

        const englishVideoData = groupedByLanguage.get('529')
        const charMap = {
          ä: 'a',
          ç: 'c',
          ğ: 'g',
          é: 'e',
          ú: 'u',
          ü: 'u'
        }
        const slug = video.slug.replace(/[äçğéúü]/g, (match) => charMap[match])

        if (!videoDocument) {
          videoDocument = await strapi.documents('api::video.video').create({
            data: {
              ...englishVideoData,
              title: englishVideoData?.title ?? 'Unknown',
              remoteId: video.id,
              label: video.label,
              slug
            }
          })
        }

        for (const [languageId, langData] of groupedByLanguage.entries()) {
          if (languageId === '529') {
            continue
          }

          const locale = locales.find(({ id }) => id.toString() === languageId)

          if (!locale) {
            errors.push(
              `Skipping video ${video.id} variant for language ${languageId}: no bcp47 mapping found`
            )
            continue
          }

          const baseData = {
            title: langData.title ?? englishVideoData.title,
            snippet: langData.snippet ?? englishVideoData.snippet,
            description: langData.description ?? englishVideoData.description,
            imageAlt: langData.imageAlt ?? englishVideoData.imageAlt,
            studyQuestions:
              langData.studyQuestions ?? englishVideoData?.studyQuestions ?? [],
            slug
          }

          await strapi.documents('api::video.video').update({
            documentId: videoDocument.documentId,
            data: baseData,
            locale: locale.code
          })
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

    strapi.log.info(`Adding children to ${videos.length} videos`)

    for (const video of videos) {
      const videosMap = Object.fromEntries(
        (
          await strapi.documents('api::video.video').findMany({
            filters: {
              remoteId: { $in: [...video.childIds, video.id] }
            },
            fields: ['remoteId', 'documentId']
          })
        ).map(({ documentId, remoteId }) => [remoteId, documentId])
      )
      const videoDocumentId = videosMap[video.id]

      const children = video.childIds
        .map((childId) => videosMap[childId])
        .filter((documentId) => documentId != null)

      await strapi.documents('api::video.video').update({
        documentId: videoDocumentId,
        data: {
          children
        }
      })
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
