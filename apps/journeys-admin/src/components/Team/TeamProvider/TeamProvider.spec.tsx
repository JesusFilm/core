import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import TagManager from 'react-gtm-module'

import {
  GetLastActiveTeamIdAndTeams,
  GetLastActiveTeamIdAndTeams_teams as Team
} from '../../../../__generated__/GetLastActiveTeamIdAndTeams'

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
  const { query, activeTeam, setActiveTeam } = useTeam()

  return (
    <>
      {activeTeam != null && (
        <div key={activeTeam.id}>activeTeam: {activeTeam.title}</div>
      )}

      {query?.data?.teams.map((value) => (
        <div key={value.id}>{value.title}</div>
      ))}

      <button onClick={() => setActiveTeam(query.data?.teams[1] ?? null)}>
        Change active to second team
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
    userTeams: []
  },
  {
    __typename: 'Team',
    id: 'teamId2',
    title: 'my second team',
    publicTitle: null,
    userTeams: []
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
        lastActiveTeamId: 'teamId1'
      }
    }
  }
}

describe('TeamProvider', () => {
  it('should show list of teams', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getByText('my second team')).toBeInTheDocument())
  })

  it('should show last viewed team as the active team', async () => {
    const getLastViewedTeamMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      ...getTeamsMock,
      result: {
        data: {
          teams,
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            lastActiveTeamId: 'teamId2'
          }
        }
      }
    }
    const { getByText } = render(
      <MockedProvider mocks={[getLastViewedTeamMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('activeTeam: my second team')).toBeInTheDocument()
    )
  })

  it('should allow active team to be set', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('activeTeam: my first team')).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button'))
    expect(getByText('activeTeam: my second team')).toBeInTheDocument()
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
})
