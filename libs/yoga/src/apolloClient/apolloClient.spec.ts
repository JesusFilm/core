import { ApolloClient, createHttpLink } from '@apollo/client'

import { createApolloClient } from '../apolloClient'

jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn()
}))

const mockCreateHttpLink = createHttpLink as jest.MockedFunction<
  typeof createHttpLink
>

describe('apolloClient', () => {
  const originalEnv = { ...process.env }
  const mockApolloClient = ApolloClient as jest.MockedClass<typeof ApolloClient>

  beforeEach(() => {
    process.env = { ...originalEnv }
    jest.clearAllMocks()
    mockCreateHttpLink.mockReturnValue({} as any)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('createApolloClient', () => {
    it('should pass the correct API name in headers', () => {
      const apiName = 'api-custom'
      process.env.GATEWAY_URL = 'https://gateway.example.com/graphql'
      process.env.INTEROP_TOKEN = 'test-token'
      process.env.SERVICE_VERSION = '3.0.0'

      createApolloClient(apiName)

      expect(mockApolloClient).toHaveBeenCalledWith({
        link: expect.any(Object),
        cache: expect.any(Object)
      })
    })

    it('should return an Apollo Client instance', () => {
      const apiName = 'api-test'
      process.env.GATEWAY_URL = 'https://gateway.example.com/graphql'
      process.env.INTEROP_TOKEN = 'test-token'
      process.env.SERVICE_VERSION = '1.0.0'

      const client = createApolloClient(apiName)

      expect(client).toBeDefined()
      expect(mockApolloClient).toHaveBeenCalledTimes(1)
    })

    it('should configure HTTP link with correct URI and headers', () => {
      const apiName = 'api-media'
      process.env.GATEWAY_URL = 'https://gateway.example.com/graphql'
      process.env.INTEROP_TOKEN = 'test-interop-token'
      process.env.SERVICE_VERSION = '1.0.0'

      createApolloClient(apiName)

      expect(mockCreateHttpLink).toHaveBeenCalledWith({
        uri: 'https://gateway.example.com/graphql',
        headers: {
          'interop-token': 'test-interop-token',
          'x-graphql-client-name': 'api-media',
          'x-graphql-client-version': '1.0.0'
        }
      })
    })

    it('should use different API names for different clients', () => {
      const apiName1 = 'api-media'
      const apiName2 = 'api-users'
      process.env.GATEWAY_URL = 'https://gateway.example.com/graphql'
      process.env.INTEROP_TOKEN = 'test-token'
      process.env.SERVICE_VERSION = '1.0.0'

      createApolloClient(apiName1)
      createApolloClient(apiName2)

      expect(mockCreateHttpLink).toHaveBeenNthCalledWith(1, {
        uri: 'https://gateway.example.com/graphql',
        headers: {
          'interop-token': 'test-token',
          'x-graphql-client-name': 'api-media',
          'x-graphql-client-version': '1.0.0'
        }
      })
      expect(mockCreateHttpLink).toHaveBeenNthCalledWith(2, {
        uri: 'https://gateway.example.com/graphql',
        headers: {
          'interop-token': 'test-token',
          'x-graphql-client-name': 'api-users',
          'x-graphql-client-version': '1.0.0'
        }
      })
    })
  })
})
