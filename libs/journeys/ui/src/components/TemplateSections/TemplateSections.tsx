import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import map from 'lodash/map'
import take from 'lodash/take'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { SwiperOptions } from 'swiper/types'

import { ContentCarousel } from '@core/shared/ui/ContentCarousel'
import {
  AlgoliaJourney,
  useJourneyHits
} from '../../libs/algolia/useJourneyHits/useJourneyHits'
import { TemplateGalleryCard } from '../TemplateGalleryCard'

interface Contents {
  [key: string]: { category: string; journeys: AlgoliaJourney[] }
}

function getAllTags(journey: AlgoliaJourney) {
  return Object.values(journey.tags)
    .filter((tags): tags is string[] => Array.isArray(tags))
    .reduce<string[]>((acc, tags) => acc.concat(tags), [])
    .filter((tag) => tag !== undefined) as unknown as string[]
}

export function TemplateSections(): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { breakpoints } = useTheme()
  const { hits, loading, refinements } = useJourneyHits()

  const algoliaContents: Contents = {}
  let algoliaCollection: AlgoliaJourney[] = []
  if (hits.length > 0) {
    const featuredAndNew = [
      ...hits.filter(({ featuredAt }) => featuredAt != null),
      ...take(
        hits.filter(({ featuredAt }) => featuredAt == null),
        10
      )
    ] as unknown as AlgoliaJourney[]

    // Let algolia handle most relivant and just grab first n results
    const mostRelevant = hits.slice(0, 10)
    algoliaCollection = refinements.length > 0 ? featuredAndNew : mostRelevant

    // Group journeys into categories
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
        algoliaCollection.length === 0 && (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 4,
              width: '100%',
              padding: 8
            }}
          >
            <Typography variant="h6">
              {t('No template fully matches your search criteria.')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t(
                "Try using fewer filters or look below for templates related to the categories you've selected to search"
              )}
            </Typography>
          </Paper>
        )}
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
