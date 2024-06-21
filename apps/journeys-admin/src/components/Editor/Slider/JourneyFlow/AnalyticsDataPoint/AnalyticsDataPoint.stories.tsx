import { StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import Cursor4 from '@core/shared/ui/icons/Cursor4'
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
    children: 10,
    Icon: Cursor4,
    tooltipLabel: 'Clicks'
  }
}

export const WithoutIcon = {
  ...Template,
  args: {
    children: '10',
    tooltipLabel: 'Clicks'
  }
}

export default AnalyticsDataPointDemo
