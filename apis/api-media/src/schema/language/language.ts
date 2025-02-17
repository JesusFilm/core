import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

export const Language = builder.externalRef(
  'Language',
  builder.selection<{ id: string }>('id')
)

interface LabeledVideoCountsType {
  seriesCount: number
  featureFilmCount: number
  shortFilmCount: number
}

const LabeledVideoCounts =
  builder.objectRef<LabeledVideoCountsType>('LabeledVideoCounts')

LabeledVideoCounts.implement({
  fields: (t) => ({
    seriesCount: t.exposeInt('seriesCount', { nullable: false }),
    featureFilmCount: t.exposeInt('featureFilmCount', { nullable: false }),
    shortFilmCount: t.exposeInt('shortFilmCount', { nullable: false })
  })
})

Language.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    labeledVideoCounts: t.field({
      type: LabeledVideoCounts,
      nullable: false,
      resolve: async (parent) => {
        const variants = await prisma.videoVariant.findMany({
          where: {
            languageId: parent.id,
            video: {
              label: {
                in: ['series', 'featureFilm', 'shortFilm']
              }
            }
          },
          select: {
            video: {
              select: {
                label: true
              }
            }
          }
        })

        const counts: LabeledVideoCountsType = {
          seriesCount: 0,
          featureFilmCount: 0,
          shortFilmCount: 0
        }

        variants.forEach((variant) => {
          if (variant.video?.label) {
            switch (variant.video.label) {
              case 'series':
                counts.seriesCount++
                break
              case 'featureFilm':
                counts.featureFilmCount++
                break
              case 'shortFilm':
                counts.shortFilmCount++
                break
            }
          }
        })

        return counts
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
