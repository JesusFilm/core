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

const getAdminJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
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

const Template: StoryObj<typeof ActiveJourneyList> = {
  render: ({ ...args }) => <ActiveJourneyList {...args} />,
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

export const ArchiveAll = {
  ...Template,
  args: {
    event: 'archiveAllActive'
  }
}

export const TrashAll = {
  ...Template,
  args: {
    event: 'trashAllActive'
  }
}

export default ActiveJourneyListStory
