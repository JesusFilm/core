import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider,
  useTeam
} from '../TeamProvider'

import { TeamCreateDialog } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TeamCreateDialog', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

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
          publicTitle: null,
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
  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
    result: {
      data: {
        teams: [
          {
            id: 'teamId1',
            title: 'Team 1 Title',
            publicTitle: null,
            __typename: 'Team',
            userTeams: []
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }
  }
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }

  it('creates new team and sets it as active', async () => {
    const handleClose = jest.fn()
    const handleCreate = jest.fn()
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId1' }]
      }
    })
    const { getByRole, getByTestId, getByText, getAllByRole } = render(
      <MockedProvider mocks={[teamCreateMock, getTeamsMock]} cache={cache}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateDialog
              open
              onClose={handleClose}
              onCreate={handleCreate}
            />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getAllByRole('textbox')[0], { target: { value: 'Team Title' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(getByTestId('active-team-title')).toHaveTextContent('Team Title')
    )
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
    expect(cache.extract()?.ROOT_QUERY?.teams).toEqual([
      { __ref: 'Team:teamId1' },
      { __ref: 'Team:teamId' }
    ])
    expect(getByText('{{ teamName }} created.')).toBeInTheDocument()
    await waitFor(() => expect(handleCreate).toHaveBeenCalled())
  })

  it('validates form', async () => {
    const handleCreate = jest.fn()
    const { getByText, getByRole, getAllByRole } = render(
      <MockedProvider mocks={[teamCreateErrorMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateDialog
              open
              onClose={jest.fn()}
              onCreate={handleCreate}
            />
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
    fireEvent.change(getAllByRole('textbox')[0], { target: { value: 'Team Title' } })
    await waitFor(() =>
      expect(getByRole('button', { name: 'Create' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Failed to create the team. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
