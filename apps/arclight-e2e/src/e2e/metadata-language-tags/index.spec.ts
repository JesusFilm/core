import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

test.describe('GET /v2/metadata-language-tags', () => {
  test('returns all metadata language tags', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/metadata-language-tags?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    // Basic shape checks
    expect(data).toMatchObject({
      _links: { self: { href: expect.any(String) } },
      _embedded: { metadataLanguageTags: expect.any(Array) }
    })

    const items = data._embedded.metadataLanguageTags
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThanOrEqual(2)

    // Each item has required fields and links
    for (const item of items) {
      expect(item).toEqual(
        expect.objectContaining({
          tag: expect.any(String),
          name: expect.any(String),
          nameNative: expect.any(String),
          _links: expect.objectContaining({
            self: expect.objectContaining({ href: expect.any(String) }),
            metadataLanguageTags: expect.objectContaining({
              href: expect.any(String)
            })
          })
        })
      )
    }

    // Ensure common tags are present without depending on names
    const tags = new Set(items.map((i: { tag: string }) => i.tag))
    expect(tags.has('en')).toBe(true)
    expect(tags.has('es')).toBe(true)
  })
})
