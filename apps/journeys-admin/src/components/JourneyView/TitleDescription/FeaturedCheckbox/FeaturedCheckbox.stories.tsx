import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../libs/storybook'
import { FeaturedCheckbox } from './FeaturedCheckbox'

const FeaturedCheckboxStory: Meta<typeof FeaturedCheckbox> = {
  ...simpleComponentConfig,
  component: FeaturedCheckbox,
  title: 'Journeys-Admin/FeaturedCheckbox',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const Template: StoryObj<typeof FeaturedCheckbox> = {
  render: (args) => <FeaturedCheckbox {...args} />
}

export const Default = {
  ...Template,
  args: {
    journeyId: 'journeyId',
    featuredAt: null
  }
}

export const Checked = {
  ...Template,
  args: {
    journeyId: 'journeyId',
    featuredAt: '2021-11-19T12:34:56.647Z'
  }
}

export default FeaturedCheckboxStory
