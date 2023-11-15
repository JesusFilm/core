import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { AccessAvatars } from '../../AccessAvatars'
import { JourneyLink } from '../JourneyLink'
import type { JourneyType } from '../JourneyView'

import { AccessControl } from './AccessControl'
import { JourneyDetails } from './JourneyDetails'

interface PropertiesProps {
  journeyType: JourneyType
  isPublisher?: boolean
}

export function Properties({
  journeyType,
  isPublisher
}: PropertiesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: '328px',
          borderLeft: 1,
          borderColor: 'divider',
          borderRadius: 0
        }}
        data-testid="Properties"
      >
        <Toolbar>
          <Typography variant="subtitle1" component="div" sx={{ ml: 2 }}>
            {journeyType === 'Template' ? t('Details') : t('Properties')}
          </Typography>
        </Toolbar>
        <Stack sx={{ py: 6 }} spacing={6} divider={<Divider />}>
          <Box sx={{ px: 6 }}>
            <JourneyDetails
              journeyType={journeyType}
              isPublisher={isPublisher}
            />
          </Box>
          {journeyType !== 'Template' && (
            <>
              <Box sx={{ px: 6 }}>
                <AccessControl />
              </Box>
              <Divider />
              <Box sx={{ px: 6 }}>
                <JourneyLink />
              </Box>
            </>
          )}
        </Stack>
      </Paper>
      <Stack
        sx={{
          display: {
            xs: 'block',
            sm: 'none'
          },
          backgroundColor: 'background.paper',
          pb: 6
        }}
        spacing={6}
      >
        {journeyType !== 'Template' && (
          <Divider>
            <AccessAvatars
              journeyId={journey?.id}
              userJourneys={journey?.userJourneys ?? undefined}
              size="medium"
              showManageButton
            />
          </Divider>
        )}
        <Box sx={{ px: 6 }}>
          <JourneyDetails journeyType={journeyType} isPublisher={isPublisher} />
        </Box>
      </Stack>
    </>
  )
}
