import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { CopyTextField } from '@core/shared/ui'
import { useJourney } from '../../../libs/context'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyDetails } from './JourneyDetails'

export function Properties(): ReactElement {
  const journey = useJourney()

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
            Properties
          </Typography>
        </Toolbar>
        <Stack sx={{ py: 6 }} spacing={6} divider={<Divider />}>
          <Box sx={{ px: 6 }}>
            <JourneyDetails />
          </Box>
          <Box sx={{ px: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Access Control
            </Typography>
            <AccessAvatars
              journeySlug={journey?.slug}
              userJourneys={journey?.userJourneys ?? undefined}
              size="medium"
              xsMax={5}
            />
          </Box>
          <Box sx={{ px: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Journey URL
            </Typography>
            <CopyTextField
              value={
                journey?.slug != null
                  ? `https://your.nextstep.is/${journey.slug}`
                  : undefined
              }
            />
          </Box>
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
        <Divider>
          <AccessAvatars
            journeySlug={journey?.slug}
            userJourneys={journey?.userJourneys ?? undefined}
            size="medium"
          />
        </Divider>
        <Box sx={{ px: 6 }}>
          <JourneyDetails />
        </Box>
        <Divider />
        <Box sx={{ px: 6 }}>
          <CopyTextField
            value={
              journey?.slug != null
                ? `https://your.nextstep.is/${journey.slug}`
                : undefined
            }
            label="Journey URL"
          />
        </Box>
      </Stack>
    </>
  )
}
