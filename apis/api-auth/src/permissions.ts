import { z } from 'zod'

import type { Prisma } from '@core/prisma/auth/client'
import { sameSecret } from '@core/yoga/mcp/readContract'

import type { AuthConfig } from './config'
import { type Database, type Transaction, audit, databaseTime } from './store'
import { beginConnectionChange, reconcileConnectionChanges } from './withdrawal'

const changeIdInput = z.object({ changeId: z.string().uuid() }).strict()
const gateSnapshot = z.array(
  z.object({ id: z.string(), generation: z.number().int() }).strict()
)
const beginInput = changeIdInput.extend({
  gateIds: z
    .array(
      z
        .string()
        .min(1)
        .max(512)
        .regex(/^(account|journey|team|user-journey|user-team):.+$/)
    )
    .min(1)
    .max(1000),
  intentHash: z.string().regex(/^[a-f0-9]{64}$/)
})
const completionInput = changeIdInput.extend({
  outcome: z.enum(['committed', 'cancelled'])
})
type Change = Prisma.PermissionChangeGetPayload<Record<string, never>>
type Gate = { id: string; generation: number }

async function lockGateRows(tx: Transaction, ids: string[]): Promise<void> {
  for (const id of ids) {
    await tx.authorizationGate.upsert({
      where: { id },
      create: { id },
      update: {}
    })
    await tx.$queryRaw`SELECT id FROM "AuthorizationGate" WHERE id = ${id} FOR UPDATE`
  }
}

async function assertClosedGates(
  tx: Transaction,
  gates: Gate[]
): Promise<void> {
  for (const expected of gates) {
    const gate = await tx.authorizationGate.findUniqueOrThrow({
      where: { id: expected.id }
    })
    if (gate.open || gate.generation !== expected.generation)
      throw new Error('Permission state changed')
  }
}

/** Gates are already closed and locked. Acceptance cannot add matching work. */
async function drain(tx: Transaction, ids: string[]): Promise<boolean> {
  const affected = new Set(ids)
  let after: string | undefined
  let accepted = false
  while (true) {
    const permits = await tx.readPermit.findMany({
      where: {
        status: { in: ['prepared', 'accepted'] },
        ...(after ? { id: { gt: after } } : {})
      },
      select: { id: true, status: true, gates: true },
      orderBy: { id: 'asc' },
      take: 100
    })
    if (!permits.length) return !accepted
    after = permits[permits.length - 1].id
    const cancelled: string[] = []
    for (const permit of permits) {
      if (
        !gateSnapshot.parse(permit.gates).some((gate) => affected.has(gate.id))
      )
        continue
      if (permit.status === 'accepted') accepted = true
      else cancelled.push(permit.id)
    }
    if (cancelled.length)
      await tx.readPermit.updateMany({
        where: { id: { in: cancelled }, status: 'prepared' },
        data: { status: 'cancelled', settledAt: await databaseTime(tx) }
      })
  }
}

function result(change: Change) {
  return {
    changeId: change.id,
    status: change.status,
    ...(change.outcome ? { outcome: change.outcome } : {})
  }
}

/** The service identity may report only its own durable owner receipt or fence. */
export function createPermissionAuthority(config: AuthConfig, db: Database) {
  function ownerFor(authorization: string): 'journeys' | 'users' {
    if (
      config.AUTH_PERMISSION_JOURNEYS_SECRET &&
      sameSecret(
        authorization,
        `Bearer ${config.AUTH_PERMISSION_JOURNEYS_SECRET}`
      )
    )
      return 'journeys'
    if (
      config.AUTH_PERMISSION_USERS_SECRET &&
      sameSecret(authorization, `Bearer ${config.AUTH_PERMISSION_USERS_SECRET}`)
    )
      return 'users'
    throw new Error('Access denied')
  }

  return async (path: string, authorization: string, body: unknown) => {
    const owner = ownerFor(authorization)
    if (path === '/internal/permissions/retire-account') {
      if (owner !== 'users') throw new Error('Access denied')
      const { userId } = z
        .object({ userId: z.string().min(1).max(200) })
        .strict()
        .parse(body)
      return retireAccount(db, userId)
    }
    if (path === '/internal/permissions/begin') {
      const input = beginInput.parse(body)
      const ids = [...new Set(input.gateIds)].sort()
      if (owner === 'users' && ids.some((id) => !id.startsWith('account:')))
        throw new Error('Access denied')
      const change = await db.$transaction(async (tx) => {
        await lockGateRows(tx, ids)
        const existing = await tx.permissionChange.findUnique({
          where: { id: input.changeId }
        })
        if (existing) {
          if (
            existing.owner !== owner ||
            existing.intentHash !== input.intentHash ||
            JSON.stringify(existing.gateIds) !== JSON.stringify(ids)
          )
            throw new Error('Permission intent changed')
          if (existing.status === 'complete' || existing.status === 'failed')
            return existing
          await assertClosedGates(tx, gateSnapshot.parse(existing.gates))
          if (!(await drain(tx, ids))) return existing
          return tx.permissionChange.update({
            where: { id: existing.id },
            data: { status: 'ready' }
          })
        }
        const gates: Gate[] = []
        for (const id of ids) {
          const gate = await tx.authorizationGate.findUniqueOrThrow({
            where: { id }
          })
          if (!gate.open) throw new Error('Authorization unavailable')
          const closed = await tx.authorizationGate.update({
            where: { id },
            data: { open: false, generation: { increment: 1 } }
          })
          gates.push({ id, generation: closed.generation })
        }
        const current = await tx.permissionChange.create({
          data: {
            id: input.changeId,
            owner,
            gateIds: ids,
            gates,
            intentHash: input.intentHash,
            requestedAt: await databaseTime(tx),
            status: (await drain(tx, ids)) ? 'ready' : 'pending'
          }
        })
        await audit(tx, 'permission_change', 'allowed', {
          userId: ids
            .find((id) => id.startsWith('account:'))
            ?.slice('account:'.length),
          journeyIds: ids
            .filter((id) => id.startsWith('journey:'))
            .map((id) => id.slice('journey:'.length))
        })
        return current
      })
      return result(change)
    }
    if (
      path !== '/internal/permissions/status' &&
      path !== '/internal/permissions/complete'
    )
      throw new Error('Access denied')
    const completion =
      path === '/internal/permissions/complete'
        ? completionInput.parse(body)
        : undefined
    const input = completion ?? changeIdInput.parse(body)
    const change = await db.permissionChange.findUniqueOrThrow({
      where: { id: input.changeId }
    })
    if (change.owner !== owner) throw new Error('Access denied')
    const current = await db.$transaction(async (tx) => {
      await lockGateRows(tx, change.gateIds)
      await tx.$queryRaw`SELECT id FROM "PermissionChange" WHERE id = ${change.id} FOR UPDATE`
      const latest = await tx.permissionChange.findUniqueOrThrow({
        where: { id: change.id }
      })
      if (latest.status === 'complete') {
        if (completion && completion.outcome !== latest.outcome)
          throw new Error('Permission outcome changed')
        return latest
      }
      await assertClosedGates(tx, gateSnapshot.parse(latest.gates))
      if (latest.status === 'failed' && completion?.outcome !== 'committed')
        return latest
      if (!(await drain(tx, latest.gateIds))) return latest
      if (!completion)
        return tx.permissionChange.update({
          where: { id: latest.id },
          data: { status: 'ready' }
        })
      if (completion.outcome === 'cancelled')
        return tx.permissionChange.update({
          where: { id: latest.id },
          data: { status: 'failed', outcome: 'cancelled' }
        })
      for (const id of latest.gateIds) {
        if (
          id.startsWith('account:') &&
          (await tx.retiredAccount.findUnique({
            where: { userId: id.slice('account:'.length) }
          }))
        )
          continue
        await tx.authorizationGate.update({
          where: { id },
          data: { open: true, generation: { increment: 1 } }
        })
      }
      return tx.permissionChange.update({
        where: { id: latest.id },
        data: {
          status: 'complete',
          outcome: completion.outcome,
          completedAt: await databaseTime(tx)
        }
      })
    })
    return result(current)
  }
}

async function retireAccount(db: Database, userId: string) {
  await db.$transaction(async (tx) => {
    const accountId = `account:${userId}`
    await lockGateRows(tx, [accountId])
    const retired = await tx.retiredAccount.findUnique({ where: { userId } })
    if (!retired) {
      await tx.retiredAccount.create({
        data: { userId, retiredAt: await databaseTime(tx) }
      })
      const gate = await tx.authorizationGate.findUniqueOrThrow({
        where: { id: accountId }
      })
      // A pending account policy change already advanced this generation.
      // Its completion sees the tombstone and cannot reopen account authority.
      await tx.authorizationGate.update({
        where: { id: accountId },
        data: {
          open: false,
          ...(gate.open ? { generation: { increment: 1 } } : {})
        }
      })
      await audit(tx, 'account_retire', 'allowed', { userId })
    }
    const connections = await tx.agentConnection.findMany({
      where: { userId },
      orderBy: { id: 'asc' }
    })
    await lockGateRows(
      tx,
      connections.map((connection) => `connection:${connection.id}`).sort()
    )
    for (const connection of connections) {
      await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR UPDATE`
      const current = await tx.agentConnection.findUniqueOrThrow({
        where: { id: connection.id }
      })
      if (current.revokedAt) continue
      await tx.connectionChange.updateMany({
        where: {
          connectionId: connection.id,
          status: 'pending',
          kind: 'access'
        },
        data: { status: 'superseded' }
      })
      await beginConnectionChange(tx, current, undefined)
    }
  })
  await reconcileConnectionChanges(db)
  const pending = await db.connectionChange.count({
    where: {
      connectionId: {
        in: (
          await db.agentConnection.findMany({
            where: { userId },
            select: { id: true }
          })
        ).map((connection) => connection.id)
      },
      status: 'pending'
    }
  })
  return { status: pending ? 'pending' : 'complete' }
}
