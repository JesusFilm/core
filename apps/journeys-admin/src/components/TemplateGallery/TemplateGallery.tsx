import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

export function TemplateGallery(): ReactElement {
  return (
    <Stack gap={4}>
      <Typography variant="h2">Journey Templates</Typography>
      <TemplateSections />
    </Stack>
  )
}
