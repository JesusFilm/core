import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { BreadcrumbNavigation } from '../BreadcrumbNavigation'
import { IntegrationsButton } from '../Integrations/IntegrationsButton'

export function TeamIntegrations(): ReactElement {
  const router = useRouter()
  const teamId = router.query.teamId as string
  const { data } = useIntegrationQuery({
    teamId
  })

  return (
    <Paper elevation={0} square sx={{ height: '100%' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: { md: '70vw' },
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 9 }
        }}
      >
        <BreadcrumbNavigation />
        <Stack direction="row" gap={4} sx={{ flexWrap: 'wrap', mt: 10 }}>
          <IntegrationsButton
            url={`/teams/${teamId}/integrations/new`}
            showAddButton
          />
          {data?.integrations != null &&
            data?.integrations.map((integration) => (
              <IntegrationsButton
                key={`${integration.id}`}
                url={`/teams/${teamId}/integrations/${integration.id}`}
                type={integration.type}
              />
            ))}
        </Stack>
      </Container>
    </Paper>
  )
}
