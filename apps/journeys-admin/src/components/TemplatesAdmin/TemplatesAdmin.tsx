import { NextRouter } from 'next/router'
import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { TemplateStatusTabs } from './TemplateStatusTabs'

interface TemplatesAdminProps {
  event: string | undefined
  router?: NextRouter
}

export function TemplatesAdmin({
  event,
  router
}: TemplatesAdminProps): ReactElement {
  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      <TemplateStatusTabs event={event} router={router} />
    </Container>
  )
}
