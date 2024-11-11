import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../libs/storybookConfig'

import { TabLabel } from './TabLabel'

type StoryArgs = ComponentPropsWithoutRef<typeof TabLabel>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Tabs/TabLabel',
  component: TabLabel,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Tab label'
  }
}

export const WithCount: Story = {
  args: {
    label: 'Tab label',
    count: 100
  }
}
