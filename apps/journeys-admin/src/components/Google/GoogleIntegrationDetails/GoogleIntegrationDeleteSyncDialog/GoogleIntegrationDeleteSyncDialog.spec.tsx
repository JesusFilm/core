import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  DELETE_GOOGLE_SHEETS_SYNC,
  GoogleIntegrationDeleteSyncDialog
} from './GoogleIntegrationDeleteSyncDialog'

import '../../../../../test/i18n'

describe('GoogleIntegrationDeleteSyncDialog', () => {
  const syncsQueryDocument = {} as any

  const baseMock: MockedResponse = {
    request: {
      query: DELETE_GOOGLE_SHEETS_SYNC,
      variables: {
        id: 'syncId'
      }
    },
    result: {
      data: {
        googleSheetsSyncDelete: {
          id: 'syncId'
        }
      }
    }
  }

  it('calls delete mutation and closes on confirm', async () => {
    const handleClose = jest.fn()

    const { getByRole } = render(
      <MockedProvider mocks={[baseMock]} addTypename={false}>
        <SnackbarProvider>
          <GoogleIntegrationDeleteSyncDialog
            open
            syncId="syncId"
            integrationId="integrationId"
            syncsQueryDocument={syncsQueryDocument}
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete Sync' }))

    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('does not call mutation when required data is missing', async () => {
    const handleClose = jest.fn()

    const { getByRole } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SnackbarProvider>
          <GoogleIntegrationDeleteSyncDialog
            open
            syncId={null}
            integrationId={undefined}
            syncsQueryDocument={syncsQueryDocument}
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete Sync' }))

    await waitFor(() => expect(handleClose).not.toHaveBeenCalled())
  })
})

