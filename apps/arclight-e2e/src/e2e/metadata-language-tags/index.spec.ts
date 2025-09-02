import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

test.describe('GET /v2/metadata-language-tags', () => {
  test('returns all metadata language tags', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/metadata-language-tags?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.any(String)
        }
      },
      _embedded: {
        metadataLanguageTags: expect.arrayContaining([
          {
            tag: 'en',
            name: 'English',
            nameNative: 'English',
            _links: {
              self: { href: expect.any(String) },
              metadataLanguageTags: { href: expect.any(String) }
            }
          },
          {
            tag: 'es',
            name: 'Spanish',
            nameNative: 'Español',
            _links: {
              self: { href: expect.any(String) },
              metadataLanguageTags: { href: expect.any(String) }
            }
          }
        ])
      }
    })

    expect(data._embedded.metadataLanguageTags).toHaveLength(20)
  })
})
