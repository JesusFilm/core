import { env } from '../../../env'

import type { PhotoCandidate } from './resolveImages'

const SEARCH_QUERY = `
  query AiBuilderSearchUnsplashPhotos(
    $query: String!
    $orientation: UnsplashPhotoOrientation
  ) {
    searchUnsplashPhotos(
      query: $query
      perPage: 5
      contentFilter: high
      orientation: $orientation
    ) {
      results {
        description
        alt_description
        width
        height
        blur_hash
        urls { regular }
        links { download_location }
      }
    }
  }
`

const DOWNLOAD_MUTATION = `
  mutation AiBuilderTriggerUnsplashDownload($url: String!) {
    triggerUnsplashDownload(url: $url)
  }
`

interface UnsplashResult {
  description: string | null
  alt_description: string | null
  width: number
  height: number
  blur_hash: string | null
  urls: { regular: string }
  links: { download_location: string }
}

/** Searches Unsplash through api-media, via the gateway with the interop token. */
export async function searchUnsplashPhotos(
  query: string,
  orientation: 'portrait' | 'landscape'
): Promise<PhotoCandidate[]> {
  const data = await gatewayRequest<{
    searchUnsplashPhotos: { results: UnsplashResult[] }
  }>(SEARCH_QUERY, { query, orientation })

  return data.searchUnsplashPhotos.results.map((photo) => ({
    description: photo.description ?? photo.alt_description ?? '',
    src: photo.urls.regular,
    width: photo.width,
    height: photo.height,
    blurhash: photo.blur_hash ?? '',
    downloadLocation: photo.links.download_location
  }))
}

export async function triggerUnsplashDownload(url: string): Promise<void> {
  await gatewayRequest(DOWNLOAD_MUTATION, { url })
}

async function gatewayRequest<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(env.GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'interop-token': env.INTEROP_TOKEN,
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': env.SERVICE_VERSION
    },
    body: JSON.stringify({ query, variables })
  })
  const result = (await response.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }
  if (result.errors != null && result.errors.length > 0)
    throw new Error(result.errors[0].message)
  if (result.data == null) throw new Error('Empty gateway response')
  return result.data
}
