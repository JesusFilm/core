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

import { TrashedJourneyList } from '.'

const TrashedJourneyListStory: Meta<typeof TrashedJourneyList> = {
  ...journeysAdminConfig,
  component: TrashedJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/TrashedJourneyList',
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
      status: [JourneyStatus.trashed],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        { ...defaultJourney, trashedAt: new Date() },
        { ...oldJourney, trashedAt: new Date() },
        { ...descriptiveJourney, trashedAt: new Date() },
        { ...publishedJourney, trashedAt: new Date() }
      ]
    }
  }
}

const Template: StoryObj<typeof TrashedJourneyList> = {
  render: ({ ...args }) => <TrashedJourneyList {...args} />,
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

export const RestoreAll = {
  ...Template,
  args: {
    event: 'restoreAllTrashed'
  }
}

export const DeleteAll = {
  ...Template,
  args: {
    event: 'deleteAllTrashed'
  }
}

export default TrashedJourneyListStory
