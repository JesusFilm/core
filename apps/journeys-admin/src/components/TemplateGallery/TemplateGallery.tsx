import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

export function TemplateGallery(): ReactElement {
  const { query } = useRouter()
  return (
    <Stack gap={4}>
      <Typography variant="h2">Journey Templates</Typography>
      <TemplateSections
        tagIds={query.tagIds != null ? castArray(query.tagIds) : undefined}
      />
    </Stack>
  )
}
