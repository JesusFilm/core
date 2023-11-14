import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { intlFormat, parseISO } from 'date-fns'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { CreateJourneyButton } from '../CreateJourneyButton'

import { PreviewTemplateButton } from './PreviewTemplateButton'
import { SocialImage } from './SocialImage'
import { TemplateCreatorDetails } from './TemplateCreatorDetails/TemplateCreatorDetails'
import { TemplateEditButton } from './TemplateEditButton/TemplateEditButton'

interface TemplateViewHeaderProps {
  isPublisher: boolean | undefined
  authUser: User
}

export function TemplateViewHeader({
  isPublisher,
  authUser
}: TemplateViewHeaderProps): ReactElement {
  const { journey } = useJourney()
  const hasCreatorDescription = journey?.creatorDescription != null
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Stack data-testid="TemplateViewHeader">
      <Typography
        variant="overline"
        sx={{
          color: 'secondary.light',
          display: { xs: 'block', sm: 'none' },
          pb: 6
        }}
        noWrap
      >
        {journey?.createdAt != null ? (
          intlFormat(parseISO(journey?.createdAt), {
            month: 'long',
            year: 'numeric'
          })
        ) : (
          <Skeleton sx={{ width: '50%', maxWidth: 150 }} />
        )}
      </Typography>
      <Stack direction="row" sx={{ gap: { xs: 4, sm: 6 } }}>
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '107px', sm: '244px' }
          }}
        >
          <SocialImage hasCreatorDescription={hasCreatorDescription} />
          {hasCreatorDescription && (
            <TemplateCreatorDetails
              creatorDetails={journey?.creatorDescription}
              creatorImage={journey?.creatorImageBlock?.src}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            />
          )}
        </Box>
        <Stack
          direction="column"
          sx={{
            width: '100%',
            flexShrink: 1
          }}
        >
          <Box sx={{ height: 16, display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.light',
                display: { xs: 'none', sm: 'block' }
              }}
              noWrap
            >
              {journey?.createdAt != null ? (
                intlFormat(parseISO(journey?.createdAt), {
                  month: 'long',
                  year: 'numeric'
                })
              ) : (
                <Skeleton sx={{ width: '35%', maxWidth: 150 }} />
              )}
            </Typography>
          </Box>
          <Typography variant={smUp ? 'h1' : 'h6'} sx={{ pb: 4 }}>
            {journey?.title != null ? (
              journey?.title
            ) : (
              <Skeleton
                data-testid="TemplateViewTitleSkeleton"
                sx={{
                  width: { xs: '100%', sm: '50%' },
                  maxWidth: { xs: 200, sm: 400 }
                }}
              />
            )}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {journey?.description != null ? (
              journey.description
            ) : (
              <>
                {[0, 1].map((value) => (
                  <Skeleton key={value} width="100%" />
                ))}
              </>
            )}
          </Typography>

          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              gap: 4,
              pt: 4,
              marginTop: 'auto'
            }}
          >
            <CreateJourneyButton signedIn={authUser?.id != null} />
            <PreviewTemplateButton slug={journey?.slug} />
            {journey != null && isPublisher === true && (
              <TemplateEditButton journeyId={journey.id} />
            )}
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, pt: 6 }} gap={2}>
        <CreateJourneyButton signedIn={authUser?.id != null} />
        <PreviewTemplateButton slug={journey?.slug} />
        {journey != null && isPublisher === true && (
          <TemplateEditButton journeyId={journey.id} />
        )}
      </Box>
    </Stack>
  )
}
