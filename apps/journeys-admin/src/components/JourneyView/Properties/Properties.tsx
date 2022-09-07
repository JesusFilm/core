import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyLink } from '../JourneyLink'
import { JourneyType } from '../JourneyView'
import { JourneyDetails } from './JourneyDetails'
import { AccessControl } from './AccessControl'

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
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '328px'
          }
        }}
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
      </Drawer>
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
