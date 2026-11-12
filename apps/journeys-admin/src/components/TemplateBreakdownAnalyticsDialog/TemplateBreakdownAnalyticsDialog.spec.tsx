import { InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { formatISO } from 'date-fns'
import { type MockedFunction } from 'vitest'

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
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/buildPresetDateRange'

import {
  GET_TEMPLATE_FAMILY_STATS_BREAKDOWN,
  TemplateBreakdownAnalyticsDialog
} from './TemplateBreakdownAnalyticsDialog'
import { mockSingleRowData } from './TemplateBreakdownAnalyticsTable/TemplateBreakdownAnalyticsTable.mockData'

vi.mock('@mui/material/useMediaQuery', () => {
  return { __esModule: true, default: vi.fn(() => false) }
})

vi.mock('date-fns', async () => {
  return {
    ...(await vi.importActual('date-fns')),
    formatISO: vi.fn()
  }
})

const mockFormatISO = formatISO as MockedFunction<typeof formatISO>

describe('TemplateBreakdownAnalyticsDialog', () => {
  const mockHandleClose = vi.fn()
  const journeyId = 'test-journey-id'
  const mockCurrentDate = '2025-12-24'
  const expectedDate = `${earliestStatsCollected},${mockCurrentDate}`

  beforeEach(() => {
    vi.clearAllMocks()
    mockFormatISO.mockReturnValue(mockCurrentDate)
  })

  const createMock = (
    status: JourneyStatus[],
    templateId = journeyId,
    data = mockSingleRowData
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
          createMock(statuses, journeyId, customTrackingData),
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
      createMock(statuses, journeyId, customTrackingData),
      createLabelsMock(journeyId, 'Conversations'),
      createMock(statuses, secondId, customTrackingData),
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
})
