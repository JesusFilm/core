import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { StrategyCarousel } from './StrategyCarousel'

const StrategyCarouselStory: Meta<typeof StrategyCarousel> = {
  ...watchConfig,
  component: StrategyCarousel,
  title: 'Watch/StrategySection/StrategyCarousel'
}

// type Story = StoryObj<ComponentProps<typeof StrategyCarousel> & {}

const Template: StoryObj<typeof StrategyCarousel> = {
  render: () => <StrategyCarousel />
}

export const Default = {
  ...Template
}

export default StrategyCarouselStory
