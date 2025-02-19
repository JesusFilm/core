import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

test.describe('GET /v2/metadata-language-tags', () => {
  test('returns all metadata language tags', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/metadata-language-tags/?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.stringMatching(/\/v2\/metadata-language-tags\/.+/)
        }
      },
      _embedded: {
        metadataLanguageTags: expect.arrayContaining([
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
          },
          {
            tag: 'es',
            name: 'Spanish',
            nameNative: 'Español',
            _links: {
              self: {
                href: expect.stringMatching(
                  /\/v2\/metadata-language-tags\/es\?apiKey=.+/
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
      }
    })

    expect(data._embedded.metadataLanguageTags).toHaveLength(19)
  })
})
