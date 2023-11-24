import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { cache } from '../../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../Team/TeamProvider'
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

const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'My Team',
          publicTitle: '',
          __typename: 'Team',
          userTeams: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

const Template: StoryObj<typeof ActiveJourneyList> = {
  render: ({ ...args }) => (
    <TeamProvider>
      <ActiveJourneyList {...args} />
    </TeamProvider>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [
        getTeamsMock,
        {
          request: {
            query: GET_ADMIN_JOURNEYS,
            variables: {
              status: [JourneyStatus.draft, JourneyStatus.published],
              teamId: 'teamId'
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
        getTeamsMock,
        {
          request: {
            query: GET_ADMIN_JOURNEYS,
            variables: {
              status: [JourneyStatus.draft, JourneyStatus.published],
              teamId: 'teamId'
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
