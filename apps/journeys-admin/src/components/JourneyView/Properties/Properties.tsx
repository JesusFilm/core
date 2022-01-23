import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { ShareSection } from '../ShareSection'
import { useJourney } from '../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyDetails } from './JourneyDetails'

export function Properties(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const journey = useJourney<Journey>()

  return smUp ? (
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
