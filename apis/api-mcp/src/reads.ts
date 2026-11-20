import { z } from 'zod'

import { operationResult } from '@core/yoga/mcp/editContract'
import {
  type ReadRequest,
  type ReadResult,
  assertStructuredResultSize,
  fingerprint,
  postJson,
  readFailure,
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
  let outputClosed = false
  let dataStarted = false
  return {
    async read(request: ReadRequest): Promise<ReadResult> {
      if (outputClosed) throw new Error('Sender closed')
      dataStarted = true
      const { credential } = z
        .object({ credential: z.string() })
        .parse(
          await postJson(
            `${config.issuerUrl!.origin}/internal/reads/exchange`,
            { token, request, executorId },
            `Bearer ${config.exchangeSecret!}`
          )
        )
      if (outputClosed) throw new Error('Sender closed')
      const response = z
        .object({ data: readResult })
        .parse(
          await postJson(
            new URL('/mcp/reads', config.gatewayUrl).href,
            { request, stage: 'read' },
            `MCP ${credential}`
          )
        )
      if (outputClosed) throw new Error('Sender closed')
      assertStructuredResultSize(response.data)
      if (
        request.tool === 'journey_edit' ||
        request.tool === 'journey_operation_get'
      )
        operationResult.parse(response.data)
      else if (response.data.kind === 'read_failure')
        readFailure.parse(response.data)
      releases.push({
        credential,
        request,
        dataHash: fingerprint(response.data)
      })
      return response.data
    },
    async authorizeOutput(body: Buffer): Promise<void> {
      if (outputClosed) throw new Error('Sender closed')
      for (const release of releases) {
        if (outputClosed) throw new Error('Sender closed')
        z.object({ permitId: z.string().uuid() }).parse(
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
      }
    },
    async settleOutput(): Promise<void> {
      outputClosed = true
      if (!dataStarted) return
      // Close admission for delayed unaccepted work too. This sender fence
      // settles only its own output permits, never an accepted owning save.
      await postJson(
        `${config.issuerUrl!.origin}/internal/reads/fence`,
        { executorId, executor: 'mcp' },
        `Bearer ${config.exchangeSecret!}`
      )
    }
  }
}
export type ReadSession = ReturnType<typeof createReadSession>
