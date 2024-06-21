import { StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import TrendDown1 from '@core/shared/ui/icons/TrendDown1'
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
    Icon: TrendDown1,
    tooltipLabel: 'Clicks'
  }
}

export const WithoutIcon = {
  ...Template,
  args: {
    value: '10',
    tooltipLabel: 'Clicks'
  }
}

export default AnalyticsDataPointDemo
