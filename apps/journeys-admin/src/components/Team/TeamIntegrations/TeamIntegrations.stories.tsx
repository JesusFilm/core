import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'

import Box from '@mui/material/Box'
import { TeamIntegrations } from '.'

const TeamIntegrationsStory: Meta<typeof TeamIntegrations> = {
  ...journeysAdminConfig,
  component: TeamIntegrations,
  title: 'Journeys-Admin/TeamIntegrations',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof TeamIntegrations> = {
  render: ({ ...args }) => (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        height: '100vh',
        p: 5
      }}
    >
      <TeamIntegrations {...args} />
    </Box>
  )
}

export const Default = {
  ...Template
}

export default TeamIntegrationsStory
