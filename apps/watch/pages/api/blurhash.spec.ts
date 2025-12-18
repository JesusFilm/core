import { readFileSync } from 'fs'

import { encode } from 'blurhash'
import { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'

import handler from './blurhash'

// Mock blurhash encode
jest.mock('blurhash', () => ({
  encode: jest.fn()
}))

// Mock sharp
jest.mock('sharp', () => {
  const mockSharp = {
    resize: jest.fn().mockReturnThis(),
    raw: jest.fn().mockReturnThis(),
    ensureAlpha: jest.fn().mockReturnThis(),
    toBuffer: jest.fn()
  }
  return jest.fn(() => mockSharp)
})

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn()
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>

describe('Blurhash API', () => {
  let mockEncode: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockEncode = encode as jest.Mock
    mockEncode.mockReturnValue('UWE2^XE2M{t7~XIoaeofS%n}s:S4A0xZj[R*')
    mockReadFileSync.mockReturnValue(Buffer.from('mock image data'))
    // Reset sharp mock to default implementation
    ;(sharp as unknown as jest.Mock).mockReset()
    ;(sharp as unknown as jest.Mock).mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      ensureAlpha: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: new Uint8ClampedArray(32 * 32 * 4),
        info: { width: 32, height: 32 }
      })
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (
    method: string,
    query?: Record<string, string | string[]>
  ): NextApiRequest =>
    ({
      method,
      query: query || {}
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

    it('should allow GET method', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      // Mock successful fetch and sharp processing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Uint8ClampedArray(32 * 32 * 4),
          info: { width: 32, height: 32 }
        })
      }

      const mockSharpForColor = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(new Uint8Array(100 * 100 * 3))
      }

      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpInstance
      )
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpForColor
      )

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('Parameter Validation', () => {
    it('should return 400 for missing imageUrl parameter', async () => {
      const req = createMockRequest('GET')
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid imageUrl parameter'
      })
    })

    it('should return 400 for empty imageUrl parameter', async () => {
      const req = createMockRequest('GET', { imageUrl: '' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid imageUrl parameter'
      })
    })

    it('should return 400 for non-string imageUrl parameter', async () => {
      const req = createMockRequest('GET', { imageUrl: ['array', 'values'] })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid imageUrl parameter'
      })
    })
  })

  describe('URL Validation', () => {
    it('should return 400 for invalid URL format', async () => {
      const req = createMockRequest('GET', { imageUrl: 'not-a-url' })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or disallowed image URL'
      })
    })

    it('should return 400 for disallowed domain', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://malicious-site.com/image.jpg'
      })
      const res = createMockResponse()

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or disallowed image URL'
      })
    })

    it('should allow images.unsplash.com', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Uint8ClampedArray(32 * 32 * 4),
          info: { width: 32, height: 32 }
        })
      }

      const mockSharpForColor = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(new Uint8Array(100 * 100 * 3))
      }

      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpInstance
      )
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpForColor
      )

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should allow cdn.sanity.io', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://cdn.sanity.io/images/project/image.jpg'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Uint8ClampedArray(32 * 32 * 4),
          info: { width: 32, height: 32 }
        })
      }

      const mockSharpForColor = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(new Uint8Array(100 * 100 * 3))
      }

      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpInstance
      )
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpForColor
      )

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should allow localhost', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'http://localhost:3000/image.jpg'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Uint8ClampedArray(32 * 32 * 4),
          info: { width: 32, height: 32 }
        })
      }

      const mockSharpForColor = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(new Uint8Array(100 * 100 * 3))
      }

      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpInstance
      )
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpForColor
      )

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('Image Fetching', () => {
    it('should return 408 for request timeout', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockImplementationOnce(() => {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 100)
        return Promise.reject(new Error('AbortError'))
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(408)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Request timeout - image took too long to fetch'
      })
    })

    it('should return 400 for HTTP error responses', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch image: HTTP 404: Not Found'
      })
    })

    it('should return 400 for non-image content types', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'text/html' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'URL does not point to a valid image'
      })
    })
  })

  describe('Blurhash Generation', () => {
    it('should return successful blurhash and dominant color', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Uint8ClampedArray(32 * 32 * 4),
          info: { width: 32, height: 32 }
        })
      }

      const mockSharpForColor = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(new Uint8Array(100 * 100 * 3))
      }

      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpInstance
      )
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpForColor
      )

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        blurhash: 'UWE2^XE2M{t7~XIoaeofS%n}s:S4A0xZj[R*',
        dominantColor: '#808080' // Expected from the mock color extraction
      })
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=86400, stale-while-revalidate=86400'
      )
    })

    it('should return 400 for unsupported image format', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Input buffer contains unsupported image format')
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unsupported image format'
      })
    })

    it('should return 500 for generic errors', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to generate blurhash and dominant color'
      })
    })
  })

  describe('Cache Headers', () => {
    it('should set correct cache headers for successful responses', async () => {
      const req = createMockRequest('GET', {
        imageUrl: 'https://images.unsplash.com/photo-123'
      })
      const res = createMockResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'image/jpeg' },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      })

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Uint8ClampedArray(32 * 32 * 4),
          info: { width: 32, height: 32 }
        })
      }

      const mockSharpForColor = {
        resize: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(new Uint8Array(100 * 100 * 3))
      }

      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpInstance
      )
      ;(sharp as unknown as jest.Mock).mockImplementationOnce(
        () => mockSharpForColor
      )

      await handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=86400, stale-while-revalidate=86400'
      )
    })
  })
})
