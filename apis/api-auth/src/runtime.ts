import { randomBytes } from 'node:crypto'
import { type IncomingMessage, createServer } from 'node:http'

import pino, { type Logger } from 'pino'
import { z } from 'zod'

import { maxTransportBytes } from '@core/yoga/mcp/readContract'

import type { AuthConfig } from './config'
import { ConnectionFailure, createConnectionManagement } from './connections'
import {
  type AccessMode,
  calculateExpiry,
  createAgentGrant,
  durations
} from './consent'
import { createEligibilityReader } from './eligibility'
import type { Identity, ReadEligibility } from './identity'
import { createPermissionAuthority } from './permissions'
import { createProvider } from './provider'
import { createReadAuthority } from './reads'
import {
  type AuditAction,
  AuthorizationChanged,
  type Database,
  assertEnvironment,
  assertRuntimeRole,
  audit,
  captureGates,
  cleanup,
  connectionGateIds,
  databaseTime,
  digest,
  lockGates,
  requestGateSnapshots,
  transactionScope
} from './store'
import { reconcileConnectionChanges } from './withdrawal'

class HttpFailure extends Error {
  constructor(readonly status: number) {
    super('Request denied')
  }
}

function securityAction(path: string): AuditAction | undefined {
  if (path === '/internal/permissions/retire-account') return 'account_retire'
  if (path.startsWith('/internal/permissions/')) return 'permission_change'
  if (path === '/internal/reads/exchange') return 'read_exchange'
  if (path.startsWith('/internal/reads/')) return 'read_accept'
  if (path === '/connections') return 'connection_view'
  if (path.endsWith('/disconnect')) return 'disconnect'
  if (/\/connections\/[^/]+\/access-/.test(path)) return 'access_change'
  if (path.startsWith('/connections/')) return 'renewal'
  if (path === '/token') return 'token'
  if (path === '/token/introspection') return 'introspection'
  if (path === '/reg') return 'registration'
  if (path === '/auth' || path.startsWith('/auth/')) return 'authorization'
  if (path.startsWith('/interaction/')) return 'consent'
  return undefined
}

async function jsonBody(req: IncomingMessage, limit = 16384): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk as Uint8Array)
    size += bytes.length
    if (size > limit) throw new HttpFailure(413)
    chunks.push(bytes)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

const selectionSchema = z
  .object({
    csrf: z.string().min(32).max(128),
    journeyIds: z.array(z.string().min(1).max(128)).min(1).max(50),
    mode: z.enum(['view', 'edit']),
    duration: z.enum(durations),
    connectionId: z.string().uuid().optional(),
    expectedVersion: z.number().int().positive().optional()
  })
  .strict()
const decisionSchema = z
  .object({
    csrf: z.string().min(32).max(128),
    reviewToken: z.string().min(32).max(128).optional(),
    decision: z.enum(['approve', 'deny'])
  })
  .strict()

export interface RuntimeDependencies {
  db: Database
  identity: Identity
  eligibility: ReadEligibility
  logger?: Logger
}

export async function createRuntime(
  config: AuthConfig,
  dependencies: RuntimeDependencies
) {
  const { db, identity, eligibility } = dependencies
  const logger =
    dependencies.logger ?? pino({ name: 'api-auth', base: undefined })
  await assertRuntimeRole(db)
  await assertEnvironment(db, config)
  await cleanup(db)
  await reconcileConnectionChanges(db)
  const { provider, close: closeMetadata } = createProvider(
    config,
    db,
    identity
  )
  provider.proxy = config.AUTH_ENVIRONMENT !== 'local'
  const readAuthority = createReadAuthority(config, db, identity, provider)
  const permissionAuthority = createPermissionAuthority(config, db)
  const currentRights = createEligibilityReader(db, identity, eligibility)
  const manageConnections = createConnectionManagement(
    config,
    db,
    identity,
    eligibility,
    provider
  )
  let draining = false
  const publicHost = new URL(config.AUTH_ISSUER).host

  provider.use(async (ctx, next) => {
    ctx.set('Cache-Control', 'no-store')
    ctx.set('X-Content-Type-Options', 'nosniff')
    ctx.set('Referrer-Policy', 'no-referrer')
    ctx.set(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'"
    )
    const reject = async (status: number, error: string): Promise<void> => {
      const action = securityAction(ctx.path)
      if (action) {
        try {
          await audit(db, action, 'denied')
        } catch {
          status = 503
          error = 'unavailable'
        }
      }
      ctx.status = status
      ctx.body = { error }
    }
    if (ctx.path === '/health') {
      ctx.body = { status: 'ok' }
      return
    }
    if (ctx.path === '/ready') {
      try {
        if (draining) throw new Error('Draining')
        await assertRuntimeRole(db)
        await assertEnvironment(db, config)
        ctx.body = { status: 'ready' }
      } catch {
        ctx.status = 503
        ctx.body = { status: 'unavailable' }
      }
      return
    }
    if (ctx.req.headers.host !== publicHost) {
      await reject(400, 'invalid_host')
      return
    }
    if (draining) {
      await reject(503, 'unavailable')
      return
    }
    const origin = ctx.get('Origin')
    if (origin && origin !== config.AUTH_ADMIN_ORIGIN) {
      await reject(403, 'invalid_origin')
      return
    }
    if (origin) {
      ctx.set('Access-Control-Allow-Origin', config.AUTH_ADMIN_ORIGIN)
      ctx.set('Access-Control-Allow-Credentials', 'true')
      ctx.set('Vary', 'Origin')
    }
    if (ctx.method === 'OPTIONS') {
      ctx.set('Access-Control-Allow-Methods', 'GET, POST')
      ctx.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
      ctx.status = origin === config.AUTH_ADMIN_ORIGIN ? 204 : 403
      return
    }
    if (ctx.path.startsWith('/internal/permissions/')) {
      try {
        if (ctx.method !== 'POST' || origin) throw new HttpFailure(403)
        ctx.body = await permissionAuthority(
          ctx.path,
          ctx.get('Authorization'),
          await jsonBody(ctx.req, 262144)
        )
      } catch {
        await audit(
          db,
          ctx.path.endsWith('/retire-account')
            ? 'account_retire'
            : 'permission_change',
          'denied'
        ).catch(() => undefined)
        ctx.status = 403
        ctx.body = { error: 'ACCESS_DENIED_OR_NOT_FOUND' }
      }
      return
    }
    if (ctx.path.startsWith('/internal/reads/')) {
      try {
        if (ctx.method !== 'POST' || origin) throw new HttpFailure(403)
        ctx.body = await readAuthority(
          ctx.path,
          ctx.get('Authorization'),
          await jsonBody(ctx.req, maxTransportBytes)
        )
      } catch {
        await audit(
          db,
          ctx.path.endsWith('/exchange') ? 'read_exchange' : 'read_accept',
          'denied'
        ).catch(() => undefined)
        ctx.status = 403
        ctx.body = { error: 'ACCESS_DENIED_OR_NOT_FOUND' }
      }
      return
    }
    if (ctx.path === '/connections' || ctx.path.startsWith('/connections/')) {
      try {
        if (ctx.method !== 'POST' || origin !== config.AUTH_ADMIN_ORIGIN)
          throw new ConnectionFailure(403)
        const result = await manageConnections(
          ctx.path,
          ctx.get('Authorization'),
          ctx.cookies.get('agent_management', { signed: false }),
          await jsonBody(ctx.req)
        )
        if (result.cookie)
          ctx.cookies.set('agent_management', result.cookie, {
            signed: false,
            httpOnly: true,
            sameSite: 'strict',
            secure: config.AUTH_ENVIRONMENT !== 'local',
            path: '/connections',
            maxAge: 600000,
            overwrite: true
          })
        ctx.body = result.body
      } catch (error) {
        await audit(db, securityAction(ctx.path)!, 'denied').catch(
          () => undefined
        )
        ctx.status =
          error instanceof AuthorizationChanged
            ? 409
            : error instanceof ConnectionFailure || error instanceof HttpFailure
              ? error.status
              : error instanceof z.ZodError || error instanceof SyntaxError
                ? 400
                : 503
        ctx.body = {
          error: ctx.status === 409 ? 'review_again' : 'request_denied'
        }
      }
      return
    }
    const route =
      /^\/interaction\/([A-Za-z0-9_-]+)(?:\/(details|review|decision))?$/.exec(
        ctx.path
      )
    if (!route) {
      // Refuse large/chunked OAuth bodies before the provider's bounded parser.
      if (
        ctx.method === 'POST' &&
        (Number(ctx.get('Content-Length')) > 16384 ||
          ctx.get('Transfer-Encoding'))
      ) {
        await reject(413, 'request_too_large')
        return
      }
      await next()
      const action = securityAction(ctx.path)
      if (action) {
        try {
          const inactive =
            action === 'introspection' &&
            typeof ctx.body === 'object' &&
            ctx.body !== null &&
            'active' in ctx.body &&
            ctx.body.active === false
          const outcome =
            ctx.status < 400 &&
            ctx.state.authorizationDenied !== true &&
            !inactive
              ? 'allowed'
              : 'denied'
          await audit(db, action, outcome, {
            userId: ctx.oidc?.account?.accountId,
            clientId: ctx.oidc?.client?.clientId
          })
        } catch {
          ctx.status = 503
          ctx.body = { error: 'temporarily_unavailable' }
        }
      }
      return
    }
    let verifiedUser: string | undefined
    let verifiedClient: string | undefined
    try {
      const details = await provider.interactionDetails(ctx.req, ctx.res)
      if (
        details.uid !== route[1] ||
        typeof details.params.client_id !== 'string'
      )
        throw new HttpFailure(403)
      verifiedClient = details.params.client_id
      if (ctx.method === 'GET' && !route[2]) {
        ctx.redirect(
          `${config.AUTH_ADMIN_ORIGIN}/agents/connect?interaction=${encodeURIComponent(details.uid)}`
        )
        return
      }
      if (ctx.method !== 'POST' || origin !== config.AUTH_ADMIN_ORIGIN)
        throw new HttpFailure(403)
      const token = /^Bearer ([^\s]+)$/.exec(ctx.get('Authorization'))?.[1]
      if (!token) throw new HttpFailure(401)
      const evidence = await identity.authenticate(token)
      verifiedUser = evidence.userId
      // Fresh Firebase sign-in selects the account for a new transaction.
      // The durable review below binds all subsequent submissions to it.
      const client = await provider.Client.find(verifiedClient)
      if (!client) throw new HttpFailure(403)
      const existing = await db.consentReview.findUnique({
        where: { interactionId: details.uid }
      })
      if (
        existing &&
        (existing.userId !== evidence.userId ||
          existing.clientId !== verifiedClient ||
          existing.consumedAt)
      )
        throw new HttpFailure(409)
      if (route[2] === 'details') {
        const gates = await captureGates(db, [`account:${evidence.userId}`])
        await identity.check(evidence)
        const journeys = await eligibility(token, evidence.userId)
        const csrf = randomBytes(32).toString('base64url')
        await db.$transaction(async (transaction) => {
          await lockGates(transaction, gates)
          const now = await databaseTime(transaction)
          await transaction.consentReview.upsert({
            where: { interactionId: details.uid },
            create: {
              interactionId: details.uid,
              userId: evidence.userId,
              clientId: verifiedClient!,
              csrfHash: digest(csrf),
              journeyIds: [],
              validUntil: new Date(now.getTime() + 600000)
            },
            update: {
              csrfHash: digest(csrf),
              reviewHash: null,
              generation: { increment: 1 },
              validUntil: new Date(now.getTime() + 600000)
            }
          })
          await audit(transaction, 'login', 'allowed', {
            userId: evidence.userId,
            clientId: verifiedClient
          })
        })
        ctx.body = {
          clientName: client.clientName ?? client.clientId,
          clientId: client.clientId,
          redirectUri: details.params.redirect_uri,
          journeys,
          reconnectableConnections: (
            await db.agentConnection.findMany({
              where: {
                userId: evidence.userId,
                clientId: verifiedClient,
                environment: config.AUTH_ENVIRONMENT,
                revokedAt: null,
                expiresAt: { gt: await databaseTime(db) },
                firebaseCreatedAt: evidence.createdAt
              },
              take: 100
            })
          ).map((connection) => ({
            id: connection.id,
            version: connection.version,
            journeyIds: connection.journeyIds,
            mode: connection.mode,
            expiresAt: connection.expiresAt.toISOString()
          })),
          csrf,
          duration: 'week'
        }
        return
      }
      const body = await jsonBody(ctx.req)
      if (
        !existing ||
        existing.csrfHash !==
          digest(z.object({ csrf: z.string() }).parse(body).csrf)
      )
        throw new HttpFailure(403)
      if (route[2] === 'review') {
        const selection = selectionSchema.parse(body)
        const reconnect = selection.connectionId
          ? await db.agentConnection.findFirst({
              where: {
                id: selection.connectionId,
                userId: evidence.userId,
                clientId: verifiedClient,
                environment: config.AUTH_ENVIRONMENT,
                firebaseCreatedAt: evidence.createdAt
              }
            })
          : null
        if (
          selection.connectionId &&
          (!reconnect ||
            reconnect.revokedAt ||
            reconnect.version !== selection.expectedVersion ||
            reconnect.mode !== selection.mode ||
            reconnect.journeyIds.length !== selection.journeyIds.length ||
            !reconnect.journeyIds.every((id) =>
              selection.journeyIds.includes(id)
            ))
        )
          throw new HttpFailure(409)
        if (new Set(selection.journeyIds).size !== selection.journeyIds.length)
          throw new HttpFailure(400)
        const gates = await captureGates(db, [
          `account:${evidence.userId}`,
          ...selection.journeyIds.map((id) => `journey:${id}`),
          ...(reconnect ? connectionGateIds(reconnect) : [])
        ])
        await identity.check(evidence)
        const journeys = reconnect
          ? (
              await currentRights({
                token,
                evidence,
                journeyIds: selection.journeyIds,
                gates
              })
            ).journeys
          : await eligibility(token, evidence.userId)
        assertSelection(journeys, selection.journeyIds, selection.mode)
        const reviewToken = randomBytes(32).toString('base64url')
        const review = await db.$transaction(async (transaction) => {
          await lockGates(transaction, gates)
          if (reconnect) {
            await transaction.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${reconnect.id} FOR SHARE`
            const current = await transaction.agentConnection.findUniqueOrThrow(
              { where: { id: reconnect.id } }
            )
            if (current.version !== reconnect.version || current.revokedAt)
              throw new HttpFailure(409)
          }
          const now = await databaseTime(transaction)
          const updated = await transaction.consentReview.updateMany({
            where: {
              interactionId: details.uid,
              generation: existing.generation,
              consumedAt: null
            },
            data: {
              reviewHash: digest(reviewToken),
              mode: selection.mode,
              duration: selection.duration,
              journeyIds: selection.journeyIds,
              approvedAt: now,
              expiresAt:
                reconnect?.expiresAt ??
                calculateExpiry(now, selection.duration),
              connectionId: reconnect?.id ?? null,
              connectionVersion: reconnect?.version ?? null,
              generation: { increment: 1 },
              validUntil: new Date(now.getTime() + 60000)
            }
          })
          if (updated.count !== 1) throw new HttpFailure(409)
          return transaction.consentReview.findUniqueOrThrow({
            where: { interactionId: details.uid }
          })
        })
        ctx.body = {
          reviewToken,
          expiresAt: review.expiresAt!.toISOString(),
          mode: review.mode,
          journeyIds: review.journeyIds,
          duration: review.duration,
          reconnect: Boolean(reconnect)
        }
        return
      }
      if (route[2] !== 'decision') throw new HttpFailure(404)
      const decision = decisionSchema.parse(body)
      if (
        decision.decision === 'approve' &&
        (!decision.reviewToken ||
          !existing.reviewHash ||
          existing.reviewHash !== digest(decision.reviewToken))
      )
        throw new HttpFailure(403)
      if (decision.decision === 'deny') {
        const denied = await db.consentReview.updateMany({
          where: {
            interactionId: details.uid,
            consumedAt: null,
            generation: existing.generation
          },
          data: { consumedAt: await databaseTime(db) }
        })
        if (denied.count !== 1) throw new HttpFailure(409)
        await audit(db, 'consent', 'denied', {
          userId: evidence.userId,
          clientId: verifiedClient
        })
        ctx.body = {
          redirectUrl: await provider.interactionResult(
            ctx.req,
            ctx.res,
            { error: 'access_denied' },
            { mergeWithLastSubmission: false }
          )
        }
        return
      }
      const approvedMode = z.enum(['view', 'edit']).parse(existing.mode)
      const gates = await captureGates(db, [
        `account:${evidence.userId}`,
        ...existing.journeyIds.map((id) => `journey:${id}`),
        ...(existing.connectionId
          ? [`connection:${existing.connectionId}`]
          : [])
      ])
      const journeys = existing.connectionId
        ? (
            await currentRights({
              token,
              evidence,
              journeyIds: existing.journeyIds,
              gates
            })
          ).journeys
        : await eligibility(token, evidence.userId)
      assertSelection(journeys, existing.journeyIds, approvedMode)
      await identity.check(evidence)
      const grantId = await db.$transaction(
        async (transaction) => {
          await lockGates(transaction, gates)
          if (existing.connectionId) {
            await transaction.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${existing.connectionId} FOR UPDATE`
          }
          await transaction.$queryRaw`SELECT "interactionId" FROM "ConsentReview" WHERE "interactionId" = ${details.uid} FOR UPDATE`
          const now = await databaseTime(transaction)
          const expiresAt = existing.expiresAt
          if (
            !expiresAt ||
            !existing.approvedAt ||
            expiresAt <= now ||
            existing.validUntil <= now
          )
            throw new HttpFailure(409)
          const consumed = await transaction.consentReview.updateMany({
            where: {
              interactionId: details.uid,
              consumedAt: null,
              generation: existing.generation,
              reviewHash: existing.reviewHash
            },
            data: { consumedAt: now }
          })
          if (consumed.count !== 1) throw new HttpFailure(409)
          if (existing.connectionId) {
            const connection =
              await transaction.agentConnection.findUniqueOrThrow({
                where: { id: existing.connectionId }
              })
            if (
              connection.userId !== evidence.userId ||
              connection.clientId !== verifiedClient ||
              connection.environment !== config.AUTH_ENVIRONMENT ||
              connection.firebaseCreatedAt !== evidence.createdAt ||
              connection.version !== existing.connectionVersion ||
              connection.revokedAt ||
              connection.expiresAt <= now ||
              connection.expiresAt.getTime() !== expiresAt.getTime()
            )
              throw new HttpFailure(409)
            await transaction.agentConnection.update({
              where: { id: connection.id },
              data: { credentialsPending: false }
            })
            await audit(transaction, 'consent', 'allowed', {
              userId: evidence.userId,
              clientId: verifiedClient,
              journeyIds: connection.journeyIds
            })
            return connection.grantId
          }
          return transactionScope.run(transaction, async () => {
            const id = await createAgentGrant(
              provider,
              config.AUTH_AUDIENCE,
              evidence.userId,
              verifiedClient!,
              approvedMode
            )
            await transaction.agentConnection.create({
              data: {
                grantId: id,
                userId: evidence.userId,
                clientId: verifiedClient!,
                environment: config.AUTH_ENVIRONMENT,
                mode: approvedMode,
                journeyIds: existing.journeyIds,
                expiresAt,
                approvedAt: now,
                firebaseAuthTime: evidence.authTime,
                firebaseCreatedAt: evidence.createdAt
              }
            })
            await audit(transaction, 'consent', 'allowed', {
              userId: evidence.userId,
              clientId: verifiedClient,
              journeyIds: existing.journeyIds
            })
            return id
          })
        },
        { timeout: 5000 }
      )
      ctx.body = {
        redirectUrl: await provider.interactionResult(
          ctx.req,
          ctx.res,
          {
            login: {
              accountId: evidence.userId,
              remember: false,
              ts: evidence.authTime
            },
            consent: { grantId }
          },
          { mergeWithLastSubmission: false }
        )
      }
    } catch (error) {
      await audit(db, 'consent', 'denied', {
        userId: verifiedUser,
        clientId: verifiedClient
      }).catch(() => undefined)
      ctx.status =
        error instanceof AuthorizationChanged
          ? 409
          : error instanceof HttpFailure
            ? error.status
            : error instanceof z.ZodError || error instanceof SyntaxError
              ? 400
              : 503
      ctx.body = {
        error: ctx.status === 409 ? 'review_again' : 'request_denied'
      }
    }
  })

  const callback = provider.callback()
  const server = createServer((req, res) => {
    res.on('finish', () =>
      logger.info({ event: 'http_complete', status: res.statusCode })
    )
    void requestGateSnapshots
      .run(new Map(), () => callback(req, res))
      .catch(() => {
        if (!res.headersSent)
          res.writeHead(503, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          })
        res.end('{"error":"unavailable"}')
      })
  })
  server.requestTimeout = 10000
  server.headersTimeout = 10000
  server.maxConnections = 128
  const maintenance = setInterval(() => {
    void cleanup(db)
      .then(() => reconcileConnectionChanges(db))
      .then((failed) => {
        if (failed)
          logger.error({ event: 'withdrawal_reconciliation_pending', failed })
      })
      .catch(() => logger.error({ event: 'cleanup_unavailable' }))
  }, 60000)
  maintenance.unref()
  return {
    server,
    provider,
    async close() {
      draining = true
      clearInterval(maintenance)
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => server.closeAllConnections(), 10000)
        timer.unref()
        server.close(() => {
          clearTimeout(timer)
          resolve()
        })
      })
      await closeMetadata()
    }
  }
}

function assertSelection(
  journeys: Array<{ id: string; canEdit: boolean }>,
  ids: string[],
  mode: AccessMode
): void {
  if (
    !ids.length ||
    !ids.every((id) =>
      journeys.some(
        (journey) => journey.id === id && (mode === 'view' || journey.canEdit)
      )
    )
  )
    throw new HttpFailure(403)
}
