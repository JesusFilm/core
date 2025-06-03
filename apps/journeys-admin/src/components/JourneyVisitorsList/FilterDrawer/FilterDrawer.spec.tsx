import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables
} from '../../../../__generated__/GetJourneyCreatedAt'

import { GET_JOURNEY_CREATED_AT } from './ExportDialog/ExportDialog'
import { FilterDrawer } from './FilterDrawer'

const journeyCreatedAt = '2023-01-01T00:00:00.000Z'
const mockJourneyCreatedAt: MockedResponse<
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables
> = {
  request: {
    query: GET_JOURNEY_CREATED_AT,
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
    fireEvent.click(screen.getByText('Poll Answers'))
    expect(handleChange).toHaveReturnedWith('Poll Answers')
    fireEvent.click(screen.getByText('Submitted Text'))
    expect(handleChange).toHaveReturnedWith('Submitted Text')
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

      expect(
        screen.queryByRole('button', { name: 'Export Data' })
      ).toBeDisabled()
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
})
