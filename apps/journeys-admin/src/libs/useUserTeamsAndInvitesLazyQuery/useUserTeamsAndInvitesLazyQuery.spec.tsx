import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { UserTeamRole } from '../../../__generated__/globalTypes'
import { GET_USER_TEAMS_AND_INVITES } from '../useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'

import { useUserTeamsAndInvitesLazyQuery } from './useUserTeamsAndInvitesLazyQuery'

describe('useUserTeamsAndInvitesLazyQuery', () => {
  it('should get user teams and invites', async () => {
    const result = jest.fn(() => ({
      data: {
        userTeams: [
          {
            __typename: 'UserTeam',
            id: 'ut1',
            role: UserTeamRole.manager,
            user: {
              __typename: 'User',
              email: 'userTeam1@example.com',
              firstName: 'User',
              lastName: 'One',
              id: 'user1',
              imageUrl: 'imageUrl1'
            }
          },
          {
            __typename: 'UserTeam',
            id: 'ut2',
            role: UserTeamRole.member,
            user: {
              __typename: 'User',
              email: 'userTeam2@example.com',
              firstName: 'User',
              lastName: 'Two',
              id: 'user2',
              imageUrl: 'imageUrl2'
            }
          }
        ],
        userTeamInvites: [
          {
            __typename: 'UserTeamInvite',
            email: 'userTeamInvite1@example.com',
            id: 'inv1',
            teamId: 'teamId'
          },
          {
            __typename: 'UserTeamInvite',
            email: 'userTeamInvite2@example.com',
            id: 'inv2',
            teamId: 'teamId'
          }
        ]
      }
    }))

    const { result: hookResult } = renderHook(
      () => useUserTeamsAndInvitesLazyQuery(),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_USER_TEAMS_AND_INVITES,
                  variables: {
                    teamId: 'teamId',
                    where: {
                      role: [UserTeamRole.manager, UserTeamRole.member]
                    }
                  }
                },
                result
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await hookResult.current.query[0]({
        variables: {
          teamId: 'teamId',
          where: {
            role: [UserTeamRole.manager, UserTeamRole.member]
          }
        }
      })
    })

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(hookResult.current.emails).toEqual([
      'userteam1@example.com',
      'userteam2@example.com',
      'userteaminvite1@example.com',
      'userteaminvite2@example.com'
    ])
  })
})
