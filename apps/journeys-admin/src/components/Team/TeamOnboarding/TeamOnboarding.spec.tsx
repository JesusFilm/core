import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { GetUserTeamsAndInvites } from '../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider,
  useTeam
} from '../TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../TeamSelect/TeamSelect'

import { TeamOnboarding } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
      id: 'userId',
      email: 'siyangguccigang@example.com'
    }
  })
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TeamOnboarding', () => {
  let push: jest.Mock

  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: {
        teamId: 'teamId',
        where: { role: [UserTeamRole.manager, UserTeamRole.member] }
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
          id: 'teamId1',
          title: 'Team Title',
          __typename: 'Team',
          userTeams: []
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
        teams: [{ __ref: 'Team:teamId' }]
      }
    })

    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider mocks={[teamCreateMock, getTeams]} cache={cache}>
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
    await waitFor(() =>
      expect(cache.extract()?.ROOT_QUERY?.teams).toEqual([
        { __ref: 'Team:teamId' },
        { __ref: 'Team:teamId1' }
      ])
    )
    expect(getByText('{{ teamName }} created.')).toBeInTheDocument()
  })

  it('should update last active team id', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyProfileUpdate: {
          __typename: 'JourneyProfile' as const,
          id: 'teamId1'
        }
      }
    }))

    const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: {
            lastActiveTeamId: 'teamId1'
          }
        }
      },
      result
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          teamCreateMock,
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: {
              data: {
                teams: [],
                getJourneyProfile: {
                  __typename: 'JourneyProfile',
                  lastActiveTeamId: null
                }
              }
            }
          },
          updateLastActiveTeamIdMock
        ]}
      >
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
    await waitFor(() => expect(result).toHaveBeenCalled())
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

  it('submits team invite form correctly', async () => {
    const { getByText, getByRole } = render(
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
    await waitFor(() => fireEvent.click(getByRole('button', { name: 'Skip' })))
    expect(push).toHaveBeenCalled()

    jest.resetAllMocks()
  })
})
