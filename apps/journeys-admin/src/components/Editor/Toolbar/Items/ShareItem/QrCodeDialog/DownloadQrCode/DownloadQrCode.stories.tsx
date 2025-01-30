import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { DownloadQrCode } from './DownloadQrCode'

const meta: Meta<typeof DownloadQrCode> = {
  ...journeysAdminConfig,
  component: DownloadQrCode,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/DownloadQrCode',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<ComponentProps<typeof DownloadQrCode>>

const Template: Story = {
  render: ({ to }) => <DownloadQrCode to={to} />
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
