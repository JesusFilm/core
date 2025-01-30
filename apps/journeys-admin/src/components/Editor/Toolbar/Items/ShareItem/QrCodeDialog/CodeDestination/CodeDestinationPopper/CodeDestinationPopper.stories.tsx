import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CodeDestinationPopper } from './CodeDestinationPopper'

const meta: Meta<typeof CodeDestinationPopper> = {
  ...journeysAdminConfig,
  component: CodeDestinationPopper,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeDestination/CodeDestinationPopper',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<ComponentProps<typeof CodeDestinationPopper>>

const Template: Story = {
  render: () => (
    <Box sx={{ p: 30 }}>
      <CodeDestinationPopper />
    </Box>
  )
}

export const Default = {
  ...Template
}

export const HoverState = {
  ...Template,
  play: async () => {
    await userEvent.hover(screen.getByRole('button'))
  }
}

export default meta
