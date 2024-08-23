import { graphql } from 'gql.tada'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { user } from './user.mock'

const USER_IMPERSONATE_MUTATION = graphql(`
  mutation UserImpersonate($email: String!) {
    userImpersonate(email: $email)
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
  }),
  impersonateUser: jest.fn().mockResolvedValue('1234')
}))

describe('me', () => {
  const authClient = getClient({
    headers: {
      authorization: '1234'
    },
    context: {
      currentUser: {
        ...user,
        superAdmin: true
      }
    }
  })
  const client = getClient()

  it('should impersonate a user', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ ...user, superAdmin: true })
      .mockResolvedValueOnce(user)
    const data = await authClient({
      document: USER_IMPERSONATE_MUTATION,
      variables: {
        email: 'abc@example.com'
      }
    })
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'abc@example.com'
      }
    })
    expect(data).toHaveProperty('data.userImpersonate', '1234')
  })

  it('should return null when no current user', async () => {
    const data = await client({
      document: USER_IMPERSONATE_MUTATION,
      variables: {
        email: 'abc@example.com'
      }
    })
    expect(data).toHaveProperty('data', null)
  })
})
