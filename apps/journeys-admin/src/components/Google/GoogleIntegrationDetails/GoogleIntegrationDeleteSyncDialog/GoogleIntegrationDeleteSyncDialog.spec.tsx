import { gql } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  DELETE_GOOGLE_SHEETS_SYNC,
  GoogleIntegrationDeleteSyncDialog
} from './GoogleIntegrationDeleteSyncDialog'

import '../../../../../test/i18n'

describe('GoogleIntegrationDeleteSyncDialog', () => {
  const syncsQueryDocument = gql`
    query GoogleSheetsSyncsByIntegrationTest(
      $filter: GoogleSheetsSyncsFilter!
    ) {
      googleSheetsSyncs(filter: $filter) {
        id
      }
    }
  `

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

  const syncsQueryMock: MockedResponse = {
    request: {
      query: syncsQueryDocument,
      variables: {
        filter: { integrationId: 'integrationId' }
      }
    },
    result: {
      data: {
        googleSheetsSyncs: []
      }
    }
  }

  it('calls delete mutation and closes on confirm', async () => {
    const handleClose = jest.fn()

    const { getByRole } = render(
      <MockedProvider mocks={[baseMock, syncsQueryMock]} addTypename={false}>
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
            integrationId="integrationId"
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
