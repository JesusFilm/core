import { Meta, Story } from '@storybook/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { cache } from '../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { getDiscoveryJourneysMock } from '../DiscoveryJourneys/data'
import { PageWrapper } from '../NewPageWrapper'

import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
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

const Template: Story = ({ ...args }) => (
  <FlagsProvider flags={args.flags}>
    <PageWrapper title="Active Journeys">
      <JourneyList {...args.props} />
    </PageWrapper>
  </FlagsProvider>
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
  }
}
Default.parameters = {
  apolloClient: {
    cache: cache(),
    mocks: [
      {
        request: {
          query: GET_ADMIN_JOURNEYS,
          variables: {
            status: [JourneyStatus.draft, JourneyStatus.published]
          }
        },
        result: {
          data: {
            journeys: [
              defaultJourney,
              publishedJourney,
              oldJourney,
              descriptiveJourney
            ]
          }
        }
      },
      getDiscoveryJourneysMock
    ]
  }
}

export const NoJourneys = Template.bind({})
NoJourneys.args = {
  props: {
    journeys: [],
    event: ''
  }
}
NoJourneys.parameters = {
  apolloClient: {
    cache: cache(),
    mocks: [getDiscoveryJourneysMock]
  }
}

export default JourneyListStory as Meta
