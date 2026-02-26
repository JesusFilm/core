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

describe('integrationDelete', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const INTEGRATION_DELETE = graphql(`
    mutation IntegrationDelete($id: ID!) {
      integrationDelete(id: $id) {
        id
        type
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

  it('deletes integration when user is owner', async () => {
    const integrationId = 'integration-id'
    const existing = {
      id: integrationId,
      userId: 'userId',
      team: { userTeams: [] }
    }
    prismaMock.integration.findUnique.mockResolvedValue(existing as any)

    const tx = {
      googleSheetsSync: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 })
      },
      integration: {
        delete: jest.fn().mockResolvedValue({
          id: integrationId,
          type: 'google'
        })
      }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: INTEGRATION_DELETE,
      variables: { id: integrationId }
    })

    expect(prismaMock.integration.findUnique).toHaveBeenCalledWith({
      where: { id: integrationId },
      include: { team: { include: { userTeams: true } } }
    })

    expect(tx.googleSheetsSync.updateMany).toHaveBeenCalledWith({
      where: { integrationId },
      data: {
        deletedAt: expect.any(Date),
        integrationId: null
      }
    })
    expect(tx.integration.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: integrationId }
      })
    )

    expect(result).toEqual({
      data: {
        integrationDelete: {
          id: integrationId,
          type: 'google'
        }
      }
    })
  })

  it('deletes integration when user is team manager', async () => {
    const integrationId = 'integration-id'
    prismaMock.integration.findUnique.mockResolvedValue({
      id: integrationId,
      userId: 'other-user',
      team: { userTeams: [{ userId: 'userId', role: 'manager' }] }
    } as any)

    const tx = {
      googleSheetsSync: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 })
      },
      integration: {
        delete: jest.fn().mockResolvedValue({
          id: integrationId,
          type: 'growthSpaces'
        })
      }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: INTEGRATION_DELETE,
      variables: { id: integrationId }
    })

    expect(result).toEqual({
      data: {
        integrationDelete: {
          id: integrationId,
          type: 'growthSpaces'
        }
      }
    })
  })

  it('returns FORBIDDEN when user is neither owner nor team manager', async () => {
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'integration-id',
      userId: 'other-user',
      team: { userTeams: [{ userId: 'userId', role: 'member' }] }
    } as any)

    const result = await authClient({
      document: INTEGRATION_DELETE,
      variables: { id: 'integration-id' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete integration'
        })
      ]
    })
  })
})
