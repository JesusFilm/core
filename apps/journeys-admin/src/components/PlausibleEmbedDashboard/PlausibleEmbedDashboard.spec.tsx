import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'

import type {
  GetAdminJourneyWithPlausibleToken,
  GetAdminJourneyWithPlausibleToken_journey as Journey
} from '../../../__generated__/GetAdminJourneyWithPlausibleToken'

import { GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN } from './PlausibleEmbedDashboard'

import { PlausibleEmbedDashboard } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('PlausibleEmbedDashboard', () => {
  it('should show plausible dashboard', async () => {
    mockUseRouter.mockReturnValue({
      query: { journeyId: 'journeyId' }
    } as unknown as NextRouter)

    const journey = {
      __typename: 'Journey',
      id: 'journey.id',
      plausibleToken: 'plausible-token'
    } as unknown as Journey

    const result = jest.fn(() => ({
      data: {
        journey
      }
    }))

    const adminJourneyMock: MockedResponse<GetAdminJourneyWithPlausibleToken> =
      {
        request: {
          query: GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN,
          variables: {
            id: 'journeyId'
          }
        },
        result
      }

    render(
      <MockedProvider mocks={[adminJourneyMock]}>
        <PlausibleEmbedDashboard />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByTestId('PlausibleEmbedDashboard')).toBeInTheDocument()
  })

  it('should show loading message', () => {
    render(
      <MockedProvider>
        <PlausibleEmbedDashboard />
      </MockedProvider>
    )

    expect(screen.getByText('The report is loading...')).toBeInTheDocument()
  })

  it('should show apollo error message', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN,
              variables: {
                id: 'journeyId'
              }
            },
            error: new Error('Error retrieving token')
          }
        ]}
      >
        <PlausibleEmbedDashboard />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('There was an error loading the report')
      ).toBeInTheDocument()
    })
  })
})
