import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'

const ME_QUERY = graphql(`
  query Me {
    me {
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

jest.mock('./findOrFetchUser', () => ({
  findOrFetchUser: jest.fn().mockResolvedValue({
    id: '1',
    userId: '1',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    firstName: 'Amin',
    lastName: 'One',
    email: 'amin@email.com',
    imageUrl: 'https://bit.ly/3Gth4',
    emailVerified: false,
    superAdmin: false
  })
}))

describe('me', () => {
  const authClient = getClient({
    headers: {
      authorization: '1234'
    }
  })
  const client = getClient()

  it('should query me', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user)
    const data = await authClient({
      document: ME_QUERY
    })
    expect(findOrFetchUser).toHaveBeenCalledWith({}, '1', undefined)
    expect(data).toHaveProperty('data.me', omit(user, ['createdAt', 'userId']))
  })

  it('should return null when no current user', async () => {
    const data = await client({
      document: ME_QUERY
    })
    expect(data).toHaveProperty('data.me', null)
  })
})
