import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  GetChildJourneysFromTemplateId,
  GetChildJourneysFromTemplateIdVariables
} from '../../../../../../__generated__/GetChildJourneysFromTemplateId'
import { GetCurrentUser } from '../../../../../../__generated__/GetCurrentUser'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateIdVariables
} from '../../../../../../__generated__/GetParentJourneysFromTemplateId'
import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from '../../../../../../__generated__/JourneyDuplicate'
import {
  TeamCreate,
  TeamCreateVariables
} from '../../../../../../__generated__/TeamCreate'
import { GET_CURRENT_USER } from '../../../../../libs/useCurrentUserLazyQuery'
import { GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import {
  mockChildJourneys,
  mockChildVariables
} from '../../../../../libs/useGetChildTemplateJourneyLanguages/useGetChildTemplateJourneyLanguages.mock'
import { GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import {
  mockParentJourneys,
  mockParentVariables
} from '../../../../../libs/useGetParentTemplateJourneyLanguages/useGetParentTemplateJourneyLanguages.mock'
import { TEAM_CREATE } from '../../../../../libs/useTeamCreateMutation/useTeamCreateMutation'

import { LanguageScreen } from './LanguageScreen'

const defaultMockUser = {
  id: 'user-id',
  uid: 'user-id',
  email: 'urim@thumim.example.io',
  displayName: null,
  photoURL: null,
  phoneNumber: null,
  emailVerified: false,
  token: 'mock-token',
  isAnonymous: false,
  providerId: ''
}

let mockUser: {
  id: string | null
  uid: string | null
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber: string | null
  emailVerified: boolean
  token: string
  isAnonymous?: boolean
  providerId: string
} = defaultMockUser

jest.mock('../../../../../libs/auth', () => ({
  __esModule: true,
  useAuth: () => ({ user: mockUser })
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockGetLastActiveTeamIdAndTeams: MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
    result: {
      data: {
        getJourneyProfile: {
          id: 'profile-id',
          lastActiveTeamId: 'teamId1',
          __typename: 'JourneyProfile'
        },
        teams: [
          {
            __typename: 'Team',
            id: 'teamId1',
            title: 'Team One',
            publicTitle: 'Team 1',
            userTeams: [],
            customDomains: []
          }
        ]
      }
    }
  }

const mockGetLastActiveTeamIdAndTeamsEmptyTeams: MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
    result: {
      data: {
        getJourneyProfile: {
          id: 'profile-id',
          lastActiveTeamId: null,
          __typename: 'JourneyProfile'
        },
        teams: []
      }
    }
  }

const mockGetChildJourneysFromTemplateId: MockedResponse<
  GetChildJourneysFromTemplateId,
  GetChildJourneysFromTemplateIdVariables
> = {
  ...mockChildJourneys,
  request: {
    query: GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID,
    variables: mockChildVariables
  }
}

const mockGetParentJourneysFromTemplateId: MockedResponse<
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateIdVariables
> = {
  ...mockParentJourneys,
  request: {
    query: GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID,
    variables: mockParentVariables
  }
}

const mockJourneyDuplicate: MockedResponse<
  JourneyDuplicate,
  JourneyDuplicateVariables
> = {
  request: {
    query: JOURNEY_DUPLICATE,
    variables: {
      id: 'journeyId',
      teamId: 'teamId1',
      forceNonTemplate: true,
      duplicateAsDraft: false
    }
  },
  result: {
    data: {
      journeyDuplicate: {
        id: 'new-journey-id',
        __typename: 'Journey',
        template: false
      }
    }
  }
}

const guestTeamIdFromCreate = 'guest-team-id'
const mockTeamCreate: MockedResponse<TeamCreate, TeamCreateVariables> = {
  request: {
    query: TEAM_CREATE,
    variables: {
      input: { title: 'My Team', publicTitle: 'My Team' }
    }
  },
  result: {
    data: {
      teamCreate: {
        __typename: 'Team',
        id: guestTeamIdFromCreate,
        title: 'My Team',
        publicTitle: 'My Team',
        userTeams: [],
        customDomains: []
      }
    }
  }
}

const mockUpdateLastActiveTeamId = {
  request: {
    query: UPDATE_LAST_ACTIVE_TEAM_ID,
    variables: { input: { lastActiveTeamId: 'teamId1' } }
  },
  result: {
    data: { journeyProfileUpdate: { id: 'profile-id' } }
  }
}

describe('LanguageScreen', () => {
  let handleNext: jest.Mock
  let push: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()
    mockUser = defaultMockUser
    handleNext = jest.fn(async (overrideJourneyId?: string) => {
      const id = overrideJourneyId ?? 'journeyId'
      push(`/templates/${id}/customize`, undefined, { shallow: true })
    })

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  const nonTemplateJourney = {
    ...journey,
    id: 'journeyId',
    template: false,
    language: {
      ...journey.language,
      id: '529'
    },
    team: {
      __typename: 'Team' as const,
      id: 'teamId1',
      title: 'Team One',
      publicTitle: 'Team 1'
    }
  }

  it('skips duplicate and navigates to next screen when journey is not a template and language and team match', async () => {
    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider
              value={{ journey: nonTemplateJourney, variant: 'customize' }}
            >
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() => expect(handleNext).toHaveBeenCalledTimes(1))
    expect(handleNext).toHaveBeenCalledWith()
  })

  it('should show loading state on the Next button after clicking', async () => {
    const mockGetLastActiveTeamIdAndTeamsResult = jest.fn(() => ({
      ...mockGetLastActiveTeamIdAndTeams.result
    }))

    render(
      <MockedProvider
        mocks={[
          {
            ...mockGetLastActiveTeamIdAndTeams,
            result: mockGetLastActiveTeamIdAndTeamsResult
          },
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          mockJourneyDuplicate,
          mockUpdateLastActiveTeamId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetLastActiveTeamIdAndTeamsResult).toHaveBeenCalled()
    )

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    expect(nextButton).not.toBeDisabled()

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(nextButton).toBeDisabled()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  it('duplicates journey to selected team and navigates to customize', async () => {
    const mockJourneyDuplicateMockResult = jest
      .fn()
      .mockReturnValue({ ...mockJourneyDuplicate.result })

    const mockGetLastActiveTeamIdAndTeamsResult = jest.fn(() => ({
      ...mockGetLastActiveTeamIdAndTeams.result
    }))

    render(
      <MockedProvider
        mocks={[
          {
            ...mockGetLastActiveTeamIdAndTeams,
            result: mockGetLastActiveTeamIdAndTeamsResult
          },
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult },
          mockUpdateLastActiveTeamId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetLastActiveTeamIdAndTeamsResult).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() =>
      expect(mockJourneyDuplicateMockResult).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
    expect(handleNext).toHaveBeenCalled()
  })

  it('duplicates journey to selected team with language selected and navigates to customize', async () => {
    const journeyWithFromTemplateId = {
      ...journey,
      fromTemplateId: 'template-123'
    }

    const mockJourneyDuplicateMockResult = jest
      .fn()
      .mockReturnValue({ ...mockJourneyDuplicate.result })

    // Create specific mocks for this test case
    const mockChildJourneysForTest = {
      ...mockGetChildJourneysFromTemplateId,
      request: {
        query: GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID,
        variables: {
          where: {
            template: true,
            fromTemplateId: 'template-123' // This journey has fromTemplateId
          }
        }
      }
    }

    const mockParentJourneysForTest = {
      ...mockGetParentJourneysFromTemplateId,
      request: {
        query: GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID,
        variables: {
          where: {
            template: true,
            ids: ['template-123']
          }
        }
      }
    }

    const mockGetChildJourneysFromTemplateIdMockResult = jest
      .fn()
      .mockReturnValue({ ...mockChildJourneysForTest.result })
    const mockGetParentJourneysFromTemplateIdMockResult = jest
      .fn()
      .mockReturnValue({ ...mockParentJourneysForTest.result })

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          {
            request: {
              ...mockJourneyDuplicate.request,
              variables: {
                id: 'journey-2', // This should match the Spanish language journey ID
                teamId: 'teamId1',
                forceNonTemplate: true,
                duplicateAsDraft: false
              }
            },
            result: mockJourneyDuplicateMockResult
          },
          {
            ...mockChildJourneysForTest,
            result: mockGetChildJourneysFromTemplateIdMockResult
          },
          {
            ...mockParentJourneysForTest,
            result: mockGetParentJourneysFromTemplateIdMockResult
          },
          mockUpdateLastActiveTeamId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider
              value={{ journey: journeyWithFromTemplateId, variant: 'admin' }}
            >
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetChildJourneysFromTemplateIdMockResult).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(mockGetParentJourneysFromTemplateIdMockResult).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )

    fireEvent.focus(screen.getByTestId('LanguageAutocompleteInput'))
    fireEvent.keyDown(screen.getByTestId('LanguageAutocompleteInput'), {
      key: 'ArrowDown'
    })
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'Spanish' }))
    )

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() =>
      expect(mockJourneyDuplicateMockResult).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
    expect(handleNext).toHaveBeenCalled()
  })

  it('for anonymous user: creates guest team, duplicates journey and redirects to customize', async () => {
    mockUser = { ...defaultMockUser, id: null, email: null, isAnonymous: true }

    const mockGetCurrentUser: MockedResponse<GetCurrentUser> = {
      request: { query: GET_CURRENT_USER },
      result: {
        data: {
          me: {
            __typename: 'AuthenticatedUser',
            id: 'anon-user-id',
            email: ''
          }
        }
      }
    }
    const mockJourneyDuplicateForGuest: MockedResponse<
      JourneyDuplicate,
      JourneyDuplicateVariables
    > = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: guestTeamIdFromCreate,
          forceNonTemplate: true,
          duplicateAsDraft: true
        }
      },
      result: {
        data: {
          journeyDuplicate: {
            id: 'new-journey-id',
            __typename: 'Journey',
            template: false
          }
        }
      }
    }

    const mockTeamCreateResult = jest.fn(() => ({
      ...mockTeamCreate.result
    }))
    const mockJourneyDuplicateForGuestResult = jest.fn(() => ({
      ...mockJourneyDuplicateForGuest.result
    }))

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeamsEmptyTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          mockGetCurrentUser,
          { ...mockTeamCreate, result: mockTeamCreateResult },
          {
            ...mockJourneyDuplicateForGuest,
            result: mockJourneyDuplicateForGuestResult
          },
          {
            request: {
              query: UPDATE_LAST_ACTIVE_TEAM_ID,
              variables: {
                input: { lastActiveTeamId: guestTeamIdFromCreate }
              }
            },
            result: {
              data: { journeyProfileUpdate: { id: 'profile-id' } }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CustomizeFlowNextButton')).not.toBeDisabled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() => expect(mockTeamCreateResult).toHaveBeenCalled())
    await waitFor(() =>
      expect(mockJourneyDuplicateForGuestResult).toHaveBeenCalled()
    )

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
    expect(handleNext).toHaveBeenCalled()
  })

  it('hides team select for guests', async () => {
    mockUser = { ...defaultMockUser, id: null, email: null, isAnonymous: true }

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByTestId('LanguageAutocompleteInput')
      ).toBeInTheDocument()
    )

    expect(screen.queryByText('Select a team')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: 'Team' })
    ).not.toBeInTheDocument()
  })

  it('for anonymous user with existing team: reuses existing team and does not create a new one', async () => {
    mockUser = { ...defaultMockUser, id: null, email: null, isAnonymous: true }

    const existingGuestTeamId = 'teamId1'
    const mockGetCurrentUser: MockedResponse<GetCurrentUser> = {
      request: { query: GET_CURRENT_USER },
      result: {
        data: {
          me: {
            __typename: 'AuthenticatedUser',
            id: 'anon-user-id',
            email: ''
          }
        }
      }
    }
    const mockJourneyDuplicateForExistingGuest: MockedResponse<
      JourneyDuplicate,
      JourneyDuplicateVariables
    > = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: existingGuestTeamId,
          forceNonTemplate: true,
          duplicateAsDraft: true
        }
      },
      result: {
        data: {
          journeyDuplicate: {
            id: 'new-journey-id',
            __typename: 'Journey',
            template: false
          }
        }
      }
    }

    const mockJourneyDuplicateForExistingGuestResult = jest.fn(() => ({
      ...mockJourneyDuplicateForExistingGuest.result
    }))
    const mockGetLastActiveTeamIdAndTeamsResult = jest.fn(() => ({
      ...mockGetLastActiveTeamIdAndTeams.result
    }))

    render(
      <MockedProvider
        mocks={[
          {
            ...mockGetLastActiveTeamIdAndTeams,
            result: mockGetLastActiveTeamIdAndTeamsResult
          },
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          mockGetCurrentUser,
          {
            ...mockJourneyDuplicateForExistingGuest,
            result: mockJourneyDuplicateForExistingGuestResult
          },
          mockUpdateLastActiveTeamId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetLastActiveTeamIdAndTeamsResult).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() =>
      expect(mockJourneyDuplicateForExistingGuestResult).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
    expect(handleNext).toHaveBeenCalled()
  })

  it('for anonymous user with stale lastActiveTeamId: falls back to first existing team', async () => {
    mockUser = { ...defaultMockUser, id: null, email: null, isAnonymous: true }

    const mockStaleGuestTeamData: MockedResponse<GetLastActiveTeamIdAndTeams> =
      {
        request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
        result: {
          data: {
            getJourneyProfile: {
              id: 'profile-id',
              lastActiveTeamId: 'deleted-team-id',
              __typename: 'JourneyProfile'
            },
            teams: [
              {
                __typename: 'Team',
                id: 'teamId1',
                title: 'Team One',
                publicTitle: 'Team 1',
                userTeams: [],
                customDomains: []
              }
            ]
          }
        }
      }

    const mockGetCurrentUser: MockedResponse<GetCurrentUser> = {
      request: { query: GET_CURRENT_USER },
      result: {
        data: {
          me: {
            __typename: 'AuthenticatedUser',
            id: 'anon-user-id',
            email: ''
          }
        }
      }
    }

    const mockDuplicateForGuestStaleTeam: MockedResponse<
      JourneyDuplicate,
      JourneyDuplicateVariables
    > = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: 'teamId1',
          forceNonTemplate: true,
          duplicateAsDraft: true
        }
      },
      result: {
        data: {
          journeyDuplicate: {
            id: 'new-journey-id',
            __typename: 'Journey',
            template: false
          }
        }
      }
    }

    const mockDuplicateResult = jest.fn(() => ({
      ...mockDuplicateForGuestStaleTeam.result
    }))

    render(
      <MockedProvider
        mocks={[
          mockStaleGuestTeamData,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          mockGetCurrentUser,
          { ...mockDuplicateForGuestStaleTeam, result: mockDuplicateResult },
          mockUpdateLastActiveTeamId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CustomizeFlowNextButton')).not.toBeDisabled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() => expect(mockDuplicateResult).toHaveBeenCalled())
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
  })

  it('should use the current journey when multiple child journeys share the same language id', async () => {
    const journeyWithFromTemplateIdAndLanguage = {
      ...journey,
      id: 'current-child-id',
      fromTemplateId: 'template-duplicate',
      language: {
        ...journey.language,
        id: 'language-duplicate',
        name: [
          {
            __typename: 'LanguageName' as const,
            primary: true,
            value: 'Spanish'
          }
        ]
      }
    }

    const mockChildJourneysWithDuplicateLanguage: MockedResponse<
      GetChildJourneysFromTemplateId,
      GetChildJourneysFromTemplateIdVariables
    > = {
      request: {
        query: GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID,
        variables: {
          where: {
            template: true,
            fromTemplateId: 'template-duplicate'
          }
        }
      },
      result: {
        data: {
          journeys: [
            {
              __typename: 'Journey' as const,
              id: 'sibling-child-id',
              fromTemplateId: 'template-duplicate',
              language: {
                __typename: 'Language' as const,
                id: 'language-duplicate',
                slug: 'es',
                name: [
                  {
                    __typename: 'LanguageName' as const,
                    primary: true,
                    value: 'Spanish'
                  }
                ]
              }
            },
            {
              __typename: 'Journey' as const,
              id: 'other-child-id',
              fromTemplateId: 'template-duplicate',
              language: {
                __typename: 'Language' as const,
                id: 'language-other',
                slug: 'fr',
                name: [
                  {
                    __typename: 'LanguageName' as const,
                    primary: true,
                    value: 'French'
                  }
                ]
              }
            },
            {
              __typename: 'Journey' as const,
              id: 'current-child-id',
              fromTemplateId: 'template-duplicate',
              language: {
                __typename: 'Language' as const,
                id: 'language-duplicate',
                slug: 'es',
                name: [
                  {
                    __typename: 'LanguageName' as const,
                    primary: true,
                    value: 'Spanish'
                  }
                ]
              }
            }
          ]
        }
      }
    }

    const mockParentJourneysForDuplicateLanguage: MockedResponse<
      GetParentJourneysFromTemplateId,
      GetParentJourneysFromTemplateIdVariables
    > = {
      request: {
        query: GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID,
        variables: {
          where: {
            template: true,
            ids: ['template-duplicate']
          }
        }
      },
      result: {
        data: {
          journeys: [
            {
              __typename: 'Journey' as const,
              id: 'template-duplicate',
              fromTemplateId: null,
              language: {
                __typename: 'Language' as const,
                id: 'language-duplicate',
                slug: 'es',
                name: [
                  {
                    __typename: 'LanguageName' as const,
                    primary: true,
                    value: 'Spanish'
                  }
                ]
              }
            }
          ]
        }
      }
    }

    const mockJourneyDuplicateForDuplicateLanguage: MockedResponse<
      JourneyDuplicate,
      JourneyDuplicateVariables
    > = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'current-child-id',
          teamId: 'teamId1',
          forceNonTemplate: true,
          duplicateAsDraft: false
        }
      },
      result: mockJourneyDuplicate.result
    }

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockChildJourneysWithDuplicateLanguage,
          mockParentJourneysForDuplicateLanguage,
          mockJourneyDuplicateForDuplicateLanguage,
          mockUpdateLastActiveTeamId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider
              value={{
                journey: journeyWithFromTemplateIdAndLanguage,
                variant: 'admin'
              }}
            >
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )

    fireEvent.focus(screen.getByTestId('LanguageAutocompleteInput'))
    fireEvent.keyDown(screen.getByTestId('LanguageAutocompleteInput'), {
      key: 'ArrowDown'
    })
    await waitFor(() => {
      const spanishOptions = screen.getAllByRole('option', { name: 'Spanish' })
      expect(spanishOptions).toHaveLength(1)
    })
    fireEvent.click(screen.getByRole('option', { name: 'Spanish' }))

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
    expect(handleNext).toHaveBeenCalled()
  })

  it('shows error snackbar when duplicate fails', async () => {
    const mockJourneyDuplicateMockResult = jest.fn().mockReturnValue({
      ...mockJourneyDuplicate.result,
      data: { journeyDuplicate: null }
    })

    const mockGetLastActiveTeamIdAndTeamsResult = jest.fn(() => ({
      ...mockGetLastActiveTeamIdAndTeams.result
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            ...mockGetLastActiveTeamIdAndTeams,
            result: mockGetLastActiveTeamIdAndTeamsResult
          },
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockGetLastActiveTeamIdAndTeamsResult).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() =>
      expect(mockJourneyDuplicateMockResult).toHaveBeenCalled()
    )

    await waitFor(() =>
      expect(
        getByText(
          'Failed to duplicate journey to team, please refresh the page and try again'
        )
      ).toBeInTheDocument()
    )
  })

  it('renders the journey preview', async () => {
    const journeyWithImage = {
      ...journey,
      primaryImageBlock: {
        id: 'image1.id',
        __typename: 'ImageBlock' as const,
        parentBlockId: null,
        parentOrder: 0,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'journey social image',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
        scale: null,
        focalLeft: 50,
        focalTop: 50,
        customizable: null
      }
    }

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: journeyWithImage, variant: 'admin' }}
          >
            <TeamProvider>
              <LanguageScreen handleNext={handleNext} />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardsSwiperSlide')).toBeInTheDocument()
    )
  })

  it('enables Next button for signed-in users when guest flow flag is off', async () => {
    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: false }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CustomizeFlowNextButton')).not.toBeDisabled()
    )
  })

  it('disables Next button when user is not signed in and guest flow flag is off', () => {
    mockUser = {
      id: null,
      uid: null,
      email: null,
      displayName: null,
      photoURL: null,
      phoneNumber: null,
      emailVerified: false,
      token: '',
      isAnonymous: false,
      providerId: ''
    }

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeamsEmptyTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: false }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CustomizeFlowNextButton')).toBeDisabled()
  })

  it('falls back to first team when lastActiveTeamId references a nonexistent team', async () => {
    const mockStaleTeamData: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
      result: {
        data: {
          getJourneyProfile: {
            id: 'profile-id',
            lastActiveTeamId: 'deleted-team-id',
            __typename: 'JourneyProfile'
          },
          teams: [
            {
              __typename: 'Team',
              id: 'teamId1',
              title: 'Team One',
              publicTitle: 'Team 1',
              userTeams: [],
              customDomains: []
            }
          ]
        }
      }
    }

    render(
      <MockedProvider
        mocks={[
          mockStaleTeamData,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )
  })

  it('calls updateLastActiveTeamId after successful duplication', async () => {
    const mockJourneyDuplicateMockResult = jest
      .fn()
      .mockReturnValue({ ...mockJourneyDuplicate.result })

    const mockUpdateLastActiveTeamIdResult = jest.fn().mockReturnValue({
      data: { journeyProfileUpdate: { id: 'profile-id' } }
    })

    const mockGetLastActiveTeamIdAndTeamsResult = jest.fn(() => ({
      ...mockGetLastActiveTeamIdAndTeams.result
    }))

    render(
      <MockedProvider
        mocks={[
          {
            ...mockGetLastActiveTeamIdAndTeams,
            result: mockGetLastActiveTeamIdAndTeamsResult
          },
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult },
          {
            request: {
              query: UPDATE_LAST_ACTIVE_TEAM_ID,
              variables: { input: { lastActiveTeamId: 'teamId1' } }
            },
            result: mockUpdateLastActiveTeamIdResult
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetLastActiveTeamIdAndTeamsResult).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() =>
      expect(mockJourneyDuplicateMockResult).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(mockUpdateLastActiveTeamIdResult).toHaveBeenCalled()
    )
  })

  it('shows error snackbar and resets loading on network error', async () => {
    const mockGetLastActiveTeamIdAndTeamsResult = jest.fn(() => ({
      ...mockGetLastActiveTeamIdAndTeams.result
    }))

    render(
      <MockedProvider
        mocks={[
          {
            ...mockGetLastActiveTeamIdAndTeams,
            result: mockGetLastActiveTeamIdAndTeamsResult
          },
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          {
            ...mockJourneyDuplicate,
            error: new Error('Network error')
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetLastActiveTeamIdAndTeamsResult).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() =>
      expect(
        screen.getByText(
          'Failed to duplicate journey to team, please refresh the page and try again'
        )
      ).toBeInTheDocument()
    )

    expect(screen.getByTestId('CustomizeFlowNextButton')).not.toBeDisabled()
  })

  it('renders team load error as an accessible alert', async () => {
    const mockTeamsQueryError: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
      error: new Error('Team query failed')
    }

    render(
      <MockedProvider
        mocks={[
          mockTeamsQueryError,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to load teams. Please refresh the page and try again.'
      )
    )
  })

  it('does not show team load error for guest users when team query fails', async () => {
    mockUser = { ...defaultMockUser, id: null, email: null, isAnonymous: true }
    const mockTeamsQueryError: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
      error: new Error('Forbidden')
    }

    render(
      <MockedProvider
        mocks={[
          mockTeamsQueryError,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.queryByText(
          'Failed to load teams. Please refresh the page and try again.'
        )
      ).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('ScreenWrapper')).toBeInTheDocument()
  })

  it('duplicates journey to the user-selected team, not lastActiveTeamId', async () => {
    const mockTeamsData: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
      result: {
        data: {
          getJourneyProfile: {
            id: 'profile-id',
            lastActiveTeamId: 'teamId1',
            __typename: 'JourneyProfile'
          },
          teams: [
            {
              __typename: 'Team',
              id: 'teamId1',
              title: 'Team One',
              publicTitle: 'Team 1',
              userTeams: [],
              customDomains: []
            },
            {
              __typename: 'Team',
              id: 'teamId2',
              title: 'Team Two',
              publicTitle: 'Team 2',
              userTeams: [],
              customDomains: []
            }
          ]
        }
      }
    }

    const mockDuplicateToTeam2: MockedResponse<
      JourneyDuplicate,
      JourneyDuplicateVariables
    > = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: 'teamId2',
          forceNonTemplate: true,
          duplicateAsDraft: false
        }
      },
      result: {
        data: {
          journeyDuplicate: {
            id: 'new-journey-id',
            __typename: 'Journey',
            template: false
          }
        }
      }
    }

    const mockDuplicateResult = jest
      .fn()
      .mockReturnValue({ ...mockDuplicateToTeam2.result })

    render(
      <MockedProvider
        mocks={[
          mockTeamsData,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockDuplicateToTeam2, result: mockDuplicateResult },
          {
            request: {
              query: UPDATE_LAST_ACTIVE_TEAM_ID,
              variables: { input: { lastActiveTeamId: 'teamId2' } }
            },
            result: {
              data: { journeyProfileUpdate: { id: 'profile-id' } }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )

    const combobox = screen.getByRole('combobox', { name: 'Team' })
    fireEvent.mouseDown(combobox)
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: 'Team Two' })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('option', { name: 'Team Two' }))

    expect(combobox).toHaveTextContent('Team Two')

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() => expect(mockDuplicateResult).toHaveBeenCalled())
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/templates/new-journey-id/customize',
        undefined,
        { shallow: true }
      )
    )
  })

  it('updates active team in session storage after duplication', async () => {
    const mockTeamsData: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
      result: {
        data: {
          getJourneyProfile: {
            id: 'profile-id',
            lastActiveTeamId: 'teamId1',
            __typename: 'JourneyProfile'
          },
          teams: [
            {
              __typename: 'Team',
              id: 'teamId1',
              title: 'Team One',
              publicTitle: 'Team 1',
              userTeams: [],
              customDomains: []
            },
            {
              __typename: 'Team',
              id: 'teamId2',
              title: 'Team Two',
              publicTitle: 'Team 2',
              userTeams: [],
              customDomains: []
            }
          ]
        }
      }
    }

    const mockDuplicateToTeam2: MockedResponse<
      JourneyDuplicate,
      JourneyDuplicateVariables
    > = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: 'teamId2',
          forceNonTemplate: true,
          duplicateAsDraft: false
        }
      },
      result: {
        data: {
          journeyDuplicate: {
            id: 'new-journey-id',
            __typename: 'Journey',
            template: false
          }
        }
      }
    }

    const mockDuplicateResult = jest
      .fn()
      .mockReturnValue({ ...mockDuplicateToTeam2.result })

    render(
      <MockedProvider
        mocks={[
          mockTeamsData,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockDuplicateToTeam2, result: mockDuplicateResult },
          {
            request: {
              query: UPDATE_LAST_ACTIVE_TEAM_ID,
              variables: { input: { lastActiveTeamId: 'teamId2' } }
            },
            result: {
              data: { journeyProfileUpdate: { id: 'profile-id' } }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )

    const combobox = screen.getByRole('combobox', { name: 'Team' })
    fireEvent.mouseDown(combobox)
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: 'Team Two' })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('option', { name: 'Team Two' }))

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() => expect(mockDuplicateResult).toHaveBeenCalled())

    await waitFor(() =>
      expect(sessionStorage.getItem('journeys-admin:activeTeamId')).toBe(
        'teamId2'
      )
    )
  })

  it('renders all required components correctly for desktop', async () => {
    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen handleNext={handleNext} />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardsSwiperSlide')).toBeInTheDocument()
    )

    expect(screen.getByText("Let's Get Started!")).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(
      screen.getByText(
        'A few quick edits and your template will be ready to share.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("A few quick edits and it's ready to share!")
    ).toBeInTheDocument()

    expect(screen.getByText(`'${journey.title}'`)).toBeInTheDocument()

    expect(screen.getAllByText('Select a language')).toHaveLength(2)
    expect(screen.getByTestId('LanguageAutocompleteInput')).toBeInTheDocument()
    expect(screen.getAllByText('Select a team')).toHaveLength(2)
    expect(screen.getByRole('combobox', { name: 'Team' })).toBeInTheDocument()

    expect(screen.getByTestId('CustomizeFlowNextButton')).toBeInTheDocument()
    expect(screen.getByTestId('CustomizeFlowNextButton')).toHaveTextContent(
      'Next'
    )
  })
})
