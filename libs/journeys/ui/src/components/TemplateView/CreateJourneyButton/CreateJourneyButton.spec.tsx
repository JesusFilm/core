import { gql } from '@apollo/client'
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
import { SUPPORTED_LANGUAGE_IDS } from '../../../libs/useJourneyAiTranslateSubscription/supportedLanguages'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import { GET_LANGUAGES } from '../../../libs/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../../libs/useUpdateLastActiveTeamIdMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

import { CreateJourneyButton } from './CreateJourneyButton'

// Query for testing template stats refetch - matches the one in CreateJourneyButton
const GET_TEMPLATE_FAMILY_STATS_AGGREGATE = gql`
  query GetTemplateFamilyStatsAggregate(
    $id: ID!
    $idType: IdType
    $where: PlausibleStatsAggregateFilter!
  ) {
    templateFamilyStatsAggregate(id: $id, idType: $idType, where: $where) {
      childJourneysCount
      totalJourneysViews
      totalJourneysResponses
    }
  }
`

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
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null,
  socialNodeX: null,
  socialNodeY: null
}

const teamData = {
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
}

const teamResult = jest.fn(() => teamData)

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
      teamId: 'teamId',
      forceNonTemplate: true
    }
  },
  result: jest.fn(() => ({
    data: {
      journeyDuplicate: {
        id: 'duplicatedJourneyId',
        template: false,
        __typename: 'Journey'
      }
    }
  }))
}

// Mock for template stats refetch - called once during refetchQueries
const templateStatsResult = jest.fn(() => ({
  data: {
    templateFamilyStatsAggregate: {
      __typename: 'TemplateFamilyStatsAggregateResponse',
      childJourneysCount: 6,
      totalJourneysViews: 100,
      totalJourneysResponses: 50
    }
  }
}))

const templateStatsMock = {
  request: {
    query: GET_TEMPLATE_FAMILY_STATS_AGGREGATE,
    variables: {
      id: 'journeyId',
      idType: 'databaseId',
      where: {}
    }
  },
  result: templateStatsResult
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

describe('CreateJourneyButton', () => {
  const prefetch = jest.fn()
  const push = jest.fn().mockResolvedValue('')
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    teamResult.mockClear()
    // Reset journeyDuplicateMock to return data
    journeyDuplicateMock.result.mockReturnValue({
      data: {
        journeyDuplicate: {
          id: 'duplicatedJourneyId',
          template: false,
          __typename: 'Journey'
        }
      }
    })
    // Reset templateStatsResult to return data
    templateStatsResult.mockReturnValue({
      data: {
        templateFamilyStatsAggregate: {
          __typename: 'TemplateFamilyStatsAggregateResponse',
          childJourneysCount: 6,
          totalJourneysViews: 100,
          totalJourneysResponses: 50
        }
      }
    })
  })

  it('should render create journey button when variant is button', () => {
    mockUseRouter.mockReturnValue({
      prefetch,
      query: { createNew: false }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          }
        ]}
      >
        <SnackbarProvider>
          <CreateJourneyButton variant="button" />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('CreateJourneyMenuItem')
    ).not.toBeInTheDocument()
  })

  it('should render create journey menu item when variant is menu-item', () => {
    mockUseRouter.mockReturnValue({
      prefetch,
      query: { createNew: false }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          }
        ]}
      >
        <SnackbarProvider>
          <CreateJourneyButton variant="menu-item" />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CreateJourneyMenuItem')).toBeInTheDocument()
    expect(screen.queryByTestId('CreateJourneyButton')).not.toBeInTheDocument()
  })

  it('should not open team dialog if url query set to createNew and openTeamDialogOnSignIn is not set', async () => {
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
      expect(screen.queryByTestId('CopyToTeamDialog')).not.toBeInTheDocument()
    )
  })

  it('should open team dialog if url query set to createNew and openTeamDialogOnSignIn is true', async () => {
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
          <CreateJourneyButton signedIn openTeamDialogOnSignIn={true} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.queryByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )
  })

  it('should open team dialog on button click if signed in', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false }
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
          <JourneyProvider value={{ journey }}>
            <CreateJourneyButton signedIn />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )
  })

  it('should duplicate journey without translation and navigate to journeys list when not global publish', async () => {
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
      expect(push).toHaveBeenCalledWith('/?type=journeys&refresh=true')
    })
  })

  it('should duplicate journey without translation and navigate to journey editor when global publish', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false },
      push,
      replace: jest.fn(),
      pathname: '/publisher'
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
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should pre-render sign in page', async () => {
      render(createJourneyButton)

      await waitFor(() => {
        expect(prefetch).toHaveBeenCalledWith('/users/sign-in')
      })
    })

    it('should open account check dialog and redirect to sign in page when login is clicked', async () => {
      render(createJourneyButton)

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Login with my account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: expect.stringContaining('/users/sign-in'),
            query: {
              redirect: expect.stringContaining(
                '/templates/journeyId?createNew=true'
              ),
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should open account check dialog and redirect to sign in page when create account is clicked', async () => {
      render(createJourneyButton)

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Create a new account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: expect.stringContaining('/users/sign-in'),
            query: {
              redirect: expect.stringContaining(
                '/templates/journeyId?createNew=true'
              ),
              login: false
            }
          },
          undefined,
          { shallow: true }
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

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
      }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should open account check dialog and still redirect to sign in page when login is clicked', async () => {
      render(createJourneyButton)

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Login with my account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: expect.stringContaining('/users/sign-in'),
            query: {
              redirect: expect.stringContaining(
                '/templates/journeyId?createNew=true'
              ),
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should open account check dialog and still redirect to sign in page when create account is clicked', async () => {
      render(createJourneyButton)

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Create a new account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
              login: false
            }
          },
          undefined,
          { shallow: true }
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

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
      }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should open account check dialog and still redirect to sign in page when login is clicked', async () => {
      render(createJourneyButton)

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Login with my account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: expect.stringContaining('/users/sign-in'),
            query: {
              redirect: expect.stringContaining(
                '/templates/journeyId?createNew=true'
              ),
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should open account check dialog and still redirect to sign in page when create account is clicked', async () => {
      render(createJourneyButton)

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Create a new account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
              login: false
            }
          },
          undefined,
          { shallow: true }
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
            result: () => {
              teamResult()
              return teamData
            }
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

  it('should refetch template stats when duplicating from a template', async () => {
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
            result: () => {
              teamResult()
              return teamData
            }
          },
          getLanguagesMock,
          journeyDuplicateMock,
          updateLastActiveTeamIdMock,
          templateStatsMock,
          // Second mock for the refetch call
          {
            request: {
              query: GET_TEMPLATE_FAMILY_STATS_AGGREGATE,
              variables: {
                id: 'journeyId',
                idType: 'databaseId',
                where: {}
              }
            },
            result: jest.fn(() => ({
              data: {
                templateFamilyStatsAggregate: {
                  __typename: 'TemplateFamilyStatsAggregateResponse',
                  childJourneysCount: 6,
                  totalJourneysViews: 100,
                  totalJourneysResponses: 50
                }
              }
            }))
          }
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

    // Open the dropdown
    const muiSelectDropDownButton = screen.getByRole('combobox', {
      name: 'Select Team'
    })
    fireEvent.mouseDown(muiSelectDropDownButton)

    // Wait for the team option to appear in the menu
    // This ensures the teams data has been processed and rendered
    await waitFor(
      () => {
        const option = screen.getByRole('option', { name: 'Team Name' })
        expect(option).toBeInTheDocument()
        return option
      },
      { timeout: 3000 }
    )

    const muiSelectOptions = screen.getByRole('option', { name: 'Team Name' })
    fireEvent.click(muiSelectOptions)

    // Submit without translation
    const addButton = screen.getByRole('button', { name: 'Add' })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(journeyDuplicateMock.result).toHaveBeenCalled()
    })

    // Verify template stats query is refetched after duplication
    // The refetch happens asynchronously after the mutation completes
    await waitFor(
      () => {
        expect(templateStatsResult).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )
  })
})
