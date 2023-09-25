import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { StrategySection } from '../TemplateView/StrategySection'

export function TemplateGallery(): ReactElement {
  return (
    <Box>
      <Typography variant="h3">
        This is a placeholder for the new template gallery
      </Typography>
      <Typography variant="h3">
        Your email is currently under a launch darkly flag
      </Typography>
      <Box sx={{ p: 4 }}>
        <StrategySection strategySlug="https://www.canva.com/design/DAFvDBw1z1A/view" />
      </Box>
      <Box sx={{ p: 4 }}>
        <StrategySection strategySlug="https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000" />
      </Box>
      <Box sx={{ p: 4 }}>
        <StrategySection strategySlug="https://www.canva.com/design/DAFvCrg6dMw/watch" />
      </Box>
    </Box>
  )
}
