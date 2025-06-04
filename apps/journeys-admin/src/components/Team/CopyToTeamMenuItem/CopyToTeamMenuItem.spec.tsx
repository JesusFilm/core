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

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateMutation/supportedLanguages'
import { JOURNEY_AI_TRANSLATE_CREATE } from '@core/journeys/ui/useJourneyAiTranslateMutation/useJourneyAiTranslateMutation'
import { JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION } from '@core/journeys/ui/useJourneyAiTranslateSubscription/useJourneyAiTranslateSubscription'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { JourneyDuplicate } from '@core/journeys/ui/useJourneyDuplicateMutation/__generated__/JourneyDuplicate'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { GetAdminJourneys_journeys as GetAdminJourney } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyFields as JourneyFields } from '../../../../__generated__/JourneyFields'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'

import { CopyToTeamMenuItem } from './CopyToTeamMenuItem'

type Journey = GetAdminJourney & JourneyFields

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()
  const push = jest.fn()
  const on = jest.fn()

  mockedUseRouter.mockReturnValue({
    query: { param: null },
    push,
    events: {
      on
    }
  } as unknown as NextRouter)

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

  const translateMock = {
    request: {
      query: JOURNEY_AI_TRANSLATE_CREATE,
      variables: {
        journeyId: 'duplicatedJourneyId',
        name: 'Journey',
        journeyLanguageName: 'English',
        textLanguageId: '528',
        textLanguageName: 'Español'
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyAiTranslateCreate: {
          id: 'translatedJourneyId',
          title: 'Viaje Traducido',
          description: 'Esta es una descripción traducida',
          languageId: '528',
          language: {
            id: '528',
            name: {
              value: 'Español',
              primary: true
            }
          },
          createdAt: '2023-04-25T12:34:56Z',
          updatedAt: '2023-04-25T12:34:56Z'
        }
      }
    }))
  }

  const translateSubscriptionMock = {
    request: {
      query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
      variables: {
        journeyId: 'duplicatedJourneyId',
        name: 'Journey',
        journeyLanguageName: '',
        textLanguageId: '528',
        textLanguageName: 'Español'
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyAiTranslateCreateSubscription: {
          progress: 100,
          message: 'Translation completed',
          journey: {
            id: 'duplicatedJourneyId',
            title: 'Viaje Traducido',
            description: 'Esta es una descripción traducida',
            languageId: '528',
            createdAt: '2023-04-25T12:34:56Z',
            updatedAt: '2023-04-25T12:34:56Z',
            blocks: [],
            __typename: 'Journey'
          },
          __typename: 'JourneyAiTranslateCreateSubscriptionPayload'
        }
      }
    }))
  }

  const duplicateJourneyMock: MockedResponse<JourneyDuplicate> = {
    request: {
      query: JOURNEY_DUPLICATE,
      variables: {
        id: 'journeyId',
        teamId: 'teamId'
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyDuplicate: {
          id: 'duplicatedJourneyId',
          __typename: 'Journey'
        }
      }
    }))
  }

  const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
    {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: jest.fn(() => ({
        data: {
          teams: [
            {
              id: 'teamId',
              title: 'Team Name',
              __typename: 'Team',
              publicTitle: 'Team Name',
              userTeams: [],
              customDomains: []
            }
          ],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            id: 'journeyProfileId',
            lastActiveTeamId: 'teamId'
          }
        }
      }))
    }

  const mockLanguage = {
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

  it('should duplicate a journey on menu card click', async () => {
    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          mockLanguage,
          translateMock,
          translateSubscriptionMock,
          duplicateJourneyMock,
          getLastActiveTeamIdAndTeamsMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CopyToTeamMenuItem
              id="journeyId"
              handleCloseMenu={handleCloseMenu}
              journey={
                {
                  __typename: 'Journey',
                  id: 'journeyId',
                  slug: 'journey',
                  title: 'Journey',
                  description: null,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    name: [
                      {
                        value: 'English',
                        primary: true,
                        __typename: 'LanguageName'
                      }
                    ]
                  },
                  status: JourneyStatus.draft,
                  createdAt: '2021-11-19T12:34:56.647Z',
                  publishedAt: null,
                  trashedAt: null,
                  archivedAt: null,
                  featuredAt: null
                } as unknown as Journey
              }
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    )
    fireEvent.click(getByRole('menuitem', { name: 'Copy to ...' }))
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = within(muiSelect).getByRole('combobox')
    fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)

    const dialogButtons = await within(
      getByTestId('CopyToTeamDialog')
    ).findAllByRole('button')
    const copyButton = dialogButtons.find(
      (button) => button.textContent === 'Copy'
    )
    expect(copyButton).not.toBeUndefined()
    if (copyButton) {
      fireEvent.click(copyButton)
    }
    await waitFor(() =>
      expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
    )
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Copied')).toBeInTheDocument()

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'copy-journey' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should translate a journey', async () => {
    render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          mockLanguage,
          translateSubscriptionMock,
          duplicateJourneyMock,
          getLastActiveTeamIdAndTeamsMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CopyToTeamMenuItem
              id="journeyId"
              handleCloseMenu={handleCloseMenu}
              journey={
                {
                  __typename: 'Journey',
                  id: 'journeyId',
                  slug: 'journey',
                  title: 'Journey',
                  description: null,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    name: [
                      {
                        value: 'English',
                        primary: true,
                        __typename: 'LanguageName'
                      }
                    ]
                  },
                  status: JourneyStatus.draft,
                  createdAt: '2021-11-19T12:34:56.647Z',
                  publishedAt: null,
                  trashedAt: null,
                  archivedAt: null,
                  featuredAt: null
                } as unknown as Journey
              }
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    })
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy to ...' }))
    const muiSelect = screen.getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = within(muiSelect).getByRole('combobox')
    fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = screen.getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Translation' }))

    await waitFor(() => {
      expect(screen.getByTestId('LanguageAutocomplete')).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })

    fireEvent.focus(screen.getByTestId('LanguageAutocomplete'))
    fireEvent.keyDown(screen.getByTestId('LanguageAutocomplete'), {
      key: 'ArrowDown'
    })
    fireEvent.click(screen.getByRole('option', { name: 'Spanish Español' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    await waitFor(() => {
      expect(duplicateJourneyMock.result).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(translateSubscriptionMock.result).toHaveBeenCalled()
    })
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(screen.getByText('Journey Translated')).toBeInTheDocument()
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'copy-journey' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should handle journey duplication errors', async () => {
    const duplicateJourneyErrorMock: MockedResponse<JourneyDuplicate> = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: 'teamId'
        }
      },
      error: new Error('Network error occurred')
    }

    render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          mockLanguage,
          duplicateJourneyErrorMock,
          getLastActiveTeamIdAndTeamsMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CopyToTeamMenuItem
              id="journeyId"
              handleCloseMenu={handleCloseMenu}
              journey={
                {
                  __typename: 'Journey',
                  id: 'journeyId',
                  slug: 'journey',
                  title: 'Journey',
                  description: null,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    name: [
                      {
                        value: 'English',
                        primary: true,
                        __typename: 'LanguageName'
                      }
                    ]
                  },
                  status: JourneyStatus.draft,
                  createdAt: '2021-11-19T12:34:56.647Z',
                  publishedAt: null,
                  trashedAt: null,
                  archivedAt: null,
                  featuredAt: null
                } as unknown as Journey
              }
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    })
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy to ...' }))
    const muiSelect = screen.getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = within(muiSelect).getByRole('combobox')
    fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = screen.getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)

    const dialogButtons = await within(
      screen.getByTestId('CopyToTeamDialog')
    ).findAllByRole('button')
    const copyButton = dialogButtons.find(
      (button) => button.textContent === 'Copy'
    )
    expect(copyButton).not.toBeUndefined()
    if (copyButton) {
      fireEvent.click(copyButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Journey duplication failed')).toBeInTheDocument()
    })
    expect(handleCloseMenu).toHaveBeenCalled()
  })
})
