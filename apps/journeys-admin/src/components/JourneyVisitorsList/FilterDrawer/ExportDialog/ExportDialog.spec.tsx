import { fireEvent, render, screen } from '@testing-library/react'

import { EventType } from '../../../../../__generated__/globalTypes'

import { ExportDialog } from './ExportDialog'

describe('ExportDialog', () => {
  const onClose = jest.fn()
  const onExport = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all checkboxes checked by default', () => {
    render(<ExportDialog open onClose={onClose} onExport={onExport} />)

    // Check "All" checkbox
    const allCheckbox = screen.getByRole('checkbox', { name: 'All' })
    expect(allCheckbox).toBeChecked()

    // Check individual checkboxes
    expect(screen.getByRole('checkbox', { name: 'Journey View' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Chat Opened' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Poll options' })).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Button Clicks' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Submitted text' })
    ).toBeChecked()

    // Check Video Events and its children
    expect(screen.getByRole('checkbox', { name: 'Video Events' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Start' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Play' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pause' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Complete' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Progress' })).toBeChecked()
  })

  it('should uncheck "All" when any checkbox is unchecked', () => {
    render(<ExportDialog open onClose={onClose} onExport={onExport} />)

    const allCheckbox = screen.getByRole('checkbox', { name: 'All' })
    const journeyViewCheckbox = screen.getByRole('checkbox', {
      name: 'Journey View'
    })

    fireEvent.click(journeyViewCheckbox)

    expect(allCheckbox).not.toBeChecked()
    expect(journeyViewCheckbox).not.toBeChecked()
  })

  it('should check/uncheck all video events when video events parent is checked/unchecked', () => {
    render(<ExportDialog open onClose={onClose} onExport={onExport} />)

    const videoEventsCheckbox = screen.getByRole('checkbox', {
      name: 'Video Events'
    })

    // Uncheck video events
    fireEvent.click(videoEventsCheckbox)

    expect(screen.getByRole('checkbox', { name: 'Start' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Play' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pause' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Complete' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Progress' })).not.toBeChecked()

    // Check video events again
    fireEvent.click(videoEventsCheckbox)

    expect(screen.getByRole('checkbox', { name: 'Start' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Play' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pause' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Complete' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Progress' })).toBeChecked()
  })

  it('should show video events parent in indeterminate state when some children are checked', () => {
    render(<ExportDialog open onClose={onClose} onExport={onExport} />)

    const startCheckbox = screen.getByRole('checkbox', { name: 'Start' })
    const videoEventsCheckbox = screen.getByRole('checkbox', {
      name: 'Video Events'
    })

    fireEvent.click(startCheckbox)

    expect(videoEventsCheckbox.indeterminate).toBe(true)
  })

  it('should call onExport with correct event types when export button is clicked', async () => {
    render(<ExportDialog open onClose={onClose} onExport={onExport} />)

    // Uncheck some options
    fireEvent.click(screen.getByRole('checkbox', { name: 'Journey View' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chat Opened' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Start' }))

    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })
    fireEvent.click(exportButton)

    expect(onExport).toHaveBeenCalledWith([
      EventType.RadioQuestionSubmissionEvent,
      EventType.ButtonClickEvent,
      EventType.SignUpSubmissionEvent,
      EventType.TextResponseSubmissionEvent,
      EventType.VideoPlayEvent,
      EventType.VideoPauseEvent,
      EventType.VideoCompleteEvent,
      EventType.VideoProgressEvent
    ])
  })

  it('should call onClose when close button is clicked', () => {
    render(<ExportDialog open onClose={onClose} onExport={onExport} />)

    const closeButton = screen.getByTestId('dialog-close-button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })
})
