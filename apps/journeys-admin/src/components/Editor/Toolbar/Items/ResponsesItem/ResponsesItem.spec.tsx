import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { GetJourneyVisitorsCount } from '../../../../../../__generated__/GetJourneyVisitorsCount'

import { GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES } from './ResponsesItem'

import { ResponsesItem } from '.'

describe('ResponsesItem', () => {
  it('should link to journey visitors page as an icon button', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ResponsesItem variant="icon-button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('link', { name: 'Responses' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports/visitors?withSubmittedText=true'
    )
  })

  it('should link to journey visitors page as an icon button with modified href if fromJourneyList prop is true', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ResponsesItem variant="icon-button" fromJourneyList />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('link', { name: 'Responses' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports/visitors?withSubmittedText=true&from=journey-list'
    )
  })

  it('should display responses count next to button', async () => {
    const getVisitorCountMock: MockedResponse<GetJourneyVisitorsCount> = {
      request: {
        query: GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES,
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
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ResponsesItem variant="icon-button" />
          </JourneyProvider>
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
