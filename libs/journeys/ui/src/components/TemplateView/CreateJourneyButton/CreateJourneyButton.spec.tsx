import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserTeamRole
} from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import type { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION } from '../../../libs/useJourneyAiTranslateSubscription'
import { SUPPORTED_LANGUAGE_IDS } from '../../../libs/useJourneyAiTranslateSubscription/supportedLanguages'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import { GET_LANGUAGES } from '../../../libs/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../../libs/useUpdateLastActiveTeamIdMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

import { CreateJourneyButton } from './CreateJourneyButton'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'Template',
  description: 'Description',
  template: true,
  slug: 'default',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      },
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: false
      }
    ]
  },
  status: JourneyStatus.published,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: '2021-11-19T12:34:56.647Z',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  socialNodeX: null,
  socialNodeY: null,
  journeyTheme: null
}

const teamResult = jest.fn(() => ({
  data: {
    teams: [
      {
        id: 'teamId',
        title: 'Team Name',
        __typename: 'Team',
        publicTitle: 'Team Name',
        userTeams: [
          {
            id: 'userTeamId',
            __typename: 'UserTeam',
            role: UserTeamRole.manager,
            user: {
              __typename: 'User',
              id: 'userId',
              firstName: 'Test',
              lastName: 'User',
              imageUrl: null,
              email: 'test@example.com'
            }
          }
        ],
        customDomains: []
      }
    ],
    getJourneyProfile: {
      id: 'profileId',
      __typename: 'JourneyProfile',
      lastActiveTeamId: 'teamId'
    }
  }
}))

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
          id: '496',
          bcp47: 'fr',
          iso3: 'fra',
          slug: 'french',
          name: [
            {
              value: 'Français',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'French',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}

const updateLastActiveTeamIdMock = {
  request: {
    query: UPDATE_LAST_ACTIVE_TEAM_ID,
    variables: {
      input: {
        lastActiveTeamId: 'teamId'
      }
    }
  },
  result: {
    data: {
      journeyProfileUpdate: {
        id: 'profileId',
        __typename: 'JourneyProfile'
      }
    }
  }
}

const journeyDuplicateMock = {
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

const journeyTranslationSubscriptionMock = {
  request: {
    query: JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION,
    variables: {
      journeyId: 'duplicatedJourneyId',
      name: 'Template',
      journeyLanguageName: 'English',
      textLanguageId: '496',
      textLanguageName: 'Français'
    }
  },
  result: {
    data: {
      journeyAiTranslateCreateSubscription: {
        progress: 100,
        message: 'Translation complete',
        journey: {
          id: 'duplicatedJourneyId',
          title: 'Template Traduit',
          description: 'Description traduite',
          languageId: '496',
          createdAt: '2023-04-25T12:34:56Z',
          updatedAt: '2023-04-25T12:34:56Z',
          blocks: [],
          __typename: 'Journey'
        },
        __typename: 'JourneyAiTranslateProgress'
      }
    }
  }
}

const createJourneyButton = (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
        },
        result: teamResult
      },
      getLanguagesMock
    ]}
  >
    <SnackbarProvider>
      <JourneyProvider value={{ journey }}>
        <CreateJourneyButton />
      </JourneyProvider>
    </SnackbarProvider>
  </MockedProvider>
)

function defineWindowWithPath(path: string): void {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: { origin: path },
    writable: true
  })
}

function mockWindowLocationAssign(origin: string) {
  const mockAssign = jest.fn()
  Object.defineProperty(window, 'location', {
    value: {
      assign: mockAssign,
      origin
    },
    writable: true
  })
  return mockAssign
}

describe('CreateJourneyButton', () => {
  const prefetch = jest.fn()
  const push = jest.fn().mockResolvedValue('')
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    teamResult.mockClear()
    journeyDuplicateMock.result.mockClear()
  })

  it('should open team dialog if url query set to createNew', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: 'true' }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          },
          getLanguagesMock
        ]}
      >
        <SnackbarProvider>
          <CreateJourneyButton signedIn />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )
  })

  it('should open team dialog on button click if signed in', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          },
          getLanguagesMock
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <CreateJourneyButton signedIn />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )
  })

  it('should duplicate journey without translation and navigate immediately', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false },
      push,
      replace: jest.fn(),
      pathname: '/templates/journeyId'
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          },
          getLanguagesMock,
          journeyDuplicateMock,
          updateLastActiveTeamIdMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider value={{ journey }}>
              <CreateJourneyButton signedIn />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    // Submit without translation
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(journeyDuplicateMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should show translation option when enabled', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false },
      push,
      replace: jest.fn(),
      pathname: '/templates/journeyId'
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          },
          getLanguagesMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider value={{ journey }}>
              <CreateJourneyButton signedIn />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    // Enable translation
    fireEvent.click(screen.getByRole('checkbox'))

    // Language selection should appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search Language')).toBeInTheDocument()
    })
  })

  describe('if not signed in', () => {
    beforeEach(() => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false }
      } as unknown as NextRouter)

      defineWindowWithPath('http://localhost:4200')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should open account check dialog and redirect to sign in page when login is clicked', async () => {
      const mockAssign = mockWindowLocationAssign('http://localhost:4200')

      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Login with my account' }))

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(
          'http://localhost:4200/users/sign-in?redirect=' +
            encodeURIComponent(
              'http://localhost:4200/templates/journeyId?createNew=true'
            ) +
            '&login=true'
        )
      })
    })

    it('should open account check dialog and redirect to sign in page when create account is clicked', async () => {
      const mockAssign = mockWindowLocationAssign('http://localhost:4200')

      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Create a new account' }))

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(
          'http://localhost:4200/users/sign-in?redirect=' +
            encodeURIComponent(
              'http://localhost:4200/templates/journeyId?createNew=true'
            ) +
            '&login=false'
        )
      })
    })
  })

  describe('if not signed in and viewing from journeys admin', () => {
    beforeAll(() => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false }
      } as unknown as NextRouter)

      defineWindowWithPath('http://localhost:4200')

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
      }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should open account check dialog and still redirect to sign in page when login is clicked', async () => {
      const mockAssign = mockWindowLocationAssign('http://localhost:4200')

      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Login with my account' }))

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(
          'http://localhost:4200/users/sign-in?redirect=' +
            encodeURIComponent(
              'http://localhost:4200/templates/journeyId?createNew=true'
            ) +
            '&login=true'
        )
      })
    })

    it('should open account check dialog and still redirect to sign in page when create account is clicked', async () => {
      const mockAssign = mockWindowLocationAssign('http://localhost:4200')

      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Create a new account' }))

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(
          'http://localhost:4200/users/sign-in?redirect=' +
            encodeURIComponent(
              'http://localhost:4200/templates/journeyId?createNew=true'
            ) +
            '&login=false'
        )
      })
    })
  })

  describe('if not signed in and viewing from another project', () => {
    beforeEach(() => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false }
      } as unknown as NextRouter)

      defineWindowWithPath('http://localhost:4300')

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
      }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should open account check dialog and still redirect to sign in page when login is clicked', async () => {
      const mockAssign = mockWindowLocationAssign('http://localhost:4300')

      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Login with my account' }))

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(
          'http://localhost:4200/users/sign-in?redirect=' +
            encodeURIComponent(
              'http://localhost:4200/templates/journeyId?createNew=true'
            ) +
            '&login=true'
        )
      })
    })

    it('should open account check dialog and still redirect to sign in page when create account is clicked', async () => {
      const mockAssign = mockWindowLocationAssign('http://localhost:4300')

      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Create a new account' }))

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(
          'http://localhost:4200/users/sign-in?redirect=' +
            encodeURIComponent(
              'http://localhost:4200/templates/journeyId?createNew=true'
            ) +
            '&login=false'
        )
      })
    })
  })

  it('should disable button while loading', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          },
          getLanguagesMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider value={{}}>
              <CreateJourneyButton signedIn />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByRole('button', { name: 'Use This Template' })).toBeDisabled()
    )
  })
})
