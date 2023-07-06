import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserTeamInviteForm } from '.'
import { GET_TEAMS, TeamProvider } from '../../TeamProvider'
import { GetTeams } from '../../../../../__generated__/GetTeams'
import { GetUserTeamsAndInvites } from '../../../../../__generated__/GetUserTeamsAndInvites'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import { USER_TEAM_INVITE_CREATE } from './UserTeamInviteForm'
import { values } from 'lodash'
import { UserTeamInviteCreate } from '../../../../../__generated__/UserTeamInviteCreate'
import { InMemoryCache } from '@apollo/client'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))
describe('UserTeamInviteForm', () => {
  const getTeams: MockedResponse<GetTeams> = {
    request: {
      query: GET_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'jfp-team', title: 'Team Title', __typename: 'Team' }]
      }
    }
  }

  const userTeamInviteCreateMock: MockedResponse<UserTeamInviteCreate> = {
    request: {
      query: USER_TEAM_INVITE_CREATE,
      variables: {
        teamId: 'jfp-team',
        input: {
          email: 'johnTHEgeronimo@gmail.com'
        }
      }
    },
    result: {
      data: {
        userTeamInviteCreate: {
          __typename: 'UserTeamInvite',
          email: 'johnTHEgeronimo@gmail.com',
          id: 'inviteId2',
          teamId: 'jfp-team'
        }
      }
    }
  }

  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: { teamId: 'jfp-team' }
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
              email: 'siyangguccigang@gmail.com',
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
            email: 'edmondshen@gmail.com',
            teamId: 'jfp-team',
            __typename: 'UserTeamInvite'
          }
        ]
      }
    }
  }
  it('it should validate when fields are empty', async () => {
    const { getByRole, getAllByText } = render(
      <MockedProvider>
        <TeamProvider>
          <UserTeamInviteForm />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })
    fireEvent.click(email)
    expect(getByRole('button', { name: 'add user' })).toBeDisabled()
    fireEvent.change(email, { target: { value: '123abc@' } })
    fireEvent.click(getByRole('button', { name: 'add user' }))
    fireEvent.change(email, { target: { value: '' } })
    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <TeamProvider>
          <UserTeamInviteForm />
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
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate if email already exists', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeams, getUserTeamMock1]}>
        <TeamProvider>
          <UserTeamInviteForm />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    await waitFor(() => {
      fireEvent.change(email, {
        target: { value: 'siyangguccigang@gmail.com' }
      })
    })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })

    await waitFor(() => {
      const inlineError = getByText('This email is already on the list')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when user inputs uppercase strings for email if email already exists', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeams, getUserTeamMock1]}>
        <TeamProvider>
          <UserTeamInviteForm />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    await waitFor(() => {
      fireEvent.change(email, {
        target: { value: 'EDMONDSHEN@gmail.com' }
      })
    })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })

    await waitFor(() => {
      const inlineError = getByText('This email is already on the list')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should create a user team invite on click ', async () => {
    const cache = new InMemoryCache()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[getTeams, getUserTeamMock1, userTeamInviteCreateMock]}
        cache={cache}
      >
        <TeamProvider>
          <UserTeamInviteForm />
        </TeamProvider>
      </MockedProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })
    await waitFor(() => {
      fireEvent.change(email, {
        target: { value: 'johnTHEgeronimo@gmail.com' }
      })
    })
    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'add user' }))
    })
    await waitFor(() => {
      expect(cache.extract()['UserTeamInvite:inviteId2']).toEqual({
        __typename: 'UserTeamInvite',
        email: 'johnTHEgeronimo@gmail.com',
        id: 'inviteId2',
        teamId: 'jfp-team'
      })
    })
  })
})
