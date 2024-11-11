import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../libs/storybookConfig'

import { SectionFallback } from './SectionFallback'

type StoryArgs = ComponentPropsWithoutRef<typeof SectionFallback>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Section/SectionFallback',
  component: SectionFallback,
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
    loading: false,
    message: 'Fallback message'
  }
}

export const Loading: Story = {
  args: {
    loading: true,
    message: 'Fallback message'
  }
}
