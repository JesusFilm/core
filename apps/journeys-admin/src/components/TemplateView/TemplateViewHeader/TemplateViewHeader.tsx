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
import { PreviewTemplateButton } from '../PreviewTemplateButton'

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
      <Stack gap={4} sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box
          sx={{
            width: { xs: 107, sm: 244 },
            height: { xs: 107, sm: 244 },
            flexShrink: 0
          }}
        >
          <SocialImage variant="large" />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 1,
            height: { xs: 107, sm: 244 }
          }}
        >
          {journey?.featuredAt != null && (
            <Typography
              variant="overline"
              sx={{ color: 'secondary.light' }}
              noWrap
            >
              {intlFormat(parseISO(journey?.featuredAt), {
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          )}
          <Typography variant={smUp ? 'h1' : 'h6'}>{journey?.title}</Typography>
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
              marginTop: 'auto'
            }}
          >
            <CreateJourneyButton signedIn={authUser?.id != null} />
            <PreviewTemplateButton slug={journey?.slug} />
            {isPublisher != null && isPublisher && <TemplateEditButton />}
          </Box>
        </Box>
      </Stack>
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, pt: 6 }} gap={2}>
        <CreateJourneyButton signedIn={authUser?.id != null} />
        <PreviewTemplateButton slug={journey?.slug} />
        {isPublisher != null && isPublisher && <TemplateEditButton />}
      </Box>
    </Stack>
  )
}
