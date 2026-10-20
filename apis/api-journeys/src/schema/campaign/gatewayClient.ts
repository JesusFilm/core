import { GraphQLError } from 'graphql'

/**
 * Lookups against other subgraphs through the gateway, in the shape of the QR
 * service's request helper. Mocked per spec; never called inside a transaction.
 */
async function graphqlRequest(
  query: string,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const gatewayUrl = process.env.GATEWAY_URL
  if (gatewayUrl == null)
    throw new GraphQLError('Gateway URL not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'interop-token': process.env.INTEROP_TOKEN ?? '',
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    },
    body: JSON.stringify({ query, variables })
  })

  const result = (await response.json()) as {
    data?: Record<string, unknown>
    errors?: Array<{ message: string }>
  }

  if (result.errors != null && result.errors.length > 0)
    throw new GraphQLError(result.errors[0].message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  return result.data ?? {}
}

export interface GatewayLanguage {
  id: string
  bcp47: string | null
}

/** Resolve an api-languages Language by id; `null` when it does not exist. */
export async function fetchLanguage(
  id: string
): Promise<GatewayLanguage | null> {
  const query = `
    query CampaignLanguage($id: ID!) {
      language(id: $id) {
        id
        bcp47
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const language = data.language as GatewayLanguage | null | undefined
  return language ?? null
}

export interface GatewayWatchVideo {
  id: string
  label: string
  childrenCount: number
  /** The variant the slug named, by its language; only a slug lookup carries it. */
  variant?: { language: { id: string } } | null
}

/**
 * Resolve a Watch variant slug (`<videoSlug>/<languageSlug>`) to its Video
 * through api-media's `video(id, idType: slug)`, which serves published
 * videos only, with the language of the variant the slug named; `null` when
 * the slug resolves to nothing.
 */
export async function fetchWatchVideoBySlug(
  slug: string
): Promise<GatewayWatchVideo | null> {
  const query = `
    query CampaignWatchVideo($id: ID!) {
      video(id: $id, idType: slug) {
        id
        label
        childrenCount
        variant {
          language {
            id
          }
        }
      }
    }
  `
  try {
    const data = await graphqlRequest(query, { id: slug })
    const video = data.video as GatewayWatchVideo | null | undefined
    return video ?? null
  } catch (error) {
    if (error instanceof GraphQLError) return null
    throw error
  }
}

/**
 * Resolve a Watch Video by its database id through api-media's
 * `video(id, idType: databaseId)`, which serves published videos only;
 * `null` when the id resolves to nothing.
 */
export async function fetchWatchVideoById(
  id: string
): Promise<GatewayWatchVideo | null> {
  const query = `
    query CampaignWatchVideoById($id: ID!) {
      video(id: $id, idType: databaseId) {
        id
        label
        childrenCount
      }
    }
  `
  try {
    const data = await graphqlRequest(query, { id })
    const video = data.video as GatewayWatchVideo | null | undefined
    return video ?? null
  } catch (error) {
    if (error instanceof GraphQLError) return null
    throw error
  }
}

export interface GatewayCountry {
  id: string
}

/** Resolve an api-languages Country by id; `null` when it does not exist. */
export async function fetchCountry(id: string): Promise<GatewayCountry | null> {
  const query = `
    query CampaignCountry($id: ID!) {
      country(id: $id) {
        id
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const country = data.country as GatewayCountry | null | undefined
  return country ?? null
}

export interface GatewayShortLink {
  id: string
  pathname: string
  hostname: string
}

/**
 * Resolve an api-media ShortLink by id to the pieces of its public address;
 * `null` when it no longer exists. The Share Link a region hands out is
 * `https://<hostname>/<pathname>`.
 */
export async function fetchShortLink(
  id: string
): Promise<GatewayShortLink | null> {
  const query = `
    query CampaignShortLink($id: String!) {
      shortLink(id: $id) {
        ... on QueryShortLinkSuccess {
          data {
            id
            pathname
            domain {
              hostname
            }
          }
        }
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const result = data.shortLink as
    | { data?: { id: string; pathname: string; domain: { hostname: string } } }
    | null
    | undefined
  const shortLink = result?.data
  if (shortLink == null) return null
  return {
    id: shortLink.id,
    pathname: shortLink.pathname,
    hostname: shortLink.domain.hostname
  }
}

/** The public address of a resolved short link. */
export function shortLinkUrl(shortLink: GatewayShortLink): string {
  return `https://${shortLink.hostname}/${shortLink.pathname}`
}

/**
 * The English name of an api-languages Language, for machine-translation
 * prompts; `null` when the language does not exist.
 */
export async function fetchLanguageName(id: string): Promise<string | null> {
  const query = `
    query CampaignLanguageName($id: ID!) {
      language(id: $id) {
        id
        name(languageId: "529") {
          value
          primary
        }
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const language = data.language as
    | { name: Array<{ value: string; primary: boolean }> }
    | null
    | undefined
  if (language == null) return null
  const names = language.name
  return (names.find((name) => !name.primary) ?? names[0])?.value ?? null
}
