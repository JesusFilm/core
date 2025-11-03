import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables
} from '../../../../__generated__/GetJourneyCreatedAt'
import { GET_JOURNEY_CREATED_AT } from '../FilterDrawer/ExportDialog/ExportDialog'

import { ExportEventsButton } from './ExportEventsButton'

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

describe('ExportEventsButton', () => {
  it('should render download button when not downloading', () => {
    render(
      <MockedProvider mocks={[]}>
        <ExportEventsButton journeyId="journey1" disabled={false} />
      </MockedProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeVisible()
  })

  it('should show the export dialog when button is clicked', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[mockJourneyCreatedAt]}>
          <ExportEventsButton journeyId="journey1" disabled={false} />
        </MockedProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    const exportButton = screen.getByRole('button')
    expect(exportButton).toBeInTheDocument()

    await user.click(exportButton)

    await waitFor(() => {
      expect(screen.getByText('Export Analytics')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('dialog-close-button'))

    await waitFor(() => {
      expect(screen.queryByText('Export Analytics')).not.toBeInTheDocument()
    })
  })

  it('should disable button when disabled is true', () => {
    render(
      <MockedProvider mocks={[]}>
        <ExportEventsButton journeyId="journey1" disabled={true} />
      </MockedProvider>
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
