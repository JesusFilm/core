import { z } from 'zod'

import { fingerprint, sameSecret } from '@core/yoga/mcp/readContract'

import type { AuthConfig } from './config'
import { type Identity, IdentityIneligible } from './identity'
import {
  AuthorizationChanged,
  type Database,
  audit,
  captureGates,
  databaseTime,
  lockGates
} from './store'
import { reconcileConnectionChanges } from './withdrawal'

const id = z.string().min(1).max(200)
const mediaAuditAction = z.enum([
  'media_admit',
  'media_transfer',
  'media_dispatch',
  'media_cancel',
  'media_release'
])
const gatesSchema = z.array(
  z.object({ id: z.string(), generation: z.number().int() })
)

export class AuditedMediaDenial extends Error {}

/** Media owns executor receipts. Only a committed bounded action or a positive
 * owning fence settles its permit. Provider absence and elapsed time do not.
 */
export function createMediaJobAuthority(
  config: AuthConfig,
  db: Database,
  identity: Identity
) {
  async function auditMediaDenial<T>(
    action: z.infer<typeof mediaAuditAction>,
    identifiers: { userId: string; clientId: string; journeyIds: string[] },
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (
        !(error instanceof AuthorizationChanged) &&
        !(error instanceof IdentityIneligible)
      )
        throw error
      // The authorization transaction has rolled back before this audit commits.
      await audit(db, action, 'denied', identifiers)
      throw new AuditedMediaDenial('Access denied')
    }
  }

  return async (path: string, authorization: string, body: unknown) => {
    if (
      !config.AUTH_READ_MEDIA_SECRET ||
      !sameSecret(authorization, `Bearer ${config.AUTH_READ_MEDIA_SECRET}`)
    )
      throw new Error('Access denied')
    if (path.endsWith('/lifecycle')) {
      const input = z
        .object({ connectionIds: z.array(id).max(100) })
        .strict()
        .parse(body)
      const connections = await db.agentConnection.findMany({
        where: { id: { in: input.connectionIds } }
      })
      const retired = await db.retiredAccount.findMany({
        where: {
          userId: { in: connections.map((connection) => connection.userId) }
        }
      })
      return {
        connections: connections.map((connection) => ({
          id: connection.id,
          accountRetired: retired.some(
            (account) => account.userId === connection.userId
          )
        }))
      }
    }
    if (path.endsWith('/prepare')) {
      const input = z
        .object({
          connectionId: id,
          userId: id,
          journeyId: id,
          teamId: id,
          executorId: z.string().uuid(),
          action: z.enum([
            'admit',
            'transfer',
            'dispatch',
            'cancel',
            'release'
          ]),
          requestHash: z.string().length(64)
        })
        .strict()
        .parse(body)
      const verified = await db.agentConnection.findUniqueOrThrow({
        where: { id: input.connectionId }
      })
      if (
        verified.userId !== input.userId ||
        verified.environment !== config.AUTH_ENVIRONMENT
      )
        throw new Error('Access denied')
      return auditMediaDenial(
        mediaAuditAction.parse(`media_${input.action}`),
        {
          userId: verified.userId,
          clientId: verified.clientId,
          journeyIds: verified.journeyIds.filter((id) => id === input.journeyId)
        },
        async () => {
          const gates = await captureGates(db, [
            `account:${input.userId}`,
            `connection:${input.connectionId}`,
            `journey:${input.journeyId}`,
            `team:${input.teamId}`,
            `user-journey:${input.userId}:${input.journeyId}`,
            `user-team:${input.userId}:${input.teamId}`
          ])
          return db.$transaction(async (tx) => {
            await lockGates(tx, gates)
            await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${input.connectionId} FOR SHARE`
            const connection = await tx.agentConnection.findUniqueOrThrow({
              where: { id: input.connectionId }
            })
            const now = await databaseTime(tx)
            if (
              connection.userId !== input.userId ||
              connection.environment !== config.AUTH_ENVIRONMENT ||
              connection.revokedAt ||
              connection.expiresAt <= now ||
              connection.mode !== 'edit' ||
              !connection.journeyIds.includes(input.journeyId)
            )
              throw new AuthorizationChanged('Access denied')
            await tx.readExecutor.create({
              data: { id: input.executorId, executor: 'media' }
            })
            const permit = await tx.readPermit.create({
              data: {
                connectionId: connection.id,
                grantVersion: connection.version,
                requestId: input.executorId,
                requestHash: input.requestHash,
                stage: `media_${input.action}`,
                executor: 'media',
                executorId: input.executorId,
                journeyIds: [input.journeyId],
                gates,
                preparedAt: now
              }
            })
            return {
              permitId: permit.id,
              clientId: connection.clientId,
              grantVersion: connection.version,
              permissionHash: fingerprint(gates)
            }
          })
        }
      )
    }
    const input = z.object({ permitId: z.string().uuid() }).strict().parse(body)
    const permit = await db.readPermit.findUniqueOrThrow({
      where: { id: input.permitId }
    })
    if (permit.executor !== 'media') throw new Error('Access denied')
    if (path.endsWith('/settle')) {
      await db.readPermit.updateMany({
        where: { id: permit.id, status: { in: ['prepared', 'accepted'] } },
        data: { status: 'settled', settledAt: await databaseTime(db) }
      })
      await reconcileConnectionChanges(db)
      return { settled: true }
    }
    if (!path.endsWith('/accept') && !path.endsWith('/deny'))
      throw new Error('Access denied')
    const action = mediaAuditAction.parse(permit.stage)
    const connection = await db.agentConnection.findUniqueOrThrow({
      where: { id: permit.connectionId }
    })
    if (path.endsWith('/deny')) {
      await audit(db, action, 'denied', {
        userId: connection.userId,
        clientId: connection.clientId,
        journeyIds: permit.journeyIds
      })
      // Reporting a denial does not establish that an accepted executor stopped.
      return { recorded: true }
    }
    return auditMediaDenial(
      action,
      {
        userId: connection.userId,
        clientId: connection.clientId,
        journeyIds: permit.journeyIds
      },
      async () => {
        await identity.check({
          userId: connection.userId,
          authTime: connection.firebaseAuthTime,
          createdAt: connection.firebaseCreatedAt
        })
        return db.$transaction(async (tx) => {
          await lockGates(tx, gatesSchema.parse(permit.gates))
          await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR SHARE`
          await tx.$queryRaw`SELECT id FROM "ReadPermit" WHERE id = ${permit.id} FOR UPDATE`
          const current = await tx.agentConnection.findUniqueOrThrow({
            where: { id: connection.id }
          })
          const now = await databaseTime(tx)
          if (
            current.version !== permit.grantVersion ||
            current.revokedAt ||
            current.expiresAt <= now ||
            current.mode !== 'edit' ||
            permit.journeyIds.some((id) => !current.journeyIds.includes(id))
          )
            throw new AuthorizationChanged('Access denied')
          const accepted = await tx.readPermit.updateMany({
            where: { id: permit.id, status: 'prepared' },
            data: { status: 'accepted', acceptedAt: now }
          })
          if (accepted.count !== 1) throw new Error('Access denied')
          await audit(tx, action, 'allowed', {
            userId: current.userId,
            clientId: current.clientId,
            journeyIds: permit.journeyIds
          })
          return { accepted: true }
        })
      }
    )
  }
}
