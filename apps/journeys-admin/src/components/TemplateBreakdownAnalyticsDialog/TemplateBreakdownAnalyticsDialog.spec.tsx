import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
  GetTemplateFamilyStatsBreakdown,
  GetTemplateFamilyStatsBreakdownVariables
} from '../../../__generated__/GetTemplateFamilyStatsBreakdown'
import {
  IdType,
  JourneyStatus,
  PlausibleEvent
} from '../../../__generated__/globalTypes'
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/buildPresetDateRange'

import {
  GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
  TemplateBreakdownAnalyticsDialog
} from './TemplateBreakdownAnalyticsDialog'
import { mockSingleRowData } from './TemplateBreakdownAnalyticsTable/TemplateBreakdownAnalyticsTable.mockData'

vi.mock('@mui/material/useMediaQuery', () => {
  return { __esModule: true, default: vi.fn(() => false) }
})

describe('TemplateBreakdownAnalyticsDialog', () => {
  const mockHandleClose = vi.fn()
  const journeyId = 'test-journey-id'
  const mockCurrentDate = '2025-12-24'
  const expectedDate = `${earliestStatsCollected},${mockCurrentDate}`

  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date(2025, 11, 24, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createMock = (
    status: JourneyStatus[],
    date = expectedDate,
    data: GetTemplateFamilyStatsBreakdown = mockSingleRowData
  ): MockLink.MockedResponse<
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
          period: date === expectedDate ? 'all' : 'custom',
          date
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
      data
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

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()

    await user.click(switchElement)

    await waitFor(() => {
      expect(switchElement).not.toBeChecked()
    })
  })

  it('should show loading spinner during loading state', () => {
    const loadingMock: MockLink.MockedResponse<
      GetTemplateFamilyStatsBreakdown,
      GetTemplateFamilyStatsBreakdownVariables
    > = {
      delay: Infinity,
      request: {
        query: GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
        variables: {
          id: journeyId,
          idType: IdType.databaseId,
          where: {
            property: 'event:props:templateKey',
            period: 'all',
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
    const errorMock: MockLink.MockedResponse<
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
            period: 'all',
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

  const selectRange = (start: string, end: string): void => {
    // MUI keeps the complete date value in an input alongside its editable sections.
    fireEvent.change(screen.getByLabelText('From', { selector: 'input' }), {
      target: { value: start }
    })
    fireEvent.change(screen.getByLabelText('To', { selector: 'input' }), {
      target: { value: end }
    })
  }

  it('applies a date range to all metrics and preserves it when toggling archived projects', async () => {
    const user = userEvent.setup()
    const filteredData: GetTemplateFamilyStatsBreakdown = {
      templateFamilyStatsBreakdown:
        mockSingleRowData.templateFamilyStatsBreakdown!.map((row) => ({
          ...row,
          stats: row.stats.map((stat) => ({ ...stat, visitors: 7 }))
        }))
    }
    const withArchived = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const filteredMock = createMock(
      withArchived,
      '2025-12-01,2025-12-10',
      filteredData
    )
    const filteredResult = vi.fn(() => ({ data: filteredData }))
    filteredMock.result = filteredResult
    const withoutArchivedMock = createMock(
      [JourneyStatus.published, JourneyStatus.draft],
      '2025-12-01,2025-12-10',
      filteredData
    )
    const withoutArchivedResult = vi.fn(() => ({ data: filteredData }))
    withoutArchivedMock.result = withoutArchivedResult

    render(
      <MockedProvider
        mocks={[
          getTemplateFamilyStatsBreakdownMockWithArchived,
          filteredMock,
          withoutArchivedMock,
          getTemplateFamilyStatsBreakdownMockWithoutArchived
        ]}
      >
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    selectRange('01-12-2025', '10-12-2025')
    await waitFor(() => expect(filteredResult).toHaveBeenCalledOnce())
    await waitFor(() =>
      expect(screen.queryByText('100')).not.toBeInTheDocument()
    )
    expect(screen.getAllByText('7')).toHaveLength(4)
    await user.click(screen.getByRole('switch'))
    await waitFor(() => expect(withoutArchivedResult).toHaveBeenCalledOnce())

    await user.click(screen.getByRole('button', { name: 'Reset date range' }))
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(screen.getAllByText('100')).toHaveLength(2)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('shows reset for a partial range without querying until both dates are filled', async () => {
    const user = userEvent.setup()
    render(
      <MockedProvider mocks={[getTemplateFamilyStatsBreakdownMockWithArchived]}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(
      screen.queryByRole('button', { name: 'Reset date range' })
    ).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('From', { selector: 'input' }), {
      target: { value: '01-12-2025' }
    })
    expect(
      screen.getByTestId('template-breakdown-analytics-table')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset date range' }))
    expect(
      screen.queryByRole('button', { name: 'Reset date range' })
    ).not.toBeInTheDocument()
  })

  it('clears a range back to explicit all-time analytics', async () => {
    const user = userEvent.setup()
    const withArchived = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    render(
      <MockedProvider
        mocks={[
          getTemplateFamilyStatsBreakdownMockWithArchived,
          createMock(withArchived, '2025-12-01,2025-12-10', {
            templateFamilyStatsBreakdown: []
          })
        ]}
      >
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    selectRange('01-12-2025', '10-12-2025')
    await screen.findByText('No template breakdown analytics data available')
    await user.click(screen.getByRole('button', { name: 'Reset date range' }))
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(
      screen.queryByRole('button', { name: 'Apply' })
    ).not.toBeInTheDocument()
  })

  it.each([
    ['10-12-2025', '01-12-2025'],
    ['01-01-2024', '10-12-2025'],
    ['01-12-2025', '31-12-2025'],
    ['01-12-2025', '']
  ])('prevents applying an invalid range %s to %s', async (start, end) => {
    render(
      <MockedProvider mocks={[getTemplateFamilyStatsBreakdownMockWithArchived]}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    selectRange(start, end)
    expect(
      screen.queryByRole('button', { name: 'Apply' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('template-breakdown-analytics-table')
    ).toBeInTheDocument()
  })

  it('keeps project rows and zero totals visible when there is no activity', async () => {
    const zeroData: GetTemplateFamilyStatsBreakdown = {
      templateFamilyStatsBreakdown:
        mockSingleRowData.templateFamilyStatsBreakdown!.map((row) => ({
          ...row,
          stats: row.stats.map((stat) => ({ ...stat, visitors: 0 }))
        }))
    }
    render(
      <MockedProvider
        mocks={[
          createMock(
            [
              JourneyStatus.published,
              JourneyStatus.draft,
              JourneyStatus.archived
            ],
            expectedDate,
            zeroData
          )
        ]}
      >
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(screen.getByRole('link', { name: 'Journey 1' })).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(4)
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).toBeInTheDocument()
  })
})
