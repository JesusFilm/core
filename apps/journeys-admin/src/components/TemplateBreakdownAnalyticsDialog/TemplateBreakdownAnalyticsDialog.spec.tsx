import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
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

  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date(2025, 11, 24, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createMock = (
    status: JourneyStatus[],
    date: string | undefined = undefined,
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
          period: date == null ? 'all' : 'custom',
          ...(date != null ? { date } : {})
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

  const getTemplateFamilyStatsBreakdownMockWithArchived = {
    ...createMock([
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]),
    maxUsageCount: 2
  }

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
            period: 'all'
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
            period: 'all'
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

  it('keeps reset visible and enables it when a date is entered', async () => {
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
      screen.getByRole('button', { name: 'Reset date range' })
    ).toBeDisabled()
    fireEvent.change(screen.getByLabelText('From', { selector: 'input' }), {
      target: { value: '01-12-2025' }
    })
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reset date range' })
    ).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Reset date range' }))
    expect(
      screen.getByRole('button', { name: 'Reset date range' })
    ).toBeDisabled()
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
      screen.getByText('Select a valid From and To date to view analytics')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
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
            undefined,
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

  it('debounces edits and cancels pending requests when a range becomes incomplete', async () => {
    const status = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const link = new MockLink([
      createMock(status),
      createMock(status, '2025-12-01,2025-12-12')
    ])
    const request = vi.spyOn(link, 'request')
    render(
      <MockedProvider link={link}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    selectRange('01-12-2025', '10-12-2025')
    fireEvent.change(screen.getByLabelText('To', { selector: 'input' }), {
      target: { value: '11-12-2025' }
    })
    fireEvent.change(screen.getByLabelText('To', { selector: 'input' }), {
      target: { value: '12-12-2025' }
    })
    expect(request).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[1][0].variables.where.date).toBe(
      '2025-12-01,2025-12-12'
    )
    fireEvent.change(screen.getByLabelText('To', { selector: 'input' }), {
      target: { value: '13-12-2025' }
    })
    fireEvent.change(screen.getByLabelText('To', { selector: 'input' }), {
      target: { value: '' }
    })
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Select a valid From and To date to view analytics')
    ).toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 550))
    })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('resets the dates and archived filter together when the dialog closes', async () => {
    const user = userEvent.setup()
    const statuses = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const withoutArchived = createMock(
      [JourneyStatus.published, JourneyStatus.draft],
      '2025-12-01,2025-12-10'
    )
    const result = vi.fn(() => ({ data: mockSingleRowData }))
    withoutArchived.result = result
    render(
      <MockedProvider
        mocks={[
          createMock(statuses),
          createMock(statuses, '2025-12-01,2025-12-10'),
          withoutArchived,
          createMock(statuses)
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
    await screen.findByTestId('template-breakdown-analytics-table')
    await user.click(screen.getByRole('switch'))
    await waitFor(() => expect(result).toHaveBeenCalledOnce())
    await user.click(screen.getByTestId('dialog-close-button'))
    expect(mockHandleClose).toHaveBeenCalledOnce()
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.getByLabelText('From', { selector: 'input' })).toHaveValue('')
    expect(screen.getByLabelText('To', { selector: 'input' })).toHaveValue('')
    expect(
      screen.getByRole('button', { name: 'Reset date range' })
    ).toBeDisabled()
  })

  it('fetches new all-time metrics after resetting instead of reusing cached values', async () => {
    const user = userEvent.setup()
    const statuses = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const refreshedData: GetTemplateFamilyStatsBreakdown = {
      templateFamilyStatsBreakdown:
        mockSingleRowData.templateFamilyStatsBreakdown!.map((row) => ({
          ...row,
          stats: row.stats.map((stat) => ({
            ...stat,
            visitors: stat.visitors + 10
          }))
        }))
    }
    const link = new MockLink([
      createMock(statuses),
      createMock(statuses, '2025-12-01,2025-12-10'),
      createMock(statuses, undefined, refreshedData)
    ])
    const request = vi.spyOn(link, 'request')
    render(
      <MockedProvider link={link}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    selectRange('01-12-2025', '10-12-2025')
    await screen.findByTestId('template-breakdown-analytics-table')
    await user.click(screen.getByRole('button', { name: 'Reset date range' }))
    await screen.findAllByText('110')
    expect(request).toHaveBeenCalledTimes(3)
    expect(request.mock.calls[2][0].variables.where).toEqual({
      property: 'event:props:templateKey',
      period: 'all'
    })
  })

  it('hides analytics for partially typed sections and clears them with Reset', async () => {
    const user = userEvent.setup()
    const statuses = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const link = new MockLink([createMock(statuses), createMock(statuses)])
    const request = vi.spyOn(link, 'request')
    render(
      <MockedProvider link={link}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    await screen.findByTestId('template-breakdown-analytics-table')
    const from = within(screen.getAllByRole('group', { name: 'From' })[0])
    await user.click(from.getByRole('spinbutton', { name: 'Day' }))
    await user.keyboard('12')
    await screen.findByText('Select a valid From and To date to view analytics')
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
    expect(request).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Reset date range' }))
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(
      screen.getByRole('button', { name: 'Reset date range' })
    ).toBeDisabled()
    expect(
      within(screen.getAllByRole('group', { name: 'From' })[0]).getByRole(
        'spinbutton',
        { name: 'Day' }
      )
    ).toHaveTextContent(/DD/i)
    expect(request).toHaveBeenCalledTimes(2)
  })
})
