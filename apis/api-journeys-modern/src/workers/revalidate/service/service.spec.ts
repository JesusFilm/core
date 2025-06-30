import { Job } from 'bullmq'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { Logger } from 'pino'

import { generateFacebookAppAccessToken, revalidate, service } from './service'

jest.mock('node-fetch')

const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockLogger = {
  error: jest.fn()
}

describe('RevalidateService', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetAllMocks()
    process.env = {
      ...originalEnv,
      JOURNEYS_URL: 'https://example.com',
      JOURNEYS_REVALIDATE_ACCESS_TOKEN: 'test-token',
      FACEBOOK_APP_ID: 'fb-app-id',
      FACEBOOK_APP_SECRET: 'fb-app-secret'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.useRealTimers()
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
  })

  describe('revalidate', () => {
    it('should throw error if environment variables are missing', async () => {
      delete process.env.JOURNEYS_URL
      delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN

      const job = {
        data: { slug: 'test-journey' }
      } as Job

      await revalidate(job, mockLogger as unknown as Logger)
      await expect(mockLogger.error).toHaveBeenCalledWith(
        'JOURNEYS_URL or JOURNEYS_REVALIDATE_ACCESS_TOKEN not configured'
      )
    })

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
    it('should throw error if Facebook credentials are missing', async () => {
      delete process.env.FACEBOOK_APP_ID
      delete process.env.FACEBOOK_APP_SECRET

      await expect(generateFacebookAppAccessToken()).rejects.toThrow(
        'Facebook App ID or App Secret not configured'
      )
    })

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
