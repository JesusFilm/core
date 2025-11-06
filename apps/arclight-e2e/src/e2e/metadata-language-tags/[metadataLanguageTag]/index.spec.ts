import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

test.describe('GET /v2/metadata-language-tags/[metadataLanguageTag]', () => {
  test('returns English metadata language tag', async ({ request }) => {
    const metadataLanguageTag = 'en'

    const response = await request.get(
      `${await getBaseUrl()}/v2/metadata-language-tags/${metadataLanguageTag}?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data[0]).toEqual(
      expect.objectContaining({
        tag: 'en',
        name: expect.any(String),
        nameNative: expect.any(String),
        _links: expect.objectContaining({
          self: expect.objectContaining({
            href: expect.stringMatching(/\/v2\/metadata-language-tags\/en\?apiKey=.+/)
          }),
          metadataLanguageTags: expect.objectContaining({
            // Allow optional trailing slash before query
            href: expect.stringMatching(/\/v2\/metadata-language-tags\/?\?apiKey=.+/)
          })
        })
      })
    )
  })
})
