import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { UpdateLastActiveTeamId } from '../../../../../../__generated__/UpdateLastActiveTeamId'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { defaultJourney } from '../../../journeyListData'

import { DuplicateJourneyMenuItem } from './DuplicateJourneyMenuItem'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({
    query: { tab: 'active' }
  }))
}))

vi.mock('../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery', () => ({
  useTemplateFamilyStatsAggregateLazyQuery: vi.fn()
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>
const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

describe('DuplicateJourneys', () => {
  const handleCloseMenu = vi.fn()
  const refetchTemplateStats = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseTemplateFamilyStatsAggregateLazyQuery.mockReturnValue({
      query: [
        vi.fn(),
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
    const result = vi.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = vi.fn(() => ({
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
              renderMode: 'admin'
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
    const result = vi.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = vi.fn(() => ({
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
    const push = vi.fn()
    const events = { on: vi.fn() }

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events
    } as unknown as NextRouter)

    const result = vi.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = vi.fn(() => ({
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
      result: vi.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'teamId'
          }
        }
      })) as MockedResponse<UpdateLastActiveTeamId>['result']
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
              renderMode: 'admin'
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
    const push = vi.fn()
    const events = { on: vi.fn() }

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events
    } as unknown as NextRouter)

    const result = vi.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = vi.fn(() => ({
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
      result: vi.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'team1.id'
          }
        }
      })) as MockedResponse<UpdateLastActiveTeamId>['result']
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
              renderMode: 'admin'
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
    const result = vi.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = vi.fn(() => ({
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
              renderMode: 'admin'
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
})
