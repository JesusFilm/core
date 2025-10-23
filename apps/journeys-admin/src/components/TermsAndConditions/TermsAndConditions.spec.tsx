import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { User, useUser } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { JourneyDuplicate } from '../../../__generated__/JourneyDuplicate'
import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'
import { TeamCreate } from '../../../__generated__/TeamCreate'
import { UpdateLastActiveTeamId } from '../../../__generated__/UpdateLastActiveTeamId'
import { TEAM_CREATE } from '../../libs/useTeamCreateMutation/useTeamCreateMutation'
import { ONBOARDING_TEMPLATE_ID } from '../Team/TeamOnboarding/TeamOnboarding'

import { JOURNEY_PROFILE_CREATE } from './TermsAndConditions'

import { TermsAndConditions } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn().mockReturnValue({
    displayName: 'Test User'
  })
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

const journeyProfileCreateMock: MockLink.MockedResponse<JourneyProfileCreate> =
  {
    request: {
      query: JOURNEY_PROFILE_CREATE
    },
    result: {
      data: {
        journeyProfileCreate: {
          __typename: 'JourneyProfile',
          id: 'profile.id',
          userId: 'userId',
          acceptedTermsAt: 'date'
        }
      }
    }
  }

const teamCreateMock: MockLink.MockedResponse<TeamCreate> = {
  request: {
    query: TEAM_CREATE,
    variables: {
      input: {
        title: 'Test User & Team',
        publicTitle: 'T Team'
      }
    }
  },
  result: {
    data: {
      teamCreate: {
        id: 'teamId1',
        title: 'Test User & Team',
        publicTitle: 'T Team',
        __typename: 'Team',
        userTeams: [],
        customDomains: []
      }
    }
  }
}

const getTeams: MockLink.MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: null
      }
    }
  }
}

const updateLastActiveTeamIdMock: MockLink.MockedResponse<UpdateLastActiveTeamId> =
  {
    request: {
      query: UPDATE_LAST_ACTIVE_TEAM_ID,
      variables: {
        input: {
          lastActiveTeamId: 'teamId1'
        }
      }
    },
    result: {
      data: {
        journeyProfileUpdate: {
          __typename: 'JourneyProfile',
          id: 'teamId1'
        }
      }
    }
  }

const journeyDuplicateMock: MockLink.MockedResponse<JourneyDuplicate> = {
  request: {
    query: JOURNEY_DUPLICATE,
    variables: {
      id: ONBOARDING_TEMPLATE_ID,
      teamId: 'teamId1'
    }
  },
  result: {
    data: {
      journeyDuplicate: {
        __typename: 'Journey',
        id: ONBOARDING_TEMPLATE_ID
      }
    }
  }
}

describe('TermsAndConditions', () => {
  const push = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUser.mockReturnValue({
      displayName: 'Test User'
    } as unknown as User)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should enable next button when box is checked', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Next' })).toBeDisabled()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Next' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Next' })).toBeDisabled()
    )
  })

  it('should create profile, team and redirect on next button click', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)

    const journeyProfileCreateMockResult = jest
      .fn()
      .mockReturnValue(journeyProfileCreateMock.result)

    const journeyDuplicateMockResult = jest
      .fn()
      .mockReturnValue(journeyDuplicateMock.result)

    const teamCreateMockResult = jest
      .fn()
      .mockReturnValue(teamCreateMock.result)

    const updateLastActiveTeamIdMockResult = jest
      .fn()
      .mockReturnValue(updateLastActiveTeamIdMock.result)

    const getTeamsMockResult = jest.fn().mockReturnValue(getTeams.result)

    const { getByRole, queryByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...journeyProfileCreateMock,
            result: journeyProfileCreateMockResult
          },
          {
            ...teamCreateMock,
            result: teamCreateMockResult
          },
          // getTeams is here twice because of the query.refetch()
          {
            ...getTeams,
            result: getTeamsMockResult
          },
          {
            ...getTeams,
            result: getTeamsMockResult
          },
          {
            ...updateLastActiveTeamIdMock,
            result: updateLastActiveTeamIdMockResult
          },
          {
            ...journeyDuplicateMock,
            result: journeyDuplicateMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Next' }))
    expect(getByRole('progressbar')).toBeInTheDocument()

    await waitFor(() => {
      expect(journeyProfileCreateMockResult).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(teamCreateMockResult).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(updateLastActiveTeamIdMockResult).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(journeyDuplicateMockResult).toHaveBeenCalled()
    })

    expect(push).toHaveBeenCalledWith('/?onboarding=true')
    await act(async () => {
      await waitFor(() => {
        expect(queryByRole('progressbar')).not.toBeInTheDocument()
      })
    })
  })

  it('should pass redirect query location to next page', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: '/custom-location' }
    } as unknown as NextRouter)

    const journeyProfileCreateMockResult = jest
      .fn()
      .mockReturnValue(journeyProfileCreateMock.result)

    const journeyDuplicateMockResult = jest
      .fn()
      .mockReturnValue(journeyDuplicateMock.result)

    const teamCreateMockResult = jest
      .fn()
      .mockReturnValue(teamCreateMock.result)

    const updateLastActiveTeamIdMockResult = jest
      .fn()
      .mockReturnValue(updateLastActiveTeamIdMock.result)

    const getTeamsMockResult = jest.fn().mockReturnValue(getTeams.result)

    const { getByRole, queryByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...journeyProfileCreateMock,
            result: journeyProfileCreateMockResult
          },
          {
            ...teamCreateMock,
            result: teamCreateMockResult
          },
          // getTeams is here twice because of the query.refetch()
          {
            ...getTeams,
            result: getTeamsMockResult
          },
          {
            ...getTeams,
            result: getTeamsMockResult
          },
          {
            ...updateLastActiveTeamIdMock,
            result: updateLastActiveTeamIdMockResult
          },
          {
            ...journeyDuplicateMock,
            result: journeyDuplicateMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(getByRole('progressbar')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(journeyProfileCreateMockResult).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(teamCreateMockResult).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(updateLastActiveTeamIdMockResult).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(journeyDuplicateMockResult).toHaveBeenCalled()
    })

    expect(push).toHaveBeenCalledWith(
      new URL('http://localhost/custom-location')
    )
    await act(async () => {
      await waitFor(() => {
        expect(queryByRole('progressbar')).not.toBeInTheDocument()
      })
    })
  })

  it('should link to terms of use page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      'https://your.nextstep.is/terms-of-use'
    )
  })

  it('should link to EULA page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      getByRole('link', { name: 'End User License Agreement' })
    ).toHaveAttribute(
      'href',
      'https://your.nextstep.is/end-user-license-agreement'
    )
  })

  it('should link to community guidelines page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Community Guidelines' })).toHaveAttribute(
      'href',
      'https://your.nextstep.is/community-guidelines'
    )
  })

  it('should use email username as displayName fallback when displayName is null', async () => {
    mockUseUser.mockReturnValue({
      displayName: null,
      email: 'testuser@example.com'
    } as unknown as User)

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)

    const teamCreateMockWithEmailUsername: MockLink.MockedResponse<TeamCreate> =
      {
        request: {
          query: TEAM_CREATE,
          variables: {
            input: {
              title: 'testuser & Team',
              publicTitle: 't Team'
            }
          }
        },
        result: {
          data: {
            teamCreate: {
              id: 'teamId1',
              title: 'testuser & Team',
              publicTitle: 't Team',
              __typename: 'Team',
              userTeams: [],
              customDomains: []
            }
          }
        }
      }

    const journeyProfileCreateMockResult = jest
      .fn()
      .mockReturnValue(journeyProfileCreateMock.result)

    const teamCreateMockResult = jest
      .fn()
      .mockReturnValue(teamCreateMockWithEmailUsername.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...journeyProfileCreateMock,
            result: journeyProfileCreateMockResult
          },
          {
            ...teamCreateMockWithEmailUsername,
            result: teamCreateMockResult
          },
          getTeams,
          getTeams,
          updateLastActiveTeamIdMock,
          journeyDuplicateMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(teamCreateMockResult).toHaveBeenCalled()
    })
  })

  it('should return early when displayName and email are both null', async () => {
    mockUseUser.mockReturnValue({
      displayName: null,
      email: null
    } as unknown as User)

    const journeyProfileCreateMockResult = jest
      .fn()
      .mockReturnValue(journeyProfileCreateMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...journeyProfileCreateMock,
            result: journeyProfileCreateMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Next' }))

    // Wait a bit to ensure no mutations are called
    await waitFor(() => {
      expect(journeyProfileCreateMockResult).not.toHaveBeenCalled()
    })
  })

  it('should have proper accessibility attributes on checkbox', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const checkbox = getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-labelledby', 'i-agree-label')
    expect(checkbox).toHaveAttribute('tabindex', '-1')
  })

  it('should show loading spinner and disable button during submission', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)

    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          journeyProfileCreateMock,
          teamCreateMock,
          getTeams,
          getTeams,
          updateLastActiveTeamIdMock,
          journeyDuplicateMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TermsAndConditions />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    const nextButton = getByTestId('TermsAndConditionsNextButton')

    expect(nextButton).not.toBeDisabled()
    fireEvent.click(nextButton)

    expect(nextButton).toBeDisabled()
    expect(getByRole('progressbar')).toBeInTheDocument()

    await waitFor(() => {
      expect(nextButton).not.toBeDisabled()
    })
  })
})
