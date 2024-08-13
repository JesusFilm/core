import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import map from 'lodash/map'
import take from 'lodash/take'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { SwiperOptions } from 'swiper/types'

import {
  AlgoliaJourney,
  useAlgoliaJourneys
} from '../../libs/algolia/useAlgoliaJourneys'
import { ContentCarousel } from '../ContentCarousel'
import { EmptySearch } from '../EmptySearch'
import { TemplateGalleryCard } from '../TemplateGalleryCard'

interface Contents {
  [key: string]: { category: string; journeys: AlgoliaJourney[] }
}

export function TemplateSections(): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { breakpoints } = useTheme()
  const { hits, loading, refinements } = useAlgoliaJourneys()

  function getAllTags(journey: AlgoliaJourney) {
    return Object.values(journey.tags)
      .filter((tags): tags is string[] => Array.isArray(tags))
      .reduce<string[]>((acc, tags) => acc.concat(tags), [])
      .filter((tag) => tag !== undefined) as unknown as string[]
  }

  const algoliaContents: Contents = {}
  let algoliaCollection: AlgoliaJourney[] = []
  if (hits.length > 0) {
    const featuredAndNew = [
      ...hits.filter(({ featuredAt }) => featuredAt != null),
      ...take(
        hits.filter(({ featuredAt }) => featuredAt == null),
        10
      )
    ]

    const mostRelevant = hits.slice(0, 10)
    algoliaCollection = refinements.length > 0 ? featuredAndNew : mostRelevant

    hits.forEach((journey) => {
      const allTags = getAllTags(journey)
      allTags.forEach((tag) => {
        if (algoliaContents[tag] == null)
          algoliaContents[tag] = {
            category: tag,
            journeys: []
          }
        algoliaContents[tag].journeys.push(journey)
      })
    })
  }

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 2,
      spaceBetween: 4
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 3,
      spaceBetween: 4
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 4,
      spaceBetween: 32
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      spaceBetween: 32
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 6,
      spaceBetween: 44
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 7,
      spaceBetween: 44
    }
  }

  return (
    <Stack spacing={8} data-testid="JourneysAdminTemplateSections">
      {!loading &&
        algoliaCollection != null &&
        algoliaCollection.length === 0 && <EmptySearch />}
      {refinements.length !== 1 &&
        (loading ||
          (algoliaCollection != null && algoliaCollection.length > 0 && (
            <ContentCarousel
              priority
              heading={
                refinements.length > 0
                  ? t('Most Relevant')
                  : t('Featured & New')
              }
              items={algoliaCollection}
              renderItem={(itemProps) => <TemplateGalleryCard {...itemProps} />}
              breakpoints={swiperBreakpoints}
              loading={loading}
              slidesOffsetBefore={-8}
              cardSpacing={{
                xs: 1,
                md: 8,
                xl: 11
              }}
            />
          )))}
      {map(
        algoliaContents,
        ({ category, journeys }, key) =>
          ((refinements.length === 0 && journeys.length >= 5) ||
            refinements.includes(key)) && (
            <ContentCarousel
              heading={category}
              items={journeys}
              renderItem={(itemProps) => <TemplateGalleryCard {...itemProps} />}
              breakpoints={swiperBreakpoints}
              slidesOffsetBefore={-8}
              cardSpacing={{
                xs: 1,
                md: 8,
                xl: 11
              }}
            />
          )
      )}
    </Stack>
  )
}
