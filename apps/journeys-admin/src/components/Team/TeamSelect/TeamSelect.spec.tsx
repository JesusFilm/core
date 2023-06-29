import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { ReactElement } from 'react'
import { GET_TEAMS, TeamProvider, useTeam } from '../TeamProvider'
import { GetTeams } from '../../../../__generated__/GetTeams'
import { TeamSelect } from '.'

describe('TeamSelect', () => {
  const getTeamsMock: MockedResponse<GetTeams> = {
    request: {
      query: GET_TEAMS
    },
    result: {
      data: {
        teams: [
          { id: 'teamId1', title: 'Team Title', __typename: 'Team' },
          { id: 'teamId2', title: 'Team Title2', __typename: 'Team' }
        ]
      }
    }
  }
  const getEmptyTeamsMock: MockedResponse<GetTeams> = {
    request: {
      query: GET_TEAMS
    },
    result: {
      data: {
        teams: [
          { id: 'teamId1', title: 'Team Title', __typename: 'Team' },
          { id: 'teamId2', title: 'Team Title2', __typename: 'Team' }
        ]
      }
    }
  }
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }

  it('shows list of teams', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <TeamSelect />
          <TestComponent />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('combobox')).toHaveValue('Team Title'))
    expect(getByTestId('active-team-title')).toHaveTextContent('Team Title')
    fireEvent.click(getByRole('button', { name: 'Open' }))
    fireEvent.click(getByRole('option', { name: 'Team Title2' }))
    expect(getByTestId('active-team-title')).toHaveTextContent('Team Title2')
  })

  it('shows empty list', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getEmptyTeamsMock]}>
        <TeamProvider>
          <TeamSelect />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('combobox')).toHaveValue(''))
  })
})
