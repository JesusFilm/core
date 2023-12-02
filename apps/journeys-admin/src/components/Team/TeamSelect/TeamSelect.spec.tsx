import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { AddJourneyButton } from '../../JourneyList/ActiveJourneyList/AddJourneyButton'
import { CreateJourneyButton } from '../../OnboardingPanel/CreateJourneyButton'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider,
  useTeam
} from '../TeamProvider'

import { UPDATE_LAST_ACTIVE_TEAM_ID } from './TeamSelect'

import { TeamSelect } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TeamSelect', () => {
  const getMultipleTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
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
          lastActiveTeamId: 'teamId1'
        }
      }
    }
  }
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }

  it('shows and updates list of teams', async () => {
    const updateLastActiveTeamIdMock = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: {
            lastActiveTeamId: 'teamId2'
          }
        }
      },
      result: {
        data: {
          journeyProfileUpdate: {
            id: 'teamId2'
          }
        }
      }
    }

    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider
        mocks={[getMultipleTeamsMock, updateLastActiveTeamIdMock]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamSelect />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('button', {
          name: 'Team Title'
        })
      ).toBeInTheDocument()
    )
    expect(getByTestId('active-team-title')).toHaveTextContent('Team Title')
    await userEvent.click(
      getByRole('button', {
        name: 'Team Title'
      })
    )
    expect(getByText('Shared With Me')).toBeInTheDocument()
    fireEvent.click(getByText('Team Title2'))
    expect(getByTestId('active-team-title')).toHaveTextContent('Team Title2')
  })

  it('shows onboarding popover', async () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider mocks={[getMultipleTeamsMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamSelect onboarding />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
    )
    await userEvent.click(getByRole('button', { name: 'Dismiss' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
    )
  })

  it('removes create journey buttons when on Shared With Me team', async () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamSelect />
            <CreateJourneyButton />
            <AddJourneyButton />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Shared With Me' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Shared With Me' }))
    expect(
      queryByRole('button', { name: 'Create Custom Journey' })
    ).not.toBeInTheDocument()
    expect(
      queryByRole('button', { name: 'Create a Journey' })
    ).not.toBeInTheDocument()
  })
})
