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
