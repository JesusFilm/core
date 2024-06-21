import { StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import { JourneyAnalyticsCard } from '.'

const JourneyAnalyticsCardDemo = {
  ...simpleComponentConfig,
  component: JourneyAnalyticsCard,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/JourneyAnalyticsCard'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof JourneyAnalyticsCard>
> = {
  render: (args) => <JourneyAnalyticsCard {...args} />
}

export const Default = {
  ...Template,
  args: {
    totalVisitors: 1000000,
    chatsStarted: 1500,
    linksVisited: 100
  }
}

export default JourneyAnalyticsCardDemo
