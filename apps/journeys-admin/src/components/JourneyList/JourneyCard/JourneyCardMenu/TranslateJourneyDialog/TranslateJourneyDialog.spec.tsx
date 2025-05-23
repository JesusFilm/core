import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { JOURNEY_AI_TRANSLATE_CREATE } from '@core/journeys/ui/useJourneyAiTranslateMutation'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateMutation/supportedLanguages'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { TranslateJourneyDialog } from './TranslateJourneyDialog'

jest.mock('@mui/material/useMediaQuery')

describe('TranslateJourneyDialog', () => {
  const getLastActiveTeamIdAndTeamsMock = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

  const getLanguagesMock = {
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

  const journeyDuplicateMock = {
    request: {
      query: JOURNEY_DUPLICATE,
      variables: {
        id: defaultJourney.id,
        teamId: 'teamId'
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

  const journeyAiTranslateCreateMock = {
    request: {
      query: JOURNEY_AI_TRANSLATE_CREATE,
      variables: {
        journeyId: 'duplicatedJourneyId',
        name: defaultJourney.title,
        journeyLanguageName: 'English',
        textLanguageId: '496',
        textLanguageName: 'Français'
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyAiTranslateCreate: {
          id: 'translatedJourneyId',
          __typename: 'Journey',
          title: 'Some french title',
          description: 'some french description',
          languageId: '496',
          language: {
            id: '496',
            name: {
              value: 'Français',
              primary: true
            }
          },
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      }
    }))
  }

  const handleClose = jest.fn()

  it('should render correctly', () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Create Translated Copy')).toBeInTheDocument()
    expect(screen.getByText('Select Language')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onClose when cancel is clicked', () => {
    const handleClose = jest.fn()

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should translate journey', async () => {
    render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          getLastActiveTeamIdAndTeamsMock,
          journeyDuplicateMock,
          journeyAiTranslateCreateMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider
              value={{ journey: defaultJourney, variant: 'admin' }}
            >
              <TranslateJourneyDialog open={true} onClose={handleClose} />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })

    fireEvent.focus(screen.getByRole('combobox'))
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('option', { name: 'French Français' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => {
      expect(journeyDuplicateMock.result).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(journeyAiTranslateCreateMock.result).toHaveBeenCalled()
    })
    expect(handleClose).toHaveBeenCalled()
    expect(screen.getByText('Journey Translated')).toBeInTheDocument()
  })
})
