import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

async function getTaxonomy(
  request: APIRequestContext,
  category: string,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/taxonomies/${category}?${queryParams}`
  )
  return response
}

test.describe('GET /v2/taxonomies/[category]', () => {
  test('returns types taxonomy', async ({ request }) => {
    const response = await getTaxonomy(request, 'types', {})
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
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
          href: expect.stringMatching(/\/v2\/taxonomies\/types\?apiKey=.+/)
        },
        taxonomies: {
          href: expect.stringMatching(/\/v2\/taxonomies\?apiKey=.+/)
        }
      }
    })
  })

  test('returns translations with fallback', async ({ request }) => {
    const response = await getTaxonomy(request, 'types', {
      metadataLanguageTags: 'es,en'
    })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const { terms } = data

    // Each term should have a label and metadataLanguageTag
    Object.values(terms).forEach((term: any) => {
      expect(term).toMatchObject({
        label: expect.any(String),
        metadataLanguageTag: expect.stringMatching(/^(es|en)$/)
      })
    })
  })

  test('returns 404 for non-existent category', async ({ request }) => {
    const response = await getTaxonomy(request, 'nonexistent', {})

    expect(response.ok()).toBeFalsy()
    expect(response.status()).toBe(404)
    const data = await response.json()
    expect(data).toEqual({
      message: "Taxonomy 'nonexistent' not found!",
      logref: 404
    })
  })
})
