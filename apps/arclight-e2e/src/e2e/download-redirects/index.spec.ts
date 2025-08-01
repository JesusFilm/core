import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

const SPECIAL_API_KEY = '607f41540b2ca6.32427244'
const REGULAR_API_KEY = 'regular_test_key'
const mediaComponentId = '2_0-PaperHats'
const languageId = '529'

// Just to run arclight-e2e
test.describe('Download Redirects', () => {
  test.describe('/dl/ - Low Quality Downloads', () => {
    test('redirects to low quality download without apiKey', async ({
      request
    }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dl/${mediaComponentId}/${languageId}`,
        { maxRedirects: 0 }
      )

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBeDefined()
      expect(response.headers()['location']).toContain('http')
    })

    test('redirects to low quality download with regular apiKey', async ({
      request
    }) => {
      const params = createQueryParams({ apiKey: REGULAR_API_KEY })
      const response = await request.get(
        `${await getBaseUrl()}/dl/${mediaComponentId}/${languageId}?${params}`,
        { maxRedirects: 0 }
      )

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBeDefined()
      expect(response.headers()['location']).toContain('http')
    })

    test('uses distroLow fallback for special apiKey', async ({ request }) => {
      const params = createQueryParams({ apiKey: SPECIAL_API_KEY })
      const response = await request.get(
        `${await getBaseUrl()}/dl/${mediaComponentId}/${languageId}?${params}`,
        { maxRedirects: 0 }
      )

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBeDefined()
      expect(response.headers()['location']).toContain('http')

      // Note: We can't directly verify which quality was used from the redirect,
      // but we can verify the redirect works and the URL is valid
    })

    test('returns 404 for non-existent media component', async ({
      request
    }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dl/non-existent/529`
      )

      expect(response.status()).toBe(404)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    test('returns 404 for non-existent language', async ({ request }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dl/${mediaComponentId}/99999`
      )

      expect(response.status()).toBe(404)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })

  test.describe('/dh/ - High Quality Downloads', () => {
    test('redirects to high quality download without apiKey', async ({
      request
    }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dh/${mediaComponentId}/${languageId}`,
        { maxRedirects: 0 }
      )

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBeDefined()
      expect(response.headers()['location']).toContain('http')
    })

    test('redirects to high quality download with regular apiKey', async ({
      request
    }) => {
      const params = createQueryParams({ apiKey: REGULAR_API_KEY })
      const response = await request.get(
        `${await getBaseUrl()}/dh/${mediaComponentId}/${languageId}?${params}`,
        { maxRedirects: 0 }
      )

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBeDefined()
      expect(response.headers()['location']).toContain('http')
    })

    test('uses distroHigh fallback for special apiKey', async ({ request }) => {
      const params = createQueryParams({ apiKey: SPECIAL_API_KEY })
      const response = await request.get(
        `${await getBaseUrl()}/dh/${mediaComponentId}/${languageId}?${params}`,
        { maxRedirects: 0 }
      )

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBeDefined()
      expect(response.headers()['location']).toContain('http')

      // Note: We can't directly verify which quality was used from the redirect,
      // but we can verify the redirect works and the URL is valid
    })

    test('returns 404 for non-existent media component', async ({
      request
    }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dh/non-existent/529`
      )

      expect(response.status()).toBe(404)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    test('returns 404 for non-existent language', async ({ request }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dh/${mediaComponentId}/99999`
      )

      expect(response.status()).toBe(404)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })

  test.describe('CORS Headers', () => {
    test('download routes include CORS headers', async ({ request }) => {
      const response = await request.get(
        `${await getBaseUrl()}/dl/${mediaComponentId}/${languageId}`,
        { maxRedirects: 0 }
      )

      expect(response.headers()['access-control-allow-origin']).toBe('*')
      expect(response.headers()['access-control-allow-methods']).toBe(
        'GET, OPTIONS'
      )
      expect(response.headers()['access-control-allow-headers']).toBe('*')
      expect(response.headers()['access-control-expose-headers']).toBe('*')
    })

    test('OPTIONS request returns correct CORS headers', async ({
      request
    }) => {
      const response = await request.fetch(
        `${await getBaseUrl()}/dl/${mediaComponentId}/${languageId}`,
        { method: 'OPTIONS' }
      )

      expect(response.status()).toBe(204)
      expect(response.headers()['access-control-allow-origin']).toBe('*')
      expect(response.headers()['access-control-allow-methods']).toBe(
        'GET, OPTIONS'
      )
      expect(response.headers()['access-control-allow-headers']).toBe('*')
      expect(response.headers()['access-control-expose-headers']).toBe('*')
    })
  })
})
