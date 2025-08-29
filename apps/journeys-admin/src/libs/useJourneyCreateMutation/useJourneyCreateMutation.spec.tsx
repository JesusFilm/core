import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import {
  CREATE_JOURNEY,
  useJourneyCreateMutation
} from './useJourneyCreateMutation'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

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
  captionTypographyContent: 'Deutoronomy 10:11'
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

describe('useJourneyCreateMutation', () => {
  it('returns a function which creates a journey by id', async () => {
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)

    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        adminJourneys: []
      }
    })

    const { result } = renderHook(() => useJourneyCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CREATE_JOURNEY,
                variables
              },
              result: { data }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      const created = await result.current.createJourney()
      expect(created).toMatchObject(data.journeyCreate)
    })
    await waitFor(() =>
      expect(cache.extract()?.ROOT_QUERY?.adminJourneys).toEqual([
        { __ref: 'Journey:createdJourneyId' }
      ])
    )
  })

  it('returns a function which returns undefined if error', async () => {
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)

    const { result } = renderHook(() => useJourneyCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: CREATE_JOURNEY,
                variables
              },
              result: { data: {} }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      const created = await result.current.createJourney()
      expect(created).toBeUndefined()
    })
  })

  it('returns a loading state', async () => {
    const { result } = renderHook(() => useJourneyCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>{children}</MockedProvider>
      )
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
  })
})
