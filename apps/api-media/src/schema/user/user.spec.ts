import { MediaRole } from '.prisma/api-media-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromAuthToken: jest.fn().mockResolvedValue({
    id: '1',
    userId: '1',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    firstName: 'Amin',
    lastName: 'One',
    email: 'amin@email.com',
    imageUrl: 'https://bit.ly/3Gth4',
    emailVerified: false
  })
}))

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
    expect(prismaMock.userMediaRole.findUnique).toHaveBeenCalled()
    expect(data).toHaveProperty('data._entities[0].mediaUserRoles', [
      MediaRole.publisher
    ])
  })
})
