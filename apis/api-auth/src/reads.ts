import { createPublicKey, randomUUID } from 'node:crypto'

import type OidcProvider from 'oidc-provider'
import { z } from 'zod'

import {
  fingerprint,
  readRequest,
  sameSecret,
  signEnvelope,
  verifyReadCredential
} from '@core/yoga/mcp/readContract'

import type { AuthConfig } from './config'
import type { Identity } from './identity'
import {
  type Database,
  audit,
  captureGates,
  databaseTime,
  lockGates
} from './store'
import { reconcileConnectionChanges } from './withdrawal'

const prepareInput = z
  .object({
    executorId: z.string().uuid(),
    credential: z.string().max(32768),
    stage: z.enum(['read', 'output']),
    resources: z
      .array(
        z
          .object({
            journeyId: z.string().max(200),
            teamId: z.string().max(200)
          })
          .strict()
      )
      .max(50),
    outputHash: z.string().length(64).optional()
  })
  .strict()

/** No remote call occurs inside the coordinator transaction. Lock order is
 * sorted gate IDs, then connection, then permit. Accepted rows never expire.
 */
export function createReadAuthority(
  config: AuthConfig,
  db: Database,
  identity: Identity,
  provider: OidcProvider
) {
  const key = config.AUTH_JWKS.keys.find((key) => key.kty === 'RSA')
  if (config.AUTH_EXCHANGE_CLIENT_SECRET && !key)
    throw new Error('RSA read signing key required')
  const trust =
    key && config.AUTH_READ_GATEWAY_AUDIENCE
      ? {
          issuer: config.AUTH_ISSUER,
          audience: config.AUTH_READ_GATEWAY_AUDIENCE,
          environment: config.AUTH_ENVIRONMENT,
          publicKey: createPublicKey({ key, format: 'jwk' }).export({
            format: 'jwk'
          })
        }
      : undefined

  async function connectionFor(credential: string) {
    if (!trust) throw new Error('Reads unavailable')
    const claims = verifyReadCredential(credential, trust)
    const connection = await db.agentConnection.findUniqueOrThrow({
      where: { id: claims.connectionId }
    })
    if (
      connection.userId !== claims.subject ||
      connection.version !== claims.grantVersion ||
      connection.environment !== config.AUTH_ENVIRONMENT ||
      connection.revokedAt ||
      !['view', 'edit'].includes(connection.mode)
    )
      throw new Error('Access denied')
    return { claims, connection }
  }

  return async (
    path: string,
    authorization: string,
    body: unknown
  ): Promise<unknown> => {
    if (
      !trust ||
      !key ||
      !config.AUTH_EXCHANGE_CLIENT_SECRET ||
      !config.AUTH_READ_OWNER_SECRET
    )
      throw new Error('Reads unavailable')
    const isMcp = sameSecret(
      authorization,
      `Bearer ${config.AUTH_EXCHANGE_CLIENT_SECRET}`
    )
    const isOwner = sameSecret(
      authorization,
      `Bearer ${config.AUTH_READ_OWNER_SECRET}`
    )
    if (path === '/internal/reads/exchange') {
      if (!isMcp) throw new Error('Access denied')
      const input = z
        .object({
          token: z.string().min(1).max(4096),
          request: readRequest,
          executorId: z.string().uuid()
        })
        .strict()
        .parse(body)
      const token = await provider.AccessToken.find(input.token)
      if (
        !token ||
        !token.grantId ||
        !token.exp ||
        token.aud !== config.AUTH_AUDIENCE ||
        !token.scope?.split(' ').includes('journeys:read')
      )
        throw new Error('Access denied')
      const tokenExpiry = token.exp * 1000
      const connection = await db.agentConnection.findUniqueOrThrow({
        where: { grantId: token.grantId }
      })
      if (
        connection.userId !== token.accountId ||
        connection.clientId !== token.clientId
      )
        throw new Error('Access denied')
      const gates = await captureGates(db, [
        `account:${connection.userId}`,
        `connection:${connection.id}`
      ])
      await identity.check({
        userId: connection.userId,
        authTime: connection.firebaseAuthTime,
        createdAt: connection.firebaseCreatedAt
      })
      return db.$transaction(async (tx) => {
        await lockGates(tx, gates)
        await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR SHARE`
        const current = await tx.agentConnection.findUniqueOrThrow({
          where: { id: connection.id }
        })
        const now = await databaseTime(tx)
        if (
          current.version !== connection.version ||
          current.revokedAt ||
          current.expiresAt <= now ||
          current.environment !== config.AUTH_ENVIRONMENT ||
          !['view', 'edit'].includes(current.mode)
        )
          throw new Error('Access denied')
        if (
          input.request.tool === 'journey_read' &&
          !current.journeyIds.includes(input.request.input.journeyId)
        )
          throw new Error('Access denied')
        const claims = {
          executorId: input.executorId,
          purpose: 'gateway-read',
          issuer: trust.issuer,
          audience: trust.audience,
          environment: trust.environment,
          subject: current.userId,
          connectionId: current.id,
          grantVersion: current.version,
          journeyIds: current.journeyIds,
          mode: current.mode,
          scope: 'journeys:read',
          requestId: randomUUID(),
          requestHash: fingerprint(input.request),
          expiresAt: Math.min(
            now.getTime() + 60000,
            current.expiresAt.getTime(),
            tokenExpiry
          )
        }
        await audit(tx, 'read_exchange', 'allowed', {
          userId: current.userId,
          clientId: current.clientId
        })
        return { credential: signEnvelope(claims, key) }
      })
    }
    if (path === '/internal/reads/fence') {
      const input = z
        .object({
          executorId: z.string().uuid(),
          executor: z.enum(['journeys', 'mcp'])
        })
        .strict()
        .parse(body)
      if (!(input.executor === 'journeys' ? isOwner : isMcp))
        throw new Error('Access denied')
      // Only the participant which has positively stopped its guarded executor
      // may report this. A fence can precede a delayed prepare or accept.
      await db.readExecutor.upsert({
        where: { id: input.executorId },
        create: { id: input.executorId, executor: input.executor },
        update: {}
      })
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "ReadExecutor" WHERE id = ${input.executorId} FOR UPDATE`
        const executor = await tx.readExecutor.findUniqueOrThrow({
          where: { id: input.executorId }
        })
        if (executor.executor !== input.executor)
          throw new Error('Access denied')
        const now = await databaseTime(tx)
        await tx.readExecutor.update({
          where: { id: executor.id },
          data: { fencedAt: executor.fencedAt ?? now }
        })
        await tx.readPermit.updateMany({
          where: { executorId: executor.id, status: 'accepted' },
          data: { status: 'settled', settledAt: now }
        })
      })
      await db.readPermit.updateMany({
        where: { executorId: input.executorId, status: 'prepared' },
        data: { status: 'cancelled', settledAt: await databaseTime(db) }
      })
      await reconcileConnectionChanges(db)
      return { fenced: true }
    }
    if (path === '/internal/reads/prepare') {
      if (!isOwner) throw new Error('Access denied')
      const input = prepareInput.parse(body)
      const { claims, connection } = await connectionFor(input.credential)
      if (input.stage === 'output' && input.executorId !== claims.executorId)
        throw new Error('Access denied')
      if (
        input.resources.some(
          (resource) => !connection.journeyIds.includes(resource.journeyId)
        ) ||
        (input.stage === 'output' && !input.outputHash)
      )
        throw new Error('Access denied')
      const gates = await captureGates(db, [
        `account:${connection.userId}`,
        `connection:${connection.id}`,
        ...input.resources.flatMap(({ journeyId, teamId }) => [
          `journey:${journeyId}`,
          `team:${teamId}`,
          `user-journey:${connection.userId}:${journeyId}`,
          `user-team:${connection.userId}:${teamId}`
        ])
      ])
      const executor = input.stage === 'read' ? 'journeys' : 'mcp'
      await db.readExecutor.upsert({
        where: { id: input.executorId },
        create: { id: input.executorId, executor },
        update: {}
      })
      const permit = await db.$transaction(async (tx) => {
        await lockGates(tx, gates)
        await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR SHARE`
        const current = await tx.agentConnection.findUniqueOrThrow({
          where: { id: connection.id }
        })
        const now = await databaseTime(tx)
        if (
          current.version !== connection.version ||
          current.revokedAt ||
          current.expiresAt <= now ||
          claims.expiresAt <= now.getTime()
        )
          throw new Error('Access denied')
        await tx.$queryRaw`SELECT id FROM "ReadExecutor" WHERE id = ${input.executorId} FOR UPDATE`
        const sender = await tx.readExecutor.findUniqueOrThrow({
          where: { id: input.executorId }
        })
        if (sender.fencedAt || sender.executor !== executor)
          throw new Error('Access denied')
        return await tx.readPermit.create({
          data: {
            connectionId: connection.id,
            grantVersion: connection.version,
            requestId: claims.requestId,
            requestHash: claims.requestHash,
            stage: input.stage,
            executor: input.stage === 'read' ? 'journeys' : 'mcp',
            executorId: input.executorId,
            journeyIds: input.resources.map((resource) => resource.journeyId),
            gates,
            preparedAt: await databaseTime(tx),
            outputHash: input.outputHash
          }
        })
      })
      return { permitId: permit.id }
    }
    if (path === '/internal/reads/accept') {
      if (!isOwner) throw new Error('Access denied')
      const input = z
        .object({ credential: z.string(), permitId: z.string().uuid() })
        .strict()
        .parse(body)
      const { claims, connection } = await connectionFor(input.credential)
      const permit = await db.readPermit.findUniqueOrThrow({
        where: { id: input.permitId }
      })
      if (
        permit.connectionId !== connection.id ||
        permit.requestId !== claims.requestId ||
        permit.grantVersion !== connection.version ||
        permit.requestHash !== claims.requestHash
      )
        throw new Error('Access denied')
      await identity.check({
        userId: connection.userId,
        authTime: connection.firebaseAuthTime,
        createdAt: connection.firebaseCreatedAt
      })
      const gates = z
        .array(z.object({ id: z.string(), generation: z.number().int() }))
        .parse(permit.gates)
      await db.$transaction(async (tx) => {
        await lockGates(tx, gates)
        await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR SHARE`
        await tx.$queryRaw`SELECT id FROM "ReadExecutor" WHERE id = ${permit.executorId} FOR UPDATE`
        const executor = await tx.readExecutor.findUniqueOrThrow({
          where: { id: permit.executorId }
        })
        if (executor.fencedAt) throw new Error('Executor fenced')
        await tx.$queryRaw`SELECT id FROM "ReadPermit" WHERE id = ${permit.id} FOR UPDATE`
        const current = await tx.agentConnection.findUniqueOrThrow({
          where: { id: connection.id }
        })
        const now = await databaseTime(tx)
        if (
          current.revokedAt ||
          current.version !== permit.grantVersion ||
          current.expiresAt <= now ||
          claims.expiresAt <= now.getTime() ||
          current.mode !== claims.mode ||
          permit.journeyIds.some((id) => !current.journeyIds.includes(id))
        )
          throw new Error('Access denied')
        const accepted = await tx.readPermit.updateMany({
          where: { id: permit.id, status: 'prepared' },
          data: { status: 'accepted', acceptedAt: now }
        })
        if (accepted.count !== 1) throw new Error('Already accepted')
        await audit(
          tx,
          permit.stage === 'read' ? 'read_accept' : 'output_accept',
          'allowed',
          {
            userId: current.userId,
            clientId: current.clientId,
            journeyIds: permit.journeyIds
          }
        )
      })
      return { permitId: permit.id }
    }
    if (path === '/internal/reads/settle') {
      const input = z
        .object({ permitId: z.string().uuid() })
        .strict()
        .parse(body)
      const permit = await db.readPermit.findUniqueOrThrow({
        where: { id: input.permitId }
      })
      if (!(permit.executor === 'journeys' ? isOwner : isMcp))
        throw new Error('Access denied')
      await db.readPermit.updateMany({
        where: { id: permit.id, status: 'accepted' },
        data: { status: 'settled', settledAt: await databaseTime(db) }
      })
      await reconcileConnectionChanges(db)
      return { settled: true }
    }
    if (path === '/internal/reads/deny') {
      if (!isOwner) throw new Error('Access denied')
      const input = z
        .object({
          credential: z.string().optional(),
          permitId: z.string().uuid().optional()
        })
        .strict()
        .parse(body)
      const verified = input.credential
        ? await connectionFor(input.credential).catch(() => undefined)
        : undefined
      const permit = input.permitId
        ? await db.readPermit.findUnique({ where: { id: input.permitId } })
        : undefined
      if (
        permit &&
        (!verified ||
          permit.connectionId !== verified.connection.id ||
          permit.requestId !== verified.claims.requestId)
      )
        throw new Error('Access denied')
      await audit(
        db,
        permit?.stage === 'output' ? 'output_accept' : 'read_accept',
        'denied',
        verified
          ? {
              userId: verified.connection.userId,
              clientId: verified.connection.clientId,
              journeyIds: permit?.journeyIds ?? []
            }
          : {}
      )
      // An error response cannot establish settlement for an accepted executor.
      if (permit)
        await db.readPermit.updateMany({
          where: { id: permit.id, status: 'prepared' },
          data: { status: 'settled', settledAt: await databaseTime(db) }
        })
      return { recorded: true }
    }
    throw new Error('Access denied')
  }
}
