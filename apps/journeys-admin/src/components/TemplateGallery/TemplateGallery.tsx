import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

export function TemplateGallery(): ReactElement {
  return (
    <Box>
      <Typography variant="h3">
        This is a placeholder for the new template gallery
      </Typography>
      <Typography variant="h3">
        Your email is currently under a launch darkly flag
      </Typography>
      <TemplateSections />
    </Box>
  )
}
