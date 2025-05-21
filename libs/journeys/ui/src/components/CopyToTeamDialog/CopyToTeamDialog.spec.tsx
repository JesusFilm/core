import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { GetJourney_journey as Journey } from '../../libs/useJourneyQuery/__generated__/GetJourney'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '../../libs/useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CopyToTeamDialog } from './CopyToTeamDialog'

describe('DuplicateJourneys', () => {
  const handleCloseMenuMock = jest.fn()
  const handleSubmitActionMock = jest.fn()

  afterEach(() => {
    handleCloseMenuMock.mockClear()
    handleSubmitActionMock.mockClear()
  })

  it('should set initial team selection if only 1 team', async () => {
    const result = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                title="Copy To Journey"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('combobox', { name: 'Select Team' })).toHaveTextContent(
      'Team Name'
    )
  })

  it('should call submit action on dialog submit', async () => {
    const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: {
            lastActiveTeamId: 'teamId'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'teamId'
          }
        }
      }))
    }
    const result = jest.fn(() => ({
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Name',
            __typename: 'Team'
          },
          {
            id: 'teamId2',
            title: 'Team Name Two',
            __typename: 'Team'
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                title="Copy To Journey"
                submitLabel="Copy"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())

    await fireEvent.mouseDown(getByRole('combobox', { name: 'Select Team' }))
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Copy')))
    await waitFor(() =>
      expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(handleSubmitActionMock).toHaveBeenCalled())
  })

  it('should validate if no option is selected', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                title="Copy To Journey"
                submitLabel="Copy"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(getByText('Copy')))
    await waitFor(() =>
      expect(getByText('Please select a valid team')).toBeInTheDocument()
    )
  })

  it('should call on close action on dialog close', async () => {
    const result = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                title="Copy To Journey"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => fireEvent.click(getByText('Cancel')))
    await waitFor(() => expect(handleSubmitActionMock).not.toHaveBeenCalled())
    await waitFor(() => expect(handleCloseMenuMock).toHaveBeenCalled())
  })

  it('should not close dialog if loading', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                loading
                title="Copy To Journey"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const dialog = getByTestId('CopyToTeamDialog')
    fireEvent.click(dialog)
    expect(handleCloseMenuMock).not.toHaveBeenCalled()
  })

  it('should not close dialog if escape key is pressed', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                loading
                title="Copy To Journey"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const dialog = getByTestId('CopyToTeamDialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(handleCloseMenuMock).not.toHaveBeenCalled()
  })

  it('should show language autocomplete if translation is checked', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                title="Copy To Journey"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Translation'
      })
    )
    expect(screen.getByPlaceholderText('Search Language')).toBeInTheDocument()
  })

  it('should not submit if no language is selected and translation is checked', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <CopyToTeamDialog
                open
                title="Copy To Journey"
                submitLabel="Copy"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Translation'
      })
    )
    expect(screen.getByPlaceholderText('Search Language')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Copy'))
    expect(handleSubmitActionMock).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.getByText('Please select a language')).toBeInTheDocument()
    )
  })
})
