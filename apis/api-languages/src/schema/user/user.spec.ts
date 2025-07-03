import { graphql } from 'gql.tada'

import { LanguageRole } from '.prisma/api-languages-client'

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
          languageUserRoles
        }
      }
    }
  `)

  it('should return language roles', async () => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'id',
      userId: 'userId',
      roles: [LanguageRole.publisher]
    })
    const data = await authClient({
      document: VIDEO_ROLES
    })
    expect(prismaMock.userLanguageRole.findUnique).toHaveBeenCalledWith({
      where: { userId: 'id' }
    })
    expect(data).toHaveProperty('data._entities[0].languageUserRoles', [
      LanguageRole.publisher
    ])
  })
})
