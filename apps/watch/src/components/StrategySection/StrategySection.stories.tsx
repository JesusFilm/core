import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { StrategySection } from './StrategySection'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...watchConfig,
  component: StrategySection,
  title: 'Watch/StrategySection'
}

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
    title: 'Missions Trips',
    description:
      'Description about upcoming missions trips with JesusFilm Project'
  }
}

export default StrategySectionStory
