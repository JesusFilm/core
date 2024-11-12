import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'

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
    onOrderUpdate: ({ id, order }) => alert(`Update ${id} order to: ${order}`)
  }
}

export const WithActions: Story = {
  args: {
    id: 'orderedItem.1',
    label: 'Ordered item',
    idx: 0,
    total: 1,
    onOrderUpdate: ({ id, order }) => alert(`Update ${id} order to: ${order}`),
    actions: [
      { label: 'View', handler: (id) => alert(`View ${id}`) },
      { label: 'Edit', handler: (id) => alert(`Edit ${id}`) },
      { label: 'Delete', handler: (id) => alert(`Delete ${id}`) }
    ]
  }
}
