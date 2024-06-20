import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import Box from '@mui/material/Box'
import { IntegrationsList } from '.'
import { PageWrapper } from '../PageWrapper'

const IntegrationsListStory: Meta<typeof IntegrationsList> = {
  ...journeysAdminConfig,
  component: IntegrationsList,
  title: 'Journeys-Admin/IntegrationsList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof IntegrationsList> = {
  render: ({ ...args }) => (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        height: '100%',
        p: 5
      }}
    >
      <IntegrationsList {...args} />
    </Box>
  )
}

export const Default = {
  ...Template
}

export default IntegrationsListStory
