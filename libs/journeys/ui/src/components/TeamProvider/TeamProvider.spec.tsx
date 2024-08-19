import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import TagManager from 'react-gtm-module'

import {
  GetLastActiveTeamIdAndTeams,
  GetLastActiveTeamIdAndTeams_teams as Team
} from './__generated__/GetLastActiveTeamIdAndTeams'
import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from './TeamProvider'

import { TeamProvider, useTeam } from '.'

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
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

describe('TeamProvider', () => {
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
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'get_teams',
          teams: 2
        }
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
})
