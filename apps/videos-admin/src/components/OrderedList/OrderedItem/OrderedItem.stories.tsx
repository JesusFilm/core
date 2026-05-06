import type { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { fn } from 'storybook/test'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'

import { videosAdminConfig } from '../../../libs/storybookConfig'

import { OrderedItem } from './OrderedItem'

const meta: Meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/OrderedList/OrderedItem',
  component: OrderedItem,
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

type Story = StoryObj<ComponentProps<typeof OrderedItem>>

const Template: Story = {
  render: ({ ...args }) => <OrderedItem {...args} />
}

export const Default: Story = {
  ...Template,
  args: {
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    onClick: fn()
  }
}

export const WithMenuItem: Story = {
  ...Template,
  args: {
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    onClick: fn(),
    menuActions: [{ label: 'View', handler: fn() }]
  }
}

export const WithIconButtons: Story = {
  ...Template,
  args: {
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    onClick: fn(),
    iconButtons: [
      {
        Icon: EyeOpen,
        events: {
          onClick: fn()
        },
        name: 'View'
      },
      {
        Icon: Edit2,
        events: {
          onClick: fn()
        },
        name: 'Edit'
      }
    ]
  }
}

export const WithImage: Story = {
  ...Template,
  args: {
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    onClick: fn(),
    img: {
      src: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
      alt: 'JESUS'
    }
  }
}

export const Complete: Story = {
  ...Template,
  args: {
    ...WithImage.args,
    ...WithMenuItem.args,
    ...WithIconButtons.args
  }
}
