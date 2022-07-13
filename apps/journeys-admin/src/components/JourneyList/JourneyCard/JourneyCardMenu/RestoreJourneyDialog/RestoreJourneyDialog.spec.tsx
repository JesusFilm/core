import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { noop } from 'lodash'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JOURNEY_RESTORE } from './RestoreJourneyDialog'
import { RestoreJourneyDialog } from '.'

describe('RestoreJourneyDialog', () => {
  it('should restore journey to published', async () => {
    const handleClose = jest.fn()
    const result = jest.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.published
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id={'journey-id'}
            published={true}
            open={true}
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey Restored')).toBeInTheDocument()
  })

  it('should restore journey to draft', async () => {
    const handleClose = jest.fn()
    const result = jest.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.draft
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id={'journey-id'}
            published={false}
            open={true}
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey Restored')).toBeInTheDocument()
  })

  it('should show error if trash fails', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            error: new Error('Error')
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id={'journey-id'}
            published={false}
            open={true}
            handleClose={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(getByText('Error')).toBeInTheDocument())
  })
})
