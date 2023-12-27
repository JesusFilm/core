import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { TeamMenu } from './TeamMenu'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TeamMenu', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId1',
            title: 'Team Title',
            publicTitle: null,
            __typename: 'Team',
            userTeams: []
          },
          {
            id: 'teamId2',
            title: 'Team Title2',
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
  const getEmptyTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId1',
            title: 'Team Title',
            publicTitle: null,
            __typename: 'Team',
            userTeams: []
          },
          {
            id: 'teamId2',
            title: 'Team Title2',
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

  it('opens dialogs', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

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
    fireEvent.click(getByRole('menuitem', { name: 'New Team' }))
    await waitFor(() => expect(getByText('Create Team')).toBeInTheDocument())
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'create-team' },
        push,
        events: {
          on
        }
      })
    })

    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Rename' }))
    await waitFor(() =>
      expect(getByText('Change Team Name')).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'rename-team' },
        push,
        events: {
          on
        }
      })
    })

    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Members' }))
    await waitFor(() =>
      expect(getByText('Invite team member')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByTestId('dialog-close-button')).not.toBeInTheDocument()
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'teams' },
        push,
        events: {
          on
        }
      })
    })
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
    expect(getByRole('menuitem', { name: 'Rename' })).toHaveAttribute(
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
    expect(getByRole('menuitem', { name: 'Members' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
