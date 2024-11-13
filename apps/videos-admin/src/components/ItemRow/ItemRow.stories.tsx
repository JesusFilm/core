import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { ItemRow } from './ItemRow'

type StoryArgs = ComponentPropsWithoutRef<typeof ItemRow>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/ItemRow',
  component: ItemRow,
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
    id: 'itemRow.1',
    label: 'Item row'
  }
}

export const WithMenu: Story = {
  args: {
    ...Default.args,
    menu: {
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
}

export const WithActions: Story = {
  args: {
    ...Default.args,
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

export const WithImage: Story = {
  args: {
    ...Default.args,
    img: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6101-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
      alt: 'Image alt'
    }
  }
}

export const WithAll: Story = {
  args: {
    ...Default.args,
    ...WithImage.args,
    ...WithMenu.args,
    ...WithActions.args
  }
}
