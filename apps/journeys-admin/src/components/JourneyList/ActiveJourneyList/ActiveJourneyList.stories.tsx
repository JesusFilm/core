import { Meta, StoryObj } from '@storybook/react'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { cache } from '../../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_JOURNEYS_ADMIN } from '../../../libs/useJourneysAdminQuery/useJourneysAdminQuery'
import { getDiscoveryJourneysMock } from '../../DiscoveryJourneys/data'
import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney
} from '../journeyListData'

import { ActiveJourneyList } from '.'

const ActiveJourneyListStory: Meta<typeof ActiveJourneyList> = {
  ...journeysAdminConfig,
  component: ActiveJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ActiveJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ActiveJourneyList> = {
  render: ({ ...args }) => <ActiveJourneyList {...args} />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [
        {
          request: {
            query: GET_JOURNEYS_ADMIN,
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
}

export const NoJourneys = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [
        {
          request: {
            query: GET_JOURNEYS_ADMIN,
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
}

export const Loading = {
  ...Template,
  args: {
    mocks: []
  },
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getDiscoveryJourneysMock]
    }
  }
}

export const ArchiveAll = {
  ...Template,
  args: {
    event: 'archiveAllActive',
    mocks: []
  },
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getDiscoveryJourneysMock]
    }
  }
}

export const TrashAll = {
  ...Template,
  args: {
    event: 'trashAllActive',
    mocks: []
  },
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getDiscoveryJourneysMock]
    }
  }
}

export default ActiveJourneyListStory
