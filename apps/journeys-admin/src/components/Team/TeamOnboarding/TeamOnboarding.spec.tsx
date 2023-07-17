import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { InMemoryCache } from '@apollo/client'
import { NextRouter, useRouter } from 'next/router'
import { GET_TEAMS, TeamProvider, useTeam } from '../TeamProvider'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import { GetTeams } from '../../../../__generated__/GetTeams'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { GetUserTeamsAndInvites } from '../../../../__generated__/GetUserTeamsAndInvites'
import { TeamOnboarding } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('../../libs/useCurrentUser', () => ({
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

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TeamOnboarding', () => {
  let push: jest.Mock

  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: {
        teamId: 'jfp-team',
        filter: { role: [UserTeamRole.manager, UserTeamRole.member] }
      }
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
        userTeamInvites: []
      }
    }
  }

  const teamCreateMock: MockedResponse<TeamCreate> = {
    request: {
      query: TEAM_CREATE,
      variables: {
        input: {
          title: 'Team Title'
        }
      }
    },
    result: {
      data: {
        teamCreate: {
          id: 'teamId',
          title: 'Team Title',
          __typename: 'Team'
        }
      }
    }
  }
  const teamCreateErrorMock: MockedResponse<TeamCreate> = {
    request: {
      query: TEAM_CREATE,
      variables: {
        input: {
          title: 'Team Title'
        }
      }
    },
    error: new Error('Team Title already exists.')
  }
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
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }

  beforeEach(() => {
    push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
  })

  it('creates new team and sets it as active', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId1' }]
      }
    })
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider mocks={[teamCreateMock]} cache={cache}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamOnboarding />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(getByTestId('active-team-title')).toHaveTextContent('Team Title')
    )
    expect(cache.extract()?.ROOT_QUERY?.teams).toEqual([
      { __ref: 'Team:teamId1' },
      { __ref: 'Team:teamId' }
    ])
    expect(getByText('{{ teamName }} created.')).toBeInTheDocument()
  })

  it('shows team invites form once team has been created', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeams, getUserTeamMock1]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamOnboarding />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('Team Title')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Siyang Gang')).toBeInTheDocument())
    expect(getByRole('button', { name: 'Skip' })).toBeInTheDocument()
  })

  it('validates form', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[teamCreateErrorMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamOnboarding />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Team Name must be at least one character.')
      ).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    await waitFor(() =>
      expect(getByRole('button', { name: 'Create' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Failed to create the team. Reload the page or try again.')
      ).toBeInTheDocument()
    )
    expect(push).not.toHaveBeenCalled()
  })
})
