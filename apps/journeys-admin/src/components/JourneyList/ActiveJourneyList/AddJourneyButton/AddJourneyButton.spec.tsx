import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'

import { CREATE_JOURNEY } from '../../../../libs/useJourneyCreateMutation'

import { AddJourneyButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AddJourneyButton', () => {
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
    captionTypographyContent: 'Deuteronomy 10:11',
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
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    },
    bodyTypographyBlockCreate: {
      id: 'bodyTypographyId',
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    },
    captionTypographyBlockCreate: {
      id: 'captionTypographyId',
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    }
  }

  const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
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

  it('should create a journey and redirect to edit page on click', async () => {
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)

    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const result = jest.fn(() => ({ data }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_JOURNEY,
              variables
            },
            result
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
        <TeamProvider>
          <AddJourneyButton />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Create a Journey' })
      ).toBeInTheDocument()
    )

    fireEvent.click(getByRole('button', { name: 'Create a Journey' }))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        `/journeys/${data.journeyCreate.id}`,
        undefined,
        { shallow: true }
      )
    )
  })

  it('should not show add journey button when no active team', async () => {
    const result = jest.fn().mockReturnValueOnce({
      data: {
        teams: []
      }
    })
    const { queryByRole } = render(
      <MockedProvider mocks={[{ ...getTeams, result }]}>
        <TeamProvider>
          <AddJourneyButton />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(
      queryByRole('button', { name: 'Create a Journey' })
    ).not.toBeInTheDocument()
  })

  it('should show add journey button when active team', async () => {
    const result = jest.fn().mockReturnValueOnce({
      data: {
        teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    })
    const { queryByRole } = render(
      <MockedProvider mocks={[{ ...getTeams, result }]}>
        <TeamProvider>
          <AddJourneyButton />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        queryByRole('button', { name: 'Create a Journey' })
      ).toBeInTheDocument()
    )
  })
})
