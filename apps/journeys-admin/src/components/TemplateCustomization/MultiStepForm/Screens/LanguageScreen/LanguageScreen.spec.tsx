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
  mockChildJourneys,
  mockChildVariables
} from '../../../../../libs/useGetChildTemplateJourneyLanguages/useGetChildTemplateJourneyLanguages.mock'
import {
  mockParentJourneys,
  mockParentVariables
} from '../../../../../libs/useGetParentTemplateJourneyLanguages/useGetParentTemplateJourneyLanguages.mock'
import { GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID } from '../../../../../libs/useGetParentTemplateJourneyLanguages'

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

const mockGetChildJourneysFromTemplateId: MockedResponse<
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
> = {
  ...mockChildJourneys,
  request: {
    query: GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID,
    variables: mockChildVariables
  }
}

const mockGetParentJourneysFromTemplateId: MockedResponse<
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
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
  const handleScreenNavigation = jest.fn()

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
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <TeamProvider>
              <LanguageScreen
                handleNext={handleNext}
                handleScreenNavigation={handleScreenNavigation}
              />
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
                teamId: 'teamId1'
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
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId,
          { ...mockJourneyDuplicate, result: mockJourneyDuplicateMockResult }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <TeamProvider>
              <LanguageScreen
                handleNext={handleNext}
                handleScreenNavigation={handleScreenNavigation}
              />
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

  it('renders the correct social media image', async () => {
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
        focalTop: 50
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
              <LanguageScreen
                handleNext={handleNext}
                handleScreenNavigation={handleScreenNavigation}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SocialImage')).toBeInTheDocument()
    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'journey social image')
    })
  })

  it('renders all required components correctly', async () => {
    render(
      <MockedProvider
        mocks={[
          mockGetLastActiveTeamIdAndTeams,
          mockGetChildJourneysFromTemplateId,
          mockGetParentJourneysFromTemplateId
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <TeamProvider>
              <LanguageScreen
                handleNext={handleNext}
                handleScreenNavigation={handleScreenNavigation}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getAllByText("Let's get started!")).toHaveLength(2)
    expect(
      screen.getByText(
        'A few quick edits and your template will be ready to share.'
      )
    ).toBeInTheDocument()
    expect(screen.getAllByText(journey.title)).toHaveLength(1)
    expect(screen.getByTestId('SocialImage')).toBeInTheDocument()

    expect(screen.getAllByText('Select a language')).toHaveLength(2)
    expect(screen.getByTestId('LanguageAutocompleteInput')).toBeInTheDocument()
    expect(screen.getAllByText('Select a team')).toHaveLength(2)
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Team' })).toBeInTheDocument()
    })

    expect(screen.getByTestId('LanguageScreenSubmitButton')).toBeInTheDocument()
    expect(screen.getByTestId('LanguageScreenSubmitButton')).toHaveTextContent(
      'Next Step'
    )
  })

  it('renders skeleton when no journey image is provided', () => {
    const journeyWithoutImage = {
      ...journey,
      primaryImageBlock: null
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
            value={{ journey: journeyWithoutImage, variant: 'admin' }}
          >
            <TeamProvider>
              <LanguageScreen
                handleNext={handleNext}
                handleScreenNavigation={handleScreenNavigation}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SocialImage')).toBeInTheDocument()
    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })
})
