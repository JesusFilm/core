import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EventType } from '../../../../../../__generated__/globalTypes'

import { FilterForm } from './FilterForm'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

describe('FilterForm', () => {
  const mockSetSelectedEvents = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all checkboxes with correct initial state', () => {
    render(<FilterForm setSelectedEvents={mockSetSelectedEvents} />)

    // Check if all regular events are rendered
    expect(screen.getByLabelText('Journey Start')).toBeInTheDocument()
    expect(screen.getByLabelText('Chat Open')).toBeInTheDocument()
    expect(screen.getByLabelText('Text Submission')).toBeInTheDocument()
    expect(screen.getByLabelText('Poll Selection')).toBeInTheDocument()
    expect(screen.getByLabelText('Button Click')).toBeInTheDocument()
    expect(screen.getByLabelText('Subscription')).toBeInTheDocument()

    // Check if video events section is rendered
    expect(screen.getByLabelText('Video Events')).toBeInTheDocument()

    // Check initial state - all checkboxes should be checked
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Journey Start')).toBeChecked()
    expect(screen.getByLabelText('Video Events')).toBeChecked()
  })

  it('handles "Select All" checkbox correctly', () => {
    render(<FilterForm setSelectedEvents={mockSetSelectedEvents} />)
    const selectAllCheckbox = screen.getByLabelText('All')

    // Uncheck all
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).not.toBeChecked()
    expect(screen.getByLabelText('Journey Start')).not.toBeChecked()
    expect(screen.getByLabelText('Video Events')).not.toBeChecked()

    // Check all again
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expect(screen.getByLabelText('Journey Start')).toBeChecked()
    expect(screen.getByLabelText('Video Events')).toBeChecked()
  })

  it('expands and collapses video events section', async () => {
    render(<FilterForm setSelectedEvents={mockSetSelectedEvents} />)

    // Initially video events should be collapsed
    expect(
      screen.queryByRole('checkbox', { name: 'Start' })
    ).not.toBeInTheDocument()

    // Expand video events
    fireEvent.click(screen.getByTestId('video-events-expander'))

    expect(screen.getByRole('checkbox', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Pause' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Complete' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Progress' })
    ).toBeInTheDocument()

    // Collapse video events
    fireEvent.click(screen.getByTestId('video-events-expander'))
    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', { name: 'Start' })
      ).not.toBeInTheDocument()
    })
  })

  it('handles video events selection correctly', () => {
    render(<FilterForm setSelectedEvents={mockSetSelectedEvents} />)

    // Expand video events
    fireEvent.click(screen.getByTestId('video-events-expander'))

    // Uncheck all video events
    fireEvent.click(screen.getByLabelText('Video Events'))
    expect(screen.getByLabelText('Start')).not.toBeChecked()
    expect(screen.getByLabelText('Play')).not.toBeChecked()
    expect(screen.getByLabelText('Complete')).not.toBeChecked()

    // Check all video events again
    fireEvent.click(screen.getByLabelText('Video Events'))
    expect(screen.getByLabelText('Start')).toBeChecked()
    expect(screen.getByLabelText('Play')).toBeChecked()
    expect(screen.getByLabelText('Complete')).toBeChecked()
  })

  it('calls setSelectedEvents with correct event types', () => {
    render(<FilterForm setSelectedEvents={mockSetSelectedEvents} />)

    // Initially all events should be selected
    expect(mockSetSelectedEvents).toHaveBeenCalledWith(
      expect.arrayContaining([
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
      ])
    )

    // Uncheck one event
    fireEvent.click(screen.getByLabelText('Journey Start'))

    // Verify the callback excludes the unchecked event
    const lastCall =
      mockSetSelectedEvents.mock.calls[
        mockSetSelectedEvents.mock.calls.length - 1
      ][0]
    expect(lastCall).not.toContain(EventType.JourneyViewEvent)
  })

  it('handles indeterminate state for video events', () => {
    render(<FilterForm setSelectedEvents={mockSetSelectedEvents} />)

    // Expand video events
    fireEvent.click(screen.getByTestId('video-events-expander'))

    // Uncheck one video event
    fireEvent.click(screen.getByLabelText('Start'))

    // Video Events checkbox should be in indeterminate state
    const videoEventsCheckbox = screen.getByLabelText('Video Events')
    expect(videoEventsCheckbox).toHaveAttribute('data-indeterminate', 'true')
  })
})
