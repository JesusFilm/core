import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../../__generated__/globalTypes'

import { JOURNEY_DELETE } from './DeleteJourneyDialog'

import { DeleteJourneyDialog } from '.'

describe('DeleteJourneyDialog', () => {
  it('should change journey status to delete', async () => {
    const handleClose = jest.fn()
    const result = jest.fn(() => ({
      data: {
        journeysDelete: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.deleted
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DELETE,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <DeleteJourneyDialog id="journey-id" open handleClose={handleClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey Deleted')).toBeInTheDocument()
  })

  it('should show error if delete fails', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DELETE,
              variables: {
                ids: ['journey-id']
              }
            },
            error: new Error('Error')
          }
        ]}
      >
        <SnackbarProvider>
          <DeleteJourneyDialog id="journey-id" open handleClose={noop} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(getByText('Error')).toBeInTheDocument())
  })
})
