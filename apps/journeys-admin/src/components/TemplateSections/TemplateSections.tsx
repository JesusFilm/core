import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import map from 'lodash/map'
import take from 'lodash/take'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SwiperOptions } from 'swiper'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { useJourneysQuery } from '../../libs/useJourneysQuery'
import { TemplateGalleryCarousel } from '../TemplateGallery/TemplateGalleryCarousel'
import { TemplateGalleryCard } from '../TemplateGalleryCard'
import dynamic from 'next/dynamic'

interface Contents {
  [key: string]: { category: string; journeys: Journey[] }
}

interface TemplateSectionsProps {
  tagIds?: string[]
  languageIds?: string[]
}

export function TemplateSections({
  tagIds,
  languageIds
}: TemplateSectionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { breakpoints } = useTheme()
  const [contents, setContents] = useState<Contents>({})
  const [collection, setCollection] = useState<Journey[]>([])
  const [loading, setLoading] = useState(true)

  useJourneysQuery({
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds,
        languageIds:
          languageIds != null && languageIds?.length > 0
            ? languageIds
            : undefined
      }
    },
    onCompleted(data) {
      const featuredAndNew = [
        ...data.journeys.filter(({ featuredAt }) => featuredAt != null),
        ...take(
          data.journeys.filter(({ featuredAt }) => featuredAt == null),
          10
        )
      ]
      const mostRelevant = data.journeys.filter(({ tags }) =>
        tagIds?.every((tagId) => tags.find((tag) => tag.id === tagId))
      )
      setCollection(tagIds == null ? featuredAndNew : mostRelevant)
      const contents = {}
      data.journeys.forEach((journey) => {
        journey.tags.forEach((tag) => {
          if (contents[tag.id] == null)
            contents[tag.id] = {
              category: tag.name.find(({ primary }) => primary)?.value ?? '',
              journeys: []
            }
          contents[tag.id].journeys.push(journey)
        })
      })
      setContents(contents)
      setLoading(false)
    }
  })

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
      <TemplateGalleryCarousel
        heading={tagIds == null ? t('Featured & New') : t('Most Relevant')}
        items={collection}
        renderItem={(itemProps) => <TemplateGalleryCard {...itemProps} />}
        breakpoints={swiperBreakpoints}
        loading={loading}
        slidesOffsetBefore={-8}
        loadingSpacing={{
          xs: 1,
          md: 8,
          xl: 11
        }}
      />
      {!loading && collection.length === 0 && (
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
      {map(
        contents,
        ({ category, journeys }, key) =>
          ((tagIds == null && journeys.length >= 5) ||
            tagIds?.includes(key) === true) && (
            <TemplateGalleryCarousel
              heading={category}
              items={journeys}
              renderItem={(itemProps) => <TemplateGalleryCard {...itemProps} />}
              breakpoints={swiperBreakpoints}
              slidesOffsetBefore={-8}
              loadingSpacing={{
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
