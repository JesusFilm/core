import { NextApiRequest, NextApiResponse } from 'next'

import handler, { LANGUAGES_CACHE_SCHEMA_VERSION } from './languages'

// Mock the Apollo client
jest.mock('../../src/libs/apolloClient', () => ({
  createApolloClient: jest.fn()
}))

// Mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    setex: jest.fn()
  }))
}))

const { Redis } = require('@upstash/redis')

const { createApolloClient } = require('../../src/libs/apolloClient')

describe('Languages API', () => {
  let mockApolloClient: any
  let mockQuery: jest.Mock
  let mockRedis: any
  let mockRedisGet: jest.Mock
  let mockRedisSetex: jest.Mock

  beforeEach(() => {
    mockQuery = jest.fn()
    mockRedisGet = jest.fn()
    mockRedisSetex = jest.fn()

    mockApolloClient = {
      query: mockQuery
    }

    mockRedis = {
      get: mockRedisGet,
      setex: mockRedisSetex
    }

    createApolloClient.mockReturnValue(mockApolloClient)
    ;(Redis as jest.Mock).mockImplementation(() => mockRedis)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (method: string): NextApiRequest =>
    ({
      method
    }) as unknown as NextApiRequest

  const createMockResponse = (): NextApiResponse => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    } as unknown as NextApiResponse
    return res
  }

  describe('HTTP Method Validation', () => {
    it('should return 405 for non-GET methods', async () => {
      const req = createMockRequest('POST')
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET')
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })

  describe('Redis Caching', () => {
    it('should return cached languages when available', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      const cachedLanguages = [
        ['529:en:English', '529:English', '639:Inglés'],
        ['639:es:Español', '529:Spanish', '639:Español']
      ]

      mockRedisGet.mockResolvedValue(cachedLanguages)

      await handler(req, res)

      expect(mockRedisGet).toHaveBeenCalledWith(
        `languages:${LANGUAGES_CACHE_SCHEMA_VERSION}`
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(cachedLanguages)
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=86400, stale-while-revalidate=86400'
      )
    })

    it('should handle Redis get error gracefully and fall back to GraphQL', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()
      mockRedisGet.mockRejectedValue(new Error('Redis connection failed'))

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [{ value: 'English' }],
            name: [
              { value: 'English', language: { id: '529' } },
              { value: 'Inglés', language: { id: '639' } }
            ]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(mockRedisGet).toHaveBeenCalledWith(
        `languages:${LANGUAGES_CACHE_SCHEMA_VERSION}`
      )
      expect(mockQuery).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('GraphQL Query Execution', () => {
    it('should call Apollo client with correct query when no cache', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [{ value: 'English' }],
            name: [
              { value: 'English', language: { id: '529' } },
              { value: 'Inglés', language: { id: '639' } }
            ]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(createApolloClient).toHaveBeenCalled()
      expect(mockQuery).toHaveBeenCalledWith({
        query: expect.any(Object)
      })
    })

    it('should transform GraphQL data to correct format', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [{ value: 'English' }],
            name: [
              { value: 'English', language: { id: '529' } },
              { value: 'Inglés', language: { id: '639' } },
              { value: '', language: { id: '787' } }
            ]
          },
          {
            id: '639',
            slug: 'es',
            nativeName: [{ value: 'Español' }],
            name: [
              { value: 'Spanish', language: { id: '529' } },
              { value: 'Español', language: { id: '639' } }
            ]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      const expectedLanguages = [
        ['529:en:English', '529:English', '639:Inglés'],
        ['639:es:Español', '529:Spanish', '639:Español']
      ]

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expectedLanguages)
    })

    it('should handle languages with missing slug', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: [
          {
            id: '529',
            slug: null,
            nativeName: [{ value: 'English' }],
            name: [{ value: 'English', language: { id: '529' } }]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      const expectedLanguages = [['529::English', '529:English']]

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expectedLanguages)
    })

    it('should handle languages with missing native name', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [],
            name: [{ value: 'English', language: { id: '529' } }]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      const expectedLanguages = [['529:en', '529:English']]

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expectedLanguages)
    })

    it('should handle languages with missing name translations', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [{ value: 'English' }],
            name: []
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      const expectedLanguages = [['529:en:English']]

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expectedLanguages)
    })
  })

  describe('Cache Storage', () => {
    it('should store languages in Redis after successful GraphQL query', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [{ value: 'English' }],
            name: [{ value: 'English', language: { id: '529' } }]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      const expectedLanguages = [['529:en:English', '529:English']]

      expect(mockRedisSetex).toHaveBeenCalledWith(
        `languages:${LANGUAGES_CACHE_SCHEMA_VERSION}`,
        86400,
        expectedLanguages
      )
    })

    it('should use correct cache key with schema version', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: []
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(mockRedisGet).toHaveBeenCalledWith(
        `languages:${LANGUAGES_CACHE_SCHEMA_VERSION}`
      )
      expect(mockRedisSetex).toHaveBeenCalledWith(
        `languages:${LANGUAGES_CACHE_SCHEMA_VERSION}`,
        86400,
        []
      )
    })
  })

  describe('Response Headers', () => {
    it('should set correct cache headers for cached response', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      const cachedLanguages = [['529:en:English', '529:English']]

      mockRedisGet.mockResolvedValue(cachedLanguages)

      await handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=86400, stale-while-revalidate=86400'
      )
    })

    it('should set correct cache headers for fresh response', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: []
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=86400, stale-while-revalidate=86400'
      )
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when GraphQL query fails', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const error = new Error('GraphQL query failed')
      mockQuery.mockRejectedValue(error)

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch languages'
      })
    })

    it('should handle Redis setex error gracefully', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)
      mockRedisSetex.mockRejectedValue(new Error('Redis setex failed'))

      const mockData = {
        languages: [
          {
            id: '529',
            slug: 'en',
            nativeName: [{ value: 'English' }],
            name: [{ value: 'English', language: { id: '529' } }]
          }
        ]
      }

      mockQuery.mockResolvedValue({ data: mockData })

      // Should still return success even if caching fails
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith([['529:en:English', '529:English']])
    })
  })

  describe('Data Transformation Edge Cases', () => {
    it('should handle empty languages array', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      mockRedisGet.mockResolvedValue(null)

      const mockData = {
        languages: []
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith([])
    })
  })
})
