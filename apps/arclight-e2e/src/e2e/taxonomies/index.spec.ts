import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function getTaxonomies(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/taxonomies?${queryParams}`
  )
  return response
}

test.describe('GET /v2/taxonomies', () => {
  test('returns all taxonomies in English', async ({ request }) => {
    const response = await getTaxonomies(request, {})
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.stringMatching(/\/v2\/taxonomies\?.+/)
        }
      },
      _embedded: {
        taxonomies: {
          types: {
            terms: {
              container: {
                label: 'Container',
                metadataLanguageTag: 'en'
              },
              content: {
                label: 'Content',
                metadataLanguageTag: 'en'
              }
            },
            _links: {
              self: {
                href: expect.stringMatching(
                  /\/v2\/taxonomies\/types\?apiKey=.+/
                )
              },
              taxonomies: {
                href: expect.stringMatching(/\/v2\/taxonomies\?apiKey=.+/)
              }
            }
          }
        }
      }
    })
  })

  test('returns translations with fallback', async ({ request }) => {
    const response = await getTaxonomies(request, {
      metadataLanguageTags: 'es,en'
    })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const typesTaxonomy = data._embedded.taxonomies.types

    // Each term should have a label and metadataLanguageTag
    Object.values(typesTaxonomy.terms).forEach((term: any) => {
      expect(term).toMatchObject({
        label: expect.any(String),
        metadataLanguageTag: expect.stringMatching(/^(es|en)$/)
      })
    })
  })

  test('returns 406 for invalid metadata language tag', async ({ request }) => {
    const response = await getTaxonomies(request, {
      metadataLanguageTags: 'invalid'
    })

    expect(response.ok()).toBeFalsy()
    expect(response.status()).toBe(406)
    const data = await response.json()
    expect(data).toEqual({
      message: 'Not acceptable metadata language tag(s): invalid'
    })
  })
})
