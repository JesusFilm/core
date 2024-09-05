import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'
import { verifyUser } from './verifyUser'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromRequest: jest.fn().mockImplementation((request: Request) =>
    request.headers.get('authorization') != null
      ? {
          id: '1',
          userId: '1',
          createdAt: new Date('2021-01-01T00:00:00.000Z'),
          firstName: 'Amin',
          lastName: 'One',
          email: 'amin@email.com',
          imageUrl: 'https://bit.ly/3Gth4',
          emailVerified: false
        }
      : null
  ),
  impersonateUser: jest.fn().mockResolvedValue('1234')
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

jest.mock('./validateEmail', () => ({
  __esModule: true,
  validateEmail: jest.fn().mockResolvedValue(true)
}))

jest.mock('./verifyUser', () => ({
  __esModule: true,
  verifyUser: jest.fn().mockResolvedValue(true)
}))

describe('api-users', () => {
  const client = getClient()

  describe('me', () => {
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

    const authClient = getClient({
      headers: {
        authorization: '1234'
      }
    })

    it('should query me', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user)
      const data = await authClient({
        document: ME_QUERY
      })
      expect(findOrFetchUser).toHaveBeenCalledWith({}, '1', undefined)
      expect(data).toHaveProperty(
        'data.me',
        omit(user, ['createdAt', 'userId'])
      )
    })

    it('should return null when no current user', async () => {
      const data = await client({
        document: ME_QUERY
      })
      expect(data).toHaveProperty('data.me', null)
    })
  })

  describe('userByEmail', () => {
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

    beforeAll(() => {
      process.env = {
        ...process.env,
        INTEROP_TOKEN: 'token'
      }
    })

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

  describe('user', () => {
    const USER_QUERY = graphql(`
      query User($id: ID!) {
        user(id: $id) {
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

    beforeAll(() => {
      process.env = {
        ...process.env,
        INTEROP_TOKEN: 'token'
      }
    })

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
          id: '1'
        }
      })
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: '1'
        }
      })
      expect(data).toHaveProperty(
        'data.user',
        omit(user, ['createdAt', 'userId'])
      )
    })

    it('should throw when no interop token', async () => {
      const data = await client({
        document: USER_QUERY,
        variables: {
          id: '1'
        }
      })
      expect(data).toHaveProperty('data.user', null)
    })
  })

  describe('createVerificationRequest', () => {
    const CREATE_VERIFICATION_REQUEST_MUTATION = graphql(`
      mutation CreateVerificationRequest {
        createVerificationRequest
      }
    `)

    const authClient = getClient({
      headers: {
        authorization: '1234'
      }
    })

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
      expect(data).toHaveProperty('data.createVerificationRequest', null)
    })
  })

  describe('userImpersonate', () => {
    const USER_IMPERSONATE_MUTATION = graphql(`
      mutation UserImpersonate($email: String!) {
        userImpersonate(email: $email)
      }
    `)

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

  describe('validateEmail', () => {
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
      expect(data).toHaveProperty('data.validateEmail', null)
    })
  })
})
