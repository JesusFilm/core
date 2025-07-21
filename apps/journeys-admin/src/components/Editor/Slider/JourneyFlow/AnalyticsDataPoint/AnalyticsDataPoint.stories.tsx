import { StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import Cursor4Icon from '@core/shared/ui/icons/Cursor4'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { AnalyticsDataPoint } from './AnalyticsDataPoint'

const AnalyticsDataPointDemo = {
  ...simpleComponentConfig,
  component: AnalyticsDataPoint,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/AnalyticsDataPoint'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof AnalyticsDataPoint>> =
  {
    render: (args) => <AnalyticsDataPoint {...args} />
  }

export const Default = {
  ...Template,
  args: {
    value: 10,
    Icon: Cursor4Icon,
    tooltipTitle: 'Clicks'
  }
}

export const WithoutIcon = {
  ...Template,
  args: {
    value: '10',
    tooltipTitle: 'Clicks'
  }
}

export default AnalyticsDataPointDemo
