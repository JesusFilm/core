import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyDetails } from './JourneyDetails'
import { AccessControl } from './AccessControl'
import { JourneyLink } from './JourneyLink'

export function Properties(): ReactElement {
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
      >
        <Toolbar>
          <Typography variant="subtitle1" component="div" sx={{ ml: 2 }}>
            {t('Properties')}
          </Typography>
        </Toolbar>
        <Stack sx={{ py: 6 }} spacing={6} divider={<Divider />}>
          <Box sx={{ px: 6 }}>
            <JourneyDetails />
          </Box>
          <Box sx={{ px: 6 }}>
            <AccessControl />
          </Box>
          <Box sx={{ px: 6 }}>
            <JourneyLink />
          </Box>
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
        <Divider>
          <AccessAvatars
            journeyId={journey?.id}
            userJourneys={journey?.userJourneys ?? undefined}
            size="medium"
          />
        </Divider>
        <Box sx={{ px: 6 }}>
          <JourneyDetails />
        </Box>
      </Stack>
    </>
  )
}
