import { z } from 'zod'

import {
  type ReadRequest,
  type ReadResult,
  fingerprint,
  postJson,
  readResult
} from '@core/yoga/mcp/readContract'

import type { McpConfig } from './config'

export function createReadSession(
  config: McpConfig,
  token: string,
  executorId: string
) {
  const releases: Array<{
    credential: string
    request: ReadRequest
    dataHash: string
  }> = []
  const permits: string[] = []
  let outputClosed = false
  const settle = (permitId: string) =>
    postJson(
      `${config.issuerUrl!.origin}/internal/reads/settle`,
      { permitId },
      `Bearer ${config.exchangeSecret!}`
    )
  return {
    async read(request: ReadRequest): Promise<ReadResult> {
      const { credential } = z
        .object({ credential: z.string() })
        .parse(
          await postJson(
            `${config.issuerUrl!.origin}/internal/reads/exchange`,
            { token, request, executorId },
            `Bearer ${config.exchangeSecret!}`
          )
        )
      const response = z
        .object({ data: readResult })
        .parse(
          await postJson(
            new URL('/mcp/reads', config.gatewayUrl).href,
            { request, stage: 'read' },
            `MCP ${credential}`
          )
        )
      releases.push({
        credential,
        request,
        dataHash: fingerprint(response.data)
      })
      return response.data
    },
    async authorizeOutput(body: Buffer): Promise<void> {
      for (const release of releases) {
        const { permitId } = z.object({ permitId: z.string().uuid() }).parse(
          await postJson(
            new URL('/mcp/reads', config.gatewayUrl).href,
            {
              ...release,
              credential: undefined,
              stage: 'output',
              outputHash: fingerprint(body.toString('utf8'))
            },
            `MCP ${release.credential}`
          )
        )
        permits.push(permitId)
        // Socket closure is positive evidence that the guarded sender cannot
        // release bytes, including when acceptance returned after that close.
        if (outputClosed) await settle(permitId)
      }
    },
    async settleOutput(): Promise<void> {
      outputClosed = true
      // Positive evidence for this guarded sender, including lost accept responses.
      await postJson(
        `${config.issuerUrl!.origin}/internal/reads/fence`,
        { executorId, executor: 'mcp' },
        `Bearer ${config.exchangeSecret!}`
      )
    }
  }
}
export type ReadSession = ReturnType<typeof createReadSession>
