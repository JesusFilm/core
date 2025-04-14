import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { ToggleColorMode } from './ToggleColorMode'

const meta: Meta<typeof ToggleColorMode> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/ToggleColorMode',
  component: ToggleColorMode,
  parameters: {
    nextjs: {
      appDirectory: false
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta
type Story = StoryObj<ComponentProps<typeof ToggleColorMode>>

export const Default: Story = {
  render: () => <ToggleColorMode />
}
