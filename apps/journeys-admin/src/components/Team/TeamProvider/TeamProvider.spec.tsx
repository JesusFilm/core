import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { GetTeams } from '../../../../__generated__/GetTeams'
import { GET_TEAMS } from './TeamProvider'
import { TeamProvider, useTeam } from '.'

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

const getTeamsMock: MockedResponse<GetTeams> = {
  request: {
    query: GET_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          __typename: 'Team',
          id: 'teamId1',
          title: 'my first team'
        },
        {
          __typename: 'Team',
          id: 'teamId2',
          title: 'my second team'
        }
      ]
    }
  }
}

describe('TeamProvider', () => {
  it('show show list of teams', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getByText('my second team')).toBeInTheDocument())
  })

  it('should show active team as first team in array', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('activeTeam: my first team')).toBeInTheDocument()
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
})
