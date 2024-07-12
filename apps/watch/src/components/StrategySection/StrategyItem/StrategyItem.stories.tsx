import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { StrategyCarouselItemProps } from '../StrategySection'
import { StrategyItem } from './StrategyItem'

const StrategyItemStory: Meta<typeof StrategyItem> = {
  ...watchConfig,
  component: StrategyItem,
  title: 'Watch/StrategySection/StrategyItem'
}

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

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
      imageUrl: '',
      link: ''
    }
  }
}

export default StrategyItemStory
