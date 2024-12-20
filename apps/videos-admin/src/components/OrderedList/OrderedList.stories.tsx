import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { OrderedItem } from './OrderedItem'
import { BaseItem, OrderedList } from './OrderedList'

interface Item {
  id: string
  value: string
}

type Story = StoryObj<ComponentProps<typeof OrderedList> & { isEdit: boolean }>

const meta: Meta = {
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
}

const Template: Story = {
  render: (args) => (
    <OrderedList<{ id: string; value: string }>
      items={args.items as unknown as Item[]}
      onOrderUpdate={args.onOrderUpdate}
    >
      {args.items.map((item, i) => (
        <OrderedItem
          key={i}
          id={item.id}
          label={(item as Item).value}
          idx={i}
        />
      ))}
    </OrderedList>
  )
}

export const Default: Story = {
  ...Template,
  args: {
    items: [
      { id: 'OrderedItem.1', value: 'Ordered row 1' } as BaseItem,
      { id: 'OrderedItem.2', value: 'Ordered row 2' } as BaseItem
    ]
  }
}

export default meta
