import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { JOURNEY_AI_TRANSLATE_CREATE } from '@core/journeys/ui/useJourneyAiTranslateMutation/useJourneyAiTranslateMutation'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { JourneyDuplicate } from '@core/journeys/ui/useJourneyDuplicateMutation/__generated__/JourneyDuplicate'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { GetAdminJourneys_journeys as AdminJourney } from '../../../../__generated__/GetAdminJourneys'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'

import { CopyToTeamMenuItem } from './CopyToTeamMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()
  const push = jest.fn()
  const on = jest.fn()

  it('should duplicate a journey on menu card click', async () => {
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
          textLanguageId: 'es-419',
          textLanguageName: 'Spanish'
        }
      },
      result: {
        data: {
          journeyAiTranslateCreate: {
            id: 'translatedJourneyId',
            title: 'Viaje Traducido',
            description: 'Esta es una descripción traducida',
            languageId: 'es-419',
            createdAt: '2023-04-25T12:34:56Z',
            updatedAt: '2023-04-25T12:34:56Z'
          }
        }
      }
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

          mockLanguage,
          translateMock,
          duplicateJourneyMock,
          getLastActiveTeamIdAndTeamsMock
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
                  } as unknown as AdminJourney
                }
              />
            </TeamProvider>
          </JourneyProvider>
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

    // Find the Copy button and click it
    const dialogButtons = await within(
      getByTestId('CopyToTeamDialog')
    ).findAllByRole('button')
    console.log(
      'Dialog buttons:',
      dialogButtons.map((btn) => btn.textContent)
    )
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
})
