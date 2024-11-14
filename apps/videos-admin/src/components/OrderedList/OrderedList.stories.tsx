import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'
import { OrderedItem } from './OrderedItem'

import { OrderedList } from './OrderedList'

interface Item {
  id: string
  value: string
}

type StoryArgs = ComponentPropsWithoutRef<typeof OrderedList<Item>>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/OrderedList',
  component: OrderedList,
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

const Template: Story = {
  render: ({ items, ...args }) => (
    <OrderedList<Item> {...args}>
      {items.map(({ id, value }, i) => (
        <OrderedItem key={i} id={id} value={value} />
      ))}
    </OrderedList>
  )
}

export const Default: Story = {
  args: {
    items: [{ id: 'OrderedItem.1', value: 'Ordered row' }]
  }
}

export const WithActions: Story = {
  args: {
    id: 'OrderedItem.1',
    label: 'Ordered row',
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
