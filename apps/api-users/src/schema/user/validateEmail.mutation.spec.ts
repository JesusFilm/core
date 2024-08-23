import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { user } from './user.mock'

const VALIDATE_EMAIL_MUTATION = graphql(`
  mutation ValidateEmail($token: String!, $email: String!) {
    validateEmail(token: $token, email: $email) {
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

jest.mock('./validateEmail', () => ({
  __esModule: true,
  validateEmail: jest.fn().mockResolvedValue(true)
}))

describe('validateEmail', () => {
  const client = getClient()

  it('should query user if interop token is valid', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user)
    const data = await client({
      document: VALIDATE_EMAIL_MUTATION,
      variables: {
        email: 'abc@example.com',
        token: 'token'
      }
    })
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'abc@example.com'
      }
    })
    expect(data).toHaveProperty('data.validateEmail', {
      ...omit(user, ['createdAt', 'userId']),
      emailVerified: true
    })
  })

  it('should throw when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const data = await client({
      document: VALIDATE_EMAIL_MUTATION,
      variables: {
        email: 'abc@example.com',
        token: 'token'
      }
    })
    expect(data).toHaveProperty('data', null)
  })
})
