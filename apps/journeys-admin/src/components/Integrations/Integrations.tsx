import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { IntegrationsButton } from './IntegrationsButton'

// fake data
const integrations = [
  { title: 'Slack', url: '' },
  { title: 'Google Workspace', url: '' },
  { title: 'Growth Space', url: '' },
  { title: 'Salesforce', url: '' },
  { title: 'Mailchimp', url: '' }
]

export function Integrations(): ReactElement {
  return (
    <Stack direction="row" gap={4} sx={{ flexWrap: 'wrap' }}>
      {integrations.map((integration, index) => (
        <IntegrationsButton
          key={`${index}-${integration.title}`}
          title={integration.title}
          teamId=""
        />
      ))}
    </Stack>
  )
}
