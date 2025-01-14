import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

interface TestCase {
  languageId: string
  params: Record<string, any>
}

const testCases = {
  basic: {
    languageId: '529',
    params: {}
  },
  withCountryIds: {
    languageId: '529',
    params: { expand: 'countryIds' }
  },
  withCustomApiKey: {
    languageId: '529',
    params: { apiKey: 'custom-key' }
  }
}

async function getMediaLanguage(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { languageId, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-languages/${languageId}?${queryParams}`
  )
  return response
}

test('basic media language request', async ({ request }) => {
  const response = await getMediaLanguage(request, testCases.basic)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    languageId: expect.any(String),
    name: expect.any(String),
    counts: {
      speakerCount: {
        value: expect.any(Number),
        description: expect.any(String)
      },
      countriesCount: {
        value: expect.any(Number),
        description: expect.any(String)
      },
      series: {
        value: expect.any(Number),
        description: expect.any(String)
      },
      featureFilm: {
        value: expect.any(Number),
        description: expect.any(String)
      },
      shortFilm: {
        value: expect.any(Number),
        description: expect.any(String)
      }
    },
    _links: expect.any(Object)
  })
})

test('media language with country IDs filter', async ({ request }) => {
  const response = await getMediaLanguage(request, testCases.withCountryIds)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    languageId: expect.any(String),
    name: expect.any(String),
    countryIds: expect.any(Array),
    _links: expect.any(Object)
  })

  expect(data.countryIds.length).toBeGreaterThan(0)
  expect(
    data.countryIds.every((id: any) => typeof id === 'string')
  ).toBeTruthy()
})

test('media language with custom API key', async ({ request }) => {
  const response = await getMediaLanguage(request, testCases.withCustomApiKey)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    languageId: expect.any(String),
    name: expect.any(String),
    _links: expect.any(Object)
  })

  // API key specific checks
  expect(data._links.self.href).toContain('apiKey=custom-key')
})

test('media language returns 404 for non-existent ID', async ({ request }) => {
  const response = await getMediaLanguage(request, {
    languageId: '999999',
    params: {}
  })

  expect(response.status()).toBe(404)
  const data = await response.json()
  expect(data).toMatchObject({
    message: expect.stringContaining('not found'),
    logref: 404
  })
})
