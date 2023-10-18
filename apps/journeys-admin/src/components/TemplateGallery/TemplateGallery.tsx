import Container from '@mui/material/Container'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { TemplateSections } from '../TemplateSections'

export function TemplateGallery(): ReactElement {
  const { query } = useRouter()
  return (
    <Container disableGutters>
      <TemplateSections
        tagIds={query.tagIds != null ? castArray(query.tagIds) : undefined}
      />
    </Container>
  )
}
