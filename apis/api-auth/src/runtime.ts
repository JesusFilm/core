import { randomBytes } from 'node:crypto'
import { type IncomingMessage, createServer } from 'node:http'

import pino, { type Logger } from 'pino'
import { z } from 'zod'

import type { AuthConfig } from './config'
import { type AccessMode, calculateExpiry, durations } from './consent'
import type { Identity, ReadEligibility } from './identity'
import { createProvider } from './provider'
import {
  type Database,
  type AuditAction,
  assertEnvironment,
  assertRuntimeRole,
  audit,
  captureGates,
  cleanup,
  databaseTime,
  digest,
  lockGates,
  requestGateSnapshots,
  transactionScope
} from './store'

class HttpFailure extends Error {
  constructor(readonly status: number) {
    super('Request denied')
  }
}

function securityAction(path: string): AuditAction | undefined {
  if (path === '/token') return 'token'
  if (path === '/token/introspection') return 'introspection'
  if (path === '/reg') return 'registration'
  if (path === '/auth' || path.startsWith('/auth/')) return 'authorization'
  if (path.startsWith('/interaction/')) return 'consent'
  return undefined
}

async function jsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk as Uint8Array)
    size += bytes.length
    if (size > 16384) throw new HttpFailure(413)
    chunks.push(bytes)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

const selectionSchema = z
  .object({
    csrf: z.string().min(32).max(128),
    journeyIds: z.array(z.string().min(1).max(128)).min(1).max(50),
    mode: z.enum(['view', 'edit']),
    duration: z.enum(durations)
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
  const { provider, close: closeMetadata } = createProvider(
    config,
    db,
    identity
  )
  provider.proxy = config.AUTH_ENVIRONMENT !== 'local'
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
        if (new Set(selection.journeyIds).size !== selection.journeyIds.length)
          throw new HttpFailure(400)
        const gates = await captureGates(db, [
          `account:${evidence.userId}`,
          ...selection.journeyIds.map((id) => `journey:${id}`)
        ])
        await identity.check(evidence)
        const journeys = await eligibility(token, evidence.userId)
        assertSelection(journeys, selection.journeyIds, selection.mode)
        const reviewToken = randomBytes(32).toString('base64url')
        const review = await db.$transaction(async (transaction) => {
          await lockGates(transaction, gates)
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
              expiresAt: calculateExpiry(now, selection.duration),
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
          duration: review.duration
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
        ...existing.journeyIds.map((id) => `journey:${id}`)
      ])
      const journeys = await eligibility(token, evidence.userId)
      assertSelection(journeys, existing.journeyIds, approvedMode)
      await identity.check(evidence)
      const grantId = await db.$transaction(
        async (transaction) => {
          await lockGates(transaction, gates)
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
          return transactionScope.run(transaction, async () => {
            const grant = new provider.Grant({
              accountId: evidence.userId,
              clientId: verifiedClient!
            })
            const scope =
              approvedMode === 'edit'
                ? 'journeys:read journeys:edit'
                : 'journeys:read'
            grant.addResourceScope(config.AUTH_AUDIENCE, scope)
            if (approvedMode === 'view')
              grant.rejectResourceScope(config.AUTH_AUDIENCE, 'journeys:edit')
            grant.addOIDCScope('offline_access')
            const id = await grant.save()
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
        error instanceof HttpFailure
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
    void cleanup(db).catch(() => logger.error({ event: 'cleanup_unavailable' }))
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
