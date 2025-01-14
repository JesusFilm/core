import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

interface TestCase {
  metadataLanguageTag: string
  params: Record<string, any>
}

const testCases = {
  basic: {
    metadataLanguageTag: 'en',
    params: {}
  },
  withCustomApiKey: {
    metadataLanguageTag: 'es',
    params: { apiKey: 'custom-key' }
  }
}

async function getMetadataLanguageTag(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { metadataLanguageTag, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/metadata-language-tags/${metadataLanguageTag}?${queryParams}`
  )
  return response
}

test('basic metadata language tag request', async ({ request }) => {
  const response = await getMetadataLanguageTag(request, testCases.basic)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    metadataLanguageTag: expect.any(String),
    name: expect.any(String),
    nativeName: expect.any(String),
    _links: expect.any(Object)
  })
})

test('metadata language tag with custom API key', async ({ request }) => {
  const response = await getMetadataLanguageTag(
    request,
    testCases.withCustomApiKey
  )
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    metadataLanguageTag: expect.any(String),
    name: expect.any(String),
    nativeName: expect.any(String),
    _links: expect.any(Object)
  })

  // API key specific checks
  expect(data._links.self.href).toContain('apiKey=custom-key')
})

test('metadata language tag returns 404 for non-existent tag', async ({
  request
}) => {
  const response = await getMetadataLanguageTag(request, {
    metadataLanguageTag: 'xx',
    params: {}
  })

  expect(response.status()).toBe(404)
  const data = await response.json()
  expect(data).toMatchObject({
    message: expect.stringContaining('not found'),
    logref: 404
  })
})
