import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { StrategyCarouselItemProps } from '../StrategySection'
import { StrategyItem } from './StrategyCard'

const StrategyItemStory: Meta<typeof StrategyItem> = {
  ...watchConfig,
  component: StrategyItem,
  title: 'Watch/StrategySection/StrategyItem'
}

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

const imageSrc =
  'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'

type Story = StoryObj<
  ComponentProps<typeof StrategyItem> & { item: StrategyCarouselItemProps }
>

const Template: Story = {
  render: (args) => <StrategyItem {...args} />
}

export const Default = {
  ...Template,
  args: {
    item: {
      title: 'Strategy Title',
      description: longDescription,
      id: 'test-id',
      imageUrl: imageSrc,
      link: ''
    }
  }
}

export default StrategyItemStory
