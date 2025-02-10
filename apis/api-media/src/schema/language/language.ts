import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

export const Language = builder.externalRef(
  'Language',
  builder.selection<{ id: string }>('id')
)

Language.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    seriesCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        return await prisma.videoVariant.count({
          where: {
            languageId: parent.id,
            video: {
              label: 'series'
            }
          }
        })
      }
    }),
    featureFilmCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        return await prisma.videoVariant.count({
          where: {
            languageId: parent.id,
            video: {
              label: 'featureFilm'
            }
          }
        })
      }
    }),
    shortFilmCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        return await prisma.videoVariant.count({
          where: {
            languageId: parent.id,
            video: {
              label: 'shortFilm'
            }
          }
        })
      }
    })
  })
})

interface LanguageWithSlugShape {
  language: { id: string }
  slug: string
}

export const LanguageWithSlug =
  builder.objectRef<LanguageWithSlugShape>('LanguageWithSlug')

LanguageWithSlug.implement({
  fields: (t) => ({
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ language: { id } }) => ({ id })
    }),
    slug: t.exposeString('slug', { nullable: false })
  })
})
