import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../../libs/storybook'
import {
  archivedJourney,
  defaultJourney,
  publishedJourney,
  trashedJourney
} from '../../data'

import { JourneyDetails } from './JourneyDetails'

const JourneyDetailsStory = {
  ...simpleComponentConfig,
  component: JourneyDetails,
  title: 'Journeys-Admin/JourneyView/Properties/JourneyDetails'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
      <JourneyDetails {...args} journeyType="Journey" />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const Publish = Template.bind({})
Publish.args = {
  journey: publishedJourney
}

export const Archived = Template.bind({})
Archived.args = {
  journey: archivedJourney
}
export const Trashed = Template.bind({})
Trashed.args = {
  journey: trashedJourney
}

export const PreviousYear = Template.bind({})
PreviousYear.args = {
  journey: {
    ...publishedJourney,
    createdAt: '2020-11-19T12:34:56.647Z'
  }
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default JourneyDetailsStory as Meta
