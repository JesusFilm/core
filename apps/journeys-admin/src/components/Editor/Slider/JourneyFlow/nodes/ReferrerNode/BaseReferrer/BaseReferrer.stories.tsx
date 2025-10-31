import type { Meta, StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BaseReferrer } from '.'

const Demo: Meta<typeof BaseReferrer> = {
  ...simpleComponentConfig,
  component: BaseReferrer,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/ReferrerNode/BaseReferrer'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof BaseReferrer>> = {
  render: (args) => {
    return <BaseReferrer {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    property: 'Direct / None',
    visitors: 10
  }
}

export const Others = {
  ...Template,
  args: {
    property: 'other sources',
    visitors: 10
  }
}

export default Demo
