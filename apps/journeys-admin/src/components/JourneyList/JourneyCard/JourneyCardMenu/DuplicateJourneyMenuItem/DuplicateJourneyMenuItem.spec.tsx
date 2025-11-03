import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

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

import { DuplicateJourneyMenuItem } from './DuplicateJourneyMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    query: { tab: 'active' }
  }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()

  beforeEach(() => jest.clearAllMocks())

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
    console.log(
      'Dialog buttons:',
      dialogButtons.map((btn) => btn.textContent)
    )

    // Find the footer buttons (primary actions are usually in DialogActions at the bottom)
    const dialogFooter = within(getByTestId('CopyToTeamDialog')).queryByTestId(
      'dialog-actions'
    )
    if (dialogFooter) {
      const footerButtons = within(dialogFooter).getAllByRole('button')
      console.log(
        'Footer buttons:',
        footerButtons.map((btn) => btn.textContent)
      )
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
})
