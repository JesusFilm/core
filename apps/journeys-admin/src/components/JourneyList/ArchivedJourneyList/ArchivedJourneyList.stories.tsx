import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { cache } from '../../../libs/apolloClient/cache'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney
} from '../journeyListData'

import { ArchivedJourneyList } from '.'

const ArchivedJourneyListStory: Meta<typeof ArchivedJourneyList> = {
  ...journeysAdminConfig,
  component: ArchivedJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ArchivedJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const getAdminJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      useLastActiveTeamId: true
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

const Template: StoryObj<typeof ArchivedJourneyList> = {
  render: ({ ...args }) => <ArchivedJourneyList {...args} />,
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getAdminJourneysMock]
    },
    docs: {
      source: {
        type: 'code'
      }
    }
  }
}

export const Default = {
  ...Template
}

export const NoJourneys = {
  ...Template,
  parameters: {
    ...Template.parameters,
    apolloClient: {
      cache: cache(),
      mocks: [
        {
          ...getAdminJourneysMock,
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

export const UnarchiveAll = {
  ...Template,
  args: {
    event: 'restoreAllArchived'
  }
}

export const TrashAll = {
  ...Template,
  args: {
    event: 'trashAllArchived'
  }
}

export default ArchivedJourneyListStory
