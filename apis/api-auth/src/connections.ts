import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import type OidcProvider from 'oidc-provider'
import { z } from 'zod'

import type { AuthConfig } from './config'
import { calculateExpiry, createAgentGrant, durations } from './consent'
import { createEligibilityReader } from './eligibility'
import type { Identity, ReadEligibility } from './identity'
import {
  AuthorizationChanged,
  type Database,
  type IdentityEvidence,
  audit,
  captureGates,
  connectionGateIds,
  databaseTime,
  digest,
  lockGates,
  transactionScope
} from './store'
import { beginConnectionChange, reconcileConnectionChanges } from './withdrawal'

export class ConnectionFailure extends Error {
  constructor(readonly status: number) {
    super('Connection request denied')
  }
}

const sessionSchema = z.object({
  userId: z.string(),
  authTime: z.number(),
  createdAt: z.string(),
  csrf: z.string(),
  expiresAt: z.number()
})
const managementInput = z.object({
  csrf: z.string().min(32).max(128),
  expectedVersion: z.number().int().positive(),
  clientId: z.string().min(1).max(2048)
})
const accessInput = managementInput
  .extend({
    mode: z.enum(['view', 'edit']),
    journeyIds: z.array(z.string().min(1).max(128)).min(1).max(50)
  })
  .strict()
const reviewInput = managementInput
  .extend({ duration: z.enum(durations) })
  .strict()
const approvalInput = managementInput
  .extend({ reviewToken: z.string().min(32).max(128) })
  .strict()

export function createConnectionManagement(
  config: AuthConfig,
  db: Database,
  identity: Identity,
  eligibility: ReadEligibility,
  provider: OidcProvider
) {
  const currentRights = createEligibilityReader(db, identity, eligibility)
  function sign(payload: string, key: string): string {
    return createHmac('sha256', key).update(payload).digest('base64url')
  }
  function readSession(
    cookie: string | undefined,
    evidence: IdentityEvidence,
    now: Date
  ) {
    if (!cookie || cookie.length > 4096) throw new ConnectionFailure(403)
    const [payload, signature, extra] = cookie.split('.')
    if (
      !payload ||
      !signature ||
      extra ||
      !config.AUTH_COOKIE_KEYS.some((key) => {
        const expected = Buffer.from(sign(payload, key))
        const actual = Buffer.from(signature)
        return (
          expected.length === actual.length && timingSafeEqual(expected, actual)
        )
      })
    )
      throw new ConnectionFailure(403)
    const session = sessionSchema.parse(
      JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    )
    if (
      session.userId !== evidence.userId ||
      session.authTime !== evidence.authTime ||
      session.createdAt !== evidence.createdAt ||
      session.expiresAt <= now.getTime()
    )
      throw new ConnectionFailure(403)
    return session
  }

  return async (
    path: string,
    authorization: string,
    cookie: string | undefined,
    body: unknown
  ): Promise<{ body: unknown; cookie?: string }> => {
    const token = /^Bearer ([^\s]+)$/.exec(authorization)?.[1]
    if (!token) throw new ConnectionFailure(401)
    const evidence = await identity.authenticate(token)
    if (path === '/connections') {
      await reconcileConnectionChanges(db)
      const input = z
        .object({ after: z.string().uuid().optional() })
        .strict()
        .parse(body)
      const gates = await captureGates(db, [`account:${evidence.userId}`])
      const connections = await db.agentConnection.findMany({
        where: {
          userId: evidence.userId,
          environment: config.AUTH_ENVIRONMENT,
          ...(input.after ? { id: { gt: input.after } } : {})
        },
        orderBy: { id: 'asc' },
        take: 101
      })
      const pending = new Set<string>()
      for (const connection of connections.slice(0, 100)) {
        try {
          gates.push(...(await captureGates(db, connectionGateIds(connection))))
        } catch (error) {
          if (!(error instanceof AuthorizationChanged)) throw error
          pending.add(connection.id)
        }
      }
      let titlesUnavailable = false
      const rights = await currentRights({
        token,
        evidence,
        journeyIds: connections
          .slice(0, 100)
          .flatMap((connection) => connection.journeyIds),
        gates,
        allowPending: true
      }).catch(async () => {
        // The owner may still relinquish consent during an owning-API outage.
        // No journey data is released, and current identity is mandatory.
        await identity.check(evidence)
        titlesUnavailable = true
        return { journeys: [], pending: new Set<string>() }
      })
      const { journeys } = rights
      for (const connection of connections)
        if (connection.journeyIds.some((id) => rights.pending.has(id)))
          pending.add(connection.id)
      return db.$transaction(async (tx) => {
        await lockGates(tx, [
          ...new Map(gates.map((gate) => [gate.id, gate])).values()
        ])
        const now = await databaseTime(tx)
        const session = {
          ...evidence,
          csrf: randomBytes(32).toString('base64url'),
          expiresAt: now.getTime() + 600000
        }
        const payload = Buffer.from(JSON.stringify(session)).toString(
          'base64url'
        )
        const result = []
        for (const connection of connections.slice(0, 100)) {
          await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR SHARE`
          const current = await tx.agentConnection.findUniqueOrThrow({
            where: { id: connection.id }
          })
          if (
            current.version !== connection.version ||
            current.revokedAt?.getTime() !== connection.revokedAt?.getTime()
          )
            throw new ConnectionFailure(409)
          if (current.firebaseCreatedAt !== evidence.createdAt) continue
          const change = await tx.connectionChange.findFirst({
            where: { connectionId: current.id },
            orderBy: { requestedAt: 'desc' }
          })
          const status =
            change?.status === 'pending'
              ? 'pending'
              : current.revokedAt
                ? 'disconnected'
                : pending.has(current.id)
                  ? 'pending'
                  : current.expiresAt <= now
                    ? 'expired'
                    : 'active'
          result.push({
            id: current.id,
            clientId: current.clientId,
            mode: current.mode,
            version: current.version,
            credentialsPending: current.credentialsPending,
            expiresAt: current.expiresAt.toISOString(),
            status,
            change: change
              ? { id: change.id, kind: change.kind, status: change.status }
              : null,
            journeys: current.journeyIds.map((id) => ({
              id,
              title: pending.has(current.id)
                ? null
                : (journeys.find((journey) => journey.id === id)?.title ?? null)
            }))
          })
        }
        await audit(tx, 'connection_view', 'allowed', {
          userId: evidence.userId
        })
        return {
          body: {
            connections: result,
            titlesUnavailable,
            csrf: session.csrf,
            nextCursor: connections.length > 100 ? connections[99].id : null
          },
          cookie: `${payload}.${sign(payload, config.AUTH_COOKIE_KEYS[0])}`
        }
      })
    }
    const route =
      /^\/connections\/([A-Za-z0-9-]{1,128})\/(review|approve|access-options|access-review|access-approve|disconnect)$/.exec(
        path
      )
    if (!route) throw new ConnectionFailure(404)
    const input =
      route[2] === 'review'
        ? reviewInput.parse(body)
        : route[2] === 'access-review'
          ? accessInput.parse(body)
          : ['approve', 'access-approve'].includes(route[2])
            ? approvalInput.parse(body)
            : managementInput.strict().parse(body)
    const session = readSession(cookie, evidence, await databaseTime(db))
    if (session.csrf !== input.csrf) throw new ConnectionFailure(403)
    const connection = await db.agentConnection.findFirst({
      where: {
        id: route[1],
        userId: evidence.userId,
        clientId: input.clientId,
        environment: config.AUTH_ENVIRONMENT
      }
    })
    if (!connection || connection.firebaseCreatedAt !== evidence.createdAt)
      throw new ConnectionFailure(403)
    if (connection.version !== input.expectedVersion || connection.revokedAt)
      throw new ConnectionFailure(409)
    if (route[2].startsWith('access-') || route[2] === 'disconnect') {
      const selectionInput =
        route[2] === 'access-review' ? accessInput.parse(body) : undefined
      let selection = selectionInput
        ? {
            journeyIds: [...new Set(selectionInput.journeyIds)].sort(),
            mode: selectionInput.mode
          }
        : undefined
      let accessReview: Awaited<
        ReturnType<typeof db.agentAccessReview.findUnique>
      > = null
      if (route[2] === 'access-approve') {
        const approval = approvalInput.parse(body)
        accessReview = await db.agentAccessReview.findUnique({
          where: { id: digest(approval.reviewToken) }
        })
        if (
          !accessReview ||
          accessReview.connectionId !== connection.id ||
          accessReview.connectionVersion !== connection.version ||
          accessReview.userId !== evidence.userId ||
          accessReview.clientId !== connection.clientId ||
          accessReview.sessionHash !== digest(cookie!) ||
          accessReview.consumedAt
        )
          throw new ConnectionFailure(409)
        selection = {
          mode: accessReview.mode as 'view' | 'edit',
          journeyIds: accessReview.journeyIds
        }
      }
      const options = route[2] === 'access-options'
      // Discovery supplies IDs only; eligibility permissions are read again after gate capture.
      const discovered = options
        ? await eligibility(token, evidence.userId)
        : []
      const ids = [
        ...new Set([
          ...connection.journeyIds,
          ...(selection?.journeyIds ?? []),
          ...discovered.map((j) => j.id)
        ])
      ]
      const expansion =
        selection &&
        (selection.journeyIds.some(
          (id) => !connection.journeyIds.includes(id)
        ) ||
          (selection.mode === 'edit' && connection.mode === 'view'))
      const gates = await captureGates(
        db,
        options || expansion
          ? connectionGateIds({ ...connection, journeyIds: ids })
          : [`account:${connection.userId}`, `connection:${connection.id}`]
      )
      let journeys: Awaited<ReturnType<ReadEligibility>> = []
      if (options || expansion) {
        journeys = (
          await currentRights({ token, evidence, journeyIds: ids, gates })
        ).journeys
      } else {
        // Relinquishing authority needs no owning-API availability or surviving ACL.
        await identity.check(evidence)
      }
      if (
        expansion &&
        !selection!.journeyIds.every((id) =>
          journeys.some(
            (j) => j.id === id && (selection!.mode === 'view' || j.canEdit)
          )
        )
      )
        throw new ConnectionFailure(403)
      const reviewToken = randomBytes(32).toString('base64url')
      const result = await db.$transaction(async (tx) => {
        await lockGates(tx, gates)
        await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR UPDATE`
        const current = await tx.agentConnection.findUniqueOrThrow({
          where: { id: connection.id }
        })
        const now = await databaseTime(tx)
        if (
          current.version !== input.expectedVersion ||
          current.revokedAt ||
          session.expiresAt <= now.getTime()
        )
          throw new ConnectionFailure(409)
        if (options) return { journeys, version: current.version }
        if (route[2] === 'access-review' && selection) {
          await tx.agentAccessReview.updateMany({
            where: {
              connectionId: current.id,
              sessionHash: digest(cookie!),
              consumedAt: null
            },
            data: { consumedAt: now }
          })
          await tx.agentAccessReview.create({
            data: {
              id: digest(reviewToken),
              connectionId: current.id,
              connectionVersion: current.version,
              userId: evidence.userId,
              clientId: current.clientId,
              sessionHash: digest(cookie!),
              ...selection,
              validUntil: new Date(now.getTime() + 60000)
            }
          })
          return {
            reviewToken,
            version: current.version,
            ...selection,
            expiresAt: current.expiresAt.toISOString(),
            journeys: selection.journeyIds.map((id) => ({
              id,
              title: journeys.find((j) => j.id === id)?.title ?? null
            }))
          }
        }
        if (route[2] === 'access-approve') {
          if (!accessReview || !selection) throw new ConnectionFailure(409)
          await tx.$queryRaw`SELECT id FROM "AgentAccessReview" WHERE id = ${accessReview.id} FOR UPDATE`
          const review = await tx.agentAccessReview.findUniqueOrThrow({
            where: { id: accessReview.id }
          })
          const approvedAt = await databaseTime(tx)
          if (
            review.consumedAt ||
            review.validUntil <= approvedAt ||
            session.expiresAt <= approvedAt.getTime()
          )
            throw new ConnectionFailure(409)
          await tx.agentAccessReview.update({
            where: { id: review.id },
            data: { consumedAt: approvedAt }
          })
        }
        if (selection)
          await transactionScope.run(tx, async () => {
            const grantId = await createAgentGrant(
              provider,
              config.AUTH_AUDIENCE,
              current.userId,
              current.clientId,
              selection.mode === 'edit' ? 'edit' : 'view'
            )
            await tx.oAuthArtifact.deleteMany({
              where: {
                OR: [
                  { grantId: current.grantId },
                  { model: 'Grant', id: current.grantId }
                ]
              }
            })
            await tx.agentConnection.update({
              where: { id: current.id },
              data: { grantId, credentialsPending: true }
            })
          })
        const change = await beginConnectionChange(tx, current, selection)
        return {
          changeId: change.id,
          status: change.status,
          version: change.version
        }
      })
      await reconcileConnectionChanges(db)
      if ('changeId' in result) {
        const change = await db.connectionChange.findUniqueOrThrow({
          where: { id: result.changeId }
        })
        return { body: { ...result, status: change.status } }
      }
      return { body: result }
    }
    const gates = await captureGates(db, connectionGateIds(connection))
    const { journeys } = await currentRights({
      token,
      evidence,
      journeyIds: connection.journeyIds,
      gates
    })
    if (
      !connection.journeyIds.length ||
      !['view', 'edit'].includes(connection.mode) ||
      !connection.journeyIds.every((id) =>
        journeys.some(
          (journey) =>
            journey.id === id && (connection.mode === 'view' || journey.canEdit)
        )
      )
    )
      throw new ConnectionFailure(403)
    const reviewToken = randomBytes(32).toString('base64url')
    return db.$transaction(async (tx) => {
      await lockGates(tx, gates)
      await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR UPDATE`
      const current = await tx.agentConnection.findUniqueOrThrow({
        where: { id: connection.id }
      })
      const now = await databaseTime(tx)
      if (
        current.version !== input.expectedVersion ||
        current.revokedAt ||
        session.expiresAt <= now.getTime()
      )
        throw new ConnectionFailure(409)
      if (route[2] === 'review') {
        const renewal = reviewInput.parse(body)
        const previewExpiresAt = calculateExpiry(now, renewal.duration)
        await tx.agentRenewalReview.updateMany({
          where: {
            connectionId: current.id,
            sessionHash: digest(cookie!),
            consumedAt: null
          },
          data: { consumedAt: now }
        })
        await tx.agentRenewalReview.create({
          data: {
            id: digest(reviewToken),
            connectionId: current.id,
            connectionVersion: current.version,
            userId: evidence.userId,
            clientId: current.clientId,
            sessionHash: digest(cookie!),
            duration: renewal.duration,
            previewExpiresAt,
            validUntil: new Date(now.getTime() + 60000)
          }
        })
        return {
          body: {
            reviewToken,
            duration: renewal.duration,
            previewExpiresAt: previewExpiresAt.toISOString(),
            previewedAt: now.toISOString(),
            previousExpiresAt: current.expiresAt.toISOString(),
            version: current.version
          }
        }
      }
      const approval = approvalInput.parse(body)
      const reviewId = digest(approval.reviewToken)
      await tx.$queryRaw`SELECT id FROM "AgentRenewalReview" WHERE id = ${reviewId} FOR UPDATE`
      const review = await tx.agentRenewalReview.findUnique({
        where: { id: reviewId }
      })
      const approvedAt = await databaseTime(tx)
      if (
        !review ||
        review.consumedAt ||
        review.validUntil <= approvedAt ||
        session.expiresAt <= approvedAt.getTime() ||
        review.sessionHash !== digest(cookie!) ||
        review.connectionId !== current.id ||
        review.connectionVersion !== current.version ||
        review.userId !== evidence.userId ||
        review.clientId !== current.clientId
      )
        throw new ConnectionFailure(409)
      const expiresAt = calculateExpiry(approvedAt, review.duration)
      await transactionScope.run(tx, async () => {
        const grantId = await createAgentGrant(
          provider,
          config.AUTH_AUDIENCE,
          current.userId,
          current.clientId,
          current.mode === 'edit' ? 'edit' : 'view'
        )
        await tx.oAuthArtifact.deleteMany({
          where: {
            OR: [
              { grantId: current.grantId },
              { model: 'Grant', id: current.grantId }
            ]
          }
        })
        await tx.agentConnection.update({
          where: { id: current.id },
          data: {
            grantId,
            expiresAt,
            approvedAt,
            version: { increment: 1 },
            credentialsPending: true,
            firebaseAuthTime: evidence.authTime
          }
        })
      })
      await tx.authorizationGate.update({
        where: { id: `connection:${current.id}` },
        data: { generation: { increment: 1 } }
      })
      await tx.agentRenewalReview.update({
        where: { id: reviewId },
        data: { consumedAt: approvedAt }
      })
      await audit(tx, 'renewal', 'allowed', {
        userId: current.userId,
        clientId: current.clientId,
        journeyIds: current.journeyIds
      })
      return {
        body: {
          id: current.id,
          version: current.version + 1,
          approvedAt: approvedAt.toISOString(),
          expiresAt: expiresAt.toISOString()
        }
      }
    })
  }
}
