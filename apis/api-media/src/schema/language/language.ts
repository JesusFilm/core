import { prisma } from '@core/prisma/media/client'

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
    labeledVideoCounts: t.loadable({
      type: LabeledVideoCounts,
      nullable: false,
      load: async (languageIds: readonly string[]) => {
        const results = await prisma.videoVariant.findMany({
          where: {
            languageId: { in: Array.from(languageIds) },
            video: {
              label: { in: ['series', 'featureFilm', 'shortFilm'] }
            }
          },
          select: {
            languageId: true,
            video: {
              select: {
                label: true
              }
            }
          }
        })

        const countsMap = new Map<string, LabeledVideoCountsType>()

        languageIds.forEach((id) => {
          countsMap.set(id.toString(), {
            seriesCount: 0,
            featureFilmCount: 0,
            shortFilmCount: 0
          })
        })

        results.forEach((variant) => {
          if (variant.video?.label) {
            const counts = countsMap.get(variant.languageId)
            if (counts) {
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
          }
        })

        return languageIds.map(
          (id) =>
            countsMap.get(id.toString()) || {
              seriesCount: 0,
              featureFilmCount: 0,
              shortFilmCount: 0
            }
        )
      },
      resolve: (parent) => parent.id
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
