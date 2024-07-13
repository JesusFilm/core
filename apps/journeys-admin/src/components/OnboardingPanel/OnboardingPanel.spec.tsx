import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'

import {
  CreateJourney,
  CreateJourneyVariables
} from '../../../__generated__/CreateJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { CREATE_JOURNEY } from '../../libs/useJourneyCreateMutation'

import { getOnboardingJourneysMock, getTeamsMock } from './data'

import { OnboardingPanel } from '.'

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
const createJourneyMock: MockedResponse<CreateJourney, CreateJourneyVariables> =
  {
    request: {
      query: CREATE_JOURNEY,
      variables
    },
    result: {
      data: {
        journeyCreate: {
          createdAt: '2022-02-17T21:47:32.004Z',
          description: variables.description,
          id: variables.journeyId,
          language: {
            id: '529',
            name: [
              {
                value: 'English',
                primary: true,
                __typename: 'LanguageName'
              }
            ],
            __typename: 'Language'
          },
          publishedAt: null,
          slug: 'untitled-journey-journeyId',
          status: JourneyStatus.draft,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
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
    }
  }
const mocks: MockedResponse[] = [
  createJourneyMock,
  getOnboardingJourneysMock,
  getTeamsMock
]

describe('OnboardingPanel', () => {
  it('should add a new journey on custom journey button click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <OnboardingPanel />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Create Custom Journey' })
      ).not.toBeDisabled()
    )
    fireEvent.click(getByRole('button', { name: 'Create Custom Journey' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        `/journeys/${variables.journeyId}`,
        undefined,
        {
          shallow: true
        }
      )
    })
  })

  it('should not show create journey button when on shared with me', async () => {
    const result = jest.fn().mockReturnValueOnce({
      data: {
        teams: []
      }
    })
    const { queryByRole } = render(
      <MockedProvider
        mocks={[
          createJourneyMock,
          getOnboardingJourneysMock,
          {
            ...getTeamsMock,
            result
          }
        ]}
      >
        <TeamProvider>
          <OnboardingPanel />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(
      queryByRole('button', { name: 'Create Custom Journey' })
    ).not.toBeInTheDocument()
  })

  it('should display onboarding templates', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <OnboardingPanel />
        </TeamProvider>
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

    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <OnboardingPanel />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('template 1 title')).toBeInTheDocument()
    )
    expect(
      getByRole('link', {
        name: 'template 1 title Template template 1 title template 1 description'
      })
    ).toHaveAttribute('href', '/templates/014c7add-288b-4f84-ac85-ccefef7a07d3')
  })

  it('should redirect on See all link', () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <OnboardingPanel />
        </TeamProvider>
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
        <TeamProvider>
          <OnboardingPanel />
        </TeamProvider>
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'See all templates' })).toHaveAttribute(
      'href',
      '/templates'
    )
  })
})
