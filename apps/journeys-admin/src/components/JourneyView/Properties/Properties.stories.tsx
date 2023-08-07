import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { journeysAdminConfig } from '../../../libs/storybook'
import { publishedJourney } from '../data'

import { Properties } from './Properties'

const PropertiesStory = {
  ...journeysAdminConfig,
  component: Properties,
  title: 'Journeys-Admin/JourneyView/Properties',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <FlagsProvider>
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <Properties {...args} journeyType="Template" />
      </JourneyProvider>
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default PropertiesStory as Meta
