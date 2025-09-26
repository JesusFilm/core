import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { GetJourney_journey as Journey } from '../../libs/useJourneyQuery/__generated__/GetJourney'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '../../libs/useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CopyToTeamDialog } from './CopyToTeamDialog'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('CopyToTeamDialog', () => {
  const handleCloseMenuMock = jest.fn()
  const handleSubmitActionMock = jest.fn()
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

  beforeEach(() => {
    // Default router mock
    mockUseRouter.mockReturnValue({
      pathname: '/admin'
    } as NextRouter)
  })

  afterEach(() => {
    handleCloseMenuMock.mockClear()
    handleSubmitActionMock.mockClear()
    jest.clearAllMocks()
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

  it('should call submit action and update team state on dialog submit', async () => {
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

  it('should not update team state when shouldUpdateTeamState is false', async () => {
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

    // Team state should not be updated when shouldUpdateTeamState is false
    expect(updateLastActiveTeamIdMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(handleSubmitActionMock).toHaveBeenCalled())
  })

  it('should show translation UI when isTranslating is true', async () => {
    const result = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByTestId } = render(
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
                loading
                title="Copy To Journey"
                onClose={handleCloseMenuMock}
                submitAction={handleSubmitActionMock}
                isTranslating={true}
                translationProgress={{
                  progress: 50,
                  message: 'Translating...'
                }}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    // Should show translation progress when isTranslating is true
    expect(getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    // The TranslationDialogWrapper should be in translation mode
    expect(screen.getByText('Translating...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
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

  it('should not close dialog if backdrop is clicked during translation', async () => {
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
                isTranslating
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

  it('should not close dialog if escape key is pressed during translation', async () => {
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
                isTranslating
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

  it('should close dialog normally when translation is not enabled', async () => {
    const result = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

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

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result
          },
          updateLastActiveTeamIdMock
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

    // Select team
    await fireEvent.mouseDown(getByRole('combobox', { name: 'Select Team' }))
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)

    // Submit form without translation
    fireEvent.click(screen.getByText('Copy'))

    await waitFor(() => expect(handleSubmitActionMock).toHaveBeenCalled())

    // Dialog should close normally when translation is not enabled
    expect(handleCloseMenuMock).toHaveBeenCalled()
  })

  it('should not allow translation of non-original templates to prevent degradation', async () => {
    // Mock router to return templates admin path
    mockUseRouter.mockReturnValue({
      pathname: '/publisher'
    } as any)

    const result = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByText, getByRole } = render(
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
              journey: {
                id: 'journeyId',
                template: true,
                fromTemplateId: 'originalTemplateId' // Not original template
              } as unknown as Journey,
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

    expect(
      getByText(/This is not the original journey template/)
    ).toBeInTheDocument()

    const translationSwitch = getByRole('checkbox', { name: 'Translation' })
    expect(translationSwitch).toBeDisabled()
  })
})
