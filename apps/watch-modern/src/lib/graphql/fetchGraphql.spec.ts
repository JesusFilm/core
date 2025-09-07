import { fetchGraphql, type GraphQLResponse, type GraphQLError } from './fetchGraphql'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('fetchGraphql', () => {
  const mockEndpoint = 'https://api.example.com/graphql'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_GATEWAY_URL = mockEndpoint
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  describe('successful requests', () => {
    it('makes correct POST request with GraphQL payload', async () => {
      const mockResponse: GraphQLResponse<{ test: string }> = {
        data: { test: 'success' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const query = `
        query TestQuery {
          test
        }
      `
      const variables = { id: '123' }

      const result = await fetchGraphql(query, variables)

      expect(mockFetch).toHaveBeenCalledWith(`${mockEndpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-graphql-client-name': 'watch-modern',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      expect(result).toEqual(mockResponse)
    })

    it('makes request without variables when none provided', async () => {
      const mockResponse: GraphQLResponse<{ test: string }> = {
        data: { test: 'success' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const query = `
        query TestQuery {
          test
        }
      `

      const result = await fetchGraphql(query)

      expect(mockFetch).toHaveBeenCalledWith(`${mockEndpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-graphql-client-name': 'watch-modern',
        },
        body: JSON.stringify({
          query,
        }),
      })

      expect(result).toEqual(mockResponse)
    })

    it('handles response with null data', async () => {
      const mockResponse: GraphQLResponse<null> = {
        data: null
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await fetchGraphql('query { test }')

      expect(result).toEqual(mockResponse)
    })
  })

  describe('error handling', () => {
    it('throws error when NEXT_PUBLIC_GATEWAY_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_GATEWAY_URL

      await expect(fetchGraphql('query { test }')).rejects.toThrow(
        'NEXT_PUBLIC_GATEWAY_URL environment variable is not set'
      )

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('throws error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(fetchGraphql('query { test }')).rejects.toThrow(
        'GraphQL request failed: 500 Internal Server Error'
      )
    })

    it('throws error with first GraphQL error message', async () => {
      const mockErrors: GraphQLError[] = [
        {
          message: 'Field "nonexistentField" not found',
          locations: [{ line: 2, column: 3 }]
        },
        {
          message: 'Another error',
          locations: [{ line: 3, column: 5 }]
        }
      ]

      const mockResponse: GraphQLResponse<null> = {
        data: null,
        errors: mockErrors
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await expect(fetchGraphql('query { test }')).rejects.toThrow(
        'GraphQL query failed: Field "nonexistentField" not found'
      )
    })

    it('logs GraphQL errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockErrors: GraphQLError[] = [
        {
          message: 'Test error',
          locations: [{ line: 1, column: 1 }]
        }
      ]

      const mockResponse: GraphQLResponse<null> = {
        data: null,
        errors: mockErrors
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      try {
        await fetchGraphql('query { test }')
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('GraphQL errors:', mockErrors)

      consoleSpy.mockRestore()
    })

    it('handles network errors', async () => {
      const networkError = new Error('Network request failed')
      mockFetch.mockRejectedValueOnce(networkError)

      await expect(fetchGraphql('query { test }')).rejects.toThrow(
        'Network request failed'
      )
    })

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      })

      await expect(fetchGraphql('query { test }')).rejects.toThrow(
        'Invalid JSON'
      )
    })
  })

  describe('response transformation', () => {
    it('returns typed response data', async () => {
      interface TestData {
        user: {
          id: string
          name: string
        }
      }

      const mockResponse: GraphQLResponse<TestData> = {
        data: {
          user: {
            id: '123',
            name: 'John Doe'
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await fetchGraphql<TestData>('query { user { id name } }')

      expect(result.data).toEqual({
        user: {
          id: '123',
          name: 'John Doe'
        }
      })
    })

    it('preserves complex GraphQL error details', async () => {
      const detailedError: GraphQLError = {
        message: 'Validation error',
        locations: [{ line: 5, column: 10 }],
        path: ['user', 'email'],
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'email',
          reason: 'Invalid email format'
        }
      }

      const mockResponse: GraphQLResponse<null> = {
        data: null,
        errors: [detailedError]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      try {
        await fetchGraphql('mutation { updateUser(input: {}) { id } }')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('GraphQL query failed: Validation error')
      }
    })
  })

  describe('headers and configuration', () => {
    it('sends correct Content-Type header', async () => {
      const mockResponse: GraphQLResponse<{ test: string }> = {
        data: { test: 'success' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await fetchGraphql('query { test }')

      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs.headers['Content-Type']).toBe('application/json')
    })

    it('sends correct GraphQL client name header', async () => {
      const mockResponse: GraphQLResponse<{ test: string }> = {
        data: { test: 'success' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await fetchGraphql('query { test }')

      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs.headers['x-graphql-client-name']).toBe('watch-modern')
    })

    it('uses correct endpoint URL', async () => {
      const mockResponse: GraphQLResponse<{ test: string }> = {
        data: { test: 'success' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await fetchGraphql('query { test }')

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockEndpoint}/`,
        expect.any(Object)
      )
    })
  })
})
