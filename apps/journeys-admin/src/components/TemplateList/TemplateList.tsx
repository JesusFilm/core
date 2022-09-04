import { NextRouter } from 'next/router'
import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { AuthUser } from 'next-firebase-auth'
import { TemplateStatusTabs } from './TemplateStatusTabs'

interface TemplateListProps {
  event: string | undefined
  router?: NextRouter
  authUser?: AuthUser
}

export function TemplateList({
  event,
  router,
  authUser
}: TemplateListProps): ReactElement {
  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      <TemplateStatusTabs event={event} router={router} authUser={authUser} />
    </Container>
  )
}
