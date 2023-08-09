import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_VISITOR_FOR_DETAILS } from './VisitorDetails'

import { VisitorDetails } from '.'

describe('VisitorDetails', () => {
  it('should show last chat started at', async () => {
    const result = jest.fn(() => ({
      data: {
        visitor: {
          __typename: 'Visitor',
          id: 'visitor.id',
          lastChatStartedAt: '2023-05-05T02:01:04.825Z',
          countryCode: null,
          userAgent: null
        }
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VISITOR_FOR_DETAILS,
              variables: {
                id: 'visitor.id'
              }
            },
            result
          }
        ]}
      >
        <VisitorDetails id="visitor.id" />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('May 5, 2:01 AM')).toBeInTheDocument()
  })

  it('should show country code', async () => {
    const result = jest.fn(() => ({
      data: {
        visitor: {
          __typename: 'Visitor',
          id: 'visitor.id',
          lastChatStartedAt: null,
          countryCode: 'New Zealand',
          userAgent: null
        }
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VISITOR_FOR_DETAILS,
              variables: {
                id: 'visitor.id'
              }
            },
            result
          }
        ]}
      >
        <VisitorDetails id="visitor.id" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('New Zealand')).toBeInTheDocument()
  })

  it('should show user device', async () => {
    const result = jest.fn(() => ({
      data: {
        visitor: {
          __typename: 'Visitor',
          id: 'visitor.id',
          lastChatStartedAt: null,
          countryCode: null,
          userAgent: {
            os: {
              name: 'Android'
            }
          }
        }
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VISITOR_FOR_DETAILS,
              variables: {
                id: 'visitor.id'
              }
            },
            result
          }
        ]}
      >
        <VisitorDetails id="visitor.id" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('Android')).toBeInTheDocument()
  })

  it('should show visitor id', async () => {
    const result = jest.fn(() => ({
      data: {
        visitor: {
          __typename: 'Visitor',
          id: 'visitor.id',
          lastChatStartedAt: null,
          countryCode: null,
          userAgent: null
        }
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VISITOR_FOR_DETAILS,
              variables: {
                id: 'visitor.id'
              }
            },
            result
          }
        ]}
      >
        <VisitorDetails id="visitor.id" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('#visitor.id')).toBeInTheDocument()
  })
})
