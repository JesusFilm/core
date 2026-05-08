import { GraphQLError } from 'graphql'
import clone from 'lodash/clone'
import fetch, { Response } from 'node-fetch'
import { type MockedFunction, vi } from 'vitest'

import {
  addVercelDomain,
  checkVercelDomain,
  removeVercelDomain
} from './shortLinkDomain.service'

// Mock environment variables

// Mock fetch
vi.mock('node-fetch', async () => ({
  ...(await vi.importActual<typeof import('node-fetch')>('node-fetch')),
  default: vi.fn()
}))
const mockFetch = fetch as MockedFunction<typeof fetch>

describe('shortLinkDomain.service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      VERCEL_TOKEN: 'test-token',
      VERCEL_SHORT_LINKS_PROJECT_ID: 'test-project-id',
      VERCEL_TEAM_ID: 'test-team-id'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  describe('addVercelDomain', () => {
    it('should add a domain successfully', async () => {
      const mockResponse = {
        name: 'test.com',
        apexName: 'test.com',
        verified: true
      }
      mockFetch.mockResolvedValue(new Response(JSON.stringify(mockResponse)))

      const result = await addVercelDomain('test.com')
      expect(result).toEqual(mockResponse)
    })

    it('should handle GraphQLError with status 400', async () => {
      const errorResponse = {
        error: { message: 'Bad Request', code: '400' }
      }
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(errorResponse), { status: 400 })
      )

      await expect(addVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should handle GraphQLError with status 409', async () => {
      const errorResponse = {
        error: { message: 'Conflict', code: '409' }
      }
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(errorResponse), { status: 409 })
      )

      await expect(addVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should handle GraphQLError with default status', async () => {
      const errorResponse = {
        error: { message: 'Internal Server Error', code: '500' }
      }
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(errorResponse), { status: 500 })
      )

      await expect(addVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should return default response if VERCEL_SHORT_LINKS_PROJECT_ID is undefined', async () => {
      process.env.VERCEL_SHORT_LINKS_PROJECT_ID = undefined
      const result = await addVercelDomain('test.com')
      expect(result).toEqual({
        name: 'test.com',
        apexName: 'test.com',
        verified: false
      })
    })
  })

  describe('removeVercelDomain', () => {
    it('should remove a domain successfully', async () => {
      mockFetch.mockResolvedValue(new Response('', { status: 200 }))

      const result = await removeVercelDomain('test.com')
      expect(result).toBe(true)
    })

    it('should handle GraphQLError with status 404', async () => {
      mockFetch.mockResolvedValue(new Response('', { status: 404 }))

      const result = await removeVercelDomain('test.com')
      expect(result).toBe(true)
    })

    it('should throw GraphQLError for other status codes', async () => {
      mockFetch.mockResolvedValue(new Response('', { status: 500 }))

      await expect(removeVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should return true if VERCEL_SHORT_LINKS_PROJECT_ID is undefined', async () => {
      process.env.VERCEL_SHORT_LINKS_PROJECT_ID = undefined
      const result = await removeVercelDomain('test.com')
      expect(result).toBe(true)
    })
  })

  describe('checkVercelDomain', () => {
    it('should check a domain successfully', async () => {
      const mockConfigData = { misconfigured: false }
      const mockDomainData = { verified: true, verification: [] }
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(mockConfigData)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockDomainData)))

      const result = await checkVercelDomain('test.com')
      expect(result).toEqual({
        configured: true,
        verified: true,
        verification: []
      })
    })

    it('should handle verification if domain is not verified', async () => {
      const mockConfigData = { misconfigured: false }
      const mockDomainData = { verified: false, verification: [] }
      const mockVerifyData = { verified: true, verification: [] }
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(mockConfigData)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockDomainData)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockVerifyData)))

      const result = await checkVercelDomain('test.com')
      expect(result).toEqual({
        configured: true,
        verified: true,
        verification: []
      })
    })

    it('should throw GraphQLError if config response is not ok', async () => {
      mockFetch.mockResolvedValueOnce(new Response('', { status: 500 }))

      await expect(checkVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should throw GraphQLError if domain response is not ok', async () => {
      const mockConfigData = { misconfigured: false }
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(mockConfigData)))
        .mockResolvedValueOnce(new Response('', { status: 500 }))

      await expect(checkVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should throw GraphQLError if verification response is not ok', async () => {
      const mockConfigData = { misconfigured: false }
      const mockDomainData = { verified: false, verification: [] }
      const mockVerifyData = { error: { code: 'some_error', message: 'Error' } }
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(mockConfigData)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockDomainData)))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockVerifyData), { status: 500 })
        )

      await expect(checkVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should throw GraphQLError if verification response contains unhandled error code', async () => {
      const mockConfigData = { misconfigured: false }
      const mockDomainData = { verified: false, verification: [] }
      const mockVerifyData = {
        error: { code: 'unhandled_error', message: 'Error' }
      }
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(mockConfigData)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockDomainData)))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockVerifyData), { status: 200 })
        )

      await expect(checkVercelDomain('test.com')).rejects.toThrow(GraphQLError)
    })

    it('should return default response if VERCEL_SHORT_LINKS_PROJECT_ID is undefined', async () => {
      process.env.VERCEL_SHORT_LINKS_PROJECT_ID = undefined
      const result = await checkVercelDomain('test.com')
      expect(result).toEqual({
        configured: true,
        verified: true,
        verification: []
      })
    })
  })
})
