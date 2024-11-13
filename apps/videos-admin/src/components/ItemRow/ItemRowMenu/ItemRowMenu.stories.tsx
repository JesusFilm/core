import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../libs/storybookConfig'

import { ItemRowMenu } from './ItemRowMenu'

type StoryArgs = ComponentPropsWithoutRef<typeof ItemRowMenu>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/ItemRow/ItemRowMenu',
  component: ItemRowMenu,
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
    actions: [
      {
        label: 'View',
        handler: () => alert('View')
      },
      {
        label: 'Edit',
        handler: () => alert('Edit')
      },
      {
        label: 'Delete',
        handler: () => alert('Delete')
      }
    ]
  }
}
