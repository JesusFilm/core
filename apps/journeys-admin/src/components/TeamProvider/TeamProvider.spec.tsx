import { render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { GetTeams_teams as Team } from '../../../__generated__/GetTeams'
import { GET_TEAMS } from './TeamProvider'
import { TeamProvider, useTeam } from '.'

const TestComponent = (): ReactElement => {
  const { query } = useTeam()

  return (
    <>
      {query?.data?.teams.map((value) => (
        <div key={value.id}>{value.title}</div>
      ))}
    </>
  )
}

const team1: Team = {
  __typename: 'Team',
  id: 'teamId1',
  title: 'my first team'
}

const team2: Team = {
  __typename: 'Team',
  id: 'teamId2',
  title: 'my second team'
}

describe('TeamProvider', () => {
  it('should pass through the journey props', async () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TEAMS
            },
            result: {
              data: {
                teams: [team1, team2]
              }
            }
          }
        ]}
      >
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getByText('my first team')).toBeInTheDocument())
  })
})
