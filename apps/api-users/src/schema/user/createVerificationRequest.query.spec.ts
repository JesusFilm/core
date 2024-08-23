import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { user } from './user.mock'
import { verifyUser } from './verifyUser'

const CREATE_VERIFICATION_REQUEST_MUTATION = graphql(`
  mutation CreateVerificationRequest {
    createVerificationRequest
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

jest.mock('./verifyUser', () => ({
  __esModule: true,
  verifyUser: jest.fn().mockResolvedValue(true)
}))

describe('createVerificationRequest', () => {
  const authClient = getClient({
    headers: {
      authorization: '1234'
    }
  })
  const client = getClient()

  it('should create verification request', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user)
    const data = await authClient({
      document: CREATE_VERIFICATION_REQUEST_MUTATION
    })
    expect(verifyUser).toHaveBeenCalledWith('1', 'amin@email.com', undefined)
    expect(data).toHaveProperty('data.createVerificationRequest', true)
  })

  it('should return null when no current user', async () => {
    const data = await client({
      document: CREATE_VERIFICATION_REQUEST_MUTATION
    })
    expect(data).toHaveProperty('data', null)
  })
})
