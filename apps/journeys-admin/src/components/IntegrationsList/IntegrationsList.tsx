import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { IntegrationsListItem } from './IntegrationsListItem'

// fake data
const integrations = [
  { title: 'Slack', url: '' },
  { title: 'Google Workspace', url: '' },
  { title: 'Growth Space', url: '' },
  { title: 'Salesforce', url: '' },
  { title: 'Mailchimp', url: '' }
]

interface IntegrationsListProps {
  showAddButton?: boolean
  // it'll either show the list of integrations or the chosen integrations by the user
  // integrations?: Integration[]
}

export function IntegrationsList({
  showAddButton
}: IntegrationsListProps): ReactElement {
  return (
    <Stack direction="row" gap={4} sx={{ flexWrap: 'wrap' }}>
      {showAddButton && <IntegrationsListItem teamId="" showAddButton />}
      {integrations.map((integration, index) => (
        <IntegrationsListItem
          key={`${index}-${integration.title}`}
          title={integration.title}
          teamId=""
        />
      ))}
    </Stack>
  )
}
