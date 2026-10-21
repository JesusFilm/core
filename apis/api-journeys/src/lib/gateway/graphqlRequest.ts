import { GraphQLError } from 'graphql'

import { env } from '../../env'
import { logger } from '../../logger'

/** How long a gateway request may take before it fails as unavailable. */
export const GATEWAY_TIMEOUT_MS = 10_000

export interface GatewayErrorEntry {
  message: string
  path?: Array<string | number>
}

/**
 * Every failed gateway request: unreachable, timed out, a non-2xx or
 * non-JSON response ("gateway unavailable"), or a GraphQL error the gateway
 * returned. A GraphQL error carries the response's `data` and `errors`, so a
 * caller can tell a subgraph's "not found" from an outage; anything it does
 * not recognise it rethrows.
 */
export class GatewayError extends GraphQLError {
  readonly data: Record<string, unknown> | null
  readonly gatewayErrors: GatewayErrorEntry[]

  constructor(
    message: string,
    response: {
      data?: Record<string, unknown> | null
      errors?: GatewayErrorEntry[]
    } = {}
  ) {
    super(message, { extensions: { code: 'INTERNAL_SERVER_ERROR' } })
    this.data = response.data ?? null
    this.gatewayErrors = response.errors ?? []
  }
}

function gatewayUnavailable(): GatewayError {
  return new GatewayError('gateway unavailable')
}

/**
 * Run a query or mutation against other subgraphs through the gateway as
 * this service. Never call it inside a transaction: it is a network round
 * trip of up to `GATEWAY_TIMEOUT_MS`.
 */
export async function graphqlRequest(
  query: string,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  let result: {
    data?: Record<string, unknown> | null
    errors?: GatewayErrorEntry[]
  }
  try {
    const response = await fetch(env.GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'interop-token': env.INTEROP_TOKEN,
        'x-graphql-client-name': 'api-journeys-modern',
        'x-graphql-client-version': env.SERVICE_VERSION
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS)
    })
    const contentType = response.headers.get('content-type') ?? ''
    if (!response.ok || !contentType.includes('json')) {
      logger.error(
        { status: response.status, contentType },
        'gateway returned an unusable response'
      )
      throw gatewayUnavailable()
    }
    result = await response.json()
  } catch (error) {
    if (error instanceof GatewayError) throw error
    logger.error({ error }, 'gateway request failed')
    throw gatewayUnavailable()
  }

  if (result.errors != null && result.errors.length > 0)
    throw new GatewayError(result.errors[0].message, result)

  return result.data ?? {}
}
