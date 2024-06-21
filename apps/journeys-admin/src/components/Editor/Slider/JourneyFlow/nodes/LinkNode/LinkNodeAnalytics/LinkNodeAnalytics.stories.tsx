import { StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

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
      <LinkNodeAnalytics>{args.children}</LinkNodeAnalytics>
    </div>
  )
}

export const Default = {
  ...Template,
  args: {
    children: 10
  }
}

export const Fallback = {
  ...Template,
  args: {
    children: undefined
  }
}

export default LinkNodeAnalyticsDemo
