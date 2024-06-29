import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'
import { BaseReferrer } from '.'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'

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
    property: 'Other sources',
    visitors: 10
  }
}

export default Demo
