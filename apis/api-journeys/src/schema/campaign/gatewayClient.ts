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
}

/**
 * Resolve a Watch variant slug (`<videoSlug>/<languageSlug>`) to its Video
 * through api-media's `video(id, idType: slug)`, which serves published
 * videos only; `null` when the slug resolves to nothing.
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
