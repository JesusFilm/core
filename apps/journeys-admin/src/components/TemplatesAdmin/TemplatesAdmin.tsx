import { NextRouter } from 'next/router'
import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { TemplateStatusTabs } from './TemplateStatusTabs'

interface TemplatesAdminProps {
  router?: NextRouter
}

export function TemplatesAdmin({ router }: TemplatesAdminProps): ReactElement {
  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      <TemplateStatusTabs router={router} />
    </Container>
  )
}
