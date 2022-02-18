import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { NextRouter, useRouter } from 'next/router'
import { JOURNEY_CREATE } from './AddJourneyButton'
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
  const resultData = {
    journeyCreate: {
      createdAt: '2022-02-17T21:47:32.004Z',
      description:
        'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
      id: 'journeyId',
      locale: 'en-US',
      publishedAt: null,
      slug: 'untitled-journey-journeyId',
      status: 'draft',
      themeMode: 'dark',
      themeName: 'base',
      title: 'Untitled Journey',
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
      id: 'stepId',
      __typename: 'StepBlock'
    },
    cardBlockCreate: {
      id: 'cardId',
      __typename: 'CardBlock'
    },
    imageBlockCreate: {
      id: 'imageId',
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
  it('should check if the mutation gets called on fab click', async () => {
    mockUuidv4.mockReturnValueOnce('journeyId')
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    mockUuidv4.mockReturnValueOnce('imageId')
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        adminJourneys: []
      }
    })
    const result = jest.fn(() => ({
      data: resultData
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_CREATE,
              variables: {
                journeyId: 'journeyId',
                title: 'Untitled Journey',
                description:
                  'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
                stepId: 'stepId',
                cardId: 'cardId',
                imageId: 'imageId',
                alt: 'two hot air balloons in the sky',
                headlineTypographyContent: 'The Journey Is On',
                bodyTypographyContent:
                  '"Go, and lead the people on their way..."',
                captionTypographyContent: 'Deutoronomy 10:11'
              }
            },
            result
          }
        ]}
      >
        <AddJourneyButton variant="fab" />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()?.ROOT_QUERY?.adminJourneys).toEqual([
      { __ref: 'Journey:journeyId' }
    ])
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        `/journeys/${resultData.journeyCreate.slug}/edit`
      )
    )
  })

  it('should check if the mutations gets called on AddJourneyButton click', async () => {
    mockUuidv4.mockReturnValueOnce('journeyId')
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    mockUuidv4.mockReturnValueOnce('imageId')
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        adminJourneys: []
      }
    })
    const result = jest.fn(() => ({
      data: resultData
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_CREATE,
              variables: {
                journeyId: 'journeyId',
                title: 'Untitled Journey',
                description:
                  'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
                stepId: 'stepId',
                cardId: 'cardId',
                imageId: 'imageId',
                alt: 'two hot air balloons in the sky',
                headlineTypographyContent: 'The Journey Is On',
                bodyTypographyContent:
                  '"Go, and lead the people on their way..."',
                captionTypographyContent: 'Deutoronomy 10:11'
              }
            },
            result
          }
        ]}
      >
        <AddJourneyButton variant="button" />
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Create a Journey' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()?.ROOT_QUERY?.adminJourneys).toEqual([
      { __ref: 'Journey:journeyId' }
    ])
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        `/journeys/${resultData.journeyCreate.slug}/edit`
      )
    )
  })
})
