import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { JourneyDuplicate } from '@core/journeys/ui/useJourneyDuplicateMutation/__generated__/JourneyDuplicate'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

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
        ids: expect.any(Array)
      }
    }
  },
  result: { data: { languages: [] } }
}

function buildJourneyDuplicateMock(
  variables: {
    id: string
    teamId: string
    forceNonTemplate: boolean
  },
  shouldError = false
): MockedResponse<JourneyDuplicate> {
  if (shouldError) {
    return {
      request: { query: JOURNEY_DUPLICATE, variables },
      error: new Error('boom')
    }
  }
  return {
    request: { query: JOURNEY_DUPLICATE, variables },
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

interface SetupOptions {
  useTemplate?: string | string[] | null
  duplicateError?: boolean
  push?: jest.Mock
  replace?: jest.Mock
}

function setup({
  useTemplate = 'template-id',
  duplicateError = false,
  push = jest.fn().mockResolvedValue(true),
  replace = jest.fn().mockResolvedValue(true)
}: SetupOptions = {}): { push: jest.Mock; replace: jest.Mock } {
  const query = useTemplate == null ? {} : { useTemplate }

  mockUseRouter.mockReturnValue({
    pathname: '/',
    query,
    push,
    replace
  } as unknown as NextRouter)

  const mocks: MockedResponse[] = [
    teamsMock,
    updateLastActiveTeamIdMock,
    languagesMock,
    buildJourneyDuplicateMock(
      { id: 'template-id', teamId: 'team-1', forceNonTemplate: true },
      duplicateError
    )
  ]

  render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <TeamProvider>
          <UseTemplateDeepLink />
        </TeamProvider>
      </SnackbarProvider>
    </MockedProvider>
  )

  return { push, replace }
}

describe('UseTemplateDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    setup({ useTemplate: ['template-id', 'second-template-id'] })
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

  it('duplicates the journey, navigates and strips the param on submit', async () => {
    const { push, replace } = setup()
    await waitFor(() =>
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    )

    // active team auto-selected; click submit
    const submitButton = await screen.findByRole('button', { name: 'Add' })
    fireEvent.click(submitButton)

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    expect(push).toHaveBeenCalledWith('/?type=journeys&refresh=true')

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(
      { pathname: '/', query: {} },
      undefined,
      { shallow: true }
    )

    await waitFor(() =>
      expect(screen.getByText('Journey Copied')).toBeInTheDocument()
    )
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
})
