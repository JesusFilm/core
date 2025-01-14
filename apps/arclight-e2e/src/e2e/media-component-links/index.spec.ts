import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

interface TestCase {
  params: Record<string, any>
}

const testCases = {
  basic: {
    params: { ids: ['1_jf-0-0', '1_jf-0-1'] }
  },
  withCustomApiKey: {
    params: { ids: ['1_jf-0-0'], apiKey: 'custom-key' }
  }
}

async function getMediaComponentLinks(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-component-links?${queryParams}`
  )
  return response
}

test('basic media component links request', async ({ request }) => {
  const response = await getMediaComponentLinks(request, testCases.basic)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      mediaComponentsLinks: expect.any(Array)
    },
    _links: expect.any(Object)
  })

  // Check each media component link
  data._embedded.mediaComponentsLinks.forEach((link: any) => {
    expect(link).toMatchObject({
      mediaComponentId: expect.any(String),
      linkedMediaComponentIds: expect.any(Object),
      _links: expect.any(Object)
    })

    // Check linked IDs structure
    if (link.linkedMediaComponentIds.containedBy) {
      expect(
        Array.isArray(link.linkedMediaComponentIds.containedBy)
      ).toBeTruthy()
      link.linkedMediaComponentIds.containedBy.forEach((id: any) => {
        expect(typeof id).toBe('string')
      })
    }
  })
})

test('media component links with custom API key', async ({ request }) => {
  const response = await getMediaComponentLinks(
    request,
    testCases.withCustomApiKey
  )
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      mediaComponentsLinks: expect.any(Array)
    },
    _links: expect.any(Object)
  })

  // API key specific checks
  expect(data._links.self.href).toContain('apiKey=custom-key')
})

test('media component links returns empty array for non-existent IDs', async ({
  request
}) => {
  const response = await getMediaComponentLinks(request, {
    params: { ids: ['nonexistent_id'] }
  })
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      mediaComponentsLinks: []
    },
    _links: expect.any(Object)
  })
})
