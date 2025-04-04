import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { OptionsMenu } from './OptionsMenu'

const meta: Meta<typeof OptionsMenu> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/OptionsMenu',
  component: OptionsMenu,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta
type Story = StoryObj<ComponentProps<typeof OptionsMenu>>

export const Default: Story = {
  render: () => <OptionsMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByTestId('MenuButton')
    await userEvent.click(menuButton)
  }
}
