import type { StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyAnalyticsCardStat } from '.'

const JourneyAnalyticsCardStatDemo = {
  ...simpleComponentConfig,
  component: JourneyAnalyticsCardStat,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/JourneyAnalyticsCard/NumberStat'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof JourneyAnalyticsCardStat>
> = {
  render: (args) => <JourneyAnalyticsCardStat {...args} />
}

export const Default = {
  ...Template,
  args: {
    label: 'Default',
    count: 100
  }
}

export const Formatted = {
  ...Template,
  args: {
    label: 'Formatted',
    count: 1500
  }
}

export default JourneyAnalyticsCardStatDemo
