import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { StrategySection } from './StrategySection'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...watchConfig,
  component: StrategySection,
  title: 'Watch/StrategySection'
}

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

const testItems = [
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  }
]

type Story = StoryObj<
  ComponentProps<typeof StrategySection> & {
    title: string
    description: string
  }
>

const Template: Story = {
  render: (args) => <StrategySection {...args} />
}

export const Default = {
  ...Template,
  args: {
    items: testItems
  }
}

export default StrategySectionStory
