import { gql } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { EventType } from '../../../../../__generated__/globalTypes'
import { useJourneyEventsExport } from '../../../../libs/useJourneyEventsExport'

import { DateRangePickerProps } from './DateRangePicker'
import { ExportDialog } from './ExportDialog'

jest.mock('../../../../libs/useJourneyEventsExport', () => ({
  useJourneyEventsExport: jest.fn()
}))
jest.mock('./DateRangePicker', () => ({
  DateRangePicker: ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
  }: DateRangePickerProps): ReactElement => (
    <div>
      <input
        data-testid="start-date-picker"
        type="date"
        value={startDate?.toISOString().split('T')[0] ?? ''}
        onChange={(e) =>
          onStartDateChange(e.target.value ? new Date(e.target.value) : null)
        }
      />
      <input
        data-testid="end-date-picker"
        type="date"
        value={endDate?.toISOString().split('T')[0] ?? ''}
        onChange={(e) =>
          onEndDateChange(e.target.value ? new Date(e.target.value) : null)
        }
      />
    </div>
  )
}))

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const GET_JOURNEY_CREATED_AT_MOCK_QUERY = gql`
  query GetJourneyCreatedAt($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
      __typename
    }
  }
`

const mockExportJourneyEvents = jest.fn()
const mockOnClose = jest.fn()

const journeyCreatedAt = '2023-01-01T00:00:00.000Z'
const mockJourneyCreatedAt = {
  request: {
    query: GET_JOURNEY_CREATED_AT_MOCK_QUERY,
    variables: { id: 'journey1' }
  },
  result: {
    data: {
      journey: {
        id: 'journey1',
        createdAt: journeyCreatedAt,
        __typename: 'Journey'
      }
    }
  }
}

const defaultProps = {
  open: true,
  onClose: mockOnClose,
  journeyId: 'journey1'
}

// Define event type groups for clarity in video group tests
const VIDEO_EVENT_TYPES = [
  EventType.VideoStartEvent,
  EventType.VideoPlayEvent,
  EventType.VideoPauseEvent,
  EventType.VideoCompleteEvent,
  EventType.VideoProgressEvent
]
const REGULAR_EVENT_TYPES = [
  EventType.JourneyViewEvent,
  EventType.ChatOpenEvent,
  EventType.TextResponseSubmissionEvent,
  EventType.RadioQuestionSubmissionEvent,
  EventType.ButtonClickEvent,
  EventType.SignUpSubmissionEvent
]

describe('ExportDialog', () => {
  let user

  beforeEach(() => {
    jest.clearAllMocks()
    user = userEvent.setup()
    ;(useJourneyEventsExport as jest.Mock).mockReturnValue({
      exportJourneyEvents: mockExportJourneyEvents
    })
  })

  it('should render correctly with initial state', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Journey Start')).toBeChecked()
    expect(screen.getByRole('button', { name: 'Export (CSV)' })).toBeEnabled()
  })

  it('should call export function with default filters on button click', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockExportJourneyEvents).toHaveBeenCalledWith({
        journeyId: 'journey1',
        filter: {
          typenames: [
            EventType.JourneyViewEvent,
            EventType.ChatOpenEvent,
            EventType.TextResponseSubmissionEvent,
            EventType.RadioQuestionSubmissionEvent,
            EventType.ButtonClickEvent,
            EventType.SignUpSubmissionEvent,
            EventType.VideoStartEvent,
            EventType.VideoPlayEvent,
            EventType.VideoPauseEvent,
            EventType.VideoCompleteEvent,
            EventType.VideoProgressEvent
          ],
          periodRangeStart: journeyCreatedAt,
          periodRangeEnd: expect.any(String) // End date defaults to now
        }
      })
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call export function with updated filters after changing selections', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('video-events-expander'))
    await user.click(screen.getByLabelText('Chat Open'))
    await user.click(screen.getByLabelText('Start'))

    await waitFor(() => {
      expect(screen.getByLabelText('Start')).not.toBeChecked()
      expect(screen.getByLabelText('Chat Open')).not.toBeChecked()
    })

    const startDatePicker = screen.getByTestId('start-date-picker')
    const endDatePicker = screen.getByTestId('end-date-picker')
    fireEvent.change(startDatePicker, { target: { value: '2023-02-10' } })
    fireEvent.change(endDatePicker, { target: { value: '2023-03-15' } })

    await user.click(screen.getByRole('button', { name: 'Export (CSV)' }))

    // Define expected types based on initial state minus unchecked ones
    const initialCheckedTypes = [
      EventType.JourneyViewEvent,
      EventType.ChatOpenEvent, // Initially checked
      EventType.TextResponseSubmissionEvent,
      EventType.RadioQuestionSubmissionEvent,
      EventType.ButtonClickEvent,
      EventType.SignUpSubmissionEvent,
      EventType.VideoStartEvent, // Initially checked
      EventType.VideoPlayEvent,
      EventType.VideoPauseEvent,
      EventType.VideoCompleteEvent,
      EventType.VideoProgressEvent
    ]
    const expectedEventTypes = initialCheckedTypes.filter(
      (type) =>
        type !== EventType.ChatOpenEvent && type !== EventType.VideoStartEvent
    )

    await waitFor(() => {
      expect(mockExportJourneyEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          // Check outer object structure
          journeyId: 'journey1',
          filter: expect.objectContaining({
            // Check filter object structure
            periodRangeStart: '2023-02-10T00:00:00.000Z',
            periodRangeEnd: '2023-03-15T00:00:00.000Z',
            typenames: expect.arrayContaining(expectedEventTypes) // Check if received contains expected (order-independent)
          })
        })
      )
      // Additionally check the length to ensure no extra elements
      expect(
        mockExportJourneyEvents.mock.calls[0][0].filter.typenames
      ).toHaveLength(expectedEventTypes.length)
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should disable export button when no events are selected', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    const allCheckbox = screen.getByLabelText('All')
    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })

    expect(exportButton).toBeEnabled()
    await user.click(allCheckbox)
    expect(exportButton).toBeDisabled()

    await user.click(screen.getByLabelText('Journey Start'))
    expect(exportButton).toBeEnabled()
  })

  it('should show error snackbar when export fails', async () => {
    const error = new Error('Export failed miserably')
    mockExportJourneyEvents.mockRejectedValueOnce(error)

    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(error.message, {
        variant: 'error'
      })
    })
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should close dialog on successful export', async () => {
    mockExportJourneyEvents.mockResolvedValueOnce(undefined)

    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockExportJourneyEvents).toHaveBeenCalled()
    })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should export only regular events when "Video Events" group is unchecked', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Video Events'))

    await waitFor(() => {
      VIDEO_EVENT_TYPES.forEach((type) => {
        if (type === EventType.VideoStartEvent) {
          expect(screen.getByLabelText('Start')).not.toBeChecked()
        }
      })
    })

    await user.click(screen.getByRole('button', { name: 'Export (CSV)' }))

    await waitFor(() => {
      expect(mockExportJourneyEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            typenames: expect.arrayContaining(REGULAR_EVENT_TYPES)
          })
        })
      )
      // Ensure no video events are included
      const receivedTypes =
        mockExportJourneyEvents.mock.calls[0][0].filter.typenames
      expect(receivedTypes).toHaveLength(REGULAR_EVENT_TYPES.length)
      VIDEO_EVENT_TYPES.forEach((videoType) => {
        expect(receivedTypes).not.toContain(videoType)
      })
    })
  })

  it('should select all video events when indeterminate "Video Events" group is clicked', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('video-events-expander'))
    await user.click(screen.getByLabelText('Start'))
    await waitFor(() => {
      expect(screen.getByLabelText('Start')).not.toBeChecked()
    })

    await user.click(screen.getByLabelText('Video Events'))

    await waitFor(() => {
      expect(screen.getByLabelText('Start')).toBeChecked()
      expect(screen.getByLabelText('Video Events')).toBeChecked()
      const videoCheckboxInput = screen.getByLabelText('Video Events') // Get input directly
      expect(videoCheckboxInput).toHaveAttribute('data-indeterminate', 'false')
    })

    await user.click(screen.getByRole('button', { name: 'Export (CSV)' }))

    await waitFor(() => {
      expect(mockExportJourneyEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            typenames: expect.arrayContaining([
              ...REGULAR_EVENT_TYPES,
              ...VIDEO_EVENT_TYPES
            ])
          })
        })
      )
      const receivedTypes =
        mockExportJourneyEvents.mock.calls[0][0].filter.typenames
      expect(receivedTypes).toHaveLength(
        REGULAR_EVENT_TYPES.length + VIDEO_EVENT_TYPES.length
      )
    })
  })

  it('should show indeterminate state for "Video Events" when some are selected', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(journeyCreatedAt.split('T')[0])
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('video-events-expander'))
    await user.click(screen.getByLabelText('Start'))

    await waitFor(() => {
      const videoCheckboxInput = screen.getByLabelText('Video Events') // Get input directly
      expect(videoCheckboxInput).toHaveAttribute('data-indeterminate', 'true')
    })
  })
})
