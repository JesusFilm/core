import { getCachedSlug, normalizeId, putCachedSlug } from './slugCache'

type ResolveWatchRedirectParams = {
  videoId: string
  languageId: string
  graphQlEndpoint?: string
}

type ResolveWatchRedirectResult =
  | {
      type: 'redirect'
      location: string
    }
  | {
      type: 'notFound'
    }
  | {
      type: 'error'
    }

type GraphQlResponse = {
  data?: {
    videos?: Array<{ slug?: string | null }> | null
    languages?: Array<{ slug?: string | null }> | null
  }
  errors?: unknown[]
}

const GRAPHQL_FETCH_TIMEOUT_MS = 5000

const VIDEO_AND_LANGUAGE_SLUGS_QUERY = `
  query GetWatchRedirectSlugs($videoIds: [ID!]!, $languageIds: [ID!]!) {
    videos(where: { ids: $videoIds }, limit: 1) {
      slug
    }
    languages(where: { ids: $languageIds }, limit: 1) {
      slug
    }
  }
`

const VIDEO_SLUG_QUERY = `
  query GetWatchRedirectVideoSlug($videoIds: [ID!]!) {
    videos(where: { ids: $videoIds }, limit: 1) {
      slug
    }
  }
`

const LANGUAGE_SLUG_QUERY = `
  query GetWatchRedirectLanguageSlug($languageIds: [ID!]!) {
    languages(where: { ids: $languageIds }, limit: 1) {
      slug
    }
  }
`

async function fetchGraphQlSlugs({
  endpoint,
  query,
  variables
}: {
  endpoint: string
  query: string
  variables: Record<string, string | string[]>
}): Promise<GraphQlResponse | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GRAPHQL_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    })

    if (!response.ok) return null

    const body = (await response.json()) as GraphQlResponse
    if (body.errors != null && body.errors.length > 0) return null
    return body
  } finally {
    clearTimeout(timeout)
  }
}

function buildWatchLocation(videoSlug: string, languageSlug: string): string {
  return `/watch/${encodeURIComponent(videoSlug)}.html/${encodeURIComponent(
    languageSlug
  )}.html`
}

export async function resolveWatchRedirect({
  videoId,
  languageId,
  graphQlEndpoint
}: ResolveWatchRedirectParams): Promise<ResolveWatchRedirectResult> {
  if (!graphQlEndpoint) return { type: 'error' }

  const normalizedVideoId = normalizeId(videoId)
  const normalizedLanguageId = normalizeId(languageId)

  let videoSlug = await getCachedSlug('video', normalizedVideoId)
  let languageSlug = await getCachedSlug('language', normalizedLanguageId)

  if (videoSlug != null && languageSlug != null) {
    return {
      type: 'redirect',
      location: buildWatchLocation(videoSlug, languageSlug)
    }
  }

  const missingVideoSlug = videoSlug == null
  const missingLanguageSlug = languageSlug == null

  const query =
    missingVideoSlug && missingLanguageSlug
      ? VIDEO_AND_LANGUAGE_SLUGS_QUERY
      : missingVideoSlug
        ? VIDEO_SLUG_QUERY
        : LANGUAGE_SLUG_QUERY

  const variables = {
    ...(missingVideoSlug && { videoIds: [normalizedVideoId] }),
    ...(missingLanguageSlug && { languageIds: [normalizedLanguageId] })
  }

  try {
    const graphQlResponse = await fetchGraphQlSlugs({
      endpoint: graphQlEndpoint,
      query,
      variables
    })

    if (graphQlResponse == null) return { type: 'error' }

    if (missingVideoSlug) {
      videoSlug = graphQlResponse.data?.videos?.[0]?.slug?.trim() ?? null
    }

    if (missingLanguageSlug) {
      languageSlug = graphQlResponse.data?.languages?.[0]?.slug?.trim() ?? null
    }

    if (!videoSlug || !languageSlug) return { type: 'notFound' }

    if (missingVideoSlug) {
      await putCachedSlug('video', normalizedVideoId, videoSlug)
    }

    if (missingLanguageSlug) {
      await putCachedSlug('language', normalizedLanguageId, languageSlug)
    }

    return {
      type: 'redirect',
      location: buildWatchLocation(videoSlug, languageSlug)
    }
  } catch (error) {
    console.error('JF watch redirect GraphQL error:', error)
    return { type: 'error' }
  }
}
