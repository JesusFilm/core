import { Meta, StoryObj } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { StrategyItem } from './StrategyItem'

const StrategyItemStory: Meta<typeof StrategyItem> = {
  ...watchConfig,
  component: StrategyItem,
  title: 'Watch/Strategy/StrategyItem'
}

const Template: StoryObj<typeof StrategyItem> = {
  render: () => <StrategyItem />
}

export const Default = {
  ...Template
}

export default StrategyItemStory
