import { Logger } from 'pino'

import { Prisma } from '.prisma/api-languages-client'

import { languageSlugs } from '../../../../__generated__/languageSlugs'
import { prisma } from '../../../../lib/prisma'
import { slugify } from '../../../../lib/slugify'
import { convertToSlug } from '../../../../lib/slugify/slugify'

export async function importLanguageSlugs(logger?: Logger): Promise<void> {
  const emptyExistingSlugs = await prisma.language.findFirst({
    where: {
      slug: 'english'
    }
  })

  // import slugs from AEM
  if (emptyExistingSlugs == null) {
    logger?.info('importing AEM language slugs')
    for (const key of Object.keys(languageSlugs)) {
      try {
        const slug = languageSlugs[key]
        await prisma.language.update({
          where: {
            id: key
          },
          data: {
            slug
          }
        })
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025' // Record to update not found
        ) {
          logger?.error(
            { languageId: key, slug: languageSlugs[key] },
            'cannot update stored slug for language'
          )
        } else {
          throw error
        }
      }
    }
    logger?.info('finished importing AEM language slugs')
  } else {
    logger?.info('no AEM language slugs to import')
  }

  const emptySlugs = await prisma.language.findMany({
    where: {
      slug: null,
      nameLanguage: { some: { languageId: '529' } }
    }
  })

  if (emptySlugs.length === 0) {
    logger?.info('no named empty language slugs to generate')
    return
  }

  logger?.info('generating new language slugs')

  const results = await prisma.language.findMany({
    where: {
      slug: { not: null }
    }
  })

  const existingSlugs: Record<string, string> = {}

  for (const result of results) {
    existingSlugs[result.id] = result.slug as string
  }

  // generate new slugs for languages that don't have them
  const languageNames = await prisma.languageName.findMany({
    where: {
      languageId: '529'
    }
  })

  const newLanguageSlugs: Record<string, string> = {}

  for (const language of emptySlugs) {
    const languageName = languageNames.find(
      (languageName) => languageName.parentLanguageId === language.id
    )
    if (languageName == null) continue
    const slug = slugify(
      language.id,
      convertToSlug(languageName.value),
      existingSlugs
    )
    newLanguageSlugs[language.id] = slug
    existingSlugs[language.id] = slug
  }

  for (const languageId of Object.keys(newLanguageSlugs)) {
    try {
      await prisma.language.update({
        where: {
          id: languageId
        },
        data: {
          slug: newLanguageSlugs[languageId]
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025' // Record to update not found
      ) {
        logger?.error(
          { languageId, slug: newLanguageSlugs[languageId] },
          'cannot update slug for language'
        )
      } else {
        throw error
      }
    }
  }

  logger?.info('finished generating new language slugs')
}
