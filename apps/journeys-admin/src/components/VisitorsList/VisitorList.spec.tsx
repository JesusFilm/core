import { MockedProvider } from '@apollo/client/testing'
import { NextRouter, useRouter } from 'next/router'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { GET_VISITORS } from './VisitorsList'
import { VisitorsList } from '.'

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

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('VideoList', () => {
  const request = {
    query: GET_VISITORS,
    variables: {
      first: 100
    }
  }
  const result = jest.fn(() => ({
    data: {
      visitors: {
        __typename: 'VisitorConnection',
        edges: [
          {
            __typename: 'VisitorEdge',
            node: {
              __typename: 'Visitor',
              id: 'visitor1.id',
              lastChatPlatform: null,
              lastLinkAction: null,
              lastRadioOptionSubmission: null,
              lastRadioQuestion: null,
              lastStepViewedAt: null,
              lastTextResponse: null
            },
            cursor: 'date string'
          }
        ],
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          startCursor: null,
          endCursor: null
        }
      }
    }
  }))

  const mocks = [
    {
      request,
      result
    }
  ]
  it('should fetch visitors', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <VisitorsList />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should fetch more visitors', async () => {
    const fetchResult = jest.fn(() => ({
      data: {
        visitors: {
          __typename: 'VisitorConnection',
          edges: [
            {
              __typename: 'VisitorEdge',
              node: {
                __typename: 'Visitor',
                id: 'visitor2.id',
                lastChatPlatform: null,
                lastLinkAction: null,
                lastRadioOptionSubmission: null,
                lastRadioQuestion: null,
                lastStepViewedAt: null,
                lastTextResponse: null
              },
              cursor: 'cursor2'
            }
          ],
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: true,
            startCursor: null,
            endCursor: 'cursor2'
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request,
            result: {
              data: {
                visitors: {
                  __typename: 'VisitorConnection',
                  edges: [
                    {
                      __typename: 'VisitorEdge',
                      node: {
                        __typename: 'Visitor',
                        id: 'visitor1.id',
                        lastChatPlatform: null,
                        lastLinkAction: null,
                        lastRadioOptionSubmission: null,
                        lastRadioQuestion: null,
                        lastStepViewedAt: null,
                        lastTextResponse: null
                      },
                      cursor: 'cursor1'
                    }
                  ],
                  pageInfo: {
                    __typename: 'PageInfo',
                    hasNextPage: true,
                    startCursor: null,
                    endCursor: 'cursor1'
                  }
                }
              }
            }
          },
          {
            request: {
              query: GET_VISITORS,
              variables: {
                first: 100,
                after: 'cursor1'
              }
            },
            result: fetchResult
          }
        ]}
      >
        <VisitorsList />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('row', { name: 'visitor1.id' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    await waitFor(() => expect(fetchResult).toHaveBeenCalled())
  })

  it('should link to visitor when clicking on a row', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VisitorsList />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('row', { name: 'visitor1.id' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('row', { name: 'visitor1.id' }))
    expect(push).toHaveBeenCalledWith('/reports/visitors/visitor1.id')
  })

  it('should disable load more button if there are no more visitors to fetch', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VisitorsList />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeDisabled()
    )
  })
})
