import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery'
import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { useUserTeamsAndInvitesQuery } from '../../../libs/useUserTeamsAndInvitesQuery'

import {
  GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION,
  GoogleIntegrationDetails
} from './GoogleIntegrationDetails'

import '../../../../test/i18n'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('../../../libs/useIntegrationQuery', () => ({
  useIntegrationQuery: jest.fn()
}))

jest.mock('../../../libs/useCurrentUserLazyQuery', () => ({
  useCurrentUserLazyQuery: jest.fn()
}))

jest.mock('../../../libs/useUserTeamsAndInvitesQuery', () => ({
  useUserTeamsAndInvitesQuery: jest.fn()
}))

jest.mock(
  './GoogleIntegrationRemoveDialog/GoogleIntegrationRemoveDialog',
  () => ({
    GoogleIntegrationRemoveDialog: () => <div>Remove Dialog</div>
  })
)

jest.mock(
  './GoogleIntegrationDeleteSyncDialog/GoogleIntegrationDeleteSyncDialog',
  () => ({
    GoogleIntegrationDeleteSyncDialog: () => <div>Delete Sync Dialog</div>
  })
)

describe('GoogleIntegrationDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function setupMocks({
    canManageSyncs = true,
    integrations = [
      {
        __typename: 'IntegrationGoogle' as const,
        id: 'integrationId',
        accountEmail: 'user@example.com',
        oauthStale: false,
        user: { id: 'userId' }
      }
    ]
  }: {
    canManageSyncs?: boolean
    integrations?: Array<{
      __typename?: 'IntegrationGoogle'
      id: string
      accountEmail?: string
      oauthStale?: boolean
      user?: { id: string }
    }>
  }): void {
    ;(useRouter as jest.Mock).mockReturnValue({
      query: {
        teamId: 'teamId',
        integrationId: 'integrationId'
      }
    })
    ;(useIntegrationQuery as jest.Mock).mockReturnValue({
      data: {
        integrations
      },
      loading: false
    })
    ;(useCurrentUserLazyQuery as jest.Mock).mockReturnValue({
      loadUser: jest.fn(),
      data: {
        id: 'userId'
      }
    })
    ;(useUserTeamsAndInvitesQuery as jest.Mock).mockReturnValue({
      data: {
        userTeams: canManageSyncs
          ? [
              {
                user: { id: 'userId' },
                role: UserTeamRole.manager
              }
            ]
          : []
      }
    })
  }

  it('renders integration information and actions', () => {
    setupMocks({})

    const { getByText, getByRole } = render(
      <MockedProvider mocks={[]}>
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
    // User is not the integration owner (different userId) and not a team manager
    setupMocks({
      canManageSyncs: false,
      integrations: [
        {
          __typename: 'IntegrationGoogle' as const,
          id: 'integrationId',
          accountEmail: 'user@example.com',
          oauthStale: false,
          user: { id: 'differentUserId' } // Different user owns this integration
        }
      ]
    })

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
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
