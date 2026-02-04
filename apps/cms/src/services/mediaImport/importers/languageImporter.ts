import type { Core } from '@strapi/strapi'
import { Input } from '@strapi/types/dist/modules/documents/params/data'

import { PrismaClient } from '.prisma/api-languages-client'

const languagesPrisma = new PrismaClient()

const BATCH_SIZE = 1000

export async function importLanguages(
  strapi: Core.Strapi,
  lastLanguageImport: Date | undefined
): Promise<{ imported: number; errors: string[] }> {
  const localeService = strapi.plugins['i18n'].services.locales

  const errors: string[] = []
  let imported = 0

  const languagesCount = await languagesPrisma.language.count()
  strapi.log.info(`LanguageImport: Importing ${languagesCount} languages`)

  try {
    const where = lastLanguageImport
      ? {
          updatedAt: { gte: lastLanguageImport },
          hasVideos: true
        }
      : {
          hasVideos: true
        }

    let skip = 0
    let hasMore = true

    while (hasMore) {
      const languages = await languagesPrisma.language.findMany({
        where,
        include: {
          name: {
            include: {
              language: {
                include: {
                  name: true
                }
              }
            }
          }
        },
        take: BATCH_SIZE,
        skip,
        orderBy: { id: 'asc' }
      })

      if (languages.length === 0) {
        hasMore = false
        break
      }

      for (const language of languages) {
        try {
          // english name
          const languageName =
            language.name.find((n) => n.languageId === '529')?.value ??
            'Unknown'

          const existing = await strapi
            .documents('api::language.language')
            .findFirst({
              locale: 'en',
              filters: { remoteId: language.id }
            })

          const data: Input<'api::language.language'> = {
            remoteId: language.id,
            bcp47: language.bcp47,
            name: languageName,
            iso3: language.iso3,
            slug: language.slug
          }

          let languageStrapi

          if (existing) {
            languageStrapi = await strapi
              .documents('api::language.language')
              .update({
                documentId: existing.documentId,
                data
              })
          } else {
            languageStrapi = await strapi
              .documents('api::language.language')
              .create({
                data
              })
          }

          if (language.name.length > 1 && languageStrapi != null) {
            for (const {
              value,
              language: translationLanguage
            } of language.name) {
              if (translationLanguage.id !== '529') {
                try {
                  const locale = await localeService.findByCode(
                    translationLanguage.bcp47
                  )
                  if (!locale) {
                    const localeName =
                      translationLanguage.name.find(
                        (n) => n.languageId === '529'
                      )?.value ??
                      translationLanguage.name.find((n) => n.primary)?.value ??
                      'Unknown'
                    await localeService.create({
                      id: translationLanguage.id,
                      code: translationLanguage.bcp47,
                      name: `${localeName} (${translationLanguage.bcp47})`
                    })
                  }
                  await strapi.documents('api::language.language').update({
                    documentId: languageStrapi.documentId,
                    locale: translationLanguage.bcp47,
                    data: { name: value }
                  })
                } catch (error) {
                  strapi.log.error(
                    `LanguageImport: Failed to create name ${translationLanguage.bcp47} for language ${language.id}: ${error}`
                  )
                }
              }
            }
          }

          imported++
        } catch (error) {
          const errorMessage = `LanguageImport: Failed to import language ${language.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
          errors.push(errorMessage)
          strapi.log.error(errorMessage, error)
        }
      }

      skip += languages.length
      if (languages.length < BATCH_SIZE) {
        hasMore = false
      }

      strapi.log.info(
        `LanguageImport: ${imported} / ${languagesCount} imported`
      )
    }
  } catch (error) {
    const errorMessage = `LanguageImport: Failed to query languages: ${
      error instanceof Error ? error.message : String(error)
    }`
    errors.push(errorMessage)
    strapi.log.error(errorMessage, error)
  }

  return { imported, errors }
}
