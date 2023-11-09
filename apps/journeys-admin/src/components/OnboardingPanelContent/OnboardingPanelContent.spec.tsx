import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { GetLastActiveTeamIdAndTeams } from '../../../__generated__/GetLastActiveTeamIdAndTeams'
import { CREATE_JOURNEY } from '../../libs/useJourneyCreateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../Team/TeamProvider'

import { onboardingJourneys } from './data'
import { GET_ONBOARDING_JOURNEYS } from './OnboardingPanelContent'

import OnboardingPanel from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const variables = {
  journeyId: 'createdJourneyId',
  title: 'Untitled Journey',
  description:
    'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
  stepId: 'stepId',
  cardId: 'cardId',
  imageId: 'imageId',
  alt: 'two hot air balloons in the sky',
  headlineTypographyContent: 'The Journey Is On',
  bodyTypographyContent: '"Go, and lead the people on their way..."',
  captionTypographyContent: 'Deutoronomy 10:11',
  teamId: 'teamId'
}

const data = {
  journeyCreate: {
    createdAt: '2022-02-17T21:47:32.004Z',
    description: variables.description,
    id: variables.journeyId,
    language: {
      id: '529',
      name: {
        value: 'English',
        primary: true
      }
    },
    publishedAt: null,
    slug: 'untitled-journey-journeyId',
    status: 'draft',
    themeMode: 'dark',
    themeName: 'base',
    title: variables.title,
    __typename: 'Journey',
    userJourneys: [
      {
        __typename: 'UserJourney',
        id: 'user-journey-id',
        user: {
          __typename: 'User',
          id: 'user-id1',
          firstName: 'Admin',
          lastName: 'One',
          imageUrl: 'https://bit.ly/3Gth4Yf'
        }
      }
    ]
  },
  stepBlockCreate: {
    id: variables.stepId,
    __typename: 'StepBlock'
  },
  cardBlockCreate: {
    id: variables.cardId,
    __typename: 'CardBlock'
  },
  imageBlockCreate: {
    id: variables.imageId,
    __typename: 'ImageBlock'
  },
  headlineTypographyBlockCreate: {
    id: 'headlineTypographyId',
    __typename: 'TypographyBlock'
  },
  bodyTypographyBlockCreate: {
    id: 'bodyTypographyId',
    __typename: 'TypographyBlock'
  },
  captionTypographyBlockCreate: {
    id: 'captionTypographyId',
    __typename: 'TypographyBlock'
  }
}

const mocks = [
  {
    request: {
      query: CREATE_JOURNEY,
      variables
    },
    result: { data }
  },
  {
    request: {
      query: GET_ONBOARDING_JOURNEYS,
      variables: {
        where: {
          ids: onboardingJourneys.map((journey) => journey.id)
        }
      }
    },
    result: { data: { onboardingJourneys } }
  }
]

const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: null
      }
    }
  }
}

describe('OnboardingPanelContent', () => {
  it('should add a new journey on custom journey button click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          ...mocks,

          {
            request: {
              query: GET_ONBOARDING_JOURNEYS
            },
            result: { data: { onboardingJourneys } }
          },
          {
            ...getTeams,
            result: {
              data: {
                teams: [
                  { id: 'teamId', title: 'Team Title', __typename: 'Team' }
                ],
                getJourneyProfile: {
                  __typename: 'JourneyProfile',
                  lastActiveTeamId: 'teamId'
                }
              }
            }
          }
        ]}
      >
        <FlagsProvider flags={{ teams: true }}>
          <TeamProvider>
            <OnboardingPanel />
          </TeamProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Create Custom Journey' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Create Custom Journey' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        `/journeys/${variables.journeyId}/edit`,
        undefined,
        {
          shallow: true
        }
      )
    })
  })

  it('should not show create journey button when on shared with me and teams flag is true', async () => {
    const result = jest.fn().mockReturnValueOnce({
      data: {
        teams: []
      }
    })
    const { queryByRole } = render(
      <MockedProvider
        mocks={[
          ...mocks,
          {
            ...getTeams,
            result
          }
        ]}
      >
        <FlagsProvider flags={{ teams: true }}>
          <TeamProvider>
            <OnboardingPanel />
          </TeamProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(
      queryByRole('button', { name: 'Create Custom Journey' })
    ).not.toBeInTheDocument()
  })

  it('should show create journey button when on shared with me and teams flag is false', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <FlagsProvider flags={{ teams: false }}>
          <TeamProvider>
            <OnboardingPanel />
          </TeamProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Create Custom Journey' })
      ).toBeInTheDocument()
    )
  })

  it('should display onboarding templates', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <OnboardingPanel />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('template 1 title')).toBeInTheDocument()
    )
    expect(getByText('template 2 title')).toBeInTheDocument()
    expect(getByText('template 3 title')).toBeInTheDocument()
    expect(getByText('template 4 title')).toBeInTheDocument()
    expect(getByText('template 5 title')).toBeInTheDocument()
  })

  it('should redirect to template details page onClick', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <OnboardingPanel />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('template 1 title')).toBeInTheDocument()
    )
    fireEvent.click(getByText('template 1 title'))
    expect(push).toHaveBeenCalledWith(
      '/templates/014c7add-288b-4f84-ac85-ccefef7a07d3'
    )
  })

  it('should redirect on See all link', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <OnboardingPanel />
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'See all' })).toHaveAttribute(
      'href',
      '/templates'
    )
  })

  it('should redirect on See all templates button', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <OnboardingPanel />
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'See all templates' })).toHaveAttribute(
      'href',
      '/templates'
    )
  })
})
