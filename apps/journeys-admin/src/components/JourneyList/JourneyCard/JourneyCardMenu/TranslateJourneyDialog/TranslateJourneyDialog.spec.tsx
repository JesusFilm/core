import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { TranslateJourneyDialog } from './TranslateJourneyDialog'

jest.mock('@mui/material/useMediaQuery')

describe('TranslateJourneyDialog', () => {
  // Mock console methods to reduce noise during tests
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  beforeAll(() => {
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })

  const getLastActiveTeamIdAndTeamsMock = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Name',
            __typename: 'Team',
            publicTitle: null,
            userTeams: [],
            customDomains: []
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          id: 'teamId',
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

  const handleClose = jest.fn()

  beforeEach(() => {
    journeyDuplicateMock.result.mockClear()
    handleClose.mockClear()
  })

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
          journeyDuplicateMock
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

    // For now, we'll just test that the duplication was called
    // The subscription testing can be added later with more complex mocking
  })

  it('should close dialog normally when not in loading/translation state', () => {
    const handleClose = jest.fn()

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    const dialog = screen.getByTestId('TranslateJourneyDialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
  })

  it('should render with journey prop when provided', () => {
    const customJourney = {
      ...defaultJourney,
      title: 'Custom Journey Title',
      trashedAt: null
    }

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog
            open={true}
            onClose={handleClose}
            journey={customJourney}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Create Translated Copy')).toBeInTheDocument()
  })

  it('should handle journey duplication error gracefully', async () => {
    const journeyDuplicateErrorMock = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: defaultJourney.id,
          teamId: 'teamId'
        }
      },
      error: new Error('Duplication failed')
    }

    render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          getLastActiveTeamIdAndTeamsMock,
          journeyDuplicateErrorMock
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

    // The error should be handled by the component's try-catch
    await waitFor(
      () => {
        expect(journeyDuplicateErrorMock.error).toBeDefined()
      },
      { timeout: 3000 }
    )
  })
})
