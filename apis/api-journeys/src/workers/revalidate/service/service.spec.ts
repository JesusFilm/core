import { Job } from 'bullmq'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { Logger } from 'pino'
import { type MockedFunction, vi } from 'vitest'

import {
  generateFacebookAppAccessToken,
  revalidate,
  revalidatePaths,
  service
} from './service'

vi.mock('node-fetch')

const mockFetch = fetch as MockedFunction<typeof fetch>
const mockLogger = {
  error: vi.fn()
}

describe('RevalidateService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('service', () => {
    it('should handle revalidate job', async () => {
      const job = {
        name: 'revalidate',
        data: { slug: 'test-journey' }
      } as Job

      mockFetch.mockResolvedValueOnce({
        ok: true
      } as any)

      await service(job)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/revalidate?accessToken=test-token&slug=test-journey'
      )
    })

    it('should handle the paths[] job variant beside the slug job', async () => {
      const job = {
        name: 'revalidate',
        data: {
          paths: ['/home/campaign/christmas', '/home/campaign/christmas/eur']
        }
      } as Job

      mockFetch.mockResolvedValue({ ok: true } as any)

      await service(job)

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/revalidate?accessToken=test-token&path=%2Fhome%2Fcampaign%2Fchristmas'
      )
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/revalidate?accessToken=test-token&path=%2Fhome%2Fcampaign%2Fchristmas%2Feur'
      )
    })
  })

  describe('revalidatePaths', () => {
    it('calls /api/revalidate once per path', async () => {
      const job = {
        data: {
          paths: [
            '/home/campaign/a',
            '/custom.example.com',
            '/custom.example.com/eur'
          ]
        }
      } as Job

      mockFetch.mockResolvedValue({ ok: true } as any)

      await revalidatePaths(job)

      expect(mockFetch.mock.calls.map((call) => call[0])).toEqual([
        'https://example.com/api/revalidate?accessToken=test-token&path=%2Fhome%2Fcampaign%2Fa',
        'https://example.com/api/revalidate?accessToken=test-token&path=%2Fcustom.example.com',
        'https://example.com/api/revalidate?accessToken=test-token&path=%2Fcustom.example.com%2Feur'
      ])
    })

    it('logs a failed path and continues with the rest', async () => {
      const job = {
        data: { paths: ['/home/campaign/a', '/home/campaign/a/eur'] }
      } as Job

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true } as any)

      await revalidatePaths(job, mockLogger as unknown as Logger)

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to revalidate /home/campaign/a: Error: Network error'
      )
    })

    it('logs a rejected revalidation with its status', async () => {
      const job = {
        data: { paths: ['/home/campaign/a'] }
      } as Job

      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as any)

      await revalidatePaths(job, mockLogger as unknown as Logger)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to revalidate /home/campaign/a: HTTP 401'
      )
    })
  })

  describe('revalidate', () => {
    it('should revalidate journey with custom hostname', async () => {
      const job = {
        data: { slug: 'test-journey', hostname: 'custom.example.com' }
      } as Job

      mockFetch.mockResolvedValueOnce({
        ok: true
      } as any)

      await revalidate(job)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/revalidate?accessToken=test-token&slug=test-journey&hostname=custom.example.com'
      )
    })

    it('should handle Facebook re-scraping when enabled', async () => {
      const job = {
        data: { slug: 'test-journey', fbReScrape: true }
      } as Job

      mockFetch
        .mockResolvedValueOnce({
          ok: true
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'fb-token' })
        } as any)
        .mockResolvedValueOnce({
          ok: true
        } as any)

      await revalidate(job)

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://graph.facebook.com/oauth/access_token?client_id=fb-app-id&client_secret=fb-app-secret&grant_type=client_credentials'
      )

      const thirdCallArgs = mockFetch.mock.calls[2]
      expect(thirdCallArgs[0]).toBe(
        'https://graph.facebook.com/v19.0/?access_token=fb-token'
      )
      expect(thirdCallArgs[1]).toHaveProperty('method', 'POST')
      expect(thirdCallArgs[1]).toHaveProperty('body')

      const formData = thirdCallArgs[1]?.body as FormData
      const formDataString = formData.getBuffer().toString()
      expect(formDataString).toContain('https://example.com/home/test-journey')
      expect(formDataString).toContain('true')
    })

    it('should handle revalidation errors', async () => {
      const job = {
        data: { slug: 'test-journey' }
      } as Job

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await revalidate(job, mockLogger as unknown as Logger)
      await expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to revalidate: Error: Network error'
      )
    })
  })

  describe('generateFacebookAppAccessToken', () => {
    it('should return access token when credentials are valid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fb-token' })
      } as any)

      const token = await generateFacebookAppAccessToken()

      expect(token).toBe('fb-token')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/oauth/access_token?client_id=fb-app-id&client_secret=fb-app-secret&grant_type=client_credentials'
      )
    })

    it('should handle Facebook API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      } as any)

      await expect(generateFacebookAppAccessToken()).rejects.toThrow(
        'Failed to generate access token: Bad Request'
      )
    })
  })
})
