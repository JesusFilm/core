import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CodeActionButton } from './CodeActionButton'

const meta: Meta<typeof CodeActionButton> = {
  ...journeysAdminConfig,
  component: CodeActionButton,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeActionButton',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<ComponentProps<typeof CodeActionButton>>

const Template: Story = {
  render: ({ to }) => <CodeActionButton to={to} />
}

export const Default = {
  ...Template,
  args: {
    to: 'url'
  }
}

export const Disabled = {
  ...Template
}

export const Dropdown = {
  ...Template,
  args: {
    to: 'url'
  },
  play: async () => {
    await userEvent.click(screen.getByTestId('DownloadDropdown'))
  }
}

export default meta
