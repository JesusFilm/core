import { ReactElement } from 'react'
import { Box, Drawer, Toolbar, Typography } from '@mui/material'
import { useBreakpoints } from '@core/shared/ui'
import { JourneyDetails } from './JourneyDetails'

export function Properties(): ReactElement {
  const breakpoints = useBreakpoints()

  return breakpoints.md ? (
    <Drawer variant="permanent" anchor="right">
      <Toolbar sx={{ minWidth: '328px' }}>
        <Typography variant="subtitle1" component="div" sx={{ ml: 2 }}>
          Properties
        </Typography>
      </Toolbar>
      <Box sx={{ px: 7, py: 9 }}>
        <JourneyDetails />
      </Box>
    </Drawer>
  ) : (
    <Box sx={{ p: 6, pt: 9, backgroundColor: 'background.paper' }}>
      <JourneyDetails />
    </Box>
  )
}
