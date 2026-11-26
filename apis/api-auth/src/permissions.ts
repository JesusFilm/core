import { z } from 'zod'

import { Prisma } from '@core/prisma/auth/client'
import { fingerprint, sameSecret } from '@core/yoga/mcp/readContract'

import type { AuthConfig } from './config'
import { type Database, type Transaction, audit, databaseTime } from './store'
import { beginConnectionChange, reconcileConnectionChanges } from './withdrawal'

const changeIdInput = z.object({ changeId: z.string().uuid() }).strict()
const gateSnapshot = z.array(
  z.object({ id: z.string(), generation: z.number().int() }).strict()
)
const beginInput = changeIdInput
  .extend({
    gateIds: z
      .array(
        z
          .string()
          .min(1)
          .max(512)
          .regex(/^(account|journey|team|user-journey|user-team|media):.+$/)
      )
      .min(1)
      .max(1000),
    intentHash: z.string().regex(/^[a-f0-9]{64}$/),
    page: z
      .object({
        offset: z.number().int().nonnegative(),
        gateCount: z.number().int().positive().max(2147483647),
        gateIdsHash: z.string().regex(/^[a-f0-9]{64}$/)
      })
      .strict()
      .optional()
  })
  .refine((input) => !input.page || input.gateIds.length <= 250, {
    message: 'Permission page is too large'
  })
const completionInput = changeIdInput.extend({
  outcome: z.enum(['committed', 'cancelled'])
})
type Change = Prisma.PermissionChangeGetPayload<Record<string, never>>
type Gate = { id: string; generation: number }

async function lockGateRows(tx: Transaction, ids: string[]): Promise<void> {
  for (let offset = 0; offset < ids.length; offset += 250) {
    const batch = ids.slice(offset, offset + 250)
    await tx.authorizationGate.createMany({
      data: batch.map((id) => ({ id })),
      skipDuplicates: true
    })
    await tx.$queryRaw`SELECT id FROM "AuthorizationGate" WHERE id IN (${Prisma.join(batch)}) ORDER BY array_position(ARRAY[${Prisma.join(batch)}]::text[], id) FOR UPDATE`
  }
}

async function assertClosedGates(
  tx: Transaction,
  gates: Gate[]
): Promise<void> {
  for (let offset = 0; offset < gates.length; offset += 250) {
    const batch = gates.slice(offset, offset + 250)
    const current = await tx.authorizationGate.findMany({
      where: { id: { in: batch.map((gate) => gate.id) } }
    })
    const expected = new Map(batch.map((gate) => [gate.id, gate.generation]))
    if (
      current.length !== batch.length ||
      current.some(
        (gate) => gate.open || gate.generation !== expected.get(gate.id)
      )
    )
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
    status: change.status === 'collecting' ? 'pending' : change.status,
    ...(change.outcome ? { outcome: change.outcome } : {})
  }
}

/** The service identity may report only its own durable owner receipt or fence. */
export function createPermissionAuthority(config: AuthConfig, db: Database) {
  function ownerFor(authorization: string): 'journeys' | 'users' | 'media' {
    if (
      config.AUTH_PERMISSION_MEDIA_SECRET &&
      sameSecret(authorization, `Bearer ${config.AUTH_PERMISSION_MEDIA_SECRET}`)
    )
      return 'media'
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
      if (owner === 'media' && (ids.length !== 1 || ids[0] !== 'media:sources'))
        throw new Error('Access denied')
      if (owner !== 'media' && ids.some((id) => id.startsWith('media:')))
        throw new Error('Access denied')
      const page = input.page
      if (
        page &&
        (JSON.stringify(ids) !== JSON.stringify(input.gateIds) ||
          page.offset + ids.length > page.gateCount)
      )
        throw new Error('Invalid permission page')
      if (owner === 'users' && ids.some((id) => !id.startsWith('account:')))
        throw new Error('Access denied')
      const change = await db.$transaction(
        async (tx) => {
          // Serialize pages and receipts before acquiring gate locks. A partial
          // manifest never authorizes the owner to execute or reopen its gates.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`permission:${input.changeId}`}, 0))`
          const existing = await tx.permissionChange.findUnique({
            where: { id: input.changeId }
          })
          if (existing) {
            if (
              existing.owner !== owner ||
              existing.intentHash !== input.intentHash ||
              (page
                ? existing.gateCount !== page.gateCount ||
                  existing.gateIdsHash !== page.gateIdsHash ||
                  page.offset > existing.gateIds.length
                : existing.gateCount !== null ||
                  JSON.stringify(existing.gateIds) !== JSON.stringify(ids))
            )
              throw new Error('Permission intent changed')
            if (page && page.offset < existing.gateIds.length) {
              if (
                JSON.stringify(
                  existing.gateIds.slice(page.offset, page.offset + ids.length)
                ) !== JSON.stringify(ids)
              )
                throw new Error('Permission page changed')
              return existing
            }
            if (page && page.offset === existing.gateIds.length) {
              if (
                existing.status !== 'collecting' ||
                existing.gateIds.at(-1)! >= ids[0]
              )
                throw new Error('Permission page changed')
            } else {
              await lockGateRows(tx, existing.gateIds)
              if (
                existing.status === 'complete' ||
                existing.status === 'failed'
              )
                return existing
              await assertClosedGates(tx, gateSnapshot.parse(existing.gates))
              if (!(await drain(tx, ids))) return existing
              return tx.permissionChange.update({
                where: { id: existing.id },
                data: { status: 'ready' }
              })
            }
          }
          if (!existing && page?.offset)
            throw new Error('Missing permission page')
          const allIds = [...(existing?.gateIds ?? []), ...ids]
          const collecting = page && allIds.length < page.gateCount
          await lockGateRows(tx, collecting ? ids : allIds)
          if (!collecting && existing)
            await assertClosedGates(tx, gateSnapshot.parse(existing.gates))
          const gates = await tx.authorizationGate.findMany({
            where: { id: { in: ids } },
            orderBy: { id: 'asc' }
          })
          if (gates.some((gate) => !gate.open))
            throw new Error('Authorization unavailable')
          await tx.authorizationGate.updateMany({
            where: { id: { in: ids } },
            data: { open: false, generation: { increment: 1 } }
          })
          const snapshots = [
            ...(existing ? gateSnapshot.parse(existing.gates) : []),
            ...gates.map((gate) => ({
              id: gate.id,
              generation: gate.generation + 1
            }))
          ]
          if (page && !collecting && fingerprint(allIds) !== page.gateIdsHash)
            throw new Error('Permission manifest changed')
          const data = {
            gateIds: allIds,
            gates: snapshots,
            status: collecting
              ? 'collecting'
              : (await drain(tx, allIds))
                ? 'ready'
                : 'pending'
          }
          const current = existing
            ? await tx.permissionChange.update({
                where: { id: existing.id },
                data
              })
            : await tx.permissionChange.create({
                data: {
                  ...data,
                  id: input.changeId,
                  owner,
                  intentHash: input.intentHash,
                  gateCount: page?.gateCount,
                  gateIdsHash: page?.gateIdsHash,
                  requestedAt: await databaseTime(tx)
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
        },
        { maxWait: 10000, timeout: 120000 }
      )
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
    const current = await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`permission:${change.id}`}, 0))`
        const manifest = await tx.permissionChange.findUniqueOrThrow({
          where: { id: change.id }
        })
        if (manifest.status === 'collecting') return manifest
        await lockGateRows(tx, manifest.gateIds)
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
        if (completion.outcome === 'cancelled' && owner !== 'media')
          return tx.permissionChange.update({
            where: { id: latest.id },
            data: { status: 'failed', outcome: 'cancelled' }
          })
        for (let offset = 0; offset < latest.gateIds.length; offset += 250) {
          const batch = latest.gateIds.slice(offset, offset + 250)
          const retired = await tx.retiredAccount.findMany({
            where: {
              userId: {
                in: batch
                  .filter((id) => id.startsWith('account:'))
                  .map((id) => id.slice('account:'.length))
              }
            }
          })
          const retiredIds = new Set(
            retired.map((account) => `account:${account.userId}`)
          )
          await tx.authorizationGate.updateMany({
            where: { id: { in: batch.filter((id) => !retiredIds.has(id)) } },
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
      },
      { maxWait: 10000, timeout: 120000 }
    )
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
  })
  // Close account authority durably before retiring bounded connection batches.
  // An interrupted request resumes from the remaining unretired connections.
  while (true) {
    const connections = await db.agentConnection.findMany({
      where: { userId, revokedAt: null },
      orderBy: { id: 'asc' },
      take: 100
    })
    if (!connections.length) break
    await db.$transaction(async (tx) => {
      await lockGateRows(tx, [`account:${userId}`])
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
  }
  const connectionIds = (
    await db.agentConnection.findMany({
      where: { userId },
      select: { id: true }
    })
  ).map((connection) => connection.id)
  // Another account's locked withdrawal must not delay this terminal receipt.
  await reconcileConnectionChanges(db, connectionIds)
  const pending = await db.connectionChange.count({
    where: {
      connectionId: { in: connectionIds },
      status: 'pending'
    }
  })
  return { status: pending ? 'pending' : 'complete' }
}
