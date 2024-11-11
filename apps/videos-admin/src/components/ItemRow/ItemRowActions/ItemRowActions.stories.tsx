import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { videosAdminConfig } from '../../../libs/storybookConfig'

import { ItemRowActions } from './ItemRowActions'

type StoryArgs = ComponentPropsWithoutRef<typeof ItemRowActions>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/ItemRow/ItemRowActions',
  component: ItemRowActions,
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
        handler: () => alert('View'),
        Icon: EyeOpen
      },
      {
        handler: () => alert('Edit'),
        Icon: Edit2
      },
      {
        handler: () => alert('Delete'),
        Icon: Trash2
      }
    ]
  }
}
