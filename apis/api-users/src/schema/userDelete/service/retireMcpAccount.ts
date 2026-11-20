import { z } from 'zod'

import { postJson, serviceUrl } from '@core/yoga/mcp/readContract'

export class McpAccountRetirementPending extends Error {
  constructor() {
    super('MCP authority retirement pending')
  }
}

export function mcpAccountRetirementEnvironment(env: NodeJS.ProcessEnv) {
  const enabled = z
    .enum(['true', 'false'])
    .optional()
    .parse(env.MCP_READS_ENABLED || undefined)
  const url = env.MCP_ACCOUNT_AUTHORITY_URL
  const secret = env.MCP_ACCOUNT_AUTHORITY_SECRET
  if (enabled !== 'true' && !url && !secret) return
  return z
    .object({ url: serviceUrl, secret: z.string().min(32) })
    .parse({ url, secret })
}

/** Terminal retirement is durable in auth even if this deletion is retried. */
export async function retireMcpAccount(userId: string): Promise<void> {
  const config = mcpAccountRetirementEnvironment(process.env)
  if (!config) return
  const result = z
    .object({ status: z.enum(['pending', 'complete']) })
    .strict()
    .parse(
      await postJson(
        new URL('/internal/permissions/retire-account', config.url).href,
        { userId },
        `Bearer ${config.secret}`
      )
    )
  if (result.status !== 'complete') throw new McpAccountRetirementPending()
}
