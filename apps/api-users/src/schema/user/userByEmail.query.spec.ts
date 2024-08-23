import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { user } from './user.mock'

const USER_QUERY = graphql(`
  query UserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      firstName
      lastName
      email
      imageUrl
      superAdmin
      emailVerified
    }
  }
`)

describe('userByEmail', () => {
  beforeAll(() => {
    process.env = {
      ...process.env,
      INTEROP_TOKEN: 'token'
    }
  })

  const client = getClient()
  const authClient = getClient({
    headers: {
      'interop-token': 'token'
    }
  })

  it('should query user if interop token is valid', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user)
    const data = await authClient({
      document: USER_QUERY,
      variables: {
        email: 'abc@example.com'
      }
    })
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'abc@example.com'
      }
    })
    expect(data).toHaveProperty(
      'data.userByEmail',
      omit(user, ['createdAt', 'userId'])
    )
  })

  it('should throw when no interop token', async () => {
    const data = await client({
      document: USER_QUERY,
      variables: {
        email: 'abc@example.com'
      }
    })
    expect(data).toHaveProperty('data.userByEmail', null)
  })
})
