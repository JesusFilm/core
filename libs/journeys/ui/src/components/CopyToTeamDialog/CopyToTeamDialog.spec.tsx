import { type FetchResult } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { type ReactElement } from 'react'
import { type Mock } from 'vitest'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { SUPPORTED_LANGUAGE_IDS } from '../../libs/useJourneyAiTranslateSubscription/supportedLanguages'
import { GetJourney_journey as Journey } from '../../libs/useJourneyQuery/__generated__/GetJourney'
import { GET_LANGUAGES } from '../../libs/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '../../libs/useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CopyToTeamDialog } from './CopyToTeamDialog'

describe('CopyToTeamDialog', () => {
  const handleCloseMenuMock = vi.fn()
  const handleSubmitActionMock = vi.fn()

  afterEach(() => {
    handleCloseMenuMock.mockClear()
    handleSubmitActionMock.mockClear()
    vi.clearAllMocks()
  })

  describe('dialog interactions', () => {
    it('should set initial team selection if only 1 team', async () => {
      const result = vi.fn(() => ({
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
      const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> =
        {
          request: {
            query: UPDATE_LAST_ACTIVE_TEAM_ID,
            variables: {
              input: {
                lastActiveTeamId: 'teamId'
              }
            }
          },
          result: vi.fn(
            (): FetchResult<UpdateLastActiveTeamId> => ({
              data: {
                journeyProfileUpdate: {
                  __typename: 'JourneyProfile',
                  id: 'teamId'
                }
              }
            })
          )
        }
      const result = vi.fn(() => ({
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

    it('should update team state when a single team is available', async () => {
      const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> =
        {
          request: {
            query: UPDATE_LAST_ACTIVE_TEAM_ID,
            variables: {
              input: {
                lastActiveTeamId: 'teamId'
              }
            }
          },
          result: vi.fn(
            (): FetchResult<UpdateLastActiveTeamId> => ({
              data: {
                journeyProfileUpdate: {
                  __typename: 'JourneyProfile',
                  id: 'teamId'
                }
              }
            })
          )
        }
      const result = vi.fn(() => ({
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

      await waitFor(() =>
        expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
      )
      await waitFor(() => expect(handleSubmitActionMock).toHaveBeenCalled())
    })

    it('should show translation UI when isTranslating is true', async () => {
      const result = vi.fn(() => ({
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
      const result = vi.fn(() => ({
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
      const result = vi.fn(() => ({
        data: {
          teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            lastActiveTeamId: 'teamId'
          }
        }
      }))

      const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> =
        {
          request: {
            query: UPDATE_LAST_ACTIVE_TEAM_ID,
            variables: {
              input: {
                lastActiveTeamId: 'teamId'
              }
            }
          },
          result: vi.fn(
            (): FetchResult<UpdateLastActiveTeamId> => ({
              data: {
                journeyProfileUpdate: {
                  __typename: 'JourneyProfile',
                  id: 'teamId'
                }
              }
            })
          )
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

    it('defers the team switch until the dialog closes when translation is enabled', async () => {
      // NES-1636: switching teams immediately refetches GetAdminJourneys and
      // unmounts the consumer that owns the translation subscription before it
      // completes, so the copied journey lands untranslated. The switch must be
      // held until the consumer closes the dialog on completion.
      //
      // Clear leaked active-team state so TeamProvider doesn't fire its own
      // mount-sync updateLastActiveTeamId and pollute the assertion below.
      window.sessionStorage.clear()

      const teamsResult = vi.fn(() => ({
        data: {
          teams: [
            { id: 'teamId', title: 'Team Name', __typename: 'Team' },
            { id: 'teamId2', title: 'Team Name Two', __typename: 'Team' }
          ],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            lastActiveTeamId: 'teamId2'
          }
        }
      }))

      const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> =
        {
          request: {
            query: UPDATE_LAST_ACTIVE_TEAM_ID,
            variables: { input: { lastActiveTeamId: 'teamId' } }
          },
          result: vi.fn(
            (): FetchResult<UpdateLastActiveTeamId> => ({
              data: {
                journeyProfileUpdate: {
                  __typename: 'JourneyProfile',
                  id: 'teamId'
                }
              }
            })
          )
        }

      const languagesMock = {
        request: {
          query: GET_LANGUAGES,
          variables: {
            languageId: '529',
            where: { ids: [...SUPPORTED_LANGUAGE_IDS] }
          }
        },
        result: {
          data: {
            languages: [
              {
                __typename: 'Language',
                id: '529',
                slug: 'english',
                name: [
                  {
                    value: 'English',
                    primary: true,
                    __typename: 'LanguageName'
                  }
                ]
              },
              {
                __typename: 'Language',
                id: '528',
                slug: 'spanish',
                name: [
                  {
                    value: 'Spanish',
                    primary: false,
                    __typename: 'LanguageName'
                  },
                  {
                    value: 'Español',
                    primary: true,
                    __typename: 'LanguageName'
                  }
                ]
              }
            ]
          }
        }
      }

      const mocks = [
        {
          request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
          result: teamsResult
        },
        languagesMock,
        updateLastActiveTeamIdMock
      ]

      const ui = (open: boolean): ReactElement => (
        <MockedProvider mocks={mocks}>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { id: 'journeyId' } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <TeamProvider>
                <CopyToTeamDialog
                  open={open}
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

      const { rerender } = render(ui(true))

      await waitFor(() => expect(teamsResult).toHaveBeenCalled())

      // Select a different team than the active one
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Team' }))
      fireEvent.click(screen.getByRole('option', { name: 'Team Name' }))

      // Enable translation and pick a target language
      fireEvent.click(screen.getByRole('checkbox', { name: 'Translation' }))
      await waitFor(() =>
        expect(screen.getByTestId('LanguageAutocomplete')).not.toHaveAttribute(
          'aria-disabled',
          'true'
        )
      )
      fireEvent.focus(screen.getByTestId('LanguageAutocomplete'))
      fireEvent.keyDown(screen.getByTestId('LanguageAutocomplete'), {
        key: 'ArrowDown'
      })
      fireEvent.click(screen.getByRole('option', { name: 'Spanish Español' }))

      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))

      await waitFor(() =>
        expect(handleSubmitActionMock).toHaveBeenCalledWith(
          'teamId',
          expect.objectContaining({ id: '528' }),
          true
        )
      )

      // Team switch is deferred: the dialog is still open mid-translation.
      expect(updateLastActiveTeamIdMock.result).not.toHaveBeenCalled()
      expect(handleCloseMenuMock).not.toHaveBeenCalled()

      // Consumer closes the dialog when the translation subscription completes.
      rerender(ui(false))

      await waitFor(() =>
        expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
      )
    })
  })

  describe('defaultToActiveTeam prop', () => {
    // Distinct team IDs ('team-a'/'team-b') vs the rest of this file ('teamId').
    // Without this, an earlier test's setActiveTeam('teamId') leaks into
    // TeamProvider via sessionStorage and the null-active-team case below
    // resolves to a real team instead of null.
    beforeEach(() => {
      window.sessionStorage.clear()
    })

    function renderWithDefaultToActiveTeam({
      defaultToActiveTeam,
      lastActiveTeamId
    }: {
      defaultToActiveTeam?: boolean
      lastActiveTeamId: string | null
    }): ReturnType<typeof render> & { queryResult: Mock } {
      const queryResult = vi.fn(() => ({
        data: {
          teams: [
            { id: 'team-a', title: 'Team A', __typename: 'Team' },
            { id: 'team-b', title: 'Team B', __typename: 'Team' }
          ],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            lastActiveTeamId
          }
        }
      }))
      const utils = render(
        <MockedProvider
          mocks={[
            {
              request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
              result: queryResult
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
                  defaultToActiveTeam={defaultToActiveTeam}
                />
              </TeamProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      return { ...utils, queryResult }
    }

    it('defaults the team dropdown to the active team when the flag is on and the user has multiple teams', async () => {
      const { getByRole, queryResult } = renderWithDefaultToActiveTeam({
        defaultToActiveTeam: true,
        lastActiveTeamId: 'team-b'
      })
      await waitFor(() => expect(queryResult).toHaveBeenCalled())
      await waitFor(() =>
        expect(
          getByRole('combobox', { name: 'Select Team' })
        ).toHaveTextContent('Team B')
      )
    })

    it('leaves the team dropdown empty when the flag is on but the user has no active team', async () => {
      const { getByRole, queryResult } = renderWithDefaultToActiveTeam({
        defaultToActiveTeam: true,
        lastActiveTeamId: null
      })
      await waitFor(() => expect(queryResult).toHaveBeenCalled())
      const teamSelect = getByRole('combobox', { name: 'Select Team' })
      expect(teamSelect).not.toHaveTextContent('Team A')
      expect(teamSelect).not.toHaveTextContent('Team B')
    })

    it('leaves the team dropdown empty when the flag is off, even if an active team is resolved', async () => {
      const { getByRole, queryResult } = renderWithDefaultToActiveTeam({
        lastActiveTeamId: 'team-b'
      })
      await waitFor(() => expect(queryResult).toHaveBeenCalled())
      const teamSelect = getByRole('combobox', { name: 'Select Team' })
      expect(teamSelect).not.toHaveTextContent('Team A')
      expect(teamSelect).not.toHaveTextContent('Team B')
    })
  })
})
