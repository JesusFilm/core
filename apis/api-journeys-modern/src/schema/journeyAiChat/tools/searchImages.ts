import { tool } from 'ai'
import { z } from 'zod'

import { env } from '../../../env'

interface UnsplashSearchResponse {
  results: Array<{
    id: string
    urls: { raw: string }
    alt_description: string | null
    user: {
      name: string
      links: { html: string }
    }
  }>
}

interface SearchImagesResult {
  results: Array<{
    query: string
    images: Array<{
      id: string
      src: string
      alt: string
      photographer: string
      photographerUrl: string
    }>
  }>
}

async function searchUnsplash(
  query: string
): Promise<UnsplashSearchResponse> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3`
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`
    }
  })

  if (!response.ok) {
    throw new Error(
      `Unsplash API error: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<UnsplashSearchResponse>
}

export const searchImagesTool = tool({
  description:
    'Search for images on Unsplash. Use before adding any image to a journey. Accepts up to 5 search queries at once.',
  inputSchema: z.object({
    queries: z
      .array(z.string())
      .min(1)
      .max(5)
      .describe('Search queries for images')
  }),
  execute: async ({
    queries
  }: {
    queries: string[]
  }): Promise<SearchImagesResult> => {
    const settled = await Promise.allSettled(
      queries.map(async (query) => {
        const data = await searchUnsplash(query)
        return {
          query,
          images: data.results.map((photo) => ({
            id: photo.id,
            src: photo.urls.raw,
            alt: photo.alt_description ?? '',
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html
          }))
        }
      })
    )

    return {
      results: settled
        .filter(
          (r): r is PromiseFulfilledResult<SearchImagesResult['results'][number]> =>
            r.status === 'fulfilled'
        )
        .map((r) => r.value)
    }
  }
})
