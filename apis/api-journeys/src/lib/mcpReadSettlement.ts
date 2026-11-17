import type { PrismaClient } from '@core/prisma/journeys/client'
import { postJson } from '@core/yoga/mcp/readContract'

interface SettlementConfig {
  authorityUrl: string
  authoritySecret: string
}

/** Acquire the same owner-database row lock as execution before fencing it.
 * Neither an absent receipt nor a timeout alone proves that execution stopped.
 */
export async function reconcileJourneyReads(
  db: PrismaClient,
  config: SettlementConfig,
  permitId?: string
): Promise<number> {
  let after: string | undefined
  let failed = 0
  while (true) {
    const pending = await db.mcpReadExecution.findMany({
      where: {
        reportedAt: null,
        ...(permitId ? { id: permitId } : after ? { id: { gt: after } } : {})
      },
      orderBy: { id: 'asc' },
      take: 100
    })
    if (!pending.length) return failed
    after = pending[pending.length - 1].id
    for (const execution of pending) {
      try {
        await db.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpReadExecution" WHERE id = ${execution.id} FOR UPDATE`
          await tx.mcpReadExecution.updateMany({
            where: { id: execution.id, status: 'prepared' },
            data: { status: 'fenced', completedAt: new Date() }
          })
        })
        // The transaction either committed its bounded read receipt or we acquired
        // its execution lock and durably prohibited every delayed executor.
        await postJson(
          new URL('/internal/reads/fence', config.authorityUrl).href,
          { executorId: execution.executorId, executor: 'journeys' },
          `Bearer ${config.authoritySecret}`
        )
        await db.mcpReadExecution.update({
          where: { id: execution.id },
          data: { reportedAt: new Date() }
        })
      } catch (error) {
        if (permitId) throw error
        // A failed report or row lock keeps this receipt pending, without
        // starving other executors or authorizing any work from its age.
        failed++
      }
    }
    if (permitId) return failed
  }
}
