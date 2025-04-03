import type { Meta, StoryObj } from '@storybook/react'

import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { PublishedChip } from './PublishedChip'

const meta: Meta<typeof PublishedChip> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/PublishedChip',
  component: PublishedChip,
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
type Story = StoryObj<ComponentPropsWithoutRef<typeof PublishedChip>>

export const Published: Story = {
  render: ({ published }) => (
    
      <PublishedChip published={published} />
    
  ),
  args: {
    published: true
  }
}

export const Unpublished: Story = {
  ...Published,
  args: {
    published: false
  }
}
