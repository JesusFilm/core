import { graphql } from 'gql.tada'

import { VideoRole } from '.prisma/api-media-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

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

describe('usesr', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const VIDEO_ROLES = graphql(`
    query VideoRoles($representations: [_Any!]!) {
      _entities(representations: $representations) {
        ... on User {
          id
          videoUserRoles
        }
      }
    }
  `)

  it('should return video roles', async () => {
    prismaMock.videoAdminUser.findUnique.mockResolvedValue({
      id: 'id',
      userId: 'userId',
      roles: [VideoRole.publisher]
    })
    const data = await authClient({
      document: VIDEO_ROLES,
      variables: {
        representations: [
          {
            __typename: 'User',
            id: 'id'
          }
        ]
      }
    })
    expect(prismaMock.videoAdminUser.findUnique).toHaveBeenCalled()
    expect(data).toHaveProperty('data._entities[0].videoUserRoles', [
      VideoRole.publisher
    ])
  })
})
