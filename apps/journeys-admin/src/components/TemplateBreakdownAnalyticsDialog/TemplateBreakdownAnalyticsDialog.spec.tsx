import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { formatISO } from 'date-fns'

import {
  GetTemplateFamilyStatsBreakdown,
  GetTemplateFamilyStatsBreakdownVariables
} from '../../../__generated__/GetTemplateFamilyStatsBreakdown'
import {
  IdType,
  JourneyStatus,
  PlausibleEvent
} from '../../../__generated__/globalTypes'
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch'
import { mockSingleRowData } from './TemplateBreakdownAnalyticsTable/TemplateBreakdownAnalyticsTable.mockData'
import {
  GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
  TemplateBreakdownAnalyticsDialog
} from './TemplateBreakdownAnalyticsDialog'

jest.mock('@mui/material/useMediaQuery', () => {
  return jest.fn(() => false)
})

jest.mock('date-fns', () => {
  return {
    ...jest.requireActual('date-fns'),
    formatISO: jest.fn()
  }
})

const mockFormatISO = formatISO as jest.MockedFunction<typeof formatISO>

describe('TemplateBreakdownAnalyticsDialog', () => {
  const mockHandleClose = jest.fn()
  const journeyId = 'test-journey-id'
  const mockCurrentDate = '2025-12-24'
  const expectedDate = `${earliestStatsCollected},${mockCurrentDate}`

  beforeEach(() => {
    jest.clearAllMocks()
    mockFormatISO.mockReturnValue(mockCurrentDate)
  })

  const createMock = (
    status: JourneyStatus[]
  ): MockedResponse<
    GetTemplateFamilyStatsBreakdown,
    GetTemplateFamilyStatsBreakdownVariables
  > => ({
    request: {
      query: GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
      variables: {
        id: journeyId,
        idType: IdType.databaseId,
        where: {
          property: 'event:props:templateKey',
          period: 'custom',
          date: expectedDate
        },
        events: [
          PlausibleEvent.journeyVisitors,
          PlausibleEvent.journeyResponses,
          PlausibleEvent.prayerRequestCapture,
          PlausibleEvent.christDecisionCapture,
          PlausibleEvent.gospelStartCapture,
          PlausibleEvent.gospelCompleteCapture,
          PlausibleEvent.rsvpCapture,
          PlausibleEvent.specialVideoStartCapture,
          PlausibleEvent.specialVideoCompleteCapture,
          PlausibleEvent.custom1Capture,
          PlausibleEvent.custom2Capture,
          PlausibleEvent.custom3Capture
        ],
        status
      }
    },
    result: {
      data: mockSingleRowData
    }
  })

  const getTemplateFamilyStatsBreakdownMockWithArchived = createMock([
    JourneyStatus.published,
    JourneyStatus.draft,
    JourneyStatus.archived
  ])

  const getTemplateFamilyStatsBreakdownMockWithoutArchived = createMock([
    JourneyStatus.published,
    JourneyStatus.draft
  ])

  it('should call query with archived journeys included by default', async () => {
    render(
      <MockedProvider mocks={[getTemplateFamilyStatsBreakdownMockWithArchived]}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open={true}
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('template-breakdown-analytics-table')
      ).toBeInTheDocument()
    })
  })

  it('should toggle archived journeys switch', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider
        mocks={[
          getTemplateFamilyStatsBreakdownMockWithArchived,
          getTemplateFamilyStatsBreakdownMockWithoutArchived
        ]}
      >
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open={true}
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('template-breakdown-analytics-table')
      ).toBeInTheDocument()
    })

    const switchElement = screen.getByRole('checkbox')
    expect(switchElement).toBeChecked()

    await user.click(switchElement)

    await waitFor(() => {
      expect(switchElement).not.toBeChecked()
    })
  })

  it('should show loading spinner during loading state', () => {
    const loadingMock: MockedResponse<
      GetTemplateFamilyStatsBreakdown,
      GetTemplateFamilyStatsBreakdownVariables
    > = {
      request: {
        query: GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
        variables: {
          id: journeyId,
          idType: IdType.databaseId,
          where: {
            property: 'event:props:templateKey',
            period: 'custom',
            date: expectedDate
          },
          events: [
            PlausibleEvent.journeyVisitors,
            PlausibleEvent.journeyResponses,
            PlausibleEvent.prayerRequestCapture,
            PlausibleEvent.christDecisionCapture,
            PlausibleEvent.gospelStartCapture,
            PlausibleEvent.gospelCompleteCapture,
            PlausibleEvent.rsvpCapture,
            PlausibleEvent.specialVideoStartCapture,
            PlausibleEvent.specialVideoCompleteCapture,
            PlausibleEvent.custom1Capture,
            PlausibleEvent.custom2Capture,
            PlausibleEvent.custom3Capture
          ],
          status: [
            JourneyStatus.published,
            JourneyStatus.draft,
            JourneyStatus.archived
          ]
        }
      }
    }

    render(
      <MockedProvider mocks={[loadingMock]}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open={true}
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show error message when there is an error', async () => {
    const errorMock: MockedResponse<
      GetTemplateFamilyStatsBreakdown,
      GetTemplateFamilyStatsBreakdownVariables
    > = {
      request: {
        query: GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
        variables: {
          id: journeyId,
          idType: IdType.databaseId,
          where: {
            property: 'event:props:templateKey',
            period: 'custom',
            date: expectedDate
          },
          events: [
            PlausibleEvent.journeyVisitors,
            PlausibleEvent.journeyResponses,
            PlausibleEvent.prayerRequestCapture,
            PlausibleEvent.christDecisionCapture,
            PlausibleEvent.gospelStartCapture,
            PlausibleEvent.gospelCompleteCapture,
            PlausibleEvent.rsvpCapture,
            PlausibleEvent.specialVideoStartCapture,
            PlausibleEvent.specialVideoCompleteCapture,
            PlausibleEvent.custom1Capture,
            PlausibleEvent.custom2Capture,
            PlausibleEvent.custom3Capture
          ],
          status: [
            JourneyStatus.published,
            JourneyStatus.draft,
            JourneyStatus.archived
          ]
        }
      },
      error: new Error('Failed to load stats')
    }

    render(
      <MockedProvider mocks={[errorMock]}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open={true}
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('There was an error loading the stats')
      ).toBeInTheDocument()
    })

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
  })
})
