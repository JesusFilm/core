import { Meta, StoryObj } from '@storybook/react'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { cache } from '../../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
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
        }
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
        }
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
      mocks: []
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
      mocks: []
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
      mocks: []
    }
  }
}

export default ActiveJourneyListStory
