import { Meta, StoryObj } from '@storybook/react'
import { InstantSearchTestWrapper } from 'libs/journeys/ui/src/libs/algolia/InstantSearchTestWrapper'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { StrategyItemProps } from './StrategyCard'
import { StrategyCard } from './StrategyCard'

const StrategyCardStory: Meta<typeof StrategyCard> = {
  ...watchConfig,
  component: StrategyCard,
  title: 'Watch/StrategySections/StrategyCard'
}

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

const imageSrc =
  'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'

type Story = StoryObj<
  ComponentProps<typeof StrategyCard> & { item: StrategyItemProps }
>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper indexName="">
      <StrategyCard {...args} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    item: {
      title: 'Strategy Title',
      description: 'Short description',
      id: 'test-id',
      imageUrl: imageSrc,
      link: ''
    }
  }
}

export const LongDescription = {
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

export const WithoutImage = {
  ...Template,
  args: {
    item: {
      title: 'Strategy Title',
      description: 'Short description',
      id: 'test-id',
      imageUrl: null,
      link: ''
    }
  }
}

export default StrategyCardStory
