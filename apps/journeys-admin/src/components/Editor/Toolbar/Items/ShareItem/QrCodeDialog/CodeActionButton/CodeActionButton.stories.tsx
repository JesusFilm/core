import type { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'
import { screen, userEvent } from 'storybook/test'

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
  render: ({ ...args }) => <CodeActionButton {...args} />
}

export const Default = {
  ...Template,
  args: {
    shortLink: 'url',
    loading: false,
    handleGenerateQrCode: noop
  }
}

export const Generate = {
  ...Template,
  args: {
    shortLink: undefined,
    loading: false,
    handleGenerateQrCode: noop
  }
}

export const Loading = {
  ...Template,
  args: {
    shortLink: undefined,
    loading: true,
    handleGenerateQrCode: noop
  }
}

export const Dropdown = {
  ...Template,
  args: {
    shortLink: 'url',
    loading: false,
    handleGenerateQrCode: noop
  },
  play: async () => {
    await userEvent.click(screen.getByTestId('DownloadDropdown'))
  }
}

export default meta
