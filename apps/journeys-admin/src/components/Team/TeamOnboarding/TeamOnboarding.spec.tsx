import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider,
  useTeam
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'

import { TeamOnboarding } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('apps/journeys-admin/src/libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn().mockReturnValue({
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
          publicTitle: null,
          __typename: 'Team',
          userTeams: [],
          customDomains: []
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
            publicTitle: null,
            __typename: 'Team',
            userTeams: [],
            customDomains: []
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          id: 'journeyProfileId',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

  const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
    request: {
      query: UPDATE_LAST_ACTIVE_TEAM_ID,
      variables: {
        input: {
          lastActiveTeamId: 'teamId1'
        }
      }
    },
    result: {
      data: {
        journeyProfileUpdate: {
          __typename: 'JourneyProfile' as const,
          id: 'teamId1'
        }
      }
    }
  }
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }
  let push: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  it('creates new team and sets it as active', async () => {
    const user: User = {
      id: null,
      email: null,
      emailVerified: false,
      phoneNumber: null,
      displayName: 'User Name',
      photoURL: null,
      claims: {},
      tenantId: null,
      getIdToken: async (forceRefresh?: boolean) => null,
      clientInitialized: false,
      firebaseUser: null,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      signOut: async () => {},
      serialize: (a?: { includeToken?: boolean }) => JSON.stringify({})
    }

    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId' }]
      }
    })

    const teamMock: MockedResponse<TeamCreate> = {
      request: {
        query: TEAM_CREATE,
        variables: {
          input: {
            title: 'Team Title',
            publicTitle: 'Public Title'
          }
        }
      },
      result: {
        data: {
          teamCreate: {
            id: 'teamId1',
            title: 'Team Title',
            publicTitle: 'Public Title',
            __typename: 'Team',
            userTeams: [],
            customDomains: []
          }
        }
      }
    }

    const { getByRole, getByTestId, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[teamMock, getTeams, updateLastActiveTeamIdMock]}
        cache={cache}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamOnboarding user={user} />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getAllByRole('textbox')[0]).toHaveValue('User Name & Team')
    expect(getAllByRole('textbox')[1]).toHaveValue('U Team')
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Team Title' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'Public Title' }
    })
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
    expect(getByText('Team Title created.')).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/?onboarding=true')
  })

  it('should update last active team id', async () => {
    const result = jest.fn(() => ({
      data: {
        teams: [],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }))
    const { getByRole, getAllByRole } = render(
      <MockedProvider
        mocks={[
          teamCreateMock,
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result
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

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Team Title' }
    })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('validates form', async () => {
    const { getByText, getByRole, getAllByRole } = render(
      <MockedProvider mocks={[teamCreateErrorMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamOnboarding />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getAllByRole('textbox')[0], { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Team Name must be at least one character.')
      ).toBeInTheDocument()
    )
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Team Title' }
    })
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

  it('should redirect to router query location', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: '/custom-location' }
    } as unknown as NextRouter)

    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId' }]
      }
    })

    const teamMock: MockedResponse<TeamCreate> = {
      request: {
        query: TEAM_CREATE,
        variables: {
          input: {
            title: 'Team Title',
            publicTitle: 'Public Title'
          }
        }
      },
      result: {
        data: {
          teamCreate: {
            id: 'teamId1',
            title: 'Team Title',
            publicTitle: 'Public Title',
            __typename: 'Team',
            userTeams: [],
            customDomains: []
          }
        }
      }
    }

    const { getByRole, getByTestId, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[teamMock, getTeams, updateLastActiveTeamIdMock]}
        cache={cache}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamOnboarding />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Team Title' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'Public Title' }
    })
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
    expect(getByText('Team Title created.')).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith(
      new URL('http://localhost/custom-location')
    )
  })
})
