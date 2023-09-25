import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'

export function TemplateSections(): ReactElement {
  return (
    <Stack spacing={8}>
      <FeaturedAndNewTemplates />
    </Stack>
  )
}
