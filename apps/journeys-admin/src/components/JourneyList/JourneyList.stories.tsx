import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { JourneysListProps } from './JourneyList'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from './journeyListData'
import { JourneyList } from '.'

const JourneyListStory = {
  ...journeysAdminConfig,
  component: JourneyList,
  title: 'Journeys-Admin/JourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<JourneysListProps> = ({ ...args }) => (
  <MockedProvider>
    <PageWrapper title="Journeys">
      <JourneyList {...args} />
    </PageWrapper>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journeys: [defaultJourney, publishedJourney, oldJourney, descriptiveJourney],
  disableCreation: true
}

export const Loading = Template.bind({})
Loading.args = {
  journeys: undefined,
  disableCreation: true
}

export const Access = Template.bind({})
Access.args = {
  journeys: [],
  disableCreation: true
}

export const CreateJourney = Template.bind({})
CreateJourney.args = {
  journeys: [],
  disableCreation: false
}

export default JourneyListStory as Meta
