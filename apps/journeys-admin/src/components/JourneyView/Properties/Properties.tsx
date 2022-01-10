import { ReactElement } from 'react'
import { Box, Divider, Drawer, Toolbar, Typography } from '@mui/material'
import { useBreakpoints } from '@core/shared/ui'
import { ShareSection } from '../ShareSection'
import { useJourney } from '../Context'
import { JourneyDetails } from './JourneyDetails'

export function Properties(): ReactElement {
  const breakpoints = useBreakpoints()
  const journey = useJourney()

  return breakpoints.md ? (
    <Drawer variant="permanent" anchor="right">
      <Toolbar sx={{ minWidth: '328px' }}>
        <Typography variant="subtitle1" component="div" sx={{ ml: 2 }}>
          Properties
        </Typography>
      </Toolbar>
      <Box sx={{ px: 6, py: 9 }}>
        <JourneyDetails />
      </Box>
      <Divider />
      <Box sx={{ p: 6 }}>
        <ShareSection slug={journey.slug} />
      </Box>
    </Drawer>
  ) : (
    <>
      <Divider />
      <Box sx={{ p: 6, pt: 9, backgroundColor: 'background.paper' }}>
        <JourneyDetails />
      </Box>
      <Divider />
      <Box sx={{ p: 6 }}>
        <ShareSection slug={journey.slug} />
      </Box>
      <Divider />
    </>
  )
}
