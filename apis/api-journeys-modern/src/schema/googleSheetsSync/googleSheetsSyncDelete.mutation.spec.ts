import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('googleSheetsSyncDelete', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const GOOGLE_SHEETS_SYNC_DELETE_MUTATION = graphql(`
    mutation GoogleSheetsSyncDelete($id: ID!) {
      googleSheetsSyncDelete(id: $id) {
        id
        deletedAt
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('should delete sync when user is integration owner', async () => {
    const mockSync = {
      id: 'sync-id',
      journeyId: 'journey-id',
      teamId: 'team-id',
      deletedAt: null,
      team: {
        id: 'team-id',
        userTeams: []
      },
      integration: {
        id: 'integration-id',
        userId: 'userId'
      },
      journey: {
        id: 'journey-id'
      }
    }

    const deletedSync = {
      ...mockSync,
      deletedAt: new Date(),
      integrationId: null
    }

    prismaMock.googleSheetsSync.findUnique.mockResolvedValue(mockSync as any)
    prismaMock.googleSheetsSync.update.mockResolvedValue(deletedSync as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_DELETE_MUTATION,
      variables: { id: 'sync-id' }
    })

    expect(prismaMock.googleSheetsSync.findUnique).toHaveBeenCalledWith({
      where: { id: 'sync-id' },
      include: {
        team: { include: { userTeams: true } },
        integration: true,
        journey: true
      }
    })

    // prismaField spreads query parameter, so we check for the call with spread
    expect(prismaMock.googleSheetsSync.update).toHaveBeenCalled()
    const updateCall = (prismaMock.googleSheetsSync.update as jest.Mock).mock
      .calls[0][0]
    expect(updateCall).toMatchObject({
      where: { id: 'sync-id' },
      data: {
        deletedAt: expect.any(Date)
      }
    })

    expect(result).toEqual({
      data: {
        googleSheetsSyncDelete: expect.objectContaining({
          id: 'sync-id',
          deletedAt: expect.any(String)
        })
      }
    })
  })

  it('should delete sync when user is team manager', async () => {
    const mockSync = {
      id: 'sync-id',
      journeyId: 'journey-id',
      teamId: 'team-id',
      deletedAt: null,
      team: {
        id: 'team-id',
        userTeams: [
          {
            userId: 'userId',
            role: 'manager'
          }
        ]
      },
      integration: {
        id: 'integration-id',
        userId: 'other-user-id'
      },
      journey: {
        id: 'journey-id'
      }
    }

    const deletedSync = {
      ...mockSync,
      deletedAt: new Date(),
      integrationId: null
    }

    prismaMock.googleSheetsSync.findUnique.mockResolvedValue(mockSync as any)
    prismaMock.googleSheetsSync.update.mockResolvedValue(deletedSync as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_DELETE_MUTATION,
      variables: { id: 'sync-id' }
    })

    expect(result).toEqual({
      data: {
        googleSheetsSyncDelete: expect.objectContaining({
          id: 'sync-id'
        })
      }
    })
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    // When user is null, it throws unauthenticated before checking sync
    const result = await unauthClient({
      document: GOOGLE_SHEETS_SYNC_DELETE_MUTATION,
      variables: { id: 'sync-id' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })

  it('should throw error when sync is not found', async () => {
    prismaMock.googleSheetsSync.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_DELETE_MUTATION,
      variables: { id: 'non-existent-sync' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Sync not found'
        })
      ]
    })
  })

  it('should throw error when user is neither integration owner nor team manager', async () => {
    const mockSync = {
      id: 'sync-id',
      journeyId: 'journey-id',
      teamId: 'team-id',
      deletedAt: null,
      team: {
        id: 'team-id',
        userTeams: [
          {
            userId: 'other-user-id',
            role: 'member'
          }
        ]
      },
      integration: {
        id: 'integration-id',
        userId: 'other-user-id'
      },
      journey: {
        id: 'journey-id'
      }
    }

    prismaMock.googleSheetsSync.findUnique.mockResolvedValue(mockSync as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_DELETE_MUTATION,
      variables: { id: 'sync-id' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Forbidden'
        })
      ]
    })

    expect(prismaMock.googleSheetsSync.update).not.toHaveBeenCalled()
  })
})
