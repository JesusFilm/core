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
import { useHits, useInstantSearch } from 'react-instantsearch'
import { GetJourneys_journeys as Journey } from '../../libs/useJourneysQuery/__generated__/GetJourneys'
import { TemplateGalleryCard } from '../TemplateGalleryCard'

interface Contents {
  [key: string]: { category: string; journeys: Journey[] }
}

interface TemplateSectionsProps {
  tagIds?: string[]
  languageIds?: string[]
}

// TODO(jk): should type the algolia data
interface AlgoliaJourney {
  objectID: string
  title: string
  description: string
  tags: {
    Topics: string[]
    Audience: string[]
    Holidays: string[]
    Collections: string[]
    'Felt Needs': string[]
  }
  image: {
    src: string
    alt: string
  }
  language: string
  date: Date
  featuredAt?: string
}

const transformItems = (items: any[]) => {
  return items.map((item) => ({
    ...item,
    id: item.objectID,
    createdAt: item.date,
    primaryImageBlock: item.image
  }))
}

function getAllTags(journey: any) {
  return Object.values(journey.tags)
    .filter((tags): tags is string[] => Array.isArray(tags))
    .reduce<string[]>((acc, tags) => acc.concat(tags), [])
    .filter((tag) => tag !== undefined)
}

export function TemplateSections({
  tagIds,
  languageIds
}: TemplateSectionsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { breakpoints } = useTheme()

  const { hits, results, sendEvent } = useHits({
    transformItems: transformItems
  })
  const { status } = useInstantSearch()
  const loading = status === 'stalled'

  const algoliaContents: Contents = {}
  let algoliaCollection: Journey[] = []
  if (hits.length > 0) {
    const featuredAndNew = [
      ...hits.filter(({ featuredAt }) => featuredAt != null),
      ...take(
        hits.filter(({ featuredAt }) => featuredAt == null),
        10
      )
    ]

    const mostRelevant = hits.filter(({ tags }) =>
      tagIds?.every((tagId) => tags.find((tag) => tag.id === tagId))
    )

    // TODO: if category tags are checked: show most relevant
    // collection = tagIds == null ? featuredAndNew : mostRelevant
    algoliaCollection = featuredAndNew

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

  console.log('algoliaContents', algoliaContents)
  console.log('algoliaCollection', algoliaCollection)

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
      {loading ||
        (algoliaCollection != null && algoliaCollection.length > 0 && (
          <ContentCarousel
            priority
            heading={t('Featured & New')}
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
        ))}
      {map(algoliaContents, ({ category, journeys }, key) => (
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
      ))}
    </Stack>
  )
}
