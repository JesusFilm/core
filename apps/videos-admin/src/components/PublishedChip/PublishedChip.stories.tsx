import type { Meta, StoryObj } from '@storybook/react'
import { PublishedChip } from './PublishedChip'
import { videosAdminConfig } from '../../libs/storybookConfig'
import { ComponentPropsWithoutRef } from 'react'
import { NextIntlClientProvider } from 'next-intl'

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
    <NextIntlClientProvider locale="en">
      <PublishedChip published={published} />
    </NextIntlClientProvider>
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
