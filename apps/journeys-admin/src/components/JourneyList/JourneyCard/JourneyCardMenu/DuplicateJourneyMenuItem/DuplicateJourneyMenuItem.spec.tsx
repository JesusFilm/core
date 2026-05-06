import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION } from '@core/journeys/ui/useJourneyAiTranslateSubscription/useJourneyAiTranslateSubscription'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { UpdateLastActiveTeamId } from '../../../../../../__generated__/UpdateLastActiveTeamId'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { defaultJourney } from '../../../journeyListData'

import { DuplicateJourneyMenuItem } from './DuplicateJourneyMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    query: { tab: 'active' }
  }))
}))

jest.mock(
  '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery',
  () => ({
    useTemplateFamilyStatsAggregateLazyQuery: jest.fn()
  })
)

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as jest.MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()
  const refetchTemplateStats = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseTemplateFamilyStatsAggregateLazyQuery.mockReturnValue({
      query: [
        jest.fn(),
        {
          data: undefined,
          loading: false,
          error: undefined
        }
      ] as any,
      refetchTemplateStats
    })
  })

  it('should duplicate a journey on menu card click', async () => {
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const mockLanguage = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId',
                teamId: 'teamId'
              }
            },
            result
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          },
          mockLanguage
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      __typename: 'LanguageName',
                      value: 'English',
                      primary: true
                    }
                  ]
                },
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    expect(getByTestId('journey-duplicate-loader')).toBeInTheDocument()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Duplicated')).toBeInTheDocument()
  })

  it('should duplicate a journey on menu card click with journey from props', async () => {
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'team1.id', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'team1.id'
        }
      }
    }))

    const mockLanguage = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journey-id',
                teamId: 'team1.id'
              }
            },
            result
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          },
          mockLanguage
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DuplicateJourneyMenuItem
              id="journey-id"
              handleCloseMenu={handleCloseMenu}
              journey={defaultJourney}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    expect(getByTestId('journey-duplicate-loader')).toBeInTheDocument()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Duplicated')).toBeInTheDocument()
  })

  it('should open copy to team dialog when on shared with me', async () => {
    const push = jest.fn()
    const events = { on: jest.fn() }

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events
    } as unknown as NextRouter)

    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
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

    const mockLanguage = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId',
                teamId: 'teamId'
              }
            },
            result
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          },
          mockLanguage
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      __typename: 'LanguageName',
                      value: 'English',
                      primary: true
                    }
                  ]
                },
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'duplicate-journey' }
      },
      undefined,
      { shallow: true }
    )
    expect(getByText('Copy to Another Team')).toBeInTheDocument()
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton =
      await within(muiSelect).getByRole('combobox')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)

    // Find the primary action button in the dialog
    const dialogButtons = await within(
      getByTestId('CopyToTeamDialog')
    ).findAllByRole('button')

    // Find the footer buttons (primary actions are usually in DialogActions at the bottom)
    const dialogFooter = within(getByTestId('CopyToTeamDialog')).queryByTestId(
      'dialog-actions'
    )
    if (dialogFooter) {
      const footerButtons = within(dialogFooter).getAllByRole('button')
      // Try to click the last button in the footer, which is typically the primary action
      const primaryButton = footerButtons[footerButtons.length - 1]
      fireEvent.click(primaryButton)
    } else {
      // If we can't find the footer, try to find the button by name containing "copy"
      const copyButton = dialogButtons.find((button) =>
        button.textContent?.toLowerCase().includes('copy')
      )
      if (copyButton) {
        fireEvent.click(copyButton)
      } else {
        // Last resort: click the last button that's not the close button
        const actionButtons = dialogButtons.filter(
          (btn) => !btn.getAttribute('data-testid')?.includes('close')
        )
        if (actionButtons.length > 0) {
          fireEvent.click(actionButtons[actionButtons.length - 1])
        }
      }
    }

    await waitFor(() =>
      expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    await waitFor(() => expect(getByText('Journey Copied')).toBeInTheDocument())
  })

  it('should open copy to team dialog when on shared with me with journey from props', async () => {
    const push = jest.fn()
    const events = { on: jest.fn() }

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events
    } as unknown as NextRouter)

    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'team1.id', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }))

    const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: {
            lastActiveTeamId: 'team1.id'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'team1.id'
          }
        }
      }))
    }

    const mockLanguage = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journey-id',
                teamId: 'team1.id'
              }
            },
            result
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          },
          mockLanguage
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DuplicateJourneyMenuItem
              id="journey-id"
              handleCloseMenu={handleCloseMenu}
              journey={defaultJourney}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'duplicate-journey' }
      },
      undefined,
      { shallow: true }
    )
    expect(getByText('Copy to Another Team')).toBeInTheDocument()
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton =
      await within(muiSelect).getByRole('combobox')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)

    // Find the primary action button in the dialog
    const dialogButtons = await within(
      getByTestId('CopyToTeamDialog')
    ).findAllByRole('button')

    // Find the footer buttons (primary actions are usually in DialogActions at the bottom)
    const dialogFooter = within(getByTestId('CopyToTeamDialog')).queryByTestId(
      'dialog-actions'
    )
    if (dialogFooter) {
      const footerButtons = within(dialogFooter).getAllByRole('button')

      // Try to click the last button in the footer, which is typically the primary action
      const primaryButton = footerButtons[footerButtons.length - 1]
      fireEvent.click(primaryButton)
    } else {
      // If we can't find the footer, try to find the button by name containing "copy"
      const copyButton = dialogButtons.find((button) =>
        button.textContent?.toLowerCase().includes('copy')
      )
      if (copyButton) {
        fireEvent.click(copyButton)
      } else {
        // Last resort: click the last button that's not the close button
        const actionButtons = dialogButtons.filter(
          (btn) => !btn.getAttribute('data-testid')?.includes('close')
        )
        if (actionButtons.length > 0) {
          fireEvent.click(actionButtons[actionButtons.length - 1])
        }
      }
    }

    await waitFor(() =>
      expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    await waitFor(() => expect(getByText('Journey Copied')).toBeInTheDocument())
  })

  it('should close copy to dialog', async () => {
    const mockLanguage = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const teamsMock = {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: {
        data: {
          teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            lastActiveTeamId: null
          }
        }
      }
    }

    const { getByRole, getByText, queryByText } = render(
      <MockedProvider mocks={[mockLanguage, teamsMock]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      __typename: 'LanguageName',
                      value: 'English',
                      primary: true
                    }
                  ]
                },
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem'))
    expect(getByText('Copy to Another Team')).toBeInTheDocument()
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Cancel' }))
    )
    await waitFor(() =>
      expect(queryByText('Copy to Another Team')).not.toBeInTheDocument()
    )
  })

  it('should call refetchTemplateStats when duplicating a journey with fromTemplateId', async () => {
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const mockLanguage = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId',
                teamId: 'teamId'
              }
            },
            result
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          },
          mockLanguage
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      __typename: 'LanguageName',
                      value: 'English',
                      primary: true
                    }
                  ]
                },
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
                fromTemplateId="templateId123"
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    expect(getByTestId('journey-duplicate-loader')).toBeInTheDocument()
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(refetchTemplateStats).toHaveBeenCalledWith(['templateId123'])
    })
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Duplicated')).toBeInTheDocument()
  })

  describe('AI translation on copy to team', () => {
    const teamsMock = {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: jest.fn(() => ({
        data: {
          teams: [
            {
              id: 'destinationTeamId',
              title: 'Destination Team',
              __typename: 'Team'
            }
          ],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            lastActiveTeamId: null
          }
        }
      }))
    }

    const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: {
            lastActiveTeamId: 'destinationTeamId'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'destinationTeamId'
          }
        }
      }))
    }

    const languagesWithFrenchMock = {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529',
          where: {
            ids: [...SUPPORTED_LANGUAGE_IDS]
          }
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
              id: '496',
              __typename: 'Language',
              slug: 'french',
              name: [
                {
                  value: 'French',
                  primary: false,
                  __typename: 'LanguageName'
                },
                {
                  value: 'Français',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const journeyDuplicateForTranslationMock = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journey-id',
          teamId: 'destinationTeamId'
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }))
    }

    async function selectDestinationTeam(): Promise<void> {
      const muiSelect = screen.getByTestId('team-duplicate-select')
      const muiSelectDropDownButton =
        await within(muiSelect).getByRole('combobox')
      await fireEvent.mouseDown(muiSelectDropDownButton)
      const teamOption = await screen.getByRole('option', {
        name: 'Destination Team'
      })
      fireEvent.click(teamOption)
    }

    async function toggleTranslationAndPickFrench(): Promise<void> {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Translation' }))
      const languageInput =
        await screen.findByPlaceholderText('Search Language')
      fireEvent.focus(languageInput)
      fireEvent.keyDown(languageInput, { key: 'ArrowDown' })
      fireEvent.click(
        await screen.findByRole('option', { name: 'French Français' })
      )
    }

    function renderForTranslation(
      additionalMocks: MockedResponse[] = []
    ): void {
      render(
        <MockedProvider
          mocks={[
            languagesWithFrenchMock,
            teamsMock,
            updateLastActiveTeamIdMock,
            journeyDuplicateForTranslationMock,
            ...additionalMocks
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journey-id"
                handleCloseMenu={handleCloseMenu}
                journey={defaultJourney}
              />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
    }

    it('starts AI translation subscription after duplicate when toggle is on', async () => {
      const translateSubscriptionMock = {
        request: {
          query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
          variables: {
            journeyId: 'duplicatedJourneyId',
            name: 'Default Journey Heading',
            journeyLanguageName: '',
            textLanguageId: '496',
            textLanguageName: 'Français',
            userLanguageId: '529',
            userLanguageName: ''
          }
        },
        result: jest.fn(() => ({
          data: {
            journeyAiTranslateCreateSubscription: {
              progress: 100,
              message: 'Translation completed',
              journey: {
                __typename: 'Journey',
                id: 'duplicatedJourneyId',
                title: 'Voyage Traduit',
                description: null,
                languageId: '496',
                createdAt: '2026-04-25T12:34:56Z',
                updatedAt: '2026-04-25T12:34:56Z',
                journeyCustomizationDescription: null,
                journeyCustomizationFields: [],
                blocks: [],
                language: {
                  __typename: 'Language',
                  id: '496',
                  name: [
                    {
                      __typename: 'LanguageName',
                      value: 'Français',
                      primary: true
                    }
                  ]
                }
              },
              __typename: 'JourneyAiTranslateProgress'
            }
          }
        }))
      }

      renderForTranslation([translateSubscriptionMock])

      await waitFor(() => expect(teamsMock.result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
      expect(
        await screen.findByText('Copy to Another Team')
      ).toBeInTheDocument()
      await selectDestinationTeam()
      await toggleTranslationAndPickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() =>
        expect(journeyDuplicateForTranslationMock.result).toHaveBeenCalled()
      )
      await waitFor(() =>
        expect(translateSubscriptionMock.result).toHaveBeenCalled()
      )
      expect(handleCloseMenu).toHaveBeenCalled()
      // updateLastActiveTeamId sets the active team during dialog submit, so by
      // the time the subscription completes the active-team-aware snackbar reads
      // "Journey Duplicated" rather than "Journey Copied".
      expect(await screen.findByText('Journey Duplicated')).toBeInTheDocument()
    })

    it('surfaces a snackbar when the translation subscription errors and keeps the duplicate', async () => {
      const translateSubscriptionErrorMock = {
        request: {
          query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
          variables: {
            journeyId: 'duplicatedJourneyId',
            name: 'Default Journey Heading',
            journeyLanguageName: '',
            textLanguageId: '496',
            textLanguageName: 'Français',
            userLanguageId: '529',
            userLanguageName: ''
          }
        },
        error: new Error('Translation service unavailable')
      }

      renderForTranslation([translateSubscriptionErrorMock])

      await waitFor(() => expect(teamsMock.result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
      expect(
        await screen.findByText('Copy to Another Team')
      ).toBeInTheDocument()
      await selectDestinationTeam()
      await toggleTranslationAndPickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() =>
        expect(journeyDuplicateForTranslationMock.result).toHaveBeenCalled()
      )
      expect(
        await screen.findByText('Translation service unavailable')
      ).toBeInTheDocument()
      // The duplicate snackbar must NOT show when the translation flow errors.
      expect(screen.queryByText('Journey Copied')).not.toBeInTheDocument()
      expect(screen.queryByText('Journey Duplicated')).not.toBeInTheDocument()
      // The duplicated journey must persist; the menu wrapper must NOT close
      // and template stats must NOT be refetched on subscription error.
      expect(handleCloseMenu).not.toHaveBeenCalled()
      expect(refetchTemplateStats).not.toHaveBeenCalled()
    })

    it('shows the duplicate-failure snackbar and does not start translation when journeyDuplicate errors', async () => {
      const journeyDuplicateErrorMock = {
        request: {
          query: JOURNEY_DUPLICATE,
          variables: {
            id: 'journey-id',
            teamId: 'destinationTeamId'
          }
        },
        error: new Error('Duplicate failed')
      }

      const translateSubscriptionMock = {
        request: {
          query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
          variables: {
            journeyId: 'duplicatedJourneyId',
            name: 'Default Journey Heading',
            journeyLanguageName: '',
            textLanguageId: '496',
            textLanguageName: 'Français',
            userLanguageId: '529',
            userLanguageName: ''
          }
        },
        result: jest.fn(() => ({
          data: {
            journeyAiTranslateCreateSubscription: {
              progress: 100,
              message: 'Translation completed',
              journey: null,
              __typename: 'JourneyAiTranslateProgress'
            }
          }
        }))
      }

      render(
        <MockedProvider
          mocks={[
            languagesWithFrenchMock,
            teamsMock,
            updateLastActiveTeamIdMock,
            journeyDuplicateErrorMock,
            translateSubscriptionMock
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journey-id"
                handleCloseMenu={handleCloseMenu}
                journey={defaultJourney}
              />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(teamsMock.result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
      expect(
        await screen.findByText('Copy to Another Team')
      ).toBeInTheDocument()
      await selectDestinationTeam()
      await toggleTranslationAndPickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Create' }))

      expect(
        await screen.findByText('Failed to duplicate journey')
      ).toBeInTheDocument()
      expect(translateSubscriptionMock.result).not.toHaveBeenCalled()
      expect(handleCloseMenu).not.toHaveBeenCalled()
    })

    it('shows an explicit error when translation is requested but the duplicate response has no id', async () => {
      const journeyDuplicateNullMock = {
        request: {
          query: JOURNEY_DUPLICATE,
          variables: {
            id: 'journey-id',
            teamId: 'destinationTeamId'
          }
        },
        result: jest.fn(() => ({
          data: {
            journeyDuplicate: null
          }
        }))
      }

      const translateSubscriptionMock = {
        request: {
          query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
          variables: {
            journeyId: 'duplicatedJourneyId',
            name: 'Default Journey Heading',
            journeyLanguageName: '',
            textLanguageId: '496',
            textLanguageName: 'Français',
            userLanguageId: '529',
            userLanguageName: ''
          }
        },
        result: jest.fn(() => ({
          data: {
            journeyAiTranslateCreateSubscription: {
              progress: 100,
              message: 'Translation completed',
              journey: null,
              __typename: 'JourneyAiTranslateProgress'
            }
          }
        }))
      }

      render(
        <MockedProvider
          mocks={[
            languagesWithFrenchMock,
            teamsMock,
            updateLastActiveTeamIdMock,
            journeyDuplicateNullMock,
            translateSubscriptionMock
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journey-id"
                handleCloseMenu={handleCloseMenu}
                journey={defaultJourney}
              />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(teamsMock.result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
      expect(
        await screen.findByText('Copy to Another Team')
      ).toBeInTheDocument()
      await selectDestinationTeam()
      await toggleTranslationAndPickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Create' }))

      expect(
        await screen.findByText('Failed to translate journey')
      ).toBeInTheDocument()
      // The subscription must NOT start when prerequisites are missing.
      expect(translateSubscriptionMock.result).not.toHaveBeenCalled()
      // The success snackbar must NOT show.
      expect(screen.queryByText('Journey Copied')).not.toBeInTheDocument()
      expect(screen.queryByText('Journey Duplicated')).not.toBeInTheDocument()
    })

    it('refetches template stats after a translated copy completes', async () => {
      const translateSubscriptionMock = {
        request: {
          query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
          variables: {
            journeyId: 'duplicatedJourneyId',
            name: 'Default Journey Heading',
            journeyLanguageName: '',
            textLanguageId: '496',
            textLanguageName: 'Français',
            userLanguageId: '529',
            userLanguageName: ''
          }
        },
        result: jest.fn(() => ({
          data: {
            journeyAiTranslateCreateSubscription: {
              progress: 100,
              message: 'Translation completed',
              journey: {
                __typename: 'Journey',
                id: 'duplicatedJourneyId',
                title: 'Voyage Traduit',
                description: null,
                languageId: '496',
                createdAt: '2026-04-25T12:34:56Z',
                updatedAt: '2026-04-25T12:34:56Z',
                journeyCustomizationDescription: null,
                journeyCustomizationFields: [],
                blocks: [],
                language: {
                  __typename: 'Language',
                  id: '496',
                  name: [
                    {
                      __typename: 'LanguageName',
                      value: 'Français',
                      primary: true
                    }
                  ]
                }
              },
              __typename: 'JourneyAiTranslateProgress'
            }
          }
        }))
      }

      render(
        <MockedProvider
          mocks={[
            languagesWithFrenchMock,
            teamsMock,
            updateLastActiveTeamIdMock,
            journeyDuplicateForTranslationMock,
            translateSubscriptionMock
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journey-id"
                handleCloseMenu={handleCloseMenu}
                journey={defaultJourney}
                fromTemplateId="templateId123"
              />
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(teamsMock.result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
      expect(
        await screen.findByText('Copy to Another Team')
      ).toBeInTheDocument()
      await selectDestinationTeam()
      await toggleTranslationAndPickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() =>
        expect(translateSubscriptionMock.result).toHaveBeenCalled()
      )
      await waitFor(() =>
        expect(refetchTemplateStats).toHaveBeenCalledWith(['templateId123'])
      )
    })
  })
})
