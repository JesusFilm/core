import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { GetJourneyVisitorsCount } from '../../../../../../__generated__/GetJourneyVisitorsCount'
import { GET_JOURNEY_VISITORS_COUNT } from '../../../../../../pages/journeys/[journeyId]/reports/visitors'

import { ResponsesItem } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ResponsesItem', () => {
  it('should link to journey visitors page as an icon button', async () => {
    mockedUseRouter.mockReturnValue({
      query: { journeyId: 'journey-id' }
    } as unknown as NextRouter)
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <ResponsesItem />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('link', { name: 'Responses' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports/visitors?withSubmittedText=true'
    )
  })

  it('should display visitor count next to button', async () => {
    mockedUseRouter.mockReturnValue({
      query: { journeyId: 'journey-id' }
    } as unknown as NextRouter)

    const getVisitorCountMock: MockedResponse<GetJourneyVisitorsCount> = {
      request: {
        query: GET_JOURNEY_VISITORS_COUNT,
        variables: {
          filter: { journeyId: 'journey-id', hasTextResponse: true }
        }
      },
      result: {
        data: { journeyVisitorCount: 153 }
      }
    }
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[getVisitorCountMock]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <ResponsesItem />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('link', { name: 'Responses' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports/visitors?withSubmittedText=true'
    )
    await waitFor(() => expect(screen.getByText('153')).toBeInTheDocument())
  })
})
