import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

export function TemplateGallery(): ReactElement {
  const { query } = useRouter()
  return (
    <Container disableGutters sx={{ px: { xs: 6, lg: 0 } }}>
      <Box>
        <TemplateSections
          tagIds={query.tagIds != null ? castArray(query.tagIds) : undefined}
        />
      </Box>
    </Container>
  )
}
