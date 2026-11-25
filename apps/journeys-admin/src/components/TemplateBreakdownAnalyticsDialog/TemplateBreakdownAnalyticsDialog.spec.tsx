import { InMemoryCache } from '@apollo/client'
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
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import {
  GetTemplateFamilyStatsBreakdown,
  GetTemplateFamilyStatsBreakdownVariables
} from '../../../__generated__/GetTemplateFamilyStatsBreakdown'
import {
  IdType,
  JourneyStatus,
  PlausibleEvent
} from '../../../__generated__/globalTypes'
import { TEMPLATE_LABELS } from '../../libs/useTemplateLabelsQuery'

import {
  GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
  TemplateBreakdownAnalyticsDialog
} from './TemplateBreakdownAnalyticsDialog'
import { mockSingleRowData } from './TemplateBreakdownAnalyticsTable/TemplateBreakdownAnalyticsTable.mockData'

vi.mock('@mui/material/useMediaQuery', () => {
  return { __esModule: true, default: vi.fn(() => false) }
})

describe('TemplateBreakdownAnalyticsDialog', () => {
  const formatToParts = Intl.DateTimeFormat.prototype.formatToParts
  const mockHandleClose = vi.fn()
  const journeyId = 'test-journey-id'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date(2025, 11, 24, 12))
    // Keep the existing range regression cases on the fallback format.
    vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const createMock = (
    status: JourneyStatus[],
    date: string | undefined = undefined,
    data: GetTemplateFamilyStatsBreakdown = mockSingleRowData,
    templateId = journeyId
  ): MockLink.MockedResponse<
    GetTemplateFamilyStatsBreakdown,
    GetTemplateFamilyStatsBreakdownVariables
  > => ({
    request: {
      query: GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
      variables: {
        id: templateId,
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

  const createLabelsMock = (
    templateId = journeyId,
    custom1Label: string | null = null
  ) => ({
    request: {
      query: TEMPLATE_LABELS,
      variables: { id: templateId }
    },
    result: {
      data: {
        adminJourney: {
          __typename: 'Journey' as const,
          id: templateId,
          custom1Label,
          custom2Label: null,
          custom3Label: null
        }
      }
    }
  })

  const customTrackingData: GetTemplateFamilyStatsBreakdown = {
    templateFamilyStatsBreakdown:
      mockSingleRowData.templateFamilyStatsBreakdown!.map((row) => ({
        ...row,
        stats: [
          ...row.stats,
          {
            __typename: 'TemplateFamilyStatsEventResponse',
            event: PlausibleEvent.custom1Capture,
            visitors: 12
          },
          {
            __typename: 'TemplateFamilyStatsEventResponse',
            event: PlausibleEvent.custom2Capture,
            visitors: 5
          }
        ]
      }))
  }

  it('warns when labels fail and retries them without interrupting successful stats', async () => {
    const user = userEvent.setup()
    const statuses = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const statsResult = vi.fn(() => ({ data: customTrackingData }))
    render(
      <MockedProvider
        mocks={[
          { ...createMock(statuses), result: statsResult },
          {
            request: createLabelsMock().request,
            error: new Error('Labels unavailable')
          },
          createLabelsMock(journeyId, 'Conversations')
        ]}
      >
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )

    const warning = await screen.findByRole('alert')
    expect(warning).toHaveTextContent('Unable to load custom tracking labels')
    expect(
      screen.getByTestId('template-breakdown-analytics-table')
    ).toBeInTheDocument()
    expect(screen.getByText('Custom Tracking 1')).toBeInTheDocument()
    expect(screen.getAllByText('12')).toHaveLength(2)

    await user.click(within(warning).getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Conversations')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getAllByText('12')).toHaveLength(2)
    expect(statsResult).toHaveBeenCalledOnce()
  })

  it('loads names for the passed template outside the editor and observes cache updates', async () => {
    const cache = new InMemoryCache()
    const statuses = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          createMock(statuses, undefined, customTrackingData),
          createLabelsMock(journeyId, 'Conversations')
        ]}
      >
        <TemplateBreakdownAnalyticsDialog
          journeyId={journeyId}
          open={true}
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )

    expect(await screen.findByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('Custom Tracking 2')).toBeInTheDocument()
    expect(screen.getAllByText('12')).toHaveLength(2)

    act(() => {
      cache.writeQuery({
        query: TEMPLATE_LABELS,
        variables: { id: journeyId },
        data: createLabelsMock(journeyId, 'Follow-ups').result.data
      })
    })

    expect(await screen.findByText('Follow-ups')).toBeInTheDocument()
    expect(screen.queryByText('Conversations')).not.toBeInTheDocument()
    expect(screen.getAllByText('12')).toHaveLength(2)

    act(() => {
      cache.writeQuery({
        query: TEMPLATE_LABELS,
        variables: { id: journeyId },
        data: createLabelsMock().result.data
      })
    })

    expect(await screen.findByText('Custom Tracking 1')).toBeInTheDocument()
    expect(screen.queryByText('Follow-ups')).not.toBeInTheDocument()
  })

  it('uses each report template ID to load independent names', async () => {
    const secondId = 'another-template'
    const statuses = [
      JourneyStatus.published,
      JourneyStatus.draft,
      JourneyStatus.archived
    ]
    const mocks = [
      createMock(statuses, undefined, customTrackingData),
      createLabelsMock(journeyId, 'Conversations'),
      createMock(statuses, undefined, customTrackingData, secondId),
      createLabelsMock(secondId, 'Follow-ups')
    ]
    const renderDialog = (id: string) => (
      <MockedProvider mocks={mocks}>
        <TemplateBreakdownAnalyticsDialog
          journeyId={id}
          open={true}
          handleClose={mockHandleClose}
        />
      </MockedProvider>
    )
    const { rerender } = render(renderDialog(journeyId))
    expect(await screen.findByText('Conversations')).toBeInTheDocument()

    rerender(renderDialog(secondId))

    expect(await screen.findByText('Follow-ups')).toBeInTheDocument()
    expect(screen.queryByText('Conversations')).not.toBeInTheDocument()
    expect(screen.getByText('Custom Tracking 2')).toBeInTheDocument()
  })

  it('should call query with archived journeys included by default', async () => {
    render(
      <MockedProvider
        mocks={[
          getTemplateFamilyStatsBreakdownMockWithArchived,
          createLabelsMock()
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
  })

  it('should toggle archived journeys switch', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider
        mocks={[
          getTemplateFamilyStatsBreakdownMockWithArchived,
          getTemplateFamilyStatsBreakdownMockWithoutArchived,
          createLabelsMock()
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
      <MockedProvider mocks={[loadingMock, createLabelsMock()]}>
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
      <MockedProvider mocks={[errorMock, createLabelsMock()]}>
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

  describe.each([
    ['en-US', ['Month', 'Day', 'Year'], '05/04/2026', '05/06/2026'],
    ['en-NZ', ['Day', 'Month', 'Year'], '04/05/2026', '06/05/2026'],
    ['ja-JP', ['Year', 'Month', 'Day'], '2026/05/04', '2026/05/06'],
    ['en', ['Month', 'Day', 'Year'], '05/04/2026', '05/06/2026']
  ])('browser locale %s', (locale, sectionOrder, fromValue, toValue) => {
    beforeEach(() => {
      vi.setSystemTime(new Date(2026, 4, 15, 12))
      vi.mocked(Intl.DateTimeFormat.prototype.formatToParts).mockReturnValue(
        formatToParts.call(
          new Intl.DateTimeFormat(locale, {
            calendar: 'gregory',
            numberingSystem: 'latn',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          new Date(2026, 4, 4)
        )
      )
    })

    const renderLocalizedDialog = () => {
      const status = [
        JourneyStatus.published,
        JourneyStatus.draft,
        JourneyStatus.archived
      ]
      const link = new MockLink([
        createLabelsMock(),
        { ...createMock(status), maxUsageCount: 2 },
        createMock(status, '2026-05-04,2026-05-06')
      ])
      const request = vi.spyOn(link, 'request')
      render(
        <SnackbarProvider>
          <MockedProvider link={link}>
            <ThemeProvider
              themeName={ThemeName.journeysAdmin}
              themeMode={ThemeMode.light}
            >
              <TemplateBreakdownAnalyticsDialog
                journeyId={journeyId}
                open
                handleClose={mockHandleClose}
              />
            </ThemeProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      return () =>
        request.mock.calls.filter(
          ([operation]) =>
            operation.operationName === 'GetTemplateFamilyStatsBreakdown'
        )
    }

    it('shows matching hints, parses typed dates, and resets to all time', async () => {
      const user = userEvent.setup()
      const request = renderLocalizedDialog()
      await screen.findByTestId('template-breakdown-analytics-table')
      for (const label of ['From', 'To']) {
        const field = within(screen.getAllByRole('group', { name: label })[0])
        expect(
          field
            .getAllByRole('spinbutton')
            .map((section) => section.getAttribute('aria-label'))
        ).toEqual(sectionOrder)
        for (const [section, hint] of [
          ['Day', 'DD'],
          ['Month', 'MM'],
          ['Year', 'YYYY']
        ]) {
          expect(
            field.getByRole('spinbutton', { name: section })
          ).toHaveTextContent(hint)
        }
      }
      for (const [label, day] of [
        ['From', '04'],
        ['To', '06']
      ]) {
        const field = within(screen.getAllByRole('group', { name: label })[0])
        for (const [section, value] of [
          ['Month', '05'],
          ['Day', day],
          ['Year', '2026']
        ]) {
          await user.click(field.getByRole('spinbutton', { name: section }))
          await user.keyboard(value)
        }
      }
      await screen.findByTestId('template-breakdown-analytics-table')
      expect(request()).toHaveLength(2)
      expect(screen.getByLabelText('From', { selector: 'input' })).toHaveValue(
        fromValue
      )
      expect(screen.getByLabelText('To', { selector: 'input' })).toHaveValue(
        toValue
      )
      expect(request()[1][0].variables.where.date).toBe('2026-05-04,2026-05-06')
      await user.click(screen.getByRole('button', { name: 'Reset date range' }))
      await screen.findByTestId('template-breakdown-analytics-table')
      expect(request()[2][0].variables.where).toEqual({
        property: 'event:props:templateKey',
        period: 'all'
      })
    })

    it('sends the same ISO range when days are selected in the calendar', async () => {
      const user = userEvent.setup()
      const request = renderLocalizedDialog()
      await screen.findByTestId('template-breakdown-analytics-table')
      await user.click(
        screen.getAllByRole('button', { name: 'Choose date' })[0]
      )
      await user.click(screen.getByRole('gridcell', { name: '4' }))
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await user.click(
        await screen.findByRole('button', { name: 'Choose date' })
      )
      await user.click(screen.getByRole('gridcell', { name: '6' }))
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await screen.findByTestId('template-breakdown-analytics-table')
      expect(request()).toHaveLength(2)
      expect(request()[1][0].variables.where.date).toBe('2026-05-04,2026-05-06')
      expect(screen.getByLabelText('From', { selector: 'input' })).toHaveValue(
        fromValue
      )
      expect(screen.getByLabelText('To', { selector: 'input' })).toHaveValue(
        toValue
      )
    })
  })

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
          createLabelsMock(),
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
      <MockedProvider
        mocks={[
          createLabelsMock(),
          getTemplateFamilyStatsBreakdownMockWithArchived
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
          createLabelsMock(),
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
      <MockedProvider
        mocks={[
          createLabelsMock(),
          getTemplateFamilyStatsBreakdownMockWithArchived
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
          createLabelsMock(),
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
      createLabelsMock(),
      createMock(status),
      createMock(status, '2025-12-01,2025-12-12')
    ])
    const request = vi.spyOn(link, 'request')
    const analyticsRequests = () =>
      request.mock.calls.filter(
        ([operation]) =>
          operation.operationName === 'GetTemplateFamilyStatsBreakdown'
      )
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
    expect(analyticsRequests()).toHaveLength(1)
    expect(
      screen.queryByTestId('template-breakdown-analytics-table')
    ).not.toBeInTheDocument()
    await screen.findByTestId('template-breakdown-analytics-table')
    expect(analyticsRequests()).toHaveLength(2)
    expect(analyticsRequests()[1][0].variables.where.date).toBe(
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
    expect(analyticsRequests()).toHaveLength(2)
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
          createLabelsMock(),
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
      createLabelsMock(),
      createMock(statuses),
      createMock(statuses, '2025-12-01,2025-12-10'),
      createMock(statuses, undefined, refreshedData)
    ])
    const request = vi.spyOn(link, 'request')
    const analyticsRequests = () =>
      request.mock.calls.filter(
        ([operation]) =>
          operation.operationName === 'GetTemplateFamilyStatsBreakdown'
      )
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
    expect(analyticsRequests()).toHaveLength(3)
    expect(analyticsRequests()[2][0].variables.where).toEqual({
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
    const link = new MockLink([
      createLabelsMock(),
      createMock(statuses),
      createMock(statuses)
    ])
    const request = vi.spyOn(link, 'request')
    const analyticsRequests = () =>
      request.mock.calls.filter(
        ([operation]) =>
          operation.operationName === 'GetTemplateFamilyStatsBreakdown'
      )
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
    expect(analyticsRequests()).toHaveLength(1)
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
    expect(analyticsRequests()).toHaveLength(2)
  })
})
