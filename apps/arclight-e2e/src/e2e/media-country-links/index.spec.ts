import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

interface TestCase {
  params: Record<string, any>
}

const testCases = {
  basic: {
    params: { ids: ['US', 'GB'] }
  },
  withCustomApiKey: {
    params: { ids: ['US'], apiKey: 'custom-key' }
  }
}

async function getMediaCountryLinks(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-country-links?${queryParams}`
  )
  return response
}

test('basic media country links request', async ({ request }) => {
  const response = await getMediaCountryLinks(request, testCases.basic)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      mediaCountriesLinks: expect.any(Array)
    },
    _links: expect.any(Object)
  })

  // Check each media country link
  data._embedded.mediaCountriesLinks.forEach((link: any) => {
    expect(link).toMatchObject({
      countryId: expect.any(String),
      linkedLanguageIds: expect.any(Array),
      _links: expect.any(Object)
    })

    // Check linked IDs structure
    expect(Array.isArray(link.linkedLanguageIds)).toBeTruthy()
    link.linkedLanguageIds.forEach((id: any) => {
      expect(typeof id).toBe('string')
    })
  })
})

test('media country links with custom API key', async ({ request }) => {
  const response = await getMediaCountryLinks(
    request,
    testCases.withCustomApiKey
  )
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      mediaCountriesLinks: expect.any(Array)
    },
    _links: expect.any(Object)
  })

  // API key specific checks
  expect(data._links.self.href).toContain('apiKey=custom-key')
})

test('media country links returns empty array for non-existent IDs', async ({
  request
}) => {
  const response = await getMediaCountryLinks(request, {
    params: { ids: ['NONEXISTENT'] }
  })
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      mediaCountriesLinks: []
    },
    _links: expect.any(Object)
  })
})
