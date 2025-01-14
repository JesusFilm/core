import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

interface TestCase {
  countryId: string
  params: Record<string, any>
}

const testCases = {
  basic: {
    countryId: 'US',
    params: {}
  },
  withLanguageIds: {
    countryId: 'US',
    params: { expand: 'languageIds' }
  },
  withCustomApiKey: {
    countryId: 'US',
    params: { apiKey: 'custom-key' }
  }
}

async function getMediaCountry(request: APIRequestContext, testCase: TestCase) {
  const { countryId, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-countries/${countryId}?${queryParams}`
  )
  return response
}

test('basic media country request', async ({ request }) => {
  const response = await getMediaCountry(request, testCases.basic)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    countryId: expect.any(String),
    name: expect.any(String),
    counts: {
      languageCount: {
        value: expect.any(Number),
        description: expect.any(String)
      },
      languageHavingMediaCount: {
        value: expect.any(Number),
        description: expect.any(String)
      }
    },
    _links: expect.any(Object)
  })
})

test('media country with language IDs filter', async ({ request }) => {
  const response = await getMediaCountry(request, testCases.withLanguageIds)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    countryId: expect.any(String),
    name: expect.any(String),
    languageIds: expect.any(Array),
    _links: expect.any(Object)
  })

  expect(data.languageIds.length).toBeGreaterThan(0)
  expect(
    data.languageIds.every((id: any) => typeof id === 'string')
  ).toBeTruthy()
})

test('media country with custom API key', async ({ request }) => {
  const response = await getMediaCountry(request, testCases.withCustomApiKey)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    countryId: expect.any(String),
    name: expect.any(String),
    _links: expect.any(Object)
  })

  // API key specific checks
  expect(data._links.self.href).toContain('apiKey=custom-key')
})

test('media country returns 404 for non-existent ID', async ({ request }) => {
  const response = await getMediaCountry(request, {
    countryId: 'NONEXISTENT',
    params: {}
  })

  expect(response.status()).toBe(404)
  const data = await response.json()
  expect(data).toMatchObject({
    message: expect.stringContaining('not found'),
    logref: 404
  })
})
