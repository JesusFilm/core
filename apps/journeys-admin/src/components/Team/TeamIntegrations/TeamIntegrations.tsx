import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { IntegrationType } from '../../../../__generated__/globalTypes'
import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { BreadcrumbNavigation } from '../BreadcrumbNavigation'
import { IntegrationsButton } from '../Integrations/IntegrationsButton'

export function TeamIntegrations(): ReactElement {
  const router = useRouter()
  const teamId = router.query.teamId as string
  const { data } = useIntegrationQuery({
    teamId
  })

  function processIntegrationsTitle(type: IntegrationType): string {
    switch (type) {
      case IntegrationType.growthSpaces:
        return 'Growth Spaces'
      default:
        return type
    }
  }

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
            title="Add Integration"
            url={`/teams/${teamId}/integrations/new`}
            showAddButton
          />
          {data?.integrations != null &&
            data?.integrations.map((integration) => (
              <IntegrationsButton
                key={`${integration.id}`}
                url={`/teams/${teamId}/integrations/${integration.id}`}
                title={processIntegrationsTitle(integration.type)}
              />
            ))}
        </Stack>
      </Container>
    </Paper>
  )
}
