import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ShareSection } from '../ShareSection'
import { useJourney } from '../../../libs/context'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyDetails } from './JourneyDetails'

export function Properties(): ReactElement {
  const { slug, userJourneys } = useJourney()

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
        <Box sx={{ p: 6 }}>
          <JourneyDetails />
        </Box>
        <Divider />
        {userJourneys != null && (
          <Box sx={{ p: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Access Control
            </Typography>
            <AccessAvatars
              journeySlug={slug}
              userJourneys={userJourneys}
              size="medium"
              xsMax={5}
            />
          </Box>
        )}
        <Divider />
        <Box sx={{ p: 6 }}>
          <ShareSection slug={slug} />
        </Box>
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
        {userJourneys != null && (
          <Divider>
            <AccessAvatars
              journeySlug={slug}
              userJourneys={userJourneys}
              size="medium"
            />
          </Divider>
        )}
        <Box sx={{ px: 6 }}>
          <JourneyDetails />
        </Box>
        <Divider />
        <Box sx={{ px: 6 }}>
          <ShareSection slug={slug} />
        </Box>
      </Stack>
    </>
  )
}
