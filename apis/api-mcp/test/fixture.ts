import { randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'

import { type McpRequestContext } from '@modelcontextprotocol/server'
import { z } from 'zod'

import { createProtocolServer } from '../src/protocol'

/** Synthetic protocol data only. This module is absent from the release entrypoint. */
export function fixtureFactory(replica: string) {
  return ({ requestInfo }: McpRequestContext) => {
    const server = createProtocolServer()
    const instance = randomUUID()
    server.registerTool(
      'fixture_echo',
      {
        description:
          'Echo synthetic protocol test data. No journey or user data.',
        inputSchema: z
          .object({
            value: z.string().max(128),
            delayMs: z.number().int().min(0).max(5000).optional(),
            outputBytes: z.number().int().min(0).max(2097152).optional()
          })
          .strict()
      },
      async ({ value, delayMs, outputBytes }) => {
        await setTimeout(delayMs ?? 0, undefined, {
          signal: requestInfo?.signal
        })
        const output = {
          value,
          instance,
          replica,
          padding: 'x'.repeat(outputBytes ?? 0)
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(output) }],
          structuredContent: output
        }
      }
    )
    server.server.registerCapabilities({ tools: { listChanged: false } })
    return server
  }
}
