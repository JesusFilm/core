import { z } from 'zod'

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * The importer sends a Firebase ID token in the `Authorization` header on
 * every GraphQL request, so the endpoint must use TLS unless it points at a
 * loopback address (local development against a backend on this machine).
 */
export function isAllowedGraphQLEndpoint(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol === 'https:') return true
  return url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname)
}

export const GRAPHQL_ENDPOINT_PROTOCOL_MESSAGE =
  'must use https:// (http:// is only allowed for localhost)'

export const graphqlEndpointSchema = z
  .url()
  .trim()
  .min(1)
  .refine(isAllowedGraphQLEndpoint, {
    message: GRAPHQL_ENDPOINT_PROTOCOL_MESSAGE
  })
