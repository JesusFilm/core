import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TeamMenu } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TeamMenu', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          { id: 'teamId1', title: 'Team Title', __typename: 'Team' },
          { id: 'teamId2', title: 'Team Title2', __typename: 'Team' }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }
  }
  const getEmptyTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          { id: 'teamId1', title: 'Team Title', __typename: 'Team' },
          { id: 'teamId2', title: 'Team Title2', __typename: 'Team' }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }
  }

  it('opens dialogs', async () => {
    const { getByRole, getByText, queryByRole, getByTestId, queryByTestId } =
      render(
        <MockedProvider mocks={[getTeamsMock]}>
          <SnackbarProvider>
            <TeamProvider>
              <TeamMenu />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Create New Team' }))
    expect(getByText('Create Team')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Rename Team' }))
    expect(getByText('Change Team Name')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Manage Team' }))
    expect(getByText('Invite others to your team')).toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByTestId('dialog-close-button')).not.toBeInTheDocument()
    )
  })

  it('disables rename team button', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getEmptyTeamsMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamMenu />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Rename Team' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
  it('disables manage team button', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getEmptyTeamsMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamMenu />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Manage Team' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
