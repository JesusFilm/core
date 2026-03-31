import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'

import {
  GetLastActiveTeamIdAndTeams,
  GetLastActiveTeamIdAndTeams_teams as Team
} from './__generated__/GetLastActiveTeamIdAndTeams'
import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from './TeamProvider'

import { TeamProvider, useTeam } from '.'

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

const TestComponent = (): ReactElement => {
  const { query, activeTeam, setActiveTeam, refetch } = useTeam()

  return (
    <>
      {activeTeam != null && (
        <div key={activeTeam.id}>activeTeam: {activeTeam.title}</div>
      )}

      {query?.data?.teams.map((value) => (
        <div key={value.id}>{value.title}</div>
      ))}

      <button
        type="button"
        onClick={() => setActiveTeam(query.data?.teams[1] ?? null)}
      >
        Change active to second team
      </button>

      <button type="button" onClick={() => setActiveTeam(null)}>
        Set Shared With Me
      </button>

      <button type="button" onClick={async () => await refetch()}>
        Refetch
      </button>
    </>
  )
}

const teams: Team[] = [
  {
    __typename: 'Team',
    id: 'teamId1',
    title: 'my first team',
    publicTitle: null,
    userTeams: [],
    customDomains: []
  },
  {
    __typename: 'Team',
    id: 'teamId2',
    title: 'my second team',
    publicTitle: null,
    userTeams: [],
    customDomains: []
  }
]

const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams,
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'teamId1'
      }
    }
  }
}

const getNoTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: null
      }
    }
  }
}

describe('TeamProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('show show list of teams', async () => {
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('my second team')).toBeInTheDocument()
    )
  })

  it('should show last viewed team as the active team', async () => {
    const getLastViewedTeamMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      ...getTeamsMock,
      result: {
        data: {
          teams,
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            id: 'journeyProfileId',
            lastActiveTeamId: 'teamId2'
          }
        }
      }
    }
    render(
      <MockedProvider mocks={[getLastViewedTeamMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('activeTeam: my second team')).toBeInTheDocument()
    )
  })

  it('should allow active team to be set', async () => {
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my first team')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Change active to second team' })
    )
    expect(screen.getByText('activeTeam: my second team')).toBeInTheDocument()
  })

  it('should create GA event', async () => {
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'get_teams',
        teams: 2
      })
    })
  })

  it('should refetch', async () => {
    const result = jest.fn(() => ({ ...getTeamsMock.result }))
    const refetchMock = {
      ...getTeamsMock,
      result
    }

    render(
      <MockedProvider mocks={[getTeamsMock, refetchMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my first team')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Refetch' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should persist active team to sessionStorage on set', async () => {
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my first team')).toBeInTheDocument()
    )
    expect(sessionStorage.getItem('journeys-admin:activeTeamId')).toBe(
      'teamId1'
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Change active to second team' })
    )
    expect(sessionStorage.getItem('journeys-admin:activeTeamId')).toBe(
      'teamId2'
    )
  })

  it('should use sessionStorage value over database lastActiveTeamId', async () => {
    sessionStorage.setItem('journeys-admin:activeTeamId', 'teamId2')

    const updateLastActiveTeamIdMock: MockedResponse = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: { lastActiveTeamId: 'teamId2' }
        }
      },
      result: {
        data: {
          journeyProfileUpdate: { id: 'journeyProfileId' }
        }
      }
    }

    render(
      <MockedProvider mocks={[getTeamsMock, updateLastActiveTeamIdMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my second team')).toBeInTheDocument()
    )
  })

  it('should store sentinel value for Shared With Me in sessionStorage', async () => {
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my first team')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Set Shared With Me' }))
    expect(sessionStorage.getItem('journeys-admin:activeTeamId')).toBe(
      '__shared__'
    )
  })

  it('should fall back to database value when session team is not in teams list', async () => {
    sessionStorage.setItem('journeys-admin:activeTeamId', 'nonExistentTeamId')

    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my first team')).toBeInTheDocument()
    )
  })

  it('should resolve to Shared With Me when no team exists', async () => {
    render(
      <MockedProvider mocks={[getNoTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.queryByText(/activeTeam:/)).not.toBeInTheDocument()
    )
  })

  it('should recover to the only team when db lastActiveTeamId is null', async () => {
    const updateLastActiveTeamIdMock: MockedResponse = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: { lastActiveTeamId: 'teamId1' }
        }
      },
      result: {
        data: {
          journeyProfileUpdate: { id: 'journeyProfileId' }
        }
      }
    }

    const getSingleTeamNullActiveMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
      {
        request: {
          query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
        },
        result: {
          data: {
            teams: [teams[0]],
            getJourneyProfile: {
              __typename: 'JourneyProfile',
              id: 'journeyProfileId',
              lastActiveTeamId: null
            }
          }
        }
      }

    render(
      <MockedProvider
        mocks={[
          getSingleTeamNullActiveMock,
          updateLastActiveTeamIdMock,
          getSingleTeamNullActiveMock
        ]}
      >
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('activeTeam: my first team')).toBeInTheDocument()
    )
  })
})
