import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION } from '@core/journeys/ui/useJourneyAiTranslateSubscription/useJourneyAiTranslateSubscription'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { JourneyDuplicate } from '@core/journeys/ui/useJourneyDuplicateMutation/__generated__/JourneyDuplicate'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { IdType } from '../../../__generated__/globalTypes'
import { UpdateLastActiveTeamId } from '../../../__generated__/UpdateLastActiveTeamId'

import { UseTemplateDeepLink } from './UseTemplateDeepLink'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const teamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
  result: {
    data: {
      teams: [
        {
          __typename: 'Team',
          id: 'team-1',
          title: 'Team One',
          publicTitle: 'Team One',
          userTeams: [],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'profile-1',
        lastActiveTeamId: 'team-1'
      }
    }
  }
}

const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
  request: {
    query: UPDATE_LAST_ACTIVE_TEAM_ID,
    variables: { input: { lastActiveTeamId: 'team-1' } }
  },
  result: {
    data: {
      journeyProfileUpdate: {
        __typename: 'JourneyProfile',
        id: 'profile-1'
      }
    }
  }
}

const languagesMock: MockedResponse = {
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
            { value: 'English', primary: true, __typename: 'LanguageName' }
          ]
        },
        {
          __typename: 'Language',
          id: '528',
          slug: 'spanish',
          name: [
            { value: 'Spanish', primary: false, __typename: 'LanguageName' },
            { value: 'Español', primary: true, __typename: 'LanguageName' }
          ]
        }
      ]
    }
  }
}

const sourceJourneyId = 'template-id'

function buildJourneyMock(): MockedResponse {
  return {
    request: {
      query: GET_JOURNEY,
      variables: {
        id: sourceJourneyId,
        idType: IdType.databaseId,
        options: { skipRoutingFilter: true }
      }
    },
    result: {
      data: {
        journey: {
          __typename: 'Journey',
          id: sourceJourneyId,
          title: 'Sample Template',
          template: true,
          fromTemplateId: null,
          language: {
            __typename: 'Language',
            id: '529',
            name: [
              { value: 'English', primary: true, __typename: 'LanguageName' }
            ]
          }
        }
      }
    }
  }
}

function buildJourneyDuplicateMock(
  variables: {
    id: string
    teamId: string
    forceNonTemplate: boolean
  },
  options: { shouldError?: boolean; delay?: number } = {}
): MockedResponse<JourneyDuplicate> {
  if (options.shouldError === true) {
    return {
      request: { query: JOURNEY_DUPLICATE, variables },
      error: new Error('boom'),
      delay: options.delay
    }
  }
  return {
    request: { query: JOURNEY_DUPLICATE, variables },
    delay: options.delay,
    result: {
      data: {
        journeyDuplicate: {
          __typename: 'Journey',
          id: 'duplicated-journey-id',
          template: false
        }
      }
    }
  }
}

function buildTranslateSubscriptionMock(options: {
  shouldError?: boolean
}): MockedResponse {
  if (options.shouldError === true) {
    return {
      request: {
        query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
        variables: {
          journeyId: 'duplicated-journey-id',
          name: 'Sample Template',
          journeyLanguageName: '',
          textLanguageId: '528',
          textLanguageName: 'Español',
          userLanguageId: '529',
          userLanguageName: ''
        }
      },
      error: new Error('Translation failed')
    }
  }
  return {
    request: {
      query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
      variables: {
        journeyId: 'duplicated-journey-id',
        name: 'Sample Template',
        journeyLanguageName: '',
        textLanguageId: '528',
        textLanguageName: 'Español',
        userLanguageId: '529',
        userLanguageName: ''
      }
    },
    result: {
      data: {
        journeyAiTranslateCreateSubscription: {
          __typename: 'JourneyAiTranslateProgress',
          progress: 100,
          message: 'Translation completed',
          journey: {
            __typename: 'Journey',
            id: 'duplicated-journey-id',
            title: 'Plantilla traducida',
            description: null,
            languageId: '528',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            journeyCustomizationDescription: null,
            journeyCustomizationFields: [],
            blocks: [],
            language: {
              __typename: 'Language',
              id: '528',
              name: [
                { __typename: 'LanguageName', value: 'Español', primary: true }
              ]
            }
          }
        }
      }
    }
  }
}

interface SetupOptions {
  useTemplate?: string | string[] | null
  duplicateError?: boolean
  duplicateDelay?: number
  includeJourneyMock?: boolean
  translationError?: boolean
  push?: jest.Mock
  replace?: jest.Mock
  extraMocks?: MockedResponse[]
}

function buildDefaultMocks(options: SetupOptions = {}): MockedResponse[] {
  const mocks: MockedResponse[] = [
    teamsMock,
    updateLastActiveTeamIdMock,
    languagesMock,
    buildJourneyDuplicateMock(
      { id: sourceJourneyId, teamId: 'team-1', forceNonTemplate: true },
      { shouldError: options.duplicateError, delay: options.duplicateDelay }
    )
  ]
  if (options.includeJourneyMock !== false) {
    mocks.push(buildJourneyMock())
  }
  if (options.translationError != null) {
    mocks.push(
      buildTranslateSubscriptionMock({ shouldError: options.translationError })
    )
  }
  if (options.extraMocks != null) mocks.push(...options.extraMocks)
  return mocks
}

function setRouter(
  options: SetupOptions = {}
): { push: jest.Mock; replace: jest.Mock } {
  const useTemplate =
    'useTemplate' in options ? options.useTemplate : sourceJourneyId
  const push = options.push ?? jest.fn().mockResolvedValue(true)
  const replace = options.replace ?? jest.fn().mockResolvedValue(true)
  const query = useTemplate == null ? {} : { useTemplate }
  mockUseRouter.mockReturnValue({
    pathname: '/',
    query,
    push,
    replace
  } as unknown as NextRouter)
  return { push, replace }
}

function setup(options: SetupOptions = {}): {
  push: jest.Mock
  replace: jest.Mock
} {
  const router = setRouter(options)
  const mocks = buildDefaultMocks(options)
  render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <TeamProvider>
          <UseTemplateDeepLink />
        </TeamProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
  return router
}

async function selectTranslationSpanish(): Promise<void> {
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
}

describe('UseTemplateDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    if (typeof window !== 'undefined') window.sessionStorage.clear()
  })

  it('renders nothing when useTemplate param is absent', () => {
    setup({ useTemplate: null })
    expect(screen.queryByTestId('CopyToTeamDialog')).not.toBeInTheDocument()
  })

  it('renders nothing when useTemplate param is an empty string', () => {
    setup({ useTemplate: '' })
    expect(screen.queryByTestId('CopyToTeamDialog')).not.toBeInTheDocument()
  })

  it('uses the first value when useTemplate param is an array', async () => {
    setup({ useTemplate: [sourceJourneyId, 'second-template-id'] })
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )
  })

  it('opens the dialog when useTemplate is present', async () => {
    setup()
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )
  })

  it('duplicates the journey and replaces the URL with /?type=journeys&refresh=true', async () => {
    const { push, replace } = setup()
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    const submitButton = await screen.findByRole('button', { name: 'Add' })
    fireEvent.click(submitButton)

    await waitFor(() =>
      expect(screen.getByText('Journey Copied')).toBeInTheDocument()
    )

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/', query: { type: 'journeys', refresh: 'true' } },
      undefined,
      { shallow: true }
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('shows an error snackbar and keeps the dialog open on duplication failure', async () => {
    const { push, replace } = setup({ duplicateError: true })
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    const submitButton = await screen.findByRole('button', { name: 'Add' })
    fireEvent.click(submitButton)

    await waitFor(() =>
      expect(screen.getByText('Journey duplication failed')).toBeInTheDocument()
    )
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
  })

  it('strips the useTemplate param on close without submitting', async () => {
    const { push, replace } = setup()
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1))
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/', query: {} },
      undefined,
      { shallow: true }
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('runs the translation subscription on submit and replaces URL on completion', async () => {
    const { push, replace } = setup({ translationError: false })
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    await selectTranslationSpanish()
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(screen.getByText('Journey Translated')).toBeInTheDocument()
    )

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/', query: { type: 'journeys', refresh: 'true' } },
      undefined,
      { shallow: true }
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('still navigates to the journey list when translation errors after a successful duplicate', async () => {
    const { push, replace } = setup({ translationError: true })
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    await selectTranslationSpanish()
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(screen.getByText('Translation failed')).toBeInTheDocument()
    )

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/', query: { type: 'journeys', refresh: 'true' } },
      undefined,
      { shallow: true }
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('surfaces a snackbar instead of silently no-oping when translation is requested before the journey resolves', async () => {
    // Omit the GET_JOURNEY mock so `journey` stays undefined throughout.
    const { push, replace } = setup({ includeJourneyMock: false })
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    await selectTranslationSpanish()
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(
        screen.getByText('Loading template — please retry')
      ).toBeInTheDocument()
    )
    expect(replace).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
  })

  it('blocks a concurrent submit on the same template+team via the session-storage lock', async () => {
    // First mount: never-resolving duplicate keeps the lock acquired.
    const firstRouter = setRouter({})
    const firstMocks: MockedResponse[] = [
      ...buildDefaultMocks({ duplicateDelay: 60_000 })
    ]
    const first = render(
      <MockedProvider mocks={firstMocks}>
        <SnackbarProvider>
          <TeamProvider>
            <UseTemplateDeepLink />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        within(first.baseElement).getByTestId('CopyToTeamDialog')
      ).toBeInTheDocument()
    )
    fireEvent.click(
      within(first.baseElement).getByRole('button', {
        name: 'Add'
      })
    )

    // Second mount: simulates another tab trying the same deep link while
    // the first mutation is still in flight. Lock should reject the click
    // before the duplicate mutation fires.
    const secondRouter = setRouter({})
    const secondDuplicate = jest.fn(() => ({
      data: {
        journeyDuplicate: {
          __typename: 'Journey' as const,
          id: 'should-never-fire',
          template: false
        }
      }
    }))
    const secondMocks: MockedResponse[] = [
      teamsMock,
      updateLastActiveTeamIdMock,
      languagesMock,
      buildJourneyMock(),
      {
        request: {
          query: JOURNEY_DUPLICATE,
          variables: {
            id: sourceJourneyId,
            teamId: 'team-1',
            forceNonTemplate: true
          }
        },
        result: secondDuplicate
      }
    ]
    const second = render(
      <MockedProvider mocks={secondMocks}>
        <SnackbarProvider>
          <TeamProvider>
            <UseTemplateDeepLink />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        within(second.baseElement).getAllByTestId(
          'CopyToTeamDialog'
        ).length
      ).toBeGreaterThanOrEqual(1)
    )
    // Click the most recently mounted dialog's Add button.
    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    fireEvent.click(addButtons[addButtons.length - 1])

    await waitFor(() =>
      expect(
        screen.getByText('Already creating a copy — please wait')
      ).toBeInTheDocument()
    )

    expect(secondDuplicate).not.toHaveBeenCalled()
    expect(firstRouter.replace).not.toHaveBeenCalled()
    expect(secondRouter.replace).not.toHaveBeenCalled()
  })
})
