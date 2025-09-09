import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor, fireEvent, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import {
  mockJourneys,
  mockVariables as mockGetJourneysFromTemplateIdVariables
} from '../../../../../libs/useTemplateJourneyLanguages/useTemplateJourneyLanguages.mock'
import { GET_JOURNEYS_FROM_TEMPLATE_ID } from '../../../../../libs/useTemplateJourneyLanguages'

import { LanguageScreen } from './LanguageScreen'
import { NextRouter, useRouter } from 'next/router'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from '../../../../../../__generated__/JourneyDuplicate'
import {
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
} from '../../../../../../__generated__/GetJourneysFromTemplateId'

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: () => ({ id: 'user-id', email: 'urim@thumim.example.io' })
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

const mockGetJourneysFromTemplateId: MockedResponse<
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
> = {
  ...mockJourneys,
  request: {
    query: GET_JOURNEYS_FROM_TEMPLATE_ID,
    variables: {
      where: {
        template: true,
        fromTemplateId: 'template-123'
      }
    }
  }
}

const mockJourneyDuplicate: MockedResponse<
  JourneyDuplicate,
  JourneyDuplicateVariables
> = {
  request: {
    query: JOURNEY_DUPLICATE,
    variables: { id: 'journeyId', teamId: 'teamId1' }
  },
  result: {
    data: {
      journeyDuplicate: { id: 'new-journey-id', __typename: 'Journey' }
    }
  }
}

describe('LanguageScreen', () => {
  const handleNext = jest.fn()

  let push: jest.Mock
  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  it('duplicates journey to selected team and navigates to customize', async () => {
    const mockJourneyDuplicateMockResult = jest
      .fn()
      .mockReturnValue({ ...mockJourneyDuplicate.result })

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <TeamProvider>
              <LanguageScreen handleNext={handleNext} />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )
    fireEvent.click(screen.getByTestId('LanguageScreenSubmitButton'))
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

    const mockGetJourneysFromTemplateIdMockResult = jest
      .fn()
      .mockReturnValue({ ...mockGetJourneysFromTemplateId.result })

    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          {
            request: {
              ...mockJourneyDuplicate.request,
              variables: {
                id: 'journey-3',
                teamId: 'teamId1'
              }
            },
            result: mockJourneyDuplicateMockResult
          },
          {
            ...mockGetJourneysFromTemplateId,
            result: mockGetJourneysFromTemplateIdMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: journeyWithFromTemplateId, variant: 'admin' }}
          >
            <TeamProvider>
              <LanguageScreen handleNext={handleNext} />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetJourneysFromTemplateIdMockResult).toHaveBeenCalled()
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
      fireEvent.click(screen.getByRole('option', { name: 'French' }))
    )

    fireEvent.click(screen.getByTestId('LanguageScreenSubmitButton'))
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

  it('shows error snackbar when duplicate fails', async () => {
    const mockJourneyDuplicateMockResult = jest.fn().mockReturnValue({
      ...mockJourneyDuplicate.result,
      data: { journeyDuplicate: null }
    })

    const { getByText } = render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <TeamProvider>
              <LanguageScreen handleNext={handleNext} />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
        'Team One'
      )
    )
    fireEvent.click(screen.getByTestId('LanguageScreenSubmitButton'))
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
})
