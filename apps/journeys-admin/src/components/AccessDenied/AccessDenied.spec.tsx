import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { UserJourneyRequest } from '../../../__generated__/UserJourneyRequest'

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

    const mockUserJourneyRequest: MockedResponse<UserJourneyRequest> = {
      request: {
        query: USER_JOURNEY_REQUEST,
        variables: { journeyId: 'mockedJourneyId' }
      },
      result: jest.fn(() => ({
        data: {
          userJourneyRequest: {
            id: 'mockedJourneyId',
            __typename: 'UserJourney'
          }
        }
      }))
    }

    const { getAllByRole } = render(
      <MockedProvider mocks={[mockUserJourneyRequest]}>
        <AccessDenied />
      </MockedProvider>
    )

    fireEvent.click(getAllByRole('button', { name: 'Request Now' })[0])

    await waitFor(() =>
      expect(mockUserJourneyRequest.result).toHaveBeenCalled()
    )

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
