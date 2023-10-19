import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { intlFormat, parseISO } from 'date-fns'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { SocialImage } from '../../JourneyView/SocialImage'
import { CreateJourneyButton } from '../CreateJourneyButton'

import { PreviewTemplateButton } from './PreviewTemplateButton'
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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Stack>
      {journey?.createdAt != null && (
        <Typography
          data-testId="featuredAtTemplatePreviewPage"
          variant="overline"
          sx={{
            color: 'secondary.light',
            display: { xs: 'block', sm: 'none' },
            pb: 6
          }}
          noWrap
        >
          {intlFormat(parseISO(journey?.createdAt), {
            month: 'long',
            year: 'numeric'
          })}
        </Typography>
      )}
      <Stack direction="row" sx={{ gap: { xs: 4, sm: 6 } }}>
        <Box
          sx={{
            flexShrink: 0
          }}
        >
          <SocialImage height={smUp ? 244 : 107} width={smUp ? 244 : 107} />
        </Box>
        <Stack
          direction="column"
          sx={{
            flexShrink: 1
          }}
        >
          {journey?.createdAt != null && (
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.light',
                display: { xs: 'none', sm: 'block' }
              }}
              data-testId="featuredAtTemplatePreviewPage"
              noWrap
            >
              {intlFormat(parseISO(journey?.createdAt), {
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          )}
          <Typography variant={smUp ? 'h1' : 'h6'} sx={{ pb: 4 }}>
            {journey?.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {journey?.description}
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
            {isPublisher === true && <TemplateEditButton />}
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, pt: 6 }} gap={2}>
        <CreateJourneyButton signedIn={authUser?.id != null} />
        <PreviewTemplateButton slug={journey?.slug} />
        {isPublisher === true && authUser.id != null && <TemplateEditButton />}
      </Box>
    </Stack>
  )
}
