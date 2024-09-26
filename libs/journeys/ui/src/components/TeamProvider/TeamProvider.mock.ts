import { MockedResponse } from '@apollo/client/testing'

import { UserTeamRole } from '../../../__generated__/globalTypes'

import { GetLastActiveTeamIdAndTeams } from './__generated__/GetLastActiveTeamIdAndTeams'
import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from './TeamProvider'

export const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Title',
            __typename: 'Team',
            userTeams: [
              {
                id: 'teamId',
                __typename: 'UserTeam',
                role: UserTeamRole.manager,
                user: {
                  __typename: 'User',
                  email: 'test@email.com',
                  firstName: 'User',
                  id: 'user.id',
                  imageUrl: 'imageURL',
                  lastName: '1'
                }
              }
            ],
            publicTitle: 'Team Title',
            customDomains: []
          }
        ],
        getJourneyProfile: {
          id: 'someId',
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

export const getLastActiveTeamIdAndTeamsMockTeamMember: MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Title',
            __typename: 'Team',
            userTeams: [
              {
                id: 'teamId',
                __typename: 'UserTeam',
                role: UserTeamRole.member,
                user: {
                  __typename: 'User',
                  email: 'test@email.com',
                  firstName: 'User',
                  id: 'user.id',
                  imageUrl: 'imageURL',
                  lastName: '1'
                }
              }
            ],
            publicTitle: 'Team Title',
            customDomains: []
          }
        ],
        getJourneyProfile: {
          id: 'someId',
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }
