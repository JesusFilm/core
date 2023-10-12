import Box from '@mui/material/Box'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

export function TemplateGallery(): ReactElement {
  const { query } = useRouter()
  return (
    <Box>
      <TemplateSections
        tagIds={query.tagIds != null ? castArray(query.tagIds) : undefined}
      />
    </Box>
  )
}
