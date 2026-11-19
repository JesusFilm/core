import type { Prisma } from '@core/prisma/auth/client'

import { type Database, type Transaction, audit, databaseTime } from './store'

/** Caller holds the captured gates and the connection row, in that order. */
export async function beginConnectionChange(
  tx: Transaction,
  connection: Prisma.AgentConnectionGetPayload<Record<string, never>>,
  selection: { mode: string; journeyIds: string[] } | undefined
) {
  const now = await databaseTime(tx)
  const gate = await tx.authorizationGate.update({
    where: { id: `connection:${connection.id}` },
    data: { open: false, generation: { increment: 1 } }
  })
  const change = await tx.connectionChange.create({
    data: {
      connectionId: connection.id,
      expectedVersion: connection.version,
      version: connection.version + 1,
      kind: selection ? 'access' : 'disconnect',
      mode: selection?.mode ?? connection.mode,
      journeyIds: selection?.journeyIds ?? connection.journeyIds,
      gateGeneration: gate.generation,
      requestedAt: now
    }
  })
  await tx.agentConnection.update({
    where: { id: connection.id },
    data: {
      version: { increment: 1 },
      ...(selection ? {} : { revokedAt: now, credentialsPending: false })
    }
  })
  await tx.readPermit.updateMany({
    where: { connectionId: connection.id, status: 'prepared' },
    data: { status: 'cancelled', settledAt: now }
  })
  if (!selection)
    await tx.oAuthArtifact.deleteMany({
      where: {
        OR: [
          { grantId: connection.grantId },
          { model: 'Grant', id: connection.grantId }
        ]
      }
    })
  await audit(tx, selection ? 'access_change' : 'disconnect', 'allowed', {
    userId: connection.userId,
    clientId: connection.clientId,
    journeyIds: change.journeyIds
  })
  return change
}

/** A missing response or an old accepted permit never satisfies this drain. */
export async function reconcileConnectionChanges(
  db: Database
): Promise<number> {
  let after: string | undefined
  let failed = 0
  while (true) {
    const changes = await db.connectionChange.findMany({
      where: { status: 'pending', ...(after ? { id: { gt: after } } : {}) },
      orderBy: { id: 'asc' },
      take: 100
    })
    if (!changes.length) return failed
    after = changes[changes.length - 1].id
    for (const change of changes) {
      try {
        await db.$transaction(async (tx) => {
          const gateId = `connection:${change.connectionId}`
          await tx.$queryRaw`SELECT id FROM "AuthorizationGate" WHERE id = ${gateId} FOR UPDATE`
          await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${change.connectionId} FOR UPDATE`
          const current = await tx.connectionChange.findUniqueOrThrow({
            where: { id: change.id }
          })
          if (current.status !== 'pending') return
          const gate = await tx.authorizationGate.findUniqueOrThrow({
            where: { id: gateId }
          })
          const connection = await tx.agentConnection.findUniqueOrThrow({
            where: { id: change.connectionId }
          })
          if (
            gate.open ||
            gate.generation !== current.gateGeneration ||
            connection.version !== current.version
          )
            throw new Error('Withdrawal state changed')
          if (
            await tx.readPermit.count({
              where: { connectionId: current.connectionId, status: 'accepted' }
            })
          )
            return
          const now = await databaseTime(tx)
          if (current.kind === 'access') {
            if (connection.revokedAt) throw new Error('Connection retired')
            await tx.agentConnection.update({
              where: { id: current.connectionId },
              data: { mode: current.mode, journeyIds: current.journeyIds }
            })
            await tx.authorizationGate.update({
              where: { id: gateId },
              data: { open: true, generation: { increment: 1 } }
            })
          } else {
            await tx.connectionHistoryPurge.upsert({
              where: { connectionId: current.connectionId },
              create: {
                connectionId: current.connectionId,
                changeId: current.id,
                requestedAt: now
              },
              update: {}
            })
          }
          await tx.connectionChange.update({
            where: { id: current.id },
            data: { status: 'complete', completedAt: now }
          })
        })
      } catch {
        // Preserve the closed gate and this change for retry; keep draining others.
        failed++
      }
    }
  }
}
