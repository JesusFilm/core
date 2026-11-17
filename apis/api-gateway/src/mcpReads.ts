import type { GatewayPlugin } from '@graphql-hive/gateway'
import { z } from 'zod'

import {
  type ReadTrust,
  assertRequestInputSize,
  assertStructuredResultSize,
  boundedJson,
  fingerprint,
  internalSignature,
  isContentWrite,
  maxTransportBytes,
  readTransportRequest,
  readTrustSchema,
  safeReadError,
  serviceUrl,
  verifyReadCredential
} from '@core/yoga/mcp/readContract'

export interface GatewayReadsConfig extends ReadTrust {
  ownerUrl: string
  internalSecret: string
}

/** A closed HTTP relay, separate from the unrestricted federation endpoint. */
export function useMcpReads(config?: GatewayReadsConfig): GatewayPlugin {
  return {
    async onRequest(payload) {
      const { request } = payload
      const path = new URL(request.url, 'http://yoga').pathname
      const authorization = request.headers.get('authorization') ?? ''
      const hasInternal =
        request.headers.has('x-mcp-context') ||
        request.headers.has('x-mcp-signature')
      const restricted = /^MCP /i.test(authorization) || hasInternal
      if (path !== '/mcp/reads') {
        if (restricted)
          payload.endResponse(
            Response.json(
              { error: 'ACCESS_DENIED_OR_NOT_FOUND' },
              { status: 403 }
            )
          )
        return
      }
      try {
        if (
          !config ||
          request.method !== 'POST' ||
          hasInternal ||
          request.headers.has('interop-token') ||
          request.headers.get('content-type') !== 'application/json'
        )
          throw new Error('Access denied')
        const token = /^MCP ([^\s]+)$/.exec(authorization)?.[1]
        if (!token) throw new Error('Access denied')
        const claims = verifyReadCredential(token, config)
        const body = readTransportRequest.parse(
          await boundedJson(new Response(request.body), maxTransportBytes)
        )
        if (
          fingerprint(body.request) !== claims.requestHash ||
          (isContentWrite(body.request.tool) &&
            (claims.scope !== 'journeys:edit' || claims.mode !== 'edit'))
        )
          throw new Error('Access denied')
        assertRequestInputSize(body.request)
        const serialized = JSON.stringify(body)
        const response = await fetch(config.ownerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-mcp-context': token,
            'x-mcp-signature': internalSignature(
              token,
              serialized,
              config.internalSecret
            )
          },
          body: serialized,
          redirect: 'error',
          signal: AbortSignal.timeout(15000)
        })
        const output = await boundedJson(response)
        if (output && typeof output === 'object' && 'data' in output)
          assertStructuredResultSize(output.data)
        payload.endResponse(
          Response.json(output, {
            headers: { 'Cache-Control': 'private, no-store' }
          })
        )
      } catch (error) {
        const code = safeReadError(error)
        payload.endResponse(
          Response.json(
            { error: code },
            { status: 403, headers: { 'Cache-Control': 'no-store' } }
          )
        )
      }
    }
  }
}

export function gatewayReadsEnvironment(
  env: NodeJS.ProcessEnv
): GatewayReadsConfig | undefined {
  if (!env.MCP_READS_ENABLED || env.MCP_READS_ENABLED === 'false') return
  if (env.MCP_READS_ENABLED !== 'true')
    throw new Error('Invalid read configuration')
  return readTrustSchema
    .extend({ ownerUrl: serviceUrl, internalSecret: z.string().min(32) })
    .parse({
      issuer: env.MCP_READ_ISSUER,
      audience: env.MCP_READ_GATEWAY_AUDIENCE,
      environment: env.MCP_READ_ENVIRONMENT,
      publicKey: JSON.parse(env.MCP_READ_PUBLIC_KEY ?? 'null'),
      ownerUrl: env.MCP_READ_OWNER_URL,
      internalSecret: env.GATEWAY_MCP_INTERNAL_SECRET
    })
}
