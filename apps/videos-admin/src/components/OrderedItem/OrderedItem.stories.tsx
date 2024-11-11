import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { OrderedItem } from './OrderedItem'

type StoryArgs = ComponentPropsWithoutRef<typeof OrderedItem>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/OrderedRow',
  component: OrderedItem,
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
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    total: 1,
    onUpdate: ({ id, newOrder }) => alert(`Update ${id} order to: ${newOrder}`)
  }
}

export const WithActions: Story = {
  args: {
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    total: 1,
    onUpdate: ({ id, newOrder }) => alert(`Update ${id} order to: ${newOrder}`),
    actions: [
      { label: 'View', handler: () => alert(`View item`) },
      { label: 'Edit', handler: () => alert(`Edit item`) },
      { label: 'Delete', handler: () => alert(`Delete item`) }
    ]
  }
}
