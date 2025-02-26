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
    labeledVideoCounts: t.loadable({
      type: LabeledVideoCounts,
      nullable: false,
      load: async (languageIds: readonly string[]) => {
        // Query VideoVariants with their related Video to get the label
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

        // Initialize counts for all requested IDs
        languageIds.forEach((id) => {
          countsMap.set(id.toString(), {
            seriesCount: 0,
            featureFilmCount: 0,
            shortFilmCount: 0
          })
        })

        // Update counts based on results
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

        // Return counts in the same order as the input IDs
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
