import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { JourneysListProps } from './JourneyList'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from './journeyListData'
import { GET_ACTIVE_JOURNEYS } from './StatusTabPanel/ActiveStatusTab/ActiveStatusTab'
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
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_ACTIVE_JOURNEYS
        },
        result: {
          data: {
            journeys: [
              defaultJourney,
              oldJourney,
              descriptiveJourney,
              publishedJourney
            ]
          }
        }
      }
    ]}
  >
    <FlagsProvider flags={{ reports: true }}>
      <PageWrapper title="Active Journeys">
        <JourneyList {...args} />
      </PageWrapper>
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journeys: [defaultJourney, publishedJourney, oldJourney, descriptiveJourney],
  disableCreation: true
}

export const Access = Template.bind({})
Access.args = {
  journeys: [],
  disableCreation: true
}

export default JourneyListStory as Meta
