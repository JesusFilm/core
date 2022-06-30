import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
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

const Template: Story = ({ ...args }) => (
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
    <FlagsProvider flags={{ analytics: args.analytics }}>
      <PageWrapper title="Active Journeys">
        <JourneyList {...args.props} />
      </PageWrapper>
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    journeys: [
      defaultJourney,
      publishedJourney,
      oldJourney,
      descriptiveJourney
    ],
    disableCreation: true
  }
}

export const Analytics = Template.bind({})
Analytics.args = {
  props: {
    journeys: [
      defaultJourney,
      publishedJourney,
      oldJourney,
      descriptiveJourney
    ],
    disableCreation: true
  },
  analytics: true
}

export const Access = Template.bind({})
Access.args = {
  props: { journeys: [], disableCreation: true }
}

export default JourneyListStory as Meta
