import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function searchResources(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/resources?${queryParams}`
  )
  return response
}

test.describe('GET /v2/resources', () => {
  test.fixme('returns United States in countries', async ({ request }) => {
    const response = await searchResources(request, { term: 'United' })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.any(String)
        }
      },
      _embedded: {
        countries: [
          {
            countryId: 'US',
            name: 'United States',
            _links: {
              self: {
                href: expect.any(String)
              }
            }
          }
        ]
      }
    })
  })

  test('returns English in languages', async ({ request }) => {
    const response = await searchResources(request, { term: 'English' })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.any(String)
        }
      },
      _embedded: {
        languages: [
          {
            languageId: 529,
            name: 'English',
            _links: {
              self: {
                href: expect.any(String)
              }
            }
          }
        ]
      }
    })
  })

  test.fixme('search returns Paper Hats in videos', async ({ request }) => {
    // Skipped because Algolia integration is not ready
    const response = await searchResources(request, {
      term: 'Paper Hats',
      metadataLanguageTags: 'en'
    })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _embedded: {
        resources: {
          mediaComponents: expect.any(Array)
        }
      }
    })

    const videos = data._embedded.resources.mediaComponents
    const paperHatsVideo = videos.find((video: any) =>
      video.title.toLowerCase().includes('paper hats')
    )

    expect(paperHatsVideo).toBeDefined()
    expect(paperHatsVideo).toMatchObject({
      mediaComponentId: expect.any(String),
      title: expect.stringContaining('Paper Hats'),
      _links: expect.any(Object)
    })
  })
})
