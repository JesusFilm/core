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
  email: 'urim@thumim.example.io'
}

let mockUser: {
  id: string | null
  email: string | null
  firebaseUser?: { isAnonymous: boolean }
} = defaultMockUser

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: () => mockUser
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

describe('LanguageScreen', () => {
  let handleNext: jest.Mock
  const handleScreenNavigation = jest.fn()
  let push: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()
    mockUser = defaultMockUser
    handleNext = jest.fn((overrideJourneyId?: string) => {
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
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
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
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
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
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider
              value={{ journey: journeyWithFromTemplateId, variant: 'admin' }}
            >
              <TeamProvider>
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
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
    mockUser = {
      id: null,
      email: null,
      firebaseUser: { isAnonymous: true }
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
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
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

  it('for anonymous user with existing team: reuses existing team and does not create a new one', async () => {
    mockUser = {
      id: null,
      email: null,
      firebaseUser: { isAnonymous: true }
    }

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
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <TeamProvider>
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
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
          mockJourneyDuplicateForDuplicateLanguage
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
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
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
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
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
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <JourneyProvider
              value={{ journey: journeyWithImage, variant: 'admin' }}
            >
              <TeamProvider>
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CardsSwiperSlide')).toBeInTheDocument()
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
                <LanguageScreen
                  handleNext={handleNext}
                  handleScreenNavigation={handleScreenNavigation}
                />
              </TeamProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
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
    expect(screen.getByTestId('CardsSwiperSlide')).toBeInTheDocument()

    expect(screen.getAllByText('Select a language')).toHaveLength(2)
    expect(screen.getByTestId('LanguageAutocompleteInput')).toBeInTheDocument()
    expect(screen.getAllByText('Select a team')).toHaveLength(2)
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Team' })).toBeInTheDocument()
    })

    expect(screen.getByTestId('CustomizeFlowNextButton')).toBeInTheDocument()
    expect(screen.getByTestId('CustomizeFlowNextButton')).toHaveTextContent(
      'Next'
    )
  })
})
