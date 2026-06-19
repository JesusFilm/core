import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery'
import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { useUserTeamsAndInvitesQuery } from '../../../libs/useUserTeamsAndInvitesQuery'

import {
  GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION,
  GoogleIntegrationDetails
} from './GoogleIntegrationDetails'

import '../../../../test/i18n'

vi.mock('next/router', () => ({
  useRouter: vi.fn()
}))

vi.mock('../../../libs/useIntegrationQuery', () => ({
  useIntegrationQuery: vi.fn()
}))

vi.mock('../../../libs/useCurrentUserLazyQuery', () => ({
  useCurrentUserLazyQuery: vi.fn()
}))

vi.mock('../../../libs/useUserTeamsAndInvitesQuery', () => ({
  useUserTeamsAndInvitesQuery: vi.fn()
}))

vi.mock(
  './GoogleIntegrationRemoveDialog/GoogleIntegrationRemoveDialog',
  () => ({
    GoogleIntegrationRemoveDialog: () => <div>Remove Dialog</div>
  })
)

vi.mock(
  './GoogleIntegrationDeleteSyncDialog/GoogleIntegrationDeleteSyncDialog',
  () => ({
    GoogleIntegrationDeleteSyncDialog: () => <div>Delete Sync Dialog</div>
  })
)

describe('GoogleIntegrationDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupMocks({
    canManageSyncs = true,
    integrations = [
      {
        id: 'integrationId',
        accountEmail: 'user@example.com',
        user: {
          id: 'userId',
          __typename: 'AuthenticatedUser',
          email: 'user@example.com'
        }
      }
    ]
  }: {
    canManageSyncs?: boolean
    integrations?: Array<{
      id: string
      accountEmail?: string
      user?: { id: string; __typename: 'AuthenticatedUser'; email: string }
    }>
  }): void {
    ;(useRouter as Mock).mockReturnValue({
      query: {
        teamId: 'teamId',
        integrationId: 'integrationId'
      }
    })
    ;(useIntegrationQuery as Mock).mockReturnValue({
      data: {
        integrations
      },
      loading: false
    })
    ;(useCurrentUserLazyQuery as Mock).mockReturnValue({
      loadUser: vi.fn(),
      data: {
        id: 'userId',
        __typename: 'AuthenticatedUser',
        email: 'user@example.com'
      }
    })
    ;(useUserTeamsAndInvitesQuery as Mock).mockReturnValue({
      data: {
        userTeams: canManageSyncs
          ? [
              {
                user: {
                  id: 'userId',
                  __typename: 'AuthenticatedUser',
                  email: 'user@example.com'
                },
                role: UserTeamRole.manager
              }
            ]
          : []
      }
    })
  }

  function getGoogleSheetsSyncsMock(): MockedResponse {
    return {
      request: {
        query: GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION,
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
  }

  it('renders integration information and actions', () => {
    setupMocks({})

    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getGoogleSheetsSyncsMock()]} addTypename={false}>
        <SnackbarProvider>
          <GoogleIntegrationDetails />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Connected Google Account')).toBeInTheDocument()
    expect(getByText('user@example.com')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('disables remove button when user cannot manage syncs', () => {
    setupMocks({ canManageSyncs: false })

    const { getByRole } = render(
      <MockedProvider mocks={[getGoogleSheetsSyncsMock()]} addTypename={false}>
        <SnackbarProvider>
          <GoogleIntegrationDetails />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Remove' })).toBeDisabled()
  })

  it.skip('opens delete sync dialog when delete action is clicked', async () => {
    setupMocks({})

    const googleSheetsSyncsMock: MockedResponse = {
      request: {
        query: GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION,
        variables: {
          filter: { integrationId: 'integrationId' }
        }
      },
      result: {
        data: {
          googleSheetsSyncs: [
            {
              id: 'syncId',
              spreadsheetId: 'sheetId',
              sheetName: 'Sheet 1',
              email: 'email@example.com',
              deletedAt: null,
              createdAt: new Date().toISOString(),
              journey: {
                id: 'journeyId',
                slug: 'journey-slug',
                title: 'Journey Title'
              }
            }
          ]
        }
      }
    }

    const { getByRole, getByText } = render(
      <MockedProvider mocks={[googleSheetsSyncsMock]} addTypename={false}>
        <SnackbarProvider>
          <GoogleIntegrationDetails />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByRole('button', { name: 'Delete sync' })).toBeInTheDocument()
    )

    fireEvent.click(getByRole('button', { name: 'Delete sync' }))

    await waitFor(() =>
      expect(getByText('Delete Sync Dialog')).toBeInTheDocument()
    )
  })
})
