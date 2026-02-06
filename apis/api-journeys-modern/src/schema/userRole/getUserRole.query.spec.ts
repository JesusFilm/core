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

describe('getUserRole', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const GET_USER_ROLE_QUERY = graphql(`
    query GetUserRole {
      getUserRole {
        id
        userId
        roles
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('should return user role when user is authenticated', async () => {
    const userRole = {
      id: 'userRoleId',
      userId: 'userId',
      roles: []
    }

    prismaMock.userRole.upsert.mockResolvedValue(userRole)

    const result = await authClient({
      document: GET_USER_ROLE_QUERY
    })

    expect(result).toEqual({
      data: {
        getUserRole: {
          id: 'userRoleId',
          userId: 'userId',
          roles: []
        }
      }
    })

    expect(prismaMock.userRole.upsert).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      create: { userId: 'userId' },
      update: {}
    })
  })

  it('should return user role with roles', async () => {
    const userRole = {
      id: 'userRoleId',
      userId: 'userId',
      roles: ['publisher']
    }

    prismaMock.userRole.upsert.mockResolvedValue(userRole as any)

    const result = await authClient({
      document: GET_USER_ROLE_QUERY
    })

    expect(result).toEqual({
      data: {
        getUserRole: {
          id: 'userRoleId',
          userId: 'userId',
          roles: ['publisher']
        }
      }
    })
  })

  it('should retry on unique constraint violation', async () => {
    const userRole = {
      id: 'userRoleId',
      userId: 'userId',
      roles: []
    }

    prismaMock.userRole.upsert.mockRejectedValueOnce({ code: 'P2002' })
    prismaMock.userRole.upsert.mockResolvedValue(userRole)

    const result = await authClient({
      document: GET_USER_ROLE_QUERY
    })

    expect(result).toEqual({
      data: {
        getUserRole: {
          id: 'userRoleId',
          userId: 'userId',
          roles: []
        }
      }
    })

    expect(prismaMock.userRole.upsert).toHaveBeenCalledTimes(2)
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: GET_USER_ROLE_QUERY
    })

    expect(result).toEqual({
      data: {
        getUserRole: null
      },
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })
})
