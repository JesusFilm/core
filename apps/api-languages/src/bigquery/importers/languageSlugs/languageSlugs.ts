import { languageSlugs } from '../../../__generated__/languageSlugs'
import { prisma } from '../../../lib/prisma'
import { slugify } from '../../../lib/slugify'

export async function importLanguageSlugs(): Promise<void> {
  const emptyExistingSlugs = await prisma.language.findFirst({
    where: {
      slug: 'english'
    }
  })

  // import slugs from AEM
  if (emptyExistingSlugs == null) {
    console.log('importing AEM language slugs')
    for (const key of Object.keys(languageSlugs)) {
      const slug = languageSlugs[key]
      await prisma.language.update({
        where: {
          id: key
        },
        data: {
          slug
        }
      })
    }
    console.log('finished importing AEM language slugs')
  } else {
    console.log('no AEM language slugs to import')
  }

  const emptySlugs = await prisma.language.findMany({
    where: {
      slug: null,
      nameLanguage: { some: { languageId: '529' } }
    }
  })

  if (emptySlugs.length === 0) {
    console.log('no named empty language slugs to generate')
    return
  }

  console.log('generating new language slugs')

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
    const slug = slugify(language.id, languageName.value, existingSlugs)
    newLanguageSlugs[language.id] = slug
    existingSlugs[language.id] = slug
  }

  for (const languageId of Object.keys(newLanguageSlugs)) {
    await prisma.language.update({
      where: {
        id: languageId
      },
      data: {
        slug: newLanguageSlugs[languageId]
      }
    })
  }

  console.log('finished generating new language slugs')
}
