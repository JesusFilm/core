import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import Box from '@mui/material/Box'
import { Integrations } from '.'

const IntegrationsStory: Meta<typeof Integrations> = {
  ...journeysAdminConfig,
  component: Integrations,
  title: 'Journeys-Admin/Integrations',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof Integrations> = {
  render: ({ ...args }) => (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        height: '100vh',
        p: 5
      }}
    >
      <Integrations {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
}

export default IntegrationsStory
