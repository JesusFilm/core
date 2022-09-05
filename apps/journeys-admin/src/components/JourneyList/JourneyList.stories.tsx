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
import { GET_ACTIVE_JOURNEYS } from './ActiveJourneyList/ActiveJourneyList'
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
    <FlagsProvider flags={{ reports: args.reports }}>
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
    event: ''
  },
  reports: true
}

export const Reports = Template.bind({})
Reports.args = {
  props: {
    journeys: [
      defaultJourney,
      publishedJourney,
      oldJourney,
      descriptiveJourney
    ],
    event: ''
  },
  reports: true
}

export const Access = Template.bind({})
Access.args = {
  props: { journeys: [], event: '' },
  reports: true
}

export default JourneyListStory as Meta
