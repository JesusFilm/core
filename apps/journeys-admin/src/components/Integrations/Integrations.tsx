import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { IntegrationsButton } from './IntegrationsButton'

// temporary data
const integrations = [
  { id: 'id1', teamId: 'teamId1', type: 'growthSpaces'},
  { id: 'id2', teamId: 'teamId1', type: 'growthSpaces'}
]

export function Integrations(): ReactElement {
  return (
    <Stack direction="row" gap={4} sx={{ flexWrap: 'wrap' }}>
      <IntegrationsButton
        url='/teams/[teamId]/integrations/new'
        showAddButton
      />
      {integrations.map((integration, index) => (
        <IntegrationsButton
          key={`${index}-${integration.id}`}
          url="/teams/${teamId}/integrations/${integrationId}"
          title={integration.type}
        />
      ))}
    </Stack>
  )
}
