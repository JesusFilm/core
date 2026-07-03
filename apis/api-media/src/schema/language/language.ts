import { prisma } from '@core/prisma/media/client'

import { reindexLanguagesWithVideosInAlgolia } from '../../lib/languages/updateLanguageInAlgolia'
import { builder } from '../builder'
import { logger } from '../logger'

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
        // Get counts for each label separately using efficient count queries
        const [seriesCounts, featureFilmCounts, shortFilmCounts] =
          await Promise.all([
            prisma.videoVariant.groupBy({
              by: ['languageId'],
              where: {
                languageId: { in: Array.from(languageIds) },
                video: { label: 'series' }
              },
              _count: { _all: true }
            }),
            prisma.videoVariant.groupBy({
              by: ['languageId'],
              where: {
                languageId: { in: Array.from(languageIds) },
                video: { label: 'featureFilm' }
              },
              _count: { _all: true }
            }),
            prisma.videoVariant.groupBy({
              by: ['languageId'],
              where: {
                languageId: { in: Array.from(languageIds) },
                video: { label: 'shortFilm' }
              },
              _count: { _all: true }
            })
          ])

        // Create maps for O(1) lookup
        const seriesMap = new Map(
          seriesCounts.map((item) => [item.languageId, item._count._all])
        )
        const featureFilmMap = new Map(
          featureFilmCounts.map((item) => [item.languageId, item._count._all])
        )
        const shortFilmMap = new Map(
          shortFilmCounts.map((item) => [item.languageId, item._count._all])
        )

        return languageIds.map((id) => ({
          seriesCount: seriesMap.get(id) || 0,
          featureFilmCount: featureFilmMap.get(id) || 0,
          shortFilmCount: shortFilmMap.get(id) || 0
        }))
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

interface ReindexLanguagesInAlgoliaResultShape {
  count: number
}

const ReindexLanguagesInAlgoliaResult =
  builder.objectRef<ReindexLanguagesInAlgoliaResultShape>(
    'ReindexLanguagesInAlgoliaResult'
  )

ReindexLanguagesInAlgoliaResult.implement({
  fields: (t) => ({
    count: t.exposeInt('count', {
      nullable: false,
      description: 'Number of languages pushed to the Algolia languages index'
    })
  })
})

builder.mutationFields((t) => ({
  // Repairs the Algolia languages index by re-upserting every language that has
  // videos. Languages that were already hasVideos: true never hit the
  // incremental sync, so this backfills them and makes them searchable.
  reindexLanguagesInAlgolia: t.withAuth({ isPublisher: true }).field({
    type: ReindexLanguagesInAlgoliaResult,
    nullable: false,
    resolve: async () => await reindexLanguagesWithVideosInAlgolia(logger)
  })
}))
