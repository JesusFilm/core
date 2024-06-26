import { gql, useQuery } from '@apollo/client'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import {
  GetTeamIntegrations,
  GetTeamIntegrationsVariables
} from '../../../../__generated__/GetTeamIntegrations'
import { BreadcrumbNavigation } from '../BreadcrumbNavigation'
import { IntegrationsButton } from '../Integrations/IntegrationsButton'

export const GET_TEAM_INTEGRATIONS = gql`
  query GetTeamIntegrations($teamId: ID!) {
    team(id: $teamId) {
      id
      title
      integrations {
        id
        type
      }
    }
  }
`

export function TeamIntegrations(): ReactElement {
  const router = useRouter()
  const teamId = router.query.teamId as string
  const { data } = useQuery<GetTeamIntegrations, GetTeamIntegrationsVariables>(
    GET_TEAM_INTEGRATIONS,
    {
      variables: { teamId: router.query.teamId as string }
    }
  )
  const integrations = data?.team?.integrations

  return (
    <Paper
      elevation={0}
      square
      sx={{ height: '100%' }}
      data-testid="TemplateGallery"
    >
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
          {integrations != null &&
            integrations.map((integration) => (
              <IntegrationsButton
                key={`${integration.id}`}
                url={`/teams/${teamId}/integrations/${integration.id}`}
                title={integration.type}
              />
            ))}
        </Stack>
      </Container>
    </Paper>
  )
}
