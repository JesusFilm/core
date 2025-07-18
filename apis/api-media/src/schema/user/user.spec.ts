import { MediaRole } from '@core/prisma-media/client'
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
      _entities(representations: [{ __typename: "User", id: "id" }]) {
        ... on User {
          id
          mediaUserRoles
        }
      }
    }
  `)

  it('should return media roles', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'id',
      userId: 'userId',
      roles: [MediaRole.publisher]
    })
    const data = await authClient({
      document: VIDEO_ROLES
    })
    expect(prismaMock.userMediaRole.findUnique).toHaveBeenCalledWith({
      where: { id: 'id' }
    })
    expect(data).toHaveProperty('data._entities[0].mediaUserRoles', [
      MediaRole.publisher
    ])
  })
})
