import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { SwiperOptions } from 'swiper'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Role } from '../../../__generated__/globalTypes'
import { useJourneysQuery } from '../../libs/useJourneysQuery'
import { useUserRoleQuery } from '../../libs/useUserRoleQuery'
import { StrategySection } from '../StrategySection'
import { TemplateGalleryCarousel } from '../TemplateGallery/TemplateGalleryCarousel'
import { TemplateGalleryCard } from '../TemplateGalleryCard'

import { TemplateFooter } from './TemplateFooter'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'
import { TemplateTags } from './TemplateTags'
import { TemplateViewHeader } from './TemplateViewHeader'
import { TemplateCreatorDetails } from './TemplateViewHeader/TemplateCreatorDetails'

interface TemplateViewProps {
  authUser: User
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { journey } = useJourney()
  const { breakpoints } = useTheme()
  const { t } = useTranslation('apps-journeys-admin')

  const tagIds = journey?.tags.map((tag) => tag.id)
  const { data } = useJourneysQuery({
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds
      }
    }
  })

  const relatedJourneys = data?.journeys.filter(({ id }) => id !== journey?.id)

  const { data: userData } = useUserRoleQuery()
  const isPublisher = userData?.getUserRole?.roles?.includes(Role.publisher)

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 2,
      slidesPerView: 2,
      spaceBetween: 20
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 3,
      slidesPerView: 3,
      spaceBetween: 20
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 4,
      slidesPerView: 4,
      spaceBetween: 20
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      slidesPerView: 5,
      spaceBetween: 48
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 6,
      slidesPerView: 6,
      spaceBetween: 48
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 7,
      slidesPerView: 7,
      spaceBetween: 48
    }
  }

  return (
    <Container disableGutters>
      <Stack sx={{ gap: { xs: 3, sm: 7 } }}>
        <TemplateViewHeader isPublisher={isPublisher} authUser={authUser} />
        <TemplateTags tags={journey?.tags} />
        <TemplatePreviewTabs />
        <Typography
          variant="body2"
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {journey?.description != null ? (
            journey.description
          ) : (
            <>
              {[0, 1, 2].map((value) => (
                <Skeleton
                  key={value}
                  data-testid="TemplateViewDescriptionSkeleton"
                  width="100%"
                />
              ))}
            </>
          )}
        </Typography>
        {journey?.creatorDescription != null && (
          <TemplateCreatorDetails
            creatorDetails={journey?.creatorDescription}
            creatorImage={journey?.creatorImageBlock?.src}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          />
        )}
        {journey?.strategySlug != null && (
          <StrategySection
            strategySlug={journey?.strategySlug}
            variant="full"
          />
        )}
        {relatedJourneys != null && relatedJourneys.length >= 1 && (
          <TemplateGalleryCarousel
            heading={t('Related Templates')}
            items={relatedJourneys}
            renderItem={(itemProps) => <TemplateGalleryCard {...itemProps} />}
            breakpoints={swiperBreakpoints}
          />
        )}
        <TemplateFooter signedIn={authUser?.id != null} />
      </Stack>
    </Container>
  )
}
