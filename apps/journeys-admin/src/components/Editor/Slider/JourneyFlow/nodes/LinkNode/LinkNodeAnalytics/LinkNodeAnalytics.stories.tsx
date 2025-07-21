import type { StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { LinkNodeAnalytics } from '.'

const LinkNodeAnalyticsDemo = {
  ...simpleComponentConfig,
  component: LinkNodeAnalytics,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/LinkNode/LinkNodeAnalytics'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof LinkNodeAnalytics>> = {
  render: (args) => (
    <div
      style={{
        position: 'relative',
        height: '1px',
        width: '1px'
      }}
    >
      <LinkNodeAnalytics {...args} />
    </div>
  )
}

export const Default = {
  ...Template,
  args: {
    clicksCount: 10
  }
}

export const Fallback = {
  ...Template,
  args: {
    clicksCount: undefined
  }
}

export default LinkNodeAnalyticsDemo
