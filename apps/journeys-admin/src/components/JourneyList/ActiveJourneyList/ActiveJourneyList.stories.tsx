import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../journeyListData'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { getDiscoveryJourneysMock } from '../../DiscoveryJourneys/data'
import { cache } from '../../../libs/apolloClient/cache'
import { ActiveJourneyList } from '.'

const ActiveJourneyListStory = {
  ...journeysAdminConfig,
  component: ActiveJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ActiveJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => <ActiveJourneyList {...args.props} />

export const Default = Template.bind({})
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
              oldJourney,
              descriptiveJourney,
              publishedJourney
            ]
          }
        }
      },
      getDiscoveryJourneysMock
    ]
  }
}

export const NoJourneys = Template.bind({})
NoJourneys.parameters = {
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
            journeys: []
          }
        }
      },
      getDiscoveryJourneysMock
    ]
  }
}

export const Loading = Template.bind({})
Loading.args = {
  mocks: []
}
Loading.parameters = {
  apolloClient: {
    cache: cache(),
    mocks: [getDiscoveryJourneysMock]
  }
}

export const ArchiveAll = Template.bind({})
ArchiveAll.args = {
  props: {
    event: 'archiveAllActive'
  },
  mocks: []
}
ArchiveAll.parameters = {
  apolloClient: {
    cache: cache(),
    mocks: [getDiscoveryJourneysMock]
  }
}

export const TrashAll = Template.bind({})
TrashAll.args = {
  props: {
    event: 'trashAllActive'
  },
  mocks: []
}
TrashAll.parameters = {
  apolloClient: {
    cache: cache(),
    mocks: [getDiscoveryJourneysMock]
  }
}

export default ActiveJourneyListStory as Meta
