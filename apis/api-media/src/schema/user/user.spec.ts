import { MediaRole } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('user', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const VIDEO_ROLES = graphql(`
    query VideoRoles {
      _entities(
        representations: [{ __typename: "AuthenticatedUser", id: "id" }]
      ) {
        ... on AuthenticatedUser {
          id
          mediaUserRoles
        }
      }
    }
  `)

  it('should return media roles from the request context', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'mediaRoleId',
      userId: 'testUserId',
      roles: [MediaRole.publisher],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const data = await authClient({
      document: VIDEO_ROLES
    })
    // Roles are resolved from the auth context (keyed by Firebase uid via
    // UserMediaRole.userId), the same source that gates publisher fields —
    // never from a separate lookup on the federation id. See issue #9416.
    expect(prismaMock.userMediaRole.findUnique).toHaveBeenCalledWith({
      where: { userId: 'testUserId' }
    })
    expect(prismaMock.userMediaRole.findUnique).not.toHaveBeenCalledWith({
      where: { id: 'id' }
    })
    expect(data).toHaveProperty('data._entities[0].mediaUserRoles', [
      MediaRole.publisher
    ])
  })

  it('should return no media roles when the user has none granted', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue(null)
    const data = await authClient({
      document: VIDEO_ROLES
    })
    expect(data).toHaveProperty('data._entities[0].mediaUserRoles', [])
  })
})
