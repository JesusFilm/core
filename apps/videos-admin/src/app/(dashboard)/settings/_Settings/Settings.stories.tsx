import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../libs/storybookConfig'

import { Settings } from './Settings'

const meta: Meta<typeof Settings> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Settings',
  component: Settings,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta

type Story = StoryObj<ComponentProps<typeof Settings>>

export const Default: Story = {
  render: () => <Settings />
}
