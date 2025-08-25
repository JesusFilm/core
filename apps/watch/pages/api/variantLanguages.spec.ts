import { NextApiRequest, NextApiResponse } from 'next'

import handler from './variantLanguages'

// Mock the Apollo client
jest.mock('../../src/libs/apolloClient', () => ({
  createApolloClient: jest.fn()
}))

const { createApolloClient } = require('../../src/libs/apolloClient')

describe('VariantLanguages API', () => {
  let mockApolloClient: any
  let mockQuery: jest.Mock

  beforeEach(() => {
    mockQuery = jest.fn()
    mockApolloClient = {
      query: mockQuery
    }
    createApolloClient.mockReturnValue(mockApolloClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (method: string, query: any = {}): NextApiRequest =>
    ({
      method,
      query
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
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Method not allowed'
      })
    })

    it('should return 405 for PUT method', async () => {
      const req = createMockRequest('PUT')
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Method not allowed'
      })
    })

    it('should return 405 for DELETE method', async () => {
      const req = createMockRequest('DELETE')
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Method not allowed'
      })
    })
  })

  describe('Query Parameter Validation', () => {
    it('should return 400 when slug is missing', async () => {
      const req = createMockRequest('GET', {})
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video slug is required'
      })
    })

    it('should return 400 when slug is not a string', async () => {
      const req = createMockRequest('GET', { slug: 123 })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video slug is required'
      })
    })

    it('should return 400 when slug is an empty string', async () => {
      const req = createMockRequest('GET', { slug: '' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video slug is required'
      })
    })

    it('should return 400 when slug has only one part', async () => {
      const req = createMockRequest('GET', { slug: 'jesus' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          'Invalid slug format. Expected format: "videoId/language" (e.g., "jesus/english")'
      })
    })

    it('should return 400 when slug has empty first part', async () => {
      const req = createMockRequest('GET', { slug: '/english' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          'Invalid slug format. Expected format: "videoId/language" (e.g., "jesus/english")'
      })
    })

    it('should return 400 when slug has empty second part', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          'Invalid slug format. Expected format: "videoId/language" (e.g., "jesus/english")'
      })
    })

    it('should return 400 when slug has more than two parts', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english/extra' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          'Invalid slug format. Expected format: "videoId/language" (e.g., "jesus/english")'
      })
    })

    it('should accept valid slug format with two parts', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: {
            id: 'video-123',
            variantLanguagesWithSlug: []
          }
        }
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(mockQuery).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: { slug: 'jesus/english' },
        fetchPolicy: 'network-only'
      })
    })
  })

  describe('GraphQL Query Execution', () => {
    it('should call Apollo client with correct query and variables', async () => {
      const slug = 'jesus/english'
      const req = createMockRequest('GET', { slug })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: {
            id: 'video-123',
            variantLanguagesWithSlug: []
          }
        }
      })

      await handler(req, res)

      expect(createApolloClient).toHaveBeenCalled()
      expect(mockQuery).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: { slug },
        fetchPolicy: 'network-only'
      })
    })

    it('should use network-only fetch policy', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: {
            id: 'video-123',
            variantLanguagesWithSlug: []
          }
        }
      })

      await handler(req, res)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchPolicy: 'network-only'
        })
      )
    })
  })

  describe('Success Response Handling', () => {
    it('should return 200 with variant languages data transformed to object', async () => {
      const slug = 'jesus/english'
      const req = createMockRequest('GET', { slug })
      const res = createMockResponse()

      const mockData = {
        video: {
          id: 'video-123',
          variantLanguagesWithSlug: [
            {
              slug: 'jesus/english',
              language: { id: '529' }
            },
            {
              slug: 'jesus/spanish',
              language: { id: '639' }
            }
          ]
        }
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          variantLanguages: {
            '529': 'jesus/english',
            '639': 'jesus/spanish'
          }
        }
      })
    })

    it('should handle empty variant languages array', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: {
            id: 'video-123',
            variantLanguagesWithSlug: []
          }
        }
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          variantLanguages: {}
        }
      })
    })

    it('should handle variant languages with missing language ID or slug gracefully', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      const mockData = {
        video: {
          id: 'video-123',
          variantLanguagesWithSlug: [
            {
              slug: 'jesus/english',
              language: { id: '529' }
            },
            {
              slug: 'jesus/spanish',
              language: null // Missing language
            },
            {
              slug: null, // Missing slug
              language: { id: '639' }
            },
            {
              slug: 'jesus/french',
              language: { id: '456' }
            }
          ]
        }
      }

      mockQuery.mockResolvedValue({ data: mockData })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          variantLanguages: {
            '529': 'jesus/english',
            '456': 'jesus/french'
          }
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 404 when video is not found', async () => {
      const req = createMockRequest('GET', { slug: 'nonexistent/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: null
        }
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video not found'
      })
    })

    it('should return 404 when variantLanguagesWithSlug is missing', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: {
            id: 'video-123'
            // Missing variantLanguagesWithSlug
          }
        }
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video not found'
      })
    })

    it('should return 500 when GraphQL query fails', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      const error = new Error('GraphQL query failed')
      mockQuery.mockRejectedValue(error)

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch variant languages'
      })
    })

    it('should log error to console when GraphQL query fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      const error = new Error('GraphQL query failed')
      mockQuery.mockRejectedValue(error)

      await handler(req, res)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching variant languages:',
        error
      )
      consoleSpy.mockRestore()
    })
  })

  describe('Data Structure Validation', () => {
    it('should handle malformed GraphQL response gracefully', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: {
          video: {
            id: 'video-123',
            variantLanguagesWithSlug: null
          }
        }
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video not found'
      })
    })

    it('should handle undefined GraphQL response', async () => {
      const req = createMockRequest('GET', { slug: 'jesus/english' })
      const res = createMockResponse()

      mockQuery.mockResolvedValue({
        data: undefined
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Video not found'
      })
    })
  })
})
