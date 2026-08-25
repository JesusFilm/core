import { gql } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
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

  const baseMock: MockLink.MockedResponse = {
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

  const syncsQueryMock: MockLink.MockedResponse = {
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
    const handleClose = vi.fn()

    const { getByRole } = render(
      <MockedProvider mocks={[baseMock, syncsQueryMock]}>
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
    const handleClose = vi.fn()

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
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
