import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { formatISO } from 'date-fns'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
} from '../../../../../../__generated__/GetJourneyPlausibleVisitors'

import { AnalyticsItem, GET_JOURNEY_PLAUSIBLE_VISITORS } from './AnalyticsItem'

jest.mock('date-fns', () => {
  return {
    ...jest.requireActual('date-fns'),
    formatISO: jest.fn()
  }
})

const mockFormatIso = formatISO as jest.MockedFunction<typeof formatISO>

const getJourneyPlausibleVisitorsMock: MockedResponse<
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
> = {
  request: {
    query: GET_JOURNEY_PLAUSIBLE_VISITORS,
    variables: {
      id: defaultJourney.id,
      date: '2024-06-01,2024-09-26'
    }
  },
  result: {
    data: {
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }
  }
}

describe('AnalyticsItem', () => {
  beforeEach(() => {
    mockFormatIso.mockReturnValue('2024-09-26')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should link to journey reports page as a list item', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <AnalyticsItem variant="menu-item" />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('menuitem', { name: 'Analytics 0 visitors' })
    ).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Analytics 0 visitors' })
    ).toHaveAttribute('href', '/journeys/journey-id/reports')
  })

  it('should link to journey reports page as an icon button', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <AnalyticsItem variant="button" />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })

  it('should link to journey reports page as an icon button with modified href if fromJourneyList prop is true', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <AnalyticsItem variant="button" fromJourneyList={true} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports?from=journey-list'
    )
  })

  it('should show number of plausible visitors', async () => {
    const result = jest
      .fn()
      .mockReturnValue(getJourneyPlausibleVisitorsMock.result)

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[{ ...getJourneyPlausibleVisitorsMock, result }]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <AnalyticsItem variant="icon-button" />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('link')).toHaveTextContent('10')
  })
})
