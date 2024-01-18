import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { AccessDenied, USER_JOURNEY_REQUEST } from './AccessDenied'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AccessDenied', () => {
  it('should request access', async () => {
    mockedUseRouter.mockReturnValue({
      query: { journeyId: 'mockedJourneyId' }
    } as unknown as NextRouter)

    const mockUserJourneyResult = jest.fn(() => ({
      data: {
        userJourneyRequest: {
          id: 'mockedJourneyId',
          __typename: 'UserJourney'
        }
      }
    }))

    const mockUserJourneyRequest = {
      request: {
        query: USER_JOURNEY_REQUEST,
        variables: { journeyId: 'mockedJourneyId' }
      },
      result: mockUserJourneyResult
    }

    const { getAllByRole } = render(
      <MockedProvider mocks={[mockUserJourneyRequest]}>
        <AccessDenied />
      </MockedProvider>
    )

    fireEvent.click(getAllByRole('button', { name: 'Request Now' })[0])

    await waitFor(() => expect(mockUserJourneyResult).toHaveBeenCalled())

    expect(
      getAllByRole('heading', { name: 'Request Sent' })[0]
    ).toBeInTheDocument()
  })

  it('should show back button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <AccessDenied />
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Back to my journeys' })).toHaveAttribute(
      'href',
      '/'
    )
  })
})
