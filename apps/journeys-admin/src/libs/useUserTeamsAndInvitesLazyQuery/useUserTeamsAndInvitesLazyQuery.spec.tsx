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
            user: {
              email: 'userTeam1@example.com'
            }
          },
          {
            user: {
              email: 'userTeam2@example.com'
            }
          }
        ],
        userTeamInvites: [
          {
            email: 'userTeamInvite1@example.com'
          },
          {
            email: 'userTeamInvite2@example.com'
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

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )

    expect(hookResult.current.emails).toEqual([
      'userteam1@example.com',
      'userteam2@example.com',
      'userteaminvite1@example.com',
      'userteaminvite2@example.com'
    ])
  })
})
