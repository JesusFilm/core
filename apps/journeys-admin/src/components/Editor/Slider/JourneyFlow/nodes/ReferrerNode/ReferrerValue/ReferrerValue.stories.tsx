import type { Meta, StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ReferrerValue } from '.'

const Demo: Meta<typeof ReferrerValue> = {
  ...simpleComponentConfig,
  component: ReferrerValue,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/ReferrerNode/ReferrerValue'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof ReferrerValue>> = {
  render: (args) => {
    return <ReferrerValue {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    tooltipTitle: 'facebook',
    property: 'facebook',
    visitors: 1000
  }
}

export default Demo
