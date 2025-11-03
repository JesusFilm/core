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
    expect(data).toEqual([
      {
        tag: 'en',
        name: 'English',
        nameNative: 'English',
        _links: {
          self: {
            href: expect.stringMatching(
              /\/v2\/metadata-language-tags\/en\?apiKey=.+/
            )
          },
          metadataLanguageTags: {
            href: expect.stringMatching(
              /\/v2\/metadata-language-tags\?apiKey=.+/
            )
          }
        }
      }
    ])
  })
})
