import { z } from 'zod'

import { Prisma, type PrismaClient } from '@core/prisma/journeys/client'
import { postJson } from '@core/yoga/mcp/readContract'

interface AuthorityConfig {
  authorityUrl: string
  authoritySecret: string
}

export async function editDatabaseTime(
  tx: Prisma.TransactionClient,
  clock?: () => Date
): Promise<Date> {
  if (clock) return clock()
  const [row] = await tx.$queryRaw<Array<{ time: Date }>>`
    SELECT clock_timestamp() AS time`
  return row.time
}

/** A successful lock either observes the committed receipt or fences every
 * delayed execution. A missing receipt or elapsed timeout proves neither.
 */
export async function reconcileJourneyEdits(
  db: PrismaClient,
  config: AuthorityConfig,
  permitId?: string
): Promise<number> {
  let after: string | undefined
  let failed = 0
  while (true) {
    const pending = await db.mcpEditExecution.findMany({
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
          await tx.$queryRaw`SELECT id FROM "McpEditExecution" WHERE id = ${execution.id} FOR UPDATE`
          await tx.mcpEditExecution.updateMany({
            where: { id: execution.id, status: 'prepared' },
            data: {
              status: 'fenced',
              completedAt: await editDatabaseTime(tx)
            }
          })
        })
        await postJson(
          new URL('/internal/reads/fence', config.authorityUrl).href,
          { executorId: execution.executorId, executor: 'journeys' },
          `Bearer ${config.authoritySecret}`
        )
        await db.mcpEditExecution.update({
          where: { id: execution.id },
          data: { reportedAt: new Date() }
        })
      } catch (error) {
        if (permitId) throw error
        failed++
      }
    }
    if (permitId) return failed
  }
}

const connectionLifecycle = z.object({
  observedAt: z.string().datetime(),
  connections: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      clientId: z.string(),
      expiresAt: z.string().datetime(),
      revokedAt: z.string().datetime().nullable(),
      historyGeneration: z.number().int().nonnegative(),
      accountRetired: z.boolean(),
      historyPurgeRequestedAt: z.string().datetime().nullable()
    })
  )
})

/** Consent/result/inverse cleanup has no media participant. Namespace tombstones
 * remain permanently closed before any accepted-key marker is removed.
 */
export async function cleanupJourneyEdits(
  db: PrismaClient,
  config: AuthorityConfig,
  clock?: () => Date
): Promise<number> {
  let after: string | undefined
  let failed = 0
  while (true) {
    const namespaces = await db.mcpEditNamespace.findMany({
      where: after ? { id: { gt: after } } : {},
      orderBy: { id: 'asc' },
      take: 100
    })
    if (!namespaces.length) return failed
    after = namespaces[namespaces.length - 1].id
    try {
      const { connections, observedAt } = connectionLifecycle.parse(
        await postJson(
          new URL('/internal/reads/connections', config.authorityUrl).href,
          { connectionIds: namespaces.map(({ id }) => id) },
          `Bearer ${config.authoritySecret}`
        )
      )
      // Expiry is decided from the authority's locked lifecycle snapshot. A
      // later local lock wait cannot turn an early-renewal snapshot into expiry.
      const lifecycleTime = new Date(observedAt)
      for (const namespace of namespaces) {
        const connection = connections.find(({ id }) => id === namespace.id)
        // Unavailable authority never authorizes cleanup or revival.
        if (
          !connection ||
          (namespace.actorId !== null &&
            namespace.actorId !== connection.userId) ||
          (namespace.clientId !== null &&
            namespace.clientId !== connection.clientId)
        ) {
          failed++
          continue
        }
        try {
          await db.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "McpEditNamespace" WHERE id = ${namespace.id} FOR UPDATE`
            const now = await editDatabaseTime(tx, clock)
            await tx.mcpEditAudit.deleteMany({
              where: { namespaceId: namespace.id, expiresAt: { lte: now } }
            })
            await tx.mcpEditExecution.deleteMany({
              where: {
                connectionId: namespace.id,
                failureCode: { not: null },
                responseExpiresAt: { lte: now },
                reportedAt: { not: null }
              }
            })
            const retired = Boolean(
              connection.revokedAt || connection.accountRetired
            )
            if (retired) {
              await tx.mcpEditNamespace.update({
                where: { id: namespace.id },
                data: { retiredAt: namespace.retiredAt ?? now }
              })
            }
            await tx.mcpEditOperation.updateMany({
              where: {
                namespaceId: namespace.id,
                ...(connection.accountRetired
                  ? {}
                  : { resultExpiresAt: { lte: now } })
              },
              data: { result: Prisma.DbNull }
            })
            await tx.mcpEditHistory.deleteMany({
              where: {
                namespaceId: namespace.id,
                historyGeneration: { lt: connection.historyGeneration }
              }
            })
            const inverseExpired =
              new Date(connection.expiresAt).getTime() + 30 * 86400000 <=
              lifecycleTime.getTime()
            if (
              connection.accountRetired ||
              connection.historyPurgeRequestedAt ||
              inverseExpired
            ) {
              await tx.mcpEditHistory.deleteMany({
                where: {
                  namespaceId: namespace.id,
                  ...(connection.accountRetired ||
                  connection.historyPurgeRequestedAt
                    ? {}
                    : { historyGeneration: connection.historyGeneration })
                }
              })
            }
            if (!connection.accountRetired) return
            // Only private recovery data for this retired namespace is removed.
            // Keep unresolved physical actions and their minimal receipt markers.
            await tx.mcpEditEffect.deleteMany({
              where: {
                namespaceId: namespace.id,
                status: { in: ['recorded', 'settled', 'cancelled'] }
              }
            })
            await tx.mcpEditExecution.deleteMany({
              where: {
                connectionId: namespace.id,
                reportedAt: { not: null }
              }
            })
            const unfinished = await tx.mcpEditExecution.count({
              where: { connectionId: namespace.id, reportedAt: null }
            })
            if (unfinished) return
            await tx.mcpEditOperation.deleteMany({
              where: { namespaceId: namespace.id, effects: { none: {} } }
            })
            await tx.mcpEditNamespace.update({
              where: { id: namespace.id },
              data: { actorId: null, clientId: null }
            })
          })
          if (connection.historyPurgeRequestedAt)
            await postJson(
              new URL('/internal/reads/purge-complete', config.authorityUrl)
                .href,
              {
                connectionId: namespace.id,
                requestedAt: connection.historyPurgeRequestedAt
              },
              `Bearer ${config.authoritySecret}`
            )
        } catch {
          failed++
        }
      }
    } catch {
      failed += namespaces.length
    }
  }
}
