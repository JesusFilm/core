import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock'
import { SnackbarProvider } from 'notistack'

import { FilterDrawer, GET_JOURNEY_BLOCK_TYPENAMES } from './FilterDrawer'

const mockGoogleSheetsSyncDialog = jest.fn()

jest.mock('./GoogleSheetsSyncDialog', () => ({
  GoogleSheetsSyncDialog: (props) => {
    mockGoogleSheetsSyncDialog(props)
    return props.open ? (
      <div data-testid="google-sheets-sync-dialog">
        Google Sheets Sync Dialog
      </div>
    ) : null
  }
}))

const journeyCreatedAt = '2023-01-01T00:00:00.000Z'
const mockJourneyCreatedAt: MockedResponse = {
  request: {
    query: GET_JOURNEY_BLOCK_TYPENAMES,
    variables: { id: 'journey1' }
  },
  result: {
    data: {
      journey: {
        id: 'journey1',
        createdAt: journeyCreatedAt,
        __typename: 'Journey',
        blockTypenames: [
          'RadioQuestionBlock',
          'MultiselectBlock',
          'IconBlock',
          'SignUpBlock',
          'TextResponseBlock'
        ]
      }
    }
  }
}

const props = {
  journeyId: 'journey1',
  chatStarted: false,
  withPollAnswers: false,
  withSubmittedText: false,
  withIcon: false,
  hideInteractive: false,
  handleClearAll: jest.fn(),
  handleChange: jest.fn((e) => e.target.value),
  disableExportButton: false
}

describe('FilterDrawer', () => {
  beforeEach(() => {
    props.handleClearAll.mockClear()
    props.handleChange.mockClear()
    mockGoogleSheetsSyncDialog.mockClear()
    mockRouter.setCurrentUrl('/journeys')
  })

  it('calls handleClearAll when the clear all button is clicked', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <FilterDrawer {...props} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Clear all'))
    expect(props.handleClearAll).toHaveBeenCalled()
  })

  it('calls handleChange when checkboxes and radio buttons are selected', async () => {
    const { handleChange } = props
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <FilterDrawer {...props} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Chat Started'))
    expect(handleChange).toHaveReturnedWith('Chat Started')
    // Wait for async-rendered options based on block types
    await screen.findByText('Poll Answers')
    fireEvent.click(screen.getByText('Poll Answers'))
    expect(handleChange).toHaveReturnedWith('Poll Answers')
    await screen.findByText('Submitted Text')
    fireEvent.click(screen.getByText('Submitted Text'))
    expect(handleChange).toHaveReturnedWith('Submitted Text')
    await screen.findByText('Icon')
    fireEvent.click(screen.getByText('Icon'))
    expect(handleChange).toHaveReturnedWith('Icon')
    fireEvent.click(screen.getByText('Hide Inactive'))
    expect(handleChange).toHaveReturnedWith('Hide Inactive')
    fireEvent.click(screen.getByRole('radio', { name: 'Duration' }))
    expect(handleChange).toHaveReturnedWith('duration')
    expect(screen.getByRole('radio', { name: 'Date' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'Date' }))
    expect(handleChange).toHaveReturnedWith('date')
    expect(screen.getByRole('radio', { name: 'Duration' })).not.toBeChecked()
  })

  describe('export button interactions', () => {
    it('should not render the export button if journeyId is not provided', async () => {
      const { journeyId, ...rest } = props

      render(
        <MockedProvider mocks={[mockJourneyCreatedAt]}>
          <FilterDrawer {...rest} />
        </MockedProvider>
      )

      expect(
        screen.queryByRole('button', { name: 'Export Data' })
      ).not.toBeInTheDocument()
    })

    it('should disable export button if disableExportButton is true', async () => {
      const { disableExportButton, ...rest } = props

      render(
        <MockedProvider>
          <FilterDrawer {...rest} disableExportButton />
        </MockedProvider>
      )

      expect(screen.getByRole('button', { name: /Export Data/ })).toBeDisabled()
    })

    it('opens the export dialog when export button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SnackbarProvider>
          <MockedProvider mocks={[mockJourneyCreatedAt]}>
            <FilterDrawer {...props} />
          </MockedProvider>
        </SnackbarProvider>
      )

      const exportButton = screen.getByRole('button', { name: 'Export Data' })
      expect(exportButton).toBeInTheDocument()

      expect(screen.queryByText('Export Analytics')).not.toBeInTheDocument()

      await user.click(exportButton)

      await waitFor(() => {
        expect(screen.getByText('Export Analytics')).toBeInTheDocument()
      })
    })

    it('closes the export dialog when the dialog close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SnackbarProvider>
          <MockedProvider mocks={[mockJourneyCreatedAt]}>
            <FilterDrawer {...props} />
          </MockedProvider>
        </SnackbarProvider>
      )

      // Open the dialog
      const exportButton = screen.getByRole('button', { name: 'Export Data' })
      await user.click(exportButton)
      await waitFor(() => {
        expect(screen.getByText('Export Analytics')).toBeInTheDocument()
      })

      const closeButton = screen.getByTestId('dialog-close-button')
      await user.click(closeButton)

      // Check dialog is closed after click
      await waitFor(() => {
        expect(screen.queryByText('Export Analytics')).not.toBeInTheDocument()
      })
    })
  })

  describe('google sheets sync dialog interactions', () => {
    it('opens the sync dialog when the button is clicked', async () => {
      mockRouter.setCurrentUrl('/journeys')
      const user = userEvent.setup()
      render(
        <MockedProvider mocks={[mockJourneyCreatedAt]}>
          <FilterDrawer {...props} />
        </MockedProvider>
      )

      expect(
        screen.queryByTestId('google-sheets-sync-dialog')
      ).not.toBeInTheDocument()

      const syncButton = screen.getByRole('button', {
        name: 'Sync to Google Sheets'
      })
      await user.click(syncButton)

      await waitFor(() =>
        expect(
          screen.getByTestId('google-sheets-sync-dialog')
        ).toBeInTheDocument()
      )
    })

    it('automatically opens the sync dialog when the URL has openSyncDialog', async () => {
      mockRouter.setCurrentUrl('/journeys?openSyncDialog=true')

      render(
        <MockedProvider mocks={[mockJourneyCreatedAt]}>
          <FilterDrawer {...props} />
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          screen.getByTestId('google-sheets-sync-dialog')
        ).toBeInTheDocument()
      )
    })
  })
})
