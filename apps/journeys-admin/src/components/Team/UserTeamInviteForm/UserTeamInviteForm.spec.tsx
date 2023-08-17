import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { GetUserTeamsAndInvites } from '../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { UserTeamInviteCreate } from '../../../../__generated__/UserTeamInviteCreate'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { TeamManageWrapper } from '../TeamManageDialog/TeamManageWrapper'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { USER_TEAM_INVITE_CREATE } from './UserTeamInviteForm'

import { UserTeamInviteForm } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('../../../libs/useCurrentUser', () => ({
  __esModule: true,
  useCurrentUser: jest.fn().mockReturnValue({
    loadUser: jest.fn(),
    data: {
      __typename: 'User',
      ...user1
    }
  })
}))

const user1 = { id: 'userId', email: 'siyangguccigang@example.com' }

describe('UserTeamInviteForm', () => {
  const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
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

  const userTeamInviteCreateMock: MockedResponse<UserTeamInviteCreate> = {
    request: {
      query: USER_TEAM_INVITE_CREATE,
      variables: {
        teamId: 'teamId',
        input: {
          email: 'johnTHEgeronimo@example.com'
        }
      }
    },
    result: {
      data: {
        userTeamInviteCreate: {
          __typename: 'UserTeamInvite',
          email: 'johnTHEgeronimo@example.com',
          id: 'inviteId2',
          teamId: 'teamId'
        }
      }
    }
  }

  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: { teamId: 'teamId' }
    },
    result: {
      data: {
        userTeams: [
          {
            id: 'userTeamId',
            __typename: 'UserTeam',
            role: UserTeamRole.manager,
            user: {
              __typename: 'User',
              email: 'siyangguccigang@example.com',
              firstName: 'Siyang',
              id: 'userId',
              imageUrl: 'imageURL',
              lastName: 'Gang'
            }
          }
        ],
        userTeamInvites: [
          {
            id: 'inviteId',
            email: 'edmondshen@example.com',
            teamId: 'teamId',
            __typename: 'UserTeamInvite'
          }
        ]
      }
    }
  }

  it('should validate when fields are empty', async () => {
    const { getByRole, getAllByText } = render(
      <MockedProvider>
        <TeamProvider>
          <UserTeamInviteForm emails={[]} role={UserTeamRole.manager} />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })
    fireEvent.click(email)
    expect(getByRole('button', { name: 'add user' })).toBeDisabled()
    fireEvent.change(email, { target: { value: '123abc@' } })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })
    await waitFor(() => {
      fireEvent.change(email, { target: { value: '' } })
    })

    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toBeInTheDocument()
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <TeamProvider>
          <UserTeamInviteForm emails={[]} role={UserTeamRole.manager} />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    fireEvent.change(email, {
      target: { value: '123abc@' }
    })
    fireEvent.click(getByRole('button', { name: 'add user' }))

    await waitFor(() => {
      const inlineError = getByText('Please enter a valid email address')
      expect(inlineError).toBeInTheDocument()
    })
  })

  it('should not allow a team member to invite others', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <TeamProvider>
          <UserTeamInviteForm emails={[]} role={UserTeamRole.member} />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    await waitFor(() => {
      const inlineError = getByText(
        'Only a manager can invite new members to the team'
      )
      expect(inlineError).toBeInTheDocument()
    })
    expect(email).toBeDisabled()
  })

  it('should validate if email already exists', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeams, getUserTeamMock1]}>
        <TeamProvider>
          <UserTeamInviteForm
            emails={['siyangguccigang@example.com', 'edmondshen@example.com']}
            role={UserTeamRole.manager}
          />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    await waitFor(() => {
      fireEvent.change(email, {
        target: { value: 'siyangguccigang@example.com' }
      })
    })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })

    await waitFor(() => {
      const inlineError = getByText('This email is already on the list')
      expect(inlineError).toBeInTheDocument()
    })
  })

  it('should validate when user inputs uppercase strings for email if email already exists', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeams, getUserTeamMock1]}>
        <TeamProvider>
          <UserTeamInviteForm
            emails={['siyangguccigang@example.com', 'edmondshen@example.com']}
            role={UserTeamRole.manager}
          />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    await waitFor(() => {
      fireEvent.change(email, {
        target: { value: 'EDMONDSHEN@example.com' }
      })
    })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })

    await waitFor(() => {
      const inlineError = getByText('This email is already on the list')
      expect(inlineError).toBeInTheDocument()
    })
  })

  it.skip('should create a user team invite on click', async () => {
    const cache = new InMemoryCache()
    const { getByRole } = render(
      <MockedProvider
        mocks={[getTeams, getUserTeamMock1, userTeamInviteCreateMock]}
        cache={cache}
      >
        <TeamProvider>
          <TeamManageWrapper>
            {({ userTeamList, userTeamInviteList, userTeamInviteForm }) => (
              <>
                {userTeamList}
                {userTeamInviteList}
                {userTeamInviteForm}
              </>
            )}
          </TeamManageWrapper>
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })
    await waitFor(() => {
      fireEvent.change(email, {
        target: { value: 'johnTHEgeronimo@example.com' }
      })
    })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })
    await waitFor(() => {
      expect(cache.extract()['UserTeamInvite:inviteId2']).toEqual({
        __typename: 'UserTeamInvite',
        email: 'johnTHEgeronimo@example.com',
        id: 'inviteId2',
        teamId: 'teamId'
      })
    })
  })
})
