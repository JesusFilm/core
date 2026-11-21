import { generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { type Server, createServer, request as httpRequest } from 'node:http'
import type { AddressInfo } from 'node:net'

import { createGatewayRuntime } from '@graphql-hive/gateway'
import pino from 'pino'
import { z } from 'zod'

import { createAuthDatabase } from '@core/prisma/auth/client'
import { Prisma, PrismaClient } from '@core/prisma/journeys/client'
import {
  type TypographyInverse,
  canonicalFingerprint,
  historyResult
} from '@core/yoga/mcp/editContract'
import { presentationInverse } from '@core/yoga/mcp/presentationContract'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- Exercise the independently deployed HTTP participants together. */
import { useMcpReads } from '../../api-gateway/src/mcpReads'
import { createJourneyEditHandler } from '../../api-journeys/src/lib/mcpEdits'
import { createJourneyReadHandler } from '../../api-journeys/src/lib/mcpReads'
import { readConfig as readMcpConfig } from '../../api-mcp/src/config'
import { createRuntime as createMcpRuntime } from '../../api-mcp/src/runtime'
import { message } from '../../api-mcp/test/helpers'
/* eslint-enable @nx/enforce-module-boundaries */
import { type AuthConfig, readConfig } from '../src/config'
import { createRuntime } from '../src/runtime'
import { cleanup, digest } from '../src/store'

const authUrl = process.env.EDITS_TEST_AUTH_DATABASE_URL
const journeysUrl = process.env.EDITS_TEST_JOURNEYS_DATABASE_URL
const day = 86400000
const receiptSchema = z.object({
  contractVersion: z.literal('1'),
  operationId: z.string(),
  journeyId: z.string(),
  committedRevision: z.string(),
  kind: z.literal('historical_receipt'),
  status: z.literal('committed'),
  adminLink: z.string().url(),
  completedAt: z.string(),
  historyId: z.string().nullable(),
  changedFields: z.array(
    z.object({ blockId: z.string(), fields: z.array(z.string()) })
  ),
  idMap: z.record(z.string(), z.string()),
  effectIds: z.array(z.string()),
  warnings: z.array(z.unknown())
})
type Receipt = z.infer<typeof receiptSchema>
type Checkpoint = NonNullable<
  Parameters<typeof createJourneyEditHandler>[2]
>['checkpoint']

const pendingBarriers = new Set<() => void>()

function barrier() {
  let arrive!: () => void
  let resume!: () => void
  const ready = new Promise<void>((resolve) => {
    arrive = resolve
  })
  const released = new Promise<void>((resolve) => {
    resume = resolve
  })
  const release = () => {
    resume()
    pendingBarriers.delete(release)
  }
  pendingBarriers.add(release)
  return {
    ready,
    resume: release,
    pause: async () => {
      arrive()
      await released
    }
  }
}

describe('saved edit integration', () => {
  describe.skipIf(!authUrl || !journeysUrl)(
    'saved edits through real OAuth, MCP HTTP, Hive gateway and Journeys PostgreSQL',
    () => {
      const auth = createAuthDatabase(authUrl!)
      const journeys = new PrismaClient({
        adapter: new PrismaPg({ connectionString: journeysUrl })
      })
      const keys = generateKeyPairSync('rsa', { modulusLength: 2048 })
      const privateKey = keys.privateKey.export({ format: 'jwk' })
      const publicKey = keys.publicKey.export({ format: 'jwk' })
      const exchangeSecret =
        'controlled-edit-exchange-10553-at-least-32-characters'
      const ownerSecret = 'controlled-edit-owner-10553-at-least-32-characters'
      const internalSecret =
        'controlled-edit-internal-10553-at-least-32-characters'
      const permissionSecret =
        'controlled-edit-permission-10553-at-least-32-characters'
      const usersSecret = 'controlled-edit-account-10553-at-least-32-characters'
      const controlledAuthTime = Math.floor(Date.now() / 1000) - 60
      const cookies = new Map<string, string>()
      const eligible = new Map<string, string[]>()
      const invalidUsers = new Set<string>()
      const servers: Server[] = []
      const replicas: ReturnType<typeof createMcpRuntime>[] = []
      let issuer: Awaited<ReturnType<typeof createRuntime>>
      let gateway: ReturnType<typeof createGatewayRuntime>
      let config: AuthConfig
      let ownerConfig: Parameters<typeof createJourneyEditHandler>[0]
      let ownerHandler: ReturnType<typeof createJourneyEditHandler>
      let readHandler: ReturnType<typeof createJourneyReadHandler>
      let gatewayUrl: string
      let ownerUrl: string
      let mcpUrl: string
      let token: string
      let journeyId: string
      let chatEnabled = true
      let checkpoint: Checkpoint
      let clock: Date | undefined
      let beforeAcceptance: ((stage: string) => Promise<void>) | undefined
      let afterAcceptance: ((stage: string) => Promise<void>) | undefined
      let beforeOutput: (() => Promise<void>) | undefined
      let afterLifecycleSnapshot: (() => Promise<void>) | undefined
      let settlementOutage = false
      let lifecycleOutage = false
      let discardSavedResponse = false
      let lastSenderId: string | undefined

      async function listen(server: Server): Promise<string> {
        await new Promise<void>((resolve) =>
          server.listen(0, '127.0.0.1', resolve)
        )
        servers.push(server)
        return `http://127.0.0.1:${(server.address() as AddressInfo).port}`
      }
      async function request(path: string, init: RequestInit = {}) {
        const response = await fetch(config.AUTH_ISSUER + path, {
          ...init,
          redirect: 'manual',
          headers: {
            Cookie: [...cookies]
              .map(([key, value]) => `${key}=${value}`)
              .join('; '),
            ...Object.fromEntries(new Headers(init.headers))
          }
        })
        for (const cookie of response.headers.getSetCookie()) {
          const [pair] = cookie.split(';')
          const offset = pair.indexOf('=')
          cookies.set(pair.slice(0, offset), pair.slice(offset + 1))
        }
        return response
      }
      async function consent(
        user: string,
        ids: string[],
        mode = 'edit',
        reconnect?: { id: string; version: number }
      ) {
        cookies.clear()
        const verifier = randomBytes(32).toString('base64url')
        const query = new URLSearchParams({
          client_id: 'edit-client',
          redirect_uri: 'http://127.0.0.1:4209/callback',
          response_type: 'code',
          scope: 'journeys:read journeys:edit offline_access',
          resource: config.AUTH_AUDIENCE,
          code_challenge: Buffer.from(digest(verifier), 'hex').toString(
            'base64url'
          ),
          code_challenge_method: 'S256'
        })
        const start = await request(`/auth?${query}`)
        expect(start.status).toBe(303)
        const interaction = await request(
          new URL(start.headers.get('location')!, config.AUTH_ISSUER).pathname
        )
        const uid = new URL(
          interaction.headers.get('location')!
        ).searchParams.get('interaction')!
        const post = (suffix: string, body: unknown) =>
          request(`/interaction/${uid}/${suffix}`, {
            method: 'POST',
            headers: {
              Origin: config.AUTH_ADMIN_ORIGIN,
              Authorization: `Bearer ${user}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })
        const details = z
          .object({ csrf: z.string() })
          .parse(await (await post('details', {})).json())
        const review = z.object({ reviewToken: z.string() }).parse(
          await (
            await post('review', {
              csrf: details.csrf,
              journeyIds: ids,
              mode,
              duration: 'week',
              ...(reconnect
                ? {
                    connectionId: reconnect.id,
                    expectedVersion: reconnect.version
                  }
                : {})
            })
          ).json()
        )
        const approved = await post('decision', {
          csrf: details.csrf,
          reviewToken: review.reviewToken,
          decision: 'approve'
        })
        expect(approved.status, await approved.clone().text()).toBe(200)
        const decision = z
          .object({ redirectUrl: z.string() })
          .parse(await approved.json())
        const resumed = await request(new URL(decision.redirectUrl).pathname)
        const code = new URL(resumed.headers.get('location')!).searchParams.get(
          'code'
        )!
        const result = await request('/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: 'edit-client',
            redirect_uri: 'http://127.0.0.1:4209/callback',
            resource: config.AUTH_AUDIENCE,
            code,
            code_verifier: verifier
          })
        })
        expect(result.status, await result.clone().text()).toBe(200)
        return z.object({ access_token: z.string() }).parse(await result.json())
          .access_token
      }
      async function call(
        tool: string,
        input: Record<string, unknown>,
        accessToken = token,
        url = mcpUrl
      ) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            Authorization: `Bearer ${accessToken}`,
            'mcp-protocol-version': '2026-07-28',
            'mcp-method': 'tools/call',
            'mcp-name': tool
          },
          body: JSON.stringify(
            message('2026-07-28', 'tools/call', {
              name: tool,
              arguments: input
            })
          )
        })
        const text = await response.text()
        return {
          status: response.status,
          text,
          json: JSON.parse(text) as {
            result?: {
              structuredContent?: Record<string, unknown>
              isError?: boolean
            }
            error?: unknown
          }
        }
      }
      async function revision() {
        return (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId }
          })
        ).revision.toString()
      }
      async function editInput(content = 'Saved heading', key = randomUUID()) {
        return {
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: key,
          commands: [
            { type: 'typography_set', blockId: `${journeyId}-text`, content }
          ]
        }
      }
      async function edit(
        input: Record<string, unknown>,
        accessToken = token,
        url = mcpUrl
      ) {
        return call('journey_edit', input, accessToken, url)
      }
      function receipt(response: Awaited<ReturnType<typeof call>>): Receipt {
        expect(response.json.error, response.text).toBeUndefined()
        expect(response.json.result?.isError, response.text).not.toBe(true)
        return receiptSchema.parse(response.json.result?.structuredContent)
      }
      async function management() {
        const page = await request('/connections', {
          method: 'POST',
          headers: {
            Origin: config.AUTH_ADMIN_ORIGIN,
            Authorization: 'Bearer alice',
            'Content-Type': 'application/json'
          },
          body: '{}'
        })
        expect(page.status, await page.clone().text()).toBe(200)
        const { csrf } = z.object({ csrf: z.string() }).parse(await page.json())
        const connection = await auth.agentConnection.findFirstOrThrow({
          where: { userId: 'alice' },
          orderBy: { approvedAt: 'desc' }
        })
        const post = (action: string, extra: Record<string, unknown> = {}) =>
          request(`/connections/${connection.id}/${action}`, {
            method: 'POST',
            headers: {
              Origin: config.AUTH_ADMIN_ORIGIN,
              Authorization: 'Bearer alice',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              csrf,
              expectedVersion: connection.version,
              clientId: connection.clientId,
              ...extra
            })
          })
        return { connection, post }
      }
      async function renew() {
        const context = await management()
        const review = await context.post('review', { duration: 'week' })
        expect(review.status, await review.clone().text()).toBe(200)
        const { reviewToken } = z
          .object({ reviewToken: z.string() })
          .parse(await review.json())
        const approved = await context.post('approve', { reviewToken })
        expect(approved.status, await approved.clone().text()).toBe(200)
        const renewed = z
          .object({ id: z.string(), version: z.number() })
          .parse(await approved.json())
        token = await consent('alice', [journeyId], 'edit', renewed)
        return renewed
      }
      async function eventually(predicate: () => Promise<boolean>) {
        const deadline = Date.now() + 5000
        while (!(await predicate())) {
          if (Date.now() >= deadline)
            throw new Error(
              'Controlled participant did not reach the expected state'
            )
          await new Promise<void>((resolve) => setTimeout(resolve, 10))
        }
      }
      function cancellableEdit(input: Awaited<ReturnType<typeof editInput>>) {
        let resolveClosed!: () => void
        const closed = new Promise<void>((resolve) => {
          resolveClosed = resolve
        })
        const request = httpRequest(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            Authorization: `Bearer ${token}`,
            'mcp-protocol-version': '2026-07-28',
            'mcp-method': 'tools/call',
            'mcp-name': 'journey_edit'
          }
        })
        request.once('error', resolveClosed)
        request.once('close', resolveClosed)
        request.once('response', (response) => response.resume())
        request.end(
          JSON.stringify(
            message('2026-07-28', 'tools/call', {
              name: 'journey_edit',
              arguments: input
            })
          )
        )
        return { request, closed }
      }
      async function replica() {
        const runtime = createMcpRuntime(
          {
            ...readMcpConfig({
              MCP_AUTH_MODE: 'granted-reads',
              MCP_PUBLIC_URL: config.AUTH_AUDIENCE,
              MCP_ISSUER_URL: config.AUTH_ISSUER,
              MCP_GATEWAY_URL: gatewayUrl,
              MCP_EXCHANGE_CLIENT_SECRET: exchangeSecret
            }),
            port: 0
          },
          { logger: pino({ enabled: false }) }
        )
        replicas.push(runtime)
        await runtime.listen()
        return `http://127.0.0.1:${(runtime.server.address() as AddressInfo).port}/mcp`
      }
      function restartOwner() {
        ownerHandler = createJourneyEditHandler(ownerConfig, journeys, {
          checkpoint: async (point, context) => checkpoint?.(point, context),
          now: () => clock ?? new Date(),
          canEditChat: async () => chatEnabled
        })
      }
      async function counts() {
        return {
          operations: await journeys.mcpEditOperation.count({
            where: { journeyId }
          }),
          history: await journeys.mcpEditHistory.count({
            where: { journeyId }
          }),
          effects: await journeys.mcpEditEffect.count({ where: { journeyId } })
        }
      }

      beforeAll(async () => {
        if (
          !/^\/auth_issue_(10553|10556|10557|10562)(_|$)/.test(
            new URL(authUrl!).pathname
          ) ||
          !/^\/journeys_issue_(10553|10556|10557|10562)(_|$)/.test(
            new URL(journeysUrl!).pathname
          )
        )
          throw new Error('Use isolated saved-edit issue databases')
        for (const table of [
          auth.permissionChange,
          auth.retiredAccount,
          auth.readPermit,
          auth.agentAccessReview,
          auth.connectionChange,
          auth.connectionHistoryPurge,
          auth.readExecutor,
          auth.oAuthArtifact,
          auth.agentConnection,
          auth.consentReview,
          auth.agentRenewalReview,
          auth.authorizationGate,
          auth.securityAudit,
          auth.authEnvironment
        ])
          await (table.deleteMany as () => Promise<unknown>)()
        await journeys.mcpEditAudit.deleteMany()
        await journeys.mcpEditExecution.deleteMany()
        await journeys.mcpEditEffect.deleteMany()
        await journeys.mcpEditHistory.deleteMany()
        await journeys.mcpEditOperation.deleteMany()
        await journeys.mcpEditNamespace.deleteMany()
        const trigger = await journeys.$queryRaw<
          Array<{ exists: boolean }>
        >`SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'journey_revision_root') AS exists`
        expect(
          trigger[0].exists,
          'Run the real shared-revision migration before this suite'
        ).toBe(true)
        const reservation = createServer()
        const issuerOrigin = await listen(reservation)
        await new Promise<void>((resolve) => reservation.close(() => resolve()))
        servers.pop()
        config = readConfig({
          AUTH_ENVIRONMENT: 'local',
          AUTH_ISSUER: issuerOrigin,
          AUTH_ADMIN_ORIGIN: 'http://127.0.0.1:4200',
          AUTH_AUDIENCE: 'http://127.0.0.1:4010/mcp',
          AUTH_GATEWAY_URL: 'http://127.0.0.1:4000/graphql',
          AUTH_FIREBASE_PROJECT_ID: 'controlled-firebase-10553',
          AUTH_COOKIE_KEYS:
            'controlled-edit-cookie-key-10553-at-least-32-characters',
          AUTH_JWKS: JSON.stringify({
            keys: [{ ...privateKey, kid: 'edits', alg: 'RS256', use: 'sig' }]
          }),
          AUTH_INTROSPECTION_CLIENT_ID: 'edit-introspection',
          AUTH_INTROSPECTION_CLIENT_SECRET:
            'controlled-edit-introspection-10553-at-least-32-characters',
          AUTH_EXCHANGE_CLIENT_SECRET: exchangeSecret,
          AUTH_READ_OWNER_SECRET: ownerSecret,
          AUTH_PERMISSION_JOURNEYS_SECRET: permissionSecret,
          AUTH_PERMISSION_USERS_SECRET: usersSecret,
          AUTH_READ_GATEWAY_AUDIENCE: 'http://127.0.0.1:4000/mcp/reads',
          PG_DATABASE_URL_AUTH: authUrl,
          AUTH_CLIENTS: JSON.stringify([
            {
              client_id: 'edit-client',
              client_name: 'Controlled edit agent',
              redirect_uris: ['http://127.0.0.1:4209/callback']
            }
          ])
        })
        issuer = await createRuntime(config, {
          db: auth,
          logger: pino({ enabled: false }),
          identity: {
            async authenticate(userId) {
              if (!['alice', 'bob'].includes(userId))
                throw new Error('Controlled identity denied')
              return {
                userId,
                authTime: controlledAuthTime,
                createdAt: '2026-01-01T00:00:00.000Z'
              }
            },
            async check(evidence) {
              if (invalidUsers.has(evidence.userId))
                throw new Error('Controlled identity unavailable')
            }
          },
          eligibility: async (_token, userId) =>
            (eligible.get(userId) ?? []).map((id) => ({
              id,
              title: id,
              teamId: `edit-team-${userId}`,
              canEdit: true
            }))
        })
        await new Promise<void>((resolve) =>
          issuer.server.listen(
            Number(new URL(issuerOrigin).port),
            '127.0.0.1',
            resolve
          )
        )
        const authorityUrl = await listen(
          createServer((req, res) => {
            void (async () => {
              const chunks: Buffer[] = []
              for await (const chunk of req)
                chunks.push(Buffer.from(chunk as Uint8Array))
              const raw = Buffer.concat(chunks).toString('utf8')
              const body = JSON.parse(raw) as { permitId?: string }
              const stage = body.permitId
                ? (
                    await auth.readPermit.findUniqueOrThrow({
                      where: { id: body.permitId }
                    })
                  ).stage
                : ''
              if (req.url?.endsWith('/accept')) await beforeAcceptance?.(stage)
              if (
                (req.url?.endsWith('/fence') && settlementOutage) ||
                (req.url === '/internal/reads/connections' && lifecycleOutage)
              ) {
                res.writeHead(503)
                res.end('{}')
                return
              }
              const response = await fetch(config.AUTH_ISSUER + req.url, {
                method: 'POST',
                headers: {
                  Authorization: req.headers.authorization ?? '',
                  'Content-Type': 'application/json'
                },
                body: raw
              })
              const result = await response.text()
              if (req.url === '/internal/reads/connections' && response.ok)
                await afterLifecycleSnapshot?.()
              if (req.url?.endsWith('/accept') && response.ok)
                await afterAcceptance?.(stage)
              res.writeHead(response.status, {
                'Content-Type': 'application/json'
              })
              res.end(result)
            })().catch(() => {
              res.writeHead(503)
              res.end('{}')
            })
          })
        )
        ownerConfig = {
          issuer: issuerOrigin,
          audience: config.AUTH_READ_GATEWAY_AUDIENCE!,
          environment: 'local',
          publicKey,
          internalSecret,
          authorityUrl,
          authoritySecret: ownerSecret,
          adminOrigin: config.AUTH_ADMIN_ORIGIN + '/',
          editsEnabled: true
        }
        restartOwner()
        readHandler = createJourneyReadHandler(ownerConfig, journeys)
        ownerUrl = await listen(
          createServer((req, res) => {
            void (async () => {
              const chunks: Buffer[] = []
              for await (const chunk of req)
                chunks.push(Buffer.from(chunk as Uint8Array))
              const raw = Buffer.concat(chunks)
              const body = JSON.parse(raw.toString('utf8')) as {
                request: { tool: string }
                stage: string
              }
              const headers = new Headers()
              for (const [name, value] of Object.entries(req.headers))
                if (value !== undefined)
                  headers.set(
                    name,
                    Array.isArray(value) ? value.join(',') : value
                  )
              if (body.stage === 'read') {
                const credential = headers.get('x-mcp-context') ?? ''
                lastSenderId = z
                  .object({ executorId: z.string() })
                  .parse(
                    JSON.parse(
                      Buffer.from(
                        credential.split('.')[0],
                        'base64url'
                      ).toString('utf8')
                    )
                  ).executorId
              }
              const incoming = new Request(ownerUrl + req.url, {
                method: 'POST',
                headers,
                body: raw
              })
              const handler =
                body.request.tool === 'journey_edit' ||
                body.request.tool === 'journey_operation_get' ||
                body.request.tool === 'journey_history' ||
                body.request.tool === 'journey_undo' ||
                body.request.tool === 'journey_redo'
                  ? ownerHandler
                  : readHandler
              const response = await handler(incoming)
              if (
                discardSavedResponse &&
                ['journey_edit', 'journey_undo', 'journey_redo'].includes(
                  body.request.tool
                ) &&
                body.stage === 'read' &&
                response.ok
              ) {
                discardSavedResponse = false
                res.writeHead(503)
                res.end('{}')
                return
              }
              res.writeHead(
                response.status,
                Object.fromEntries(response.headers)
              )
              res.end(await response.text())
            })().catch(() => {
              res.writeHead(503)
              res.end('{}')
            })
          })
        )
        gateway = createGatewayRuntime({
          graphqlEndpoint: '/',
          supergraph: readFileSync(
            new URL('../../api-gateway/schema.graphql', import.meta.url),
            'utf8'
          ),
          logging: false,
          plugins: () => [
            {
              async onRequest({ request: incoming }) {
                if (
                  new URL(incoming.url).pathname === '/mcp/reads' &&
                  ((await incoming.clone().json()) as { stage?: string })
                    .stage === 'output'
                )
                  await beforeOutput?.()
              }
            },
            useMcpReads({ ...ownerConfig, ownerUrl: `${ownerUrl}/mcp/reads` })
          ]
        })
        gatewayUrl = await listen(
          createServer((req, res) => {
            void gateway(req, res)
          })
        )
        mcpUrl = await replica()
      }, 30000)

      beforeEach(async () => {
        checkpoint = undefined
        chatEnabled = true
        clock = undefined
        beforeAcceptance = undefined
        afterAcceptance = undefined
        beforeOutput = undefined
        afterLifecycleSnapshot = undefined
        settlementOutage = false
        lifecycleOutage = false
        discardSavedResponse = false
        invalidUsers.clear()
        await auth.retiredAccount.deleteMany()
        await auth.authorizationGate.updateMany({
          data: { open: true, generation: { increment: 1 } }
        })
        journeyId = `edit-${randomUUID()}`
        eligible.set('alice', [journeyId])
        eligible.set('bob', [])
        for (const userId of ['alice', 'bob']) {
          await journeys.team.upsert({
            where: { id: `edit-team-${userId}` },
            create: {
              id: `edit-team-${userId}`,
              title: userId,
              userTeams: { create: { userId, role: 'manager' } }
            },
            update: {}
          })
          await journeys.journeyProfile.upsert({
            where: { userId },
            create: { userId },
            update: {}
          })
        }
        await journeys.journey.create({
          data: {
            id: journeyId,
            slug: journeyId,
            title: 'Controlled ordinary draft',
            teamId: 'edit-team-alice',
            languageId: '529',
            status: 'draft',
            blocks: {
              create: [
                {
                  id: `${journeyId}-step`,
                  typename: 'StepBlock',
                  parentOrder: 0
                },
                {
                  id: `${journeyId}-card`,
                  typename: 'CardBlock',
                  parentBlockId: `${journeyId}-step`,
                  parentOrder: 0
                },
                {
                  id: `${journeyId}-text`,
                  typename: 'TypographyBlock',
                  parentBlockId: `${journeyId}-card`,
                  parentOrder: 0,
                  content: 'Original heading',
                  variant: 'h2',
                  align: 'left',
                  color: 'legacy-color',
                  settings: {
                    color: '#123456',
                    unmounted: 'preserve-settings-sentinel'
                  }
                }
              ]
            }
          }
        })
        token = await consent('alice', [journeyId])
      })

      afterEach(async () => {
        for (const resume of pendingBarriers) resume()
        checkpoint = undefined
        beforeAcceptance = undefined
        afterAcceptance = undefined
        beforeOutput = undefined
        afterLifecycleSnapshot = undefined
        settlementOutage = false
        lifecycleOutage = false
        clock = undefined
        await ownerHandler.reconcile()
      })

      afterAll(async () => {
        await Promise.all(replicas.map((runtime) => runtime.shutdown()))
        await Promise.all(
          servers.map(
            (server) =>
              new Promise<void>((resolve) => server.close(() => resolve()))
          )
        )
        await gateway?.dispose()
        await issuer?.close()
        await auth.$disconnect()
        await journeys.$disconnect()
      })

      it('reads the revision, saves complete Typography presentation once and retains only actual inverse fields', async () => {
        const read = await call('journey_read', { journeyId, view: 'steps' })
        expect(read.text).toContain('Original heading')
        const current = await revision()
        const input = {
          ...(await editInput()),
          expectedRevision: current,
          commands: [
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              content: 'Saved heading',
              variant: 'h1',
              align: 'center',
              color: '#abcdef'
            }
          ]
        }
        const saved = receipt(await edit(input))
        expect(saved).toMatchObject({
          journeyId,
          kind: 'historical_receipt',
          idMap: {}
        })
        expect(BigInt(saved.committedRevision)).toBe(BigInt(current) + 1n)
        expect(saved.changedFields).toEqual([
          {
            blockId: `${journeyId}-text`,
            fields: expect.arrayContaining(['content', 'variant', 'align'])
          }
        ])
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({
          content: 'Saved heading',
          variant: 'h1',
          align: 'center',
          color: 'legacy-color',
          settings: {
            color: '#abcdef',
            unmounted: 'preserve-settings-sentinel'
          }
        })
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        const history = await journeys.mcpEditHistory.findUniqueOrThrow({
          where: { operationId: saved.operationId }
        })
        expect(JSON.stringify(history.changes)).toContain('Original heading')
        expect(JSON.stringify(history.changes)).not.toContain(
          'preserve-settings-sentinel'
        )
        expect(
          await journeys.mcpEditEffect.findFirst({
            where: { operationId: saved.operationId }
          })
        ).toMatchObject({ kind: 'journey_content_changed', status: 'recorded' })
      })

      it.each([
        'execution_prepared',
        'before_accept',
        'after_accept',
        'after_content',
        'after_revision',
        'after_history',
        'after_receipt',
        'after_outbox',
        'before_commit'
      ])(
        'rolls back content, revision, history, receipt and effect intent after failure at %s',
        async (point) => {
          const before = await revision()
          const input = await editInput()
          checkpoint = async (current) => {
            if (current === point) throw new Error('private-raw-error-sentinel')
          }
          const failed = await edit(input)
          expect(failed.json.result?.isError, failed.text).toBe(true)
          expect(failed.text).not.toContain('private-raw-error-sentinel')
          expect(await revision()).toBe(before)
          expect(
            await journeys.block.findUnique({
              where: { id: `${journeyId}-text` }
            })
          ).toMatchObject({ content: 'Original heading' })
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
          checkpoint = undefined
          const recovered = receipt(await edit(input))
          expect(recovered.committedRevision).toBe(await revision())
          expect(await counts()).toEqual({
            operations: 1,
            history: 1,
            effects: 1
          })
        }
      )

      it('loses a committed response, retries concurrently on another MCP replica, and recovers after owner restart', async () => {
        const input = await editInput()
        discardSavedResponse = true
        expect((await edit(input)).json.result?.isError).toBe(true)
        const operation = await journeys.mcpEditOperation.findFirstOrThrow({
          where: { journeyId }
        })
        const original = receiptSchema.parse(operation.result)
        const secondReplica = await replica()
        restartOwner()
        const concurrent = await Promise.all([
          edit(input),
          edit(input, token, secondReplica),
          edit(input, token, secondReplica)
        ])
        for (const response of concurrent)
          expect(receipt(response)).toEqual(original)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        const changed = await edit({
          ...input,
          commands: [
            { ...input.commands[0], content: 'different-payload-sentinel' }
          ]
        })
        expect(changed.json.result?.isError).toBe(true)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        const reordered = {
          commands: input.commands.map(({ content, blockId, type }) => ({
            content,
            blockId,
            type
          })),
          idempotencyKey: input.idempotencyKey,
          expectedRevision: input.expectedRevision,
          journeyId: input.journeyId
        }
        expect(receipt(await call('journey_edit', reordered))).toEqual(original)
      })

      it('recovers the exact historical revision after later Admin content changes', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { content: 'Later human heading' }
        })
        const current = await revision()
        expect(current).not.toBe(original.committedRevision)
        expect(receipt(await edit(input))).toEqual(original)
        const lookedUp = await call('journey_operation_get', {
          journeyId,
          operationId: original.operationId
        })
        expect(receipt(lookedUp)).toEqual(original)
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Later human heading' })
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('rejects stale revision and the publication race without leaving effects', async () => {
        const stale = await editInput()
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { content: 'Human draft change' }
        })
        expect((await edit(stale)).text).toContain('REVISION_CONFLICT')
        expect(
          (await edit({ ...stale, expectedRevision: '18446744073709551615' }))
            .text
        ).toContain('REVISION_CONFLICT')
        const publishFirst = await editInput()
        await journeys.journey.update({
          where: { id: journeyId },
          data: {
            status: 'published',
            publishedAt: new Date(),
            firstPublishedAt: new Date()
          }
        })
        expect((await edit(publishFirst)).json.result?.isError).toBe(true)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Human draft change' })
      })

      it.each(['before', 'after'])(
        'allows an Admin save while coordinator acceptance is stalled %s its commit',
        async (side) => {
          const input = await editInput()
          const pause = barrier()
          const stall = async (stage: string) => {
            if (stage === 'read') await pause.pause()
          }
          if (side === 'before') beforeAcceptance = stall
          else afterAcceptance = stall
          const saving = edit(input)
          await pause.ready
          try {
            await journeys.$transaction(async (tx) => {
              await tx.$executeRaw`SET LOCAL lock_timeout = '1s'`
              await tx.block.update({
                where: { id: `${journeyId}-text` },
                data: { content: 'Concurrent Admin heading' }
              })
            })
          } finally {
            pause.resume()
          }
          expect((await saving).text).toContain('REVISION_CONFLICT')
          expect(
            await journeys.block.findUnique({
              where: { id: `${journeyId}-text` }
            })
          ).toMatchObject({ content: 'Concurrent Admin heading' })
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
        }
      )

      it.each(['before', 'after'])(
        'rejects an edit when publication completes during coordinator acceptance %s its commit',
        async (side) => {
          const input = await editInput()
          const pause = barrier()
          const stall = async (stage: string) => {
            if (stage === 'read') await pause.pause()
          }
          if (side === 'before') beforeAcceptance = stall
          else afterAcceptance = stall
          const saving = edit(input)
          await pause.ready
          try {
            await journeys.$transaction(async (tx) => {
              await tx.$executeRaw`SET LOCAL lock_timeout = '1s'`
              await tx.journey.update({
                where: { id: journeyId },
                data: {
                  status: 'published',
                  publishedAt: new Date(),
                  firstPublishedAt: new Date()
                }
              })
            })
          } finally {
            pause.resume()
          }
          expect((await saving).text).toContain('NOT_EDITABLE')
          expect(
            await journeys.block.findUnique({
              where: { id: `${journeyId}-text` }
            })
          ).toMatchObject({ content: 'Original heading' })
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
        }
      )

      it('rechecks local ACLs after coordinator acceptance before committing', async () => {
        const input = await editInput()
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const saving = edit(input)
        await pause.ready
        const membership = await journeys.userTeam.findUniqueOrThrow({
          where: {
            teamId_userId: { teamId: 'edit-team-alice', userId: 'alice' }
          }
        })
        await journeys.userTeam.delete({ where: { id: membership.id } })
        try {
          pause.resume()
          expect((await saving).json.result?.isError).toBe(true)
          expect(
            await journeys.block.findUnique({
              where: { id: `${journeyId}-text` }
            })
          ).toMatchObject({ content: 'Original heading' })
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
        } finally {
          pause.resume()
          await journeys.userTeam.create({
            data: {
              teamId: membership.teamId,
              userId: membership.userId,
              role: membership.role
            }
          })
        }
      })

      it('fences an accepted executor while its coordinator response is delayed', async () => {
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const saving = edit(await editInput())
        await pause.ready
        const execution = await journeys.mcpEditExecution.findFirstOrThrow({
          where: { status: 'prepared' }
        })
        await ownerHandler.reconcile(execution.id)
        expect(
          await journeys.mcpEditExecution.findUnique({
            where: { id: execution.id }
          })
        ).toMatchObject({ status: 'fenced', reportedAt: expect.any(Date) })
        pause.resume()
        expect((await saving).json.result?.isError).toBe(true)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(
          await auth.readPermit.count({ where: { status: 'accepted' } })
        ).toBe(0)
      })

      it('serializes an accepted edit before a competing publication under the shared fence', async () => {
        const pause = barrier()
        checkpoint = async (point) => {
          if (point === 'after_content') await pause.pause()
        }
        const saving = edit(await editInput())
        await pause.ready
        let publicationSettled = false
        const publication = journeys.journey
          .update({
            where: { id: journeyId },
            data: {
              status: 'published',
              publishedAt: new Date(),
              firstPublishedAt: new Date()
            }
          })
          .then((journey) => {
            publicationSettled = true
            return { published: journey.status === 'published' }
          })
          .catch((error: unknown) => ({ error }))
        await Promise.resolve()
        expect(publicationSettled).toBe(false)
        pause.resume()
        await saving
        expect(await publication).toEqual({ published: true })
        checkpoint = undefined
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Saved heading' })
        expect(
          await journeys.journey.findUnique({ where: { id: journeyId } })
        ).toMatchObject({ status: 'published' })
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('rejects unknown fields, Host patches and unregistered commands as one whole batch', async () => {
        const input = await editInput()
        for (const invalid of [
          { ...input, hostId: 'hidden-host-sentinel' },
          {
            ...input,
            commands: [
              ...input.commands,
              {
                type: 'typography_set',
                blockId: `${journeyId}-text`,
                content: 'hidden-change',
                host: { title: 'hidden-host-sentinel' }
              }
            ]
          },
          {
            ...input,
            commands: [
              ...input.commands,
              { type: 'raw_graphql', mutation: 'mutation { journeyDelete }' }
            ]
          },
          {
            ...input,
            commands: [
              ...input.commands,
              {
                type: 'step_default_set',
                stepId: `${journeyId}-step`,
                destination: { id: 'foreign-step-sentinel' }
              }
            ]
          }
        ]) {
          const response = await call('journey_edit', invalid)
          expect(response.json.result?.isError, response.text).toBe(true)
          expect(response.text).not.toContain('hidden-host-sentinel')
        }
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Original heading' })
      })

      it('checks actual Typography parents and resources and denies view-only execution', async () => {
        const foreignId = `edit-foreign-${randomUUID()}`
        await journeys.journey.create({
          data: {
            id: foreignId,
            slug: foreignId,
            title: 'private-foreign-sentinel',
            languageId: '529',
            teamId: 'edit-team-bob',
            status: 'draft',
            blocks: {
              create: [
                { id: `${foreignId}-card`, typename: 'CardBlock' },
                {
                  id: `${foreignId}-text`,
                  typename: 'TypographyBlock',
                  parentBlockId: `${foreignId}-card`,
                  content: 'foreign-content-sentinel'
                }
              ]
            }
          }
        })
        const input = await editInput()
        const foreignTarget = await edit({
          ...input,
          commands: [{ ...input.commands[0], blockId: `${foreignId}-text` }]
        })
        expect(foreignTarget.json.result?.isError).toBe(true)
        expect(foreignTarget.text).not.toContain('foreign-content-sentinel')
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { parentBlockId: `${foreignId}-card` }
        })
        expect((await edit(await editInput())).json.result?.isError).toBe(true)
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { parentBlockId: `${journeyId}-card` }
        })
        const viewToken = await consent('alice', [journeyId], 'view')
        expect(
          (await edit(await editInput(), viewToken)).json.result?.isError
        ).toBe(true)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
      })

      it('preserves pre-existing deleted inbound routes during a later text edit', async () => {
        const deletedStep = `${journeyId}-deleted-step`
        await journeys.block.create({
          data: {
            id: deletedStep,
            journeyId,
            typename: 'StepBlock',
            parentOrder: 1
          }
        })
        await journeys.block.update({
          where: { id: `${journeyId}-step` },
          data: { nextBlockId: deletedStep }
        })
        await journeys.block.update({
          where: { id: deletedStep },
          data: { deletedAt: new Date() }
        })
        receipt(await edit(await editInput()))
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-step` }
          })
        ).toMatchObject({ nextBlockId: deletedStep })
        expect(
          await journeys.block.findUnique({ where: { id: deletedStep } })
        ).toMatchObject({ deletedAt: expect.any(Date) })
        expect(
          (
            await call('journey_edit', {
              ...(await editInput()),
              commands: [
                {
                  type: 'step_default_set',
                  stepId: `${journeyId}-step`,
                  destination: { id: deletedStep }
                }
              ]
            })
          ).json.result?.isError
        ).toBe(true)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('denies replay and buffered result release when withdrawal occurs before final acceptance', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const context = await management()
        beforeOutput = async () => {
          beforeOutput = undefined
          afterLifecycleSnapshot = undefined
          const withdrawn = await context.post('disconnect')
          expect(withdrawn.status).toBe(200)
        }
        const denied = await edit(input)
        expect(denied.text).not.toContain(original.operationId)
        expect(denied.text).not.toContain('Saved heading')
        expect(
          (
            await call('journey_operation_get', {
              journeyId,
              operationId: original.operationId
            })
          ).text
        ).not.toContain(original.operationId)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('keeps withdrawal Pending while an accepted write can commit and settles only with owning evidence', async () => {
        const context = await management()
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const saving = edit(await editInput())
        await pause.ready
        settlementOutage = true
        const withdrawal = await context.post('disconnect')
        expect(withdrawal.status, await withdrawal.clone().text()).toBe(200)
        const change = z
          .object({ changeId: z.string() })
          .parse(await withdrawal.json())
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'pending' })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Original heading' })
        pause.resume()
        await saving
        afterAcceptance = undefined
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Saved heading' })
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'pending' })
        settlementOutage = false
        lifecycleOutage = false
        restartOwner()
        await ownerHandler.reconcile()
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'complete' })
        await ownerHandler.cleanup()
        expect(
          await journeys.mcpEditHistory.count({ where: { journeyId } })
        ).toBe(0)
        const purge = await auth.connectionHistoryPurge.findUniqueOrThrow({
          where: { connectionId: context.connection.id }
        })
        expect(purge.completedAt).toBeInstanceOf(Date)
        await ownerHandler.cleanup()
        expect(
          await auth.connectionHistoryPurge.findUniqueOrThrow({
            where: { connectionId: context.connection.id }
          })
        ).toEqual(purge)
      })

      it('positively fences a prepared owner execution before a delayed save can acquire its lock', async () => {
        const context = await management()
        const pause = barrier()
        let permitId: string | undefined
        checkpoint = async (point, execution) => {
          if (point === 'execution_prepared') {
            permitId = execution.permitId
            await pause.pause()
          }
        }
        const saving = edit(await editInput())
        await pause.ready
        const withdrawal = await context.post('disconnect')
        expect(withdrawal.status).toBe(200)
        checkpoint = undefined
        await ownerHandler.reconcile(permitId)
        pause.resume()
        expect((await saving).json.result?.isError).toBe(true)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(
          await journeys.mcpEditExecution.findUnique({
            where: { id: permitId! }
          })
        ).toMatchObject({ status: 'fenced' })
      })

      it.each(['before', 'after'])(
        'checks fixed expiry %s final acceptance without reexecuting accepted work',
        async (side) => {
          const context = await management()
          const pause = barrier()
          if (side === 'before')
            beforeAcceptance = async (stage) => {
              if (stage === 'read') await pause.pause()
            }
          else
            afterAcceptance = async (stage) => {
              if (stage === 'read') await pause.pause()
            }
          const input = await editInput()
          const saving = edit(input)
          await pause.ready
          await auth.agentConnection.update({
            where: { id: context.connection.id },
            data: { expiresAt: new Date(0) }
          })
          pause.resume()
          const response = await saving
          beforeAcceptance = undefined
          afterAcceptance = undefined
          expect(response.text).not.toContain('historical_receipt')
          expect(await counts()).toEqual(
            side === 'before'
              ? { operations: 0, history: 0, effects: 0 }
              : { operations: 1, history: 1, effects: 1 }
          )
          expect((await edit(input)).text).not.toContain('historical_receipt')
          if (side === 'after') {
            await renew()
            receipt(await edit(input))
            expect(await counts()).toEqual({
              operations: 1,
              history: 1,
              effects: 1
            })
          }
        }
      )

      it('renews only the same verified connection and replays an accepted key without restarting work', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const originalConnection = (await management()).connection
        await auth.agentConnection.update({
          where: { id: originalConnection.id },
          data: { expiresAt: new Date(0) }
        })
        expect((await edit(input)).text).not.toContain(original.operationId)
        const renewed = await renew()
        expect(renewed.id).toBe(originalConnection.id)
        expect(receipt(await edit(input))).toEqual(original)
        expect(
          (
            await edit({
              ...input,
              commands: [
                {
                  ...input.commands[0],
                  content: 'changed-after-renewal-sentinel'
                }
              ]
            })
          ).json.result?.isError
        ).toBe(true)
        const newToken = await consent('alice', [journeyId])
        expect(
          (
            await call(
              'journey_operation_get',
              { journeyId, operationId: original.operationId },
              newToken
            )
          ).text
        ).not.toContain(original.operationId)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('evicts the sixth inverse independently of exact replay markers and completion-based result retention', async () => {
        const input = await editInput('Batch one')
        const original = receipt(await edit(input))
        for (let batch = 2; batch <= 6; batch++)
          receipt(await edit(await editInput(`Batch ${batch}`)))
        expect(await counts()).toEqual({
          operations: 6,
          history: 5,
          effects: 6
        })
        expect(
          await journeys.mcpEditHistory.findUnique({
            where: { operationId: original.operationId }
          })
        ).toBeNull()
        restartOwner()
        expect(receipt(await edit(input))).toEqual(original)
        const completedAt = new Date(original.completedAt).getTime()
        clock = new Date(completedAt + 30 * day - 1)
        expect(receipt(await edit(input))).toEqual(original)
        clock = new Date(completedAt + 30 * day)
        expect((await edit(input)).text).toContain('RESULT_EXPIRED')
        await ownerHandler.cleanup()
        restartOwner()
        expect((await edit(input)).text).toContain('RESULT_EXPIRED')
        expect(
          (
            await edit({
              ...input,
              commands: [
                {
                  ...input.commands[0],
                  content: 'changed-after-expiry-sentinel'
                }
              ]
            })
          ).json.result?.isError
        ).toBe(true)
        expect(await counts()).toEqual({
          operations: 6,
          history: 5,
          effects: 6
        })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Batch 6' })
      })

      it('expires inverse history 30 days after consent expiry while retaining accepted-key markers', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const { connection } = await management()
        const inverse = await journeys.mcpEditHistory.findUniqueOrThrow({
          where: { operationId: original.operationId }
        })
        clock = new Date(inverse.expiresAt.getTime() + 1)
        const expiredAt = new Date(0)
        await auth.agentConnection.update({
          where: { id: connection.id },
          data: { expiresAt: expiredAt }
        })
        await ownerHandler.cleanup()
        expect(
          await journeys.mcpEditHistory.count({ where: { journeyId } })
        ).toBe(0)
        expect(
          await journeys.mcpEditOperation.count({ where: { journeyId } })
        ).toBe(1)
        await renew()
        restartOwner()
        const recovered = await edit(input)
        if (!recovered.json.result?.isError)
          expect(receipt(recovered)).toEqual(original)
        expect(await counts()).toEqual({
          operations: 1,
          history: 0,
          effects: 1
        })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Saved heading' })
      })

      it('records minimal allowed and denied audits and expires them independently after 90 days', async () => {
        await auth.securityAudit.deleteMany()
        const input = await editInput('content-prompt-file-credential-sentinel')
        receipt(await edit(input))
        invalidUsers.add('alice')
        expect((await edit(input)).text).not.toContain(
          'content-prompt-file-credential-sentinel'
        )
        invalidUsers.clear()
        const events = await auth.securityAudit.findMany({
          orderBy: { occurredAt: 'asc' }
        })
        expect(events.some((event) => event.outcome === 'allowed')).toBe(true)
        expect(events.some((event) => event.outcome === 'denied')).toBe(true)
        expect(JSON.stringify(events)).not.toContain(
          'content-prompt-file-credential-sentinel'
        )
        expect(JSON.stringify(events)).not.toContain(
          'private-raw-error-sentinel'
        )
        for (const event of events)
          expect(event.expiresAt.getTime() - event.occurredAt.getTime()).toBe(
            90 * day
          )
        const selected = events[0]
        await auth.securityAudit.update({
          where: { id: selected.id },
          data: { expiresAt: new Date(0) }
        })
        await cleanup(auth)
        await cleanup(auth)
        expect(
          await auth.securityAudit.findUnique({ where: { id: selected.id } })
        ).toBeNull()
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('retires only the deleted account namespace and retries private cleanup without changing content or other users', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const aliceConnection = (await management()).connection
        const bobJourney = `edit-bob-${randomUUID()}`
        await journeys.journey.create({
          data: {
            id: bobJourney,
            slug: bobJourney,
            title: 'Bob draft',
            teamId: 'edit-team-bob',
            languageId: '529',
            status: 'draft',
            blocks: {
              create: [
                {
                  id: `${bobJourney}-step`,
                  typename: 'StepBlock',
                  parentOrder: 0
                },
                {
                  id: `${bobJourney}-card`,
                  typename: 'CardBlock',
                  parentBlockId: `${bobJourney}-step`,
                  parentOrder: 0
                },
                {
                  id: `${bobJourney}-text`,
                  typename: 'TypographyBlock',
                  parentBlockId: `${bobJourney}-card`,
                  parentOrder: 0,
                  content: 'Bob heading'
                }
              ]
            }
          }
        })
        eligible.set('bob', [bobJourney])
        const bobToken = await consent('bob', [bobJourney])
        const bobRevision = (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId: bobJourney }
          })
        ).revision.toString()
        const bobInput = {
          journeyId: bobJourney,
          expectedRevision: bobRevision,
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'typography_set',
              blockId: `${bobJourney}-text`,
              content: 'Bob saved'
            }
          ]
        }
        const bobReceipt = receipt(
          await call('journey_edit', bobInput, bobToken)
        )
        const retired = await request('/internal/permissions/retire-account', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${usersSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: 'alice' })
        })
        expect(retired.status, await retired.clone().text()).toBe(200)
        lifecycleOutage = true
        expect(await ownerHandler.cleanup()).toBeGreaterThan(0)
        lifecycleOutage = false
        await ownerHandler.cleanup()
        restartOwner()
        await ownerHandler.cleanup()
        const operation = await journeys.mcpEditOperation.findUnique({
          where: { id: original.operationId }
        })
        expect(operation?.result ?? null).toBeNull()
        expect(
          await journeys.mcpEditHistory.count({ where: { journeyId } })
        ).toBe(0)
        expect((await edit(input)).text).not.toContain(original.operationId)
        expect(receipt(await call('journey_edit', bobInput, bobToken))).toEqual(
          bobReceipt
        )
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Saved heading' })
        expect(
          await journeys.block.findUnique({
            where: { id: `${bobJourney}-text` }
          })
        ).toMatchObject({ content: 'Bob saved' })
        const namespace = await journeys.mcpEditNamespace.findFirst({
          where: { id: aliceConnection.id, retiredAt: { not: null } }
        })
        expect(namespace).not.toBeNull()
        expect(
          await auth.retiredAccount.findUnique({ where: { userId: 'alice' } })
        ).not.toBeNull()
      })

      it('returns bounded complete read pages at one revision and rejects continuation after an Admin edit', async () => {
        await journeys.block.createMany({
          data: Array.from({ length: 12 }, (_, index) => ({
            id: `${journeyId}-wide-${String(index).padStart(2, '0')}`,
            journeyId,
            typename: 'TypographyBlock',
            parentBlockId: `${journeyId}-card`,
            parentOrder: index + 1,
            content: 'wide-text-sentinel'.repeat(3000)
          }))
        })
        const pageSchema = z.object({
          revision: z.string(),
          nextCursor: z.string().nullable(),
          complete: z.boolean(),
          blocks: z.array(z.object({ id: z.string() }))
        })
        const first = await call('journey_read', { journeyId, view: 'steps' })
        const page = pageSchema.parse(first.json.result?.structuredContent)
        expect(
          Buffer.byteLength(
            JSON.stringify(first.json.result?.structuredContent)
          )
        ).toBeLessThanOrEqual(524288)
        expect(page.blocks.length).toBeLessThanOrEqual(100)
        expect(page.complete).toBe(false)
        expect(page.nextCursor).not.toBeNull()
        const ids = new Set(page.blocks.map((block) => block.id))
        let nextCursor = page.nextCursor
        while (nextCursor) {
          const response = await call('journey_read', {
            journeyId,
            view: 'steps',
            revision: page.revision,
            cursor: nextCursor
          })
          const next = pageSchema.parse(response.json.result?.structuredContent)
          expect(next.revision).toBe(page.revision)
          expect(
            Buffer.byteLength(
              JSON.stringify(response.json.result?.structuredContent)
            )
          ).toBeLessThanOrEqual(524288)
          for (const block of next.blocks) {
            expect(ids.has(block.id)).toBe(false)
            ids.add(block.id)
          }
          nextCursor = next.nextCursor
        }
        expect(ids.size).toBe(15)
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { content: 'Admin changed the snapshot' }
        })
        const stale = await call('journey_read', {
          journeyId,
          view: 'steps',
          revision: page.revision,
          cursor: page.nextCursor
        })
        expect(stale.text).toContain('REVISION_CONFLICT')
        expect(stale.text).not.toContain('wide-text-sentinel')
      })

      it.each(['expired', 'changed', 'unavailable'])(
        'withholds a buffered %s historical failure after withdrawal before final output',
        async (failure) => {
          const input = await editInput()
          const original = receipt(await edit(input))
          const context = await management()
          if (failure === 'expired')
            clock = new Date(
              new Date(original.completedAt).getTime() + 30 * day
            )
          beforeOutput = async () => {
            beforeOutput = undefined
            afterLifecycleSnapshot = undefined
            const withdrawn = await context.post('disconnect')
            expect(withdrawn.status, await withdrawn.clone().text()).toBe(200)
          }
          const response =
            failure === 'unavailable'
              ? await call('journey_operation_get', {
                  journeyId,
                  operationId: randomUUID()
                })
              : await edit(
                  failure === 'changed'
                    ? {
                        ...input,
                        commands: [
                          {
                            ...input.commands[0],
                            content: 'changed-historical-payload-sentinel'
                          }
                        ]
                      }
                    : input
                )
          for (const secret of [
            'RESULT_EXPIRED',
            'IDEMPOTENCY_KEY_REUSED',
            'RESULT_UNAVAILABLE',
            original.operationId,
            'Saved heading',
            'changed-historical-payload-sentinel'
          ])
            expect(response.text).not.toContain(secret)
          expect(await counts()).toEqual({
            operations: 1,
            history: 1,
            effects: 1
          })
        }
      )

      it('does not revive expired inverse payloads when eligible renewal precedes delayed owner cleanup', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const inverse = await journeys.mcpEditHistory.findUniqueOrThrow({
          where: { operationId: original.operationId }
        })
        const { connection } = await management()
        clock = new Date(inverse.expiresAt.getTime() + 1)
        await auth.agentConnection.update({
          where: { id: connection.id },
          data: { expiresAt: new Date(0) }
        })
        const renewed = await renew()
        expect(renewed.id).toBe(connection.id)
        await ownerHandler.cleanup()
        expect(
          await journeys.mcpEditHistory.findUnique({
            where: { operationId: original.operationId }
          })
        ).toBeNull()
        restartOwner()
        expect((await edit(input)).text).toContain('RESULT_EXPIRED')
        expect(await counts()).toEqual({
          operations: 1,
          history: 0,
          effects: 1
        })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Saved heading' })
      })

      it('accepts a no-op key without inventing inverse payload or provider effects', async () => {
        const before = await revision()
        const input = await editInput('Original heading')
        const original = receipt(await edit(input))
        expect(original).toMatchObject({
          committedRevision: before,
          historyId: null,
          changedFields: [],
          effectIds: []
        })
        expect(receipt(await edit(input))).toEqual(original)
        expect(await counts()).toEqual({
          operations: 1,
          history: 0,
          effects: 0
        })
        expect(await revision()).toBe(before)
      })

      it('requires current Admin rights for historical replay even while the edit grant remains active', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const membership = await journeys.userTeam.findUniqueOrThrow({
          where: {
            teamId_userId: { teamId: 'edit-team-alice', userId: 'alice' }
          }
        })
        await journeys.userTeam.delete({ where: { id: membership.id } })
        try {
          const replay = await edit(input)
          expect(replay.json.result?.isError).toBe(true)
          expect(replay.text).not.toContain(original.operationId)
          expect(replay.text).not.toContain('historical_receipt')
          expect(
            (
              await call('journey_operation_get', {
                journeyId,
                operationId: original.operationId
              })
            ).text
          ).not.toContain(original.operationId)
          expect(await counts()).toEqual({
            operations: 1,
            history: 1,
            effects: 1
          })
        } finally {
          await journeys.userTeam.create({
            data: {
              teamId: membership.teamId,
              userId: membership.userId,
              role: membership.role
            }
          })
        }
      })

      it('preserves eligible inverses across an early renewal without extending completed result retention', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const inverse = await journeys.mcpEditHistory.findUniqueOrThrow({
          where: { operationId: original.operationId }
        })
        const beforeRenewal = (await management()).connection
        await renew()
        const renewed = await auth.agentConnection.findUniqueOrThrow({
          where: { id: beforeRenewal.id }
        })
        expect(renewed.historyGeneration).toBe(beforeRenewal.historyGeneration)
        clock = new Date(inverse.expiresAt.getTime() + 1)
        expect(clock.getTime()).toBeLessThan(
          renewed.expiresAt.getTime() + 30 * day
        )
        expect(await ownerHandler.cleanup()).toBe(0)
        expect(
          await journeys.mcpEditHistory.findUnique({
            where: { operationId: original.operationId }
          })
        ).not.toBeNull()
        expect((await edit(input)).text).toContain('RESULT_EXPIRED')
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('does not let an old cleanup snapshot erase history retained by an eligible renewal', async () => {
        const input = await editInput()
        const original = receipt(await edit(input))
        const context = await management()
        const priorExpiry = new Date(Date.now() - 29 * day)
        await auth.agentConnection.update({
          where: { id: context.connection.id },
          data: { expiresAt: priorExpiry }
        })
        const pause = barrier()
        afterLifecycleSnapshot = async () => {
          afterLifecycleSnapshot = undefined
          await pause.pause()
        }
        clock = new Date(priorExpiry.getTime() + 31 * day)
        const cleaning = ownerHandler.cleanup()
        await pause.ready
        try {
          await renew()
          const renewed = await auth.agentConnection.findUniqueOrThrow({
            where: { id: context.connection.id }
          })
          expect(renewed.historyGeneration).toBe(
            context.connection.historyGeneration
          )
        } finally {
          pause.resume()
        }
        expect(await cleaning).toBe(0)
        expect(
          await journeys.mcpEditHistory.findUnique({
            where: { operationId: original.operationId }
          })
        ).not.toBeNull()
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it.each(['REVISION_CONFLICT', 'NOT_EDITABLE'])(
        'withholds the ephemeral %s edit rejection after withdrawal without accepting the operation key',
        async (code) => {
          const input = await editInput()
          const context = await management()
          if (code === 'REVISION_CONFLICT')
            await journeys.block.update({
              where: { id: `${journeyId}-text` },
              data: { content: 'Later Admin heading' }
            })
          else
            await journeys.journey.update({
              where: { id: journeyId },
              data: {
                status: 'published',
                publishedAt: new Date(),
                firstPublishedAt: new Date()
              }
            })
          beforeOutput = async () => {
            beforeOutput = undefined
            const withdrawn = await context.post('disconnect')
            expect(withdrawn.status, await withdrawn.clone().text()).toBe(200)
          }
          const response = await edit(input)
          expect(response.text).not.toContain(code)
          expect(response.text).not.toContain('operation_failure')
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
          const witness = await journeys.mcpEditExecution.findFirst({
            where: { connectionId: context.connection.id, failureCode: code }
          })
          expect(witness).not.toBeNull()
          expect(witness?.operationId).toBeNull()
        }
      )

      it('withholds a stale read rejection after withdrawal at the protected output boundary', async () => {
        const staleRevision = await revision()
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { content: 'Later Admin heading' }
        })
        const context = await management()
        beforeOutput = async () => {
          beforeOutput = undefined
          const withdrawn = await context.post('disconnect')
          expect(withdrawn.status, await withdrawn.clone().text()).toBe(200)
        }
        const response = await call('journey_read', {
          journeyId,
          view: 'steps',
          revision: staleRevision
        })
        expect(response.text).not.toContain('REVISION_CONFLICT')
        expect(response.text).not.toContain('read_failure')
        expect(response.text).not.toContain('Later Admin heading')
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(
          await journeys.mcpReadExecution.findFirst({
            where: { failureCode: 'REVISION_CONFLICT' }
          })
        ).not.toBeNull()
      })

      it('saves and exactly replays a legal 256 KiB decoded input including its protected output', async () => {
        const input = await editInput('')
        input.commands[0].content = 'x'.repeat(
          262144 - Buffer.byteLength(JSON.stringify(input))
        )
        expect(Buffer.byteLength(JSON.stringify(input))).toBe(262144)
        const original = receipt(await edit(input))
        expect(receipt(await edit(input))).toEqual(original)
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: input.commands[0].content })
        const tooLarge = {
          ...input,
          idempotencyKey: randomUUID(),
          expectedRevision: await revision(),
          commands: [
            { ...input.commands[0], content: input.commands[0].content + 'x' }
          ]
        }
        expect(Buffer.byteLength(JSON.stringify(tooLarge))).toBeGreaterThan(
          262144
        )
        const rejected = await edit(tooLarge)
        expect(rejected.text).toContain('LIMIT_EXCEEDED')
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: input.commands[0].content })
      })

      it('delivers and authorizes an exact 512 KiB structured read result through the gateway wrapper', async () => {
        const baseline = await call('journey_read', {
          journeyId,
          view: 'steps'
        })
        const baselineBytes = Buffer.byteLength(
          JSON.stringify(baseline.json.result?.structuredContent)
        )
        const content = 'x'.repeat(
          524288 - baselineBytes + 'Original heading'.length
        )
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { content }
        })
        const response = await call('journey_read', {
          journeyId,
          view: 'steps'
        })
        expect(
          response.json.result?.isError,
          response.text.slice(0, 500)
        ).not.toBe(true)
        expect(
          Buffer.byteLength(
            JSON.stringify(response.json.result?.structuredContent)
          )
        ).toBe(524288)
        const page = z
          .object({
            complete: z.literal(true),
            nextCursor: z.null(),
            blocks: z.array(
              z.object({
                id: z.string(),
                content: z.string().nullable().optional()
              })
            )
          })
          .parse(response.json.result?.structuredContent)
        expect(
          page.blocks.find((block) => block.id === `${journeyId}-text`)?.content
        ).toBe(content)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
      })

      it.each(['before', 'after'])(
        'cancels the MCP socket %s final owner acceptance with positive sender fencing',
        async (side) => {
          const pause = barrier()
          if (side === 'before')
            beforeAcceptance = async (stage) => {
              if (stage === 'read') await pause.pause()
            }
          else
            afterAcceptance = async (stage) => {
              if (stage === 'read') await pause.pause()
            }
          const input = await editInput()
          const call = cancellableEdit(input)
          await pause.ready
          const senderId = lastSenderId
          expect(senderId).toBeTruthy()
          call.request.destroy()
          await call.closed
          await eventually(async () =>
            Boolean(
              await auth.readExecutor.findFirst({
                where: {
                  id: senderId!,
                  executor: 'mcp',
                  fencedAt: { not: null }
                }
              })
            )
          )
          if (side === 'after')
            expect(
              await auth.readPermit.count({
                where: { executor: 'journeys', status: 'accepted' }
              })
            ).toBeGreaterThan(0)
          pause.resume()
          beforeAcceptance = undefined
          afterAcceptance = undefined
          if (side === 'before') {
            await eventually(async () =>
              Boolean(
                await journeys.mcpEditExecution.findFirst({
                  where: {
                    status: 'fenced',
                    connectionId: (
                      await auth.agentConnection.findFirstOrThrow({
                        orderBy: { approvedAt: 'desc' }
                      })
                    ).id
                  }
                })
              )
            )
            expect(await counts()).toEqual({
              operations: 0,
              history: 0,
              effects: 0
            })
            expect(
              await journeys.block.findUnique({
                where: { id: `${journeyId}-text` }
              })
            ).toMatchObject({ content: 'Original heading' })
          } else {
            await eventually(async () => (await counts()).operations === 1)
            const original = receipt(await edit(input))
            expect(original.journeyId).toBe(journeyId)
            expect(await counts()).toEqual({
              operations: 1,
              history: 1,
              effects: 1
            })
            expect(
              await journeys.block.findUnique({
                where: { id: `${journeyId}-text` }
              })
            ).toMatchObject({ content: 'Saved heading' })
          }
        }
      )

      it.each([
        ['content', 'Intermediate heading', 'Final heading'],
        ['content', 'Original heading', 'Saved heading'],
        ['content', 'Original heading', 'Original heading'],
        ['variant', 'h1', 'h2'],
        ['align', 'center', 'right'],
        ['color', '#123456', '#654321']
      ])(
        'rejects duplicate %s writes, including no-ops, without accepting an edit',
        async (field, first, second) => {
          const before = await revision()
          const original = await journeys.block.findUniqueOrThrow({
            where: { id: `${journeyId}-text` }
          })
          const input = {
            ...(await editInput()),
            commands: [first, second].map((value) => ({
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              [field]: value
            }))
          }
          expect((await call('journey_edit', input)).json.result).toMatchObject(
            {
              isError: true,
              structuredContent: { code: 'VALIDATION_FAILED' }
            }
          )
          expect(await revision()).toBe(before)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: `${journeyId}-text` }
            })
          ).toEqual(original)
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
          expect(
            await auth.readPermit.count({ where: { status: 'accepted' } })
          ).toBe(0)
        }
      )

      it('saves disjoint fields on the same block with sparse inverses and exact replay', async () => {
        const before = await revision()
        const input = {
          ...(await editInput()),
          commands: [
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              content: 'Original heading'
            },
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              variant: 'h1'
            },
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              align: 'center',
              color: '#654321'
            }
          ]
        }
        const saved = receipt(await call('journey_edit', input))
        expect(BigInt(saved.committedRevision)).toBe(BigInt(before) + 1n)
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({
          content: 'Original heading',
          variant: 'h1',
          align: 'center',
          settings: expect.objectContaining({ color: '#654321' })
        })
        const history = await journeys.mcpEditHistory.findUniqueOrThrow({
          where: { operationId: saved.operationId }
        })
        expect(history.changes).toEqual([
          {
            type: 'typography_restore',
            blockId: `${journeyId}-text`,
            parent: {
              cardId: `${journeyId}-card`,
              stepId: `${journeyId}-step`
            },
            fields: [
              {
                field: 'variant',
                before: 'h2',
                after: 'h1',
                beforePresent: true
              }
            ]
          },
          {
            type: 'typography_restore',
            blockId: `${journeyId}-text`,
            parent: {
              cardId: `${journeyId}-card`,
              stepId: `${journeyId}-step`
            },
            fields: [
              {
                field: 'align',
                before: 'left',
                after: 'center',
                beforePresent: true
              },
              {
                field: 'settings.color',
                before: '#123456',
                after: '#654321',
                beforePresent: true
              }
            ]
          }
        ])
        expect(receipt(await call('journey_edit', input))).toEqual(saved)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('rejects a schema-valid batch with a later wrong-type target before changing any earlier command', async () => {
        const before = await revision()
        const input = {
          ...(await editInput()),
          commands: [
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              content: 'Must not survive'
            },
            {
              type: 'typography_set',
              blockId: `${journeyId}-card`,
              content: 'Wrong-type target'
            }
          ]
        }
        expect((await edit(input)).json.result?.isError).toBe(true)
        expect(await revision()).toBe(before)
        expect(
          await journeys.block.findUnique({
            where: { id: `${journeyId}-text` }
          })
        ).toMatchObject({ content: 'Original heading' })
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
      })

      async function seedPresentation() {
        const buttonId = `${journeyId}-button`
        await journeys.block.createMany({
          data: [
            {
              id: buttonId,
              journeyId,
              typename: 'ButtonBlock',
              parentBlockId: `${journeyId}-card`,
              parentOrder: 1,
              label: 'Original button',
              variant: 'contained',
              size: 'medium',
              color: 'primary',
              submitEnabled: false,
              startIconId: `${buttonId}-start`,
              endIconId: `${buttonId}-end`,
              settings: {
                alignment: 'justify',
                color: '#abcdef',
                legacy: { preserve: true }
              }
            },
            {
              id: `${buttonId}-start`,
              journeyId,
              typename: 'IconBlock',
              parentBlockId: buttonId,
              name: 'Home4',
              color: 'inherit',
              size: 'small'
            },
            {
              id: `${buttonId}-end`,
              journeyId,
              typename: 'IconBlock',
              parentBlockId: buttonId,
              name: 'ArrowForwardRounded',
              color: null,
              size: 'large'
            },
            {
              id: `${journeyId}-spacer`,
              journeyId,
              typename: 'SpacerBlock',
              parentBlockId: `${journeyId}-card`,
              parentOrder: 2,
              spacing: 100
            }
          ]
        })
      }
      function presentationCase(name: string) {
        const buttonId = `${journeyId}-button`
        switch (name) {
          case 'typography_set':
            return {
              command: {
                type: name,
                blockId: `${journeyId}-text`,
                variant: 'body1',
                align: 'right',
                color: '#ffffff'
              },
              targetId: `${journeyId}-text`,
              expected: {
                variant: 'body1',
                align: 'right',
                settings: {
                  color: '#ffffff',
                  unmounted: 'preserve-settings-sentinel'
                }
              },
              unrelated: { content: 'Human text' }
            }
          case 'button_set':
            return {
              command: {
                type: name,
                blockId: buttonId,
                label: 'Continue',
                variant: 'outlined',
                color: 'secondary',
                size: 'large',
                alignment: 'center'
              },
              targetId: buttonId,
              expected: {
                label: 'Continue',
                variant: 'outlined',
                color: 'secondary',
                size: 'large',
                settings: {
                  alignment: 'center',
                  color: '#abcdef',
                  legacy: { preserve: true }
                }
              },
              unrelated: { eventLabel: 'prayerRequest' as const }
            }
          case 'button_icon_start':
            return {
              command: {
                type: 'button_icon_set',
                blockId: buttonId,
                slot: 'start',
                name: 'CheckCircleRounded',
                color: 'secondary'
              },
              targetId: `${buttonId}-start`,
              expected: {
                name: 'CheckCircleRounded',
                color: 'secondary',
                size: 'small'
              },
              unrelated: { size: 'medium' }
            }
          case 'button_icon_end':
            return {
              command: {
                type: 'button_icon_set',
                blockId: buttonId,
                slot: 'end',
                name: null,
                color: 'error'
              },
              targetId: `${buttonId}-end`,
              expected: { name: null, color: 'error', size: 'large' },
              unrelated: { size: 'medium' }
            }
          case 'spacer_set':
            return {
              command: {
                type: name,
                blockId: `${journeyId}-spacer`,
                spacing: 230
              },
              targetId: `${journeyId}-spacer`,
              expected: { spacing: 230 },
              unrelated: { label: 'Human sentinel' }
            }
          case 'card_set':
            return {
              command: {
                type: name,
                blockId: `${journeyId}-card`,
                fullscreen: true,
                backgroundColor: '#12345680',
                backdropBlur: 13,
                themeMode: 'light'
              },
              targetId: `${journeyId}-card`,
              expected: {
                fullscreen: true,
                backgroundColor: '#12345680',
                backdropBlur: 13,
                themeMode: 'light',
                themeName: 'base'
              },
              unrelated: { label: 'Human sentinel' }
            }
          case 'card_chat_set':
            return {
              command: {
                type: name,
                blockId: `${journeyId}-card`,
                enabled: true,
                collapse: true
              },
              targetId: `${journeyId}-card`,
              expected: { showAssistant: true, expandChatByDefault: false },
              unrelated: { backgroundColor: '#abcdef' }
            }
          default:
            throw new Error('Unknown presentation fixture')
        }
      }

      it.each([
        'typography_set',
        'button_set',
        'button_icon_start',
        'button_icon_end',
        'spacer_set',
        'card_set',
        'card_chat_set'
      ])(
        'saves, replays and safely undoes/redoes %s through the authenticated MCP path',
        async (name) => {
          await seedPresentation()
          const fixture = presentationCase(name)
          const original = await journeys.block.findUniqueOrThrow({
            where: { id: fixture.targetId }
          })
          const input = {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [fixture.command]
          }
          discardSavedResponse = true
          expect((await call('journey_edit', input)).json.result?.isError).toBe(
            true
          )
          const saved = receipt(await call('journey_edit', input))
          expect(receipt(await call('journey_edit', input))).toEqual(saved)
          expect(await counts()).toEqual({
            operations: 1,
            history: 1,
            effects: 1
          })
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: fixture.targetId }
            })
          ).toMatchObject(fixture.expected)
          const read = await call('journey_read', { journeyId, view: 'steps' })
          expect(read.json.result?.isError, read.text).not.toBe(true)
          expect(read.text).toContain(fixture.targetId)
          const host = await journeys.host.create({
            data: { teamId: 'edit-team-alice', title: 'Later human Host' }
          })
          await journeys.journey.update({
            where: { id: journeyId },
            data: { hostId: host.id }
          })
          await journeys.block.update({
            where: { id: fixture.targetId },
            data: fixture.unrelated
          })
          expect(
            (
              await call('journey_edit', {
                ...input,
                idempotencyKey: randomUUID()
              })
            ).text
          ).toContain('REVISION_CONFLICT')
          const deniedToken = await consent('alice', [journeyId], 'view')
          expect(
            (
              await call(
                'journey_edit',
                {
                  ...input,
                  expectedRevision: await revision(),
                  idempotencyKey: randomUUID()
                },
                deniedToken
              )
            ).json.result?.isError
          ).toBe(true)
          const undoInput = await historyInput(saved.historyId!)
          const undone = receipt(await call('journey_undo', undoInput))
          expect(receipt(await call('journey_undo', undoInput))).toEqual(undone)
          const afterUndo = await journeys.block.findUniqueOrThrow({
            where: { id: fixture.targetId }
          })
          expect(afterUndo).toMatchObject({
            ...original,
            ...fixture.unrelated,
            updatedAt: expect.any(Date)
          })
          await historyAction('redo', saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: fixture.targetId }
            })
          ).toMatchObject({ ...fixture.expected, ...fixture.unrelated })
          expect(
            await journeys.journey.findUniqueOrThrow({
              where: { id: journeyId }
            })
          ).toMatchObject({ hostId: host.id })
          const fresh = receipt(
            await call('journey_edit', {
              ...input,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID()
            })
          )
          expect(fresh.operationId).not.toBe(saved.operationId)
          await journeys.journey.update({
            where: { id: journeyId },
            data: {
              status: 'published',
              publishedAt: new Date(),
              firstPublishedAt: new Date()
            }
          })
          expect(
            (
              await call('journey_edit', {
                ...input,
                expectedRevision: await revision(),
                idempotencyKey: randomUUID()
              })
            ).text
          ).toContain('NOT_EDITABLE')
        }
      )

      it.each(['typography', 'button', 'spacer'])(
        'creates complete %s content once, then undoes/redoes the same IDs',
        async (kind) => {
          const block =
            kind === 'typography'
              ? {
                  kind,
                  content: 'Plain\ntext',
                  variant: 'caption',
                  align: 'right',
                  color: '#ffffff'
                }
              : kind === 'button'
                ? {
                    kind,
                    label: 'Next',
                    startIcon: { name: 'Home4', color: 'primary' },
                    endIcon: { name: null }
                  }
                : { kind, spacing: 200 }
          const input = {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'block_add',
                key: 'created',
                cardId: `${journeyId}-card`,
                placement: { position: 'before', blockId: `${journeyId}-text` },
                block
              }
            ]
          }
          discardSavedResponse = true
          expect((await call('journey_edit', input)).json.result?.isError).toBe(
            true
          )
          const saved = receipt(await call('journey_edit', input))
          expect(receipt(await call('journey_edit', input))).toEqual(saved)
          expect(Object.keys(saved.idMap)).toHaveLength(
            kind === 'button' ? 3 : 1
          )
          const ids = Object.values(saved.idMap)
          const created = await journeys.block.findMany({
            where: { id: { in: ids }, deletedAt: null },
            orderBy: { id: 'asc' }
          })
          expect(created).toHaveLength(ids.length)
          expect(
            created.find((item) => item.id === saved.idMap.created)
          ).toMatchObject({
            parentBlockId: `${journeyId}-card`,
            parentOrder: 0
          })
          if (kind === 'button')
            expect(
              created.find((item) => item.id === saved.idMap.created)
            ).toMatchObject({
              startIconId: saved.idMap['created.startIcon'],
              endIconId: saved.idMap['created.endIcon'],
              submitEnabled: false,
              settings: { alignment: 'justify' }
            })
          const read = await call('journey_read', { journeyId, view: 'steps' })
          for (const id of ids) expect(read.text).toContain(id)
          await historyAction('undo', saved.historyId!)
          expect(
            await journeys.block.count({
              where: { id: { in: ids }, deletedAt: null }
            })
          ).toBe(0)
          expect(await textBlock()).toMatchObject({ parentOrder: 0 })
          await historyAction('redo', saved.historyId!)
          expect(
            await journeys.block.findMany({
              where: { id: { in: ids }, deletedAt: null },
              orderBy: { id: 'asc' }
            })
          ).toEqual(
            created.map((item) =>
              expect.objectContaining({ ...item, updatedAt: expect.any(Date) })
            )
          )
        }
      )

      it('rolls back parent, children, revision, receipt, audit and history on a child failure', async () => {
        const before = await revision()
        checkpoint = async (point) => {
          if (point === 'after_child')
            throw new Error('Controlled child-write failure')
        }
        const input = {
          journeyId,
          expectedRevision: before,
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'block_add',
              key: 'cta',
              cardId: `${journeyId}-card`,
              placement: { position: 'end' },
              block: { kind: 'button', label: 'Atomic' }
            }
          ]
        }
        expect((await call('journey_edit', input)).json.result?.isError).toBe(
          true
        )
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(await journeys.block.count({ where: { journeyId } })).toBe(3)
        expect(
          await journeys.mcpEditAudit.count({ where: { journeyId } })
        ).toBe(0)
        expect(await revision()).toBe(before)
        checkpoint = undefined
        receipt(await call('journey_edit', input))
      })

      it.each(['TextResponseBlock', 'MultiselectBlock'])(
        'derives one shared submit role from %s when adding several complete Buttons',
        async (typename) => {
          await journeys.block.create({
            data: {
              journeyId,
              typename,
              parentBlockId: `${journeyId}-card`,
              parentOrder: 1
            }
          })
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: ['first', 'second'].map((key) => ({
                type: 'block_add',
                key,
                cardId: `${journeyId}-card`,
                placement: { position: 'end' },
                block: { kind: 'button', label: key }
              }))
            })
          )
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: saved.idMap.first }
            })
          ).toMatchObject({ submitEnabled: true })
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: saved.idMap.second }
            })
          ).toMatchObject({ submitEnabled: false })
          await historyAction('undo', saved.historyId!)
          await historyAction('redo', saved.historyId!)
        }
      )

      it('rejects creation undo after a human edits a child or adds an action, preserving the whole composite', async () => {
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'block_add',
                key: 'cta',
                cardId: `${journeyId}-card`,
                placement: { position: 'end' },
                block: { kind: 'button', label: 'Next' }
              }
            ]
          })
        )
        await journeys.block.update({
          where: { id: saved.idMap['cta.endIcon'] },
          data: { name: 'Home4' }
        })
        expect(
          (await call('journey_undo', await historyInput(saved.historyId!)))
            .text
        ).toContain('HISTORY_CONFLICT')
        await journeys.block.update({
          where: { id: saved.idMap['cta.endIcon'] },
          data: { name: null }
        })
        await journeys.action.create({
          data: { parentBlockId: saved.idMap.cta, url: 'https://example.test/' }
        })
        expect(
          (await call('journey_undo', await historyInput(saved.historyId!)))
            .text
        ).toContain('HISTORY_CONFLICT')
        expect(
          await journeys.block.count({
            where: { id: { in: Object.values(saved.idMap) }, deletedAt: null }
          })
        ).toBe(3)
      })

      it('repairs a missing owned icon with reversible creation and rejects foreign or shared slot IDs', async () => {
        await seedPresentation()
        const buttonId = `${journeyId}-button`
        await journeys.block.update({
          where: { id: buttonId },
          data: { startIconId: null }
        })
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'button_icon_set',
                blockId: buttonId,
                slot: 'start',
                name: 'Home4',
                color: 'error'
              }
            ]
          })
        )
        const button = await journeys.block.findUniqueOrThrow({
          where: { id: buttonId }
        })
        expect(button.startIconId).not.toBeNull()
        await historyAction('undo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({ startIconId: null })
        await historyAction('redo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({ startIconId: button.startIconId })
        for (const startIconId of [`${journeyId}-text`, button.endIconId]) {
          await journeys.block.update({
            where: { id: buttonId },
            data: { startIconId }
          })
          const before = await revision()
          expect(
            (
              await call('journey_edit', {
                journeyId,
                expectedRevision: before,
                idempotencyKey: randomUUID(),
                commands: [
                  {
                    type: 'button_icon_set',
                    blockId: buttonId,
                    slot: 'start',
                    name: 'Home4'
                  }
                ]
              })
            ).json.result?.isError
          ).toBe(true)
          expect(await revision()).toBe(before)
        }
      })

      it.each(
        (['undo', 'redo'] as const).flatMap((direction) =>
          (['start', 'end'] as const).flatMap((slot) =>
            [
              'missing',
              'wrong-type',
              'foreign-journey',
              'wrong-parent',
              'deleted',
              'other-slot',
              'submit-slot',
              'other-owner'
            ].map((corruption) => ({ direction, slot, corruption }))
          )
        )
      )(
        'rejects $corruption restored $slot Icon linkage before $direction acceptance and recovers after repair',
        async ({ direction, slot, corruption }) => {
          await seedPresentation()
          const buttonId = `${journeyId}-button`
          const field = slot === 'start' ? 'startIconId' : 'endIconId'
          await journeys.block.update({
            where: { id: buttonId },
            data: { [field]: null }
          })
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'button_icon_set',
                  blockId: buttonId,
                  slot,
                  name: 'CheckCircleRounded'
                }
              ]
            })
          )
          const button = await journeys.block.findUniqueOrThrow({
            where: { id: buttonId }
          })
          const iconId = button[field]!
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          if (direction === 'redo') await historyAction('undo', entry.id)
          let invalidId = `${buttonId}-invalid`
          if (corruption === 'wrong-type') invalidId = `${journeyId}-text`
          if (corruption === 'other-slot')
            invalidId = button[slot === 'start' ? 'endIconId' : 'startIconId']!
          if (
            [
              'foreign-journey',
              'wrong-parent',
              'deleted',
              'submit-slot',
              'other-owner'
            ].includes(corruption)
          ) {
            const foreign =
              corruption === 'foreign-journey'
                ? await journeys.journey.create({
                    data: {
                      title: 'Foreign draft',
                      slug: randomUUID(),
                      languageId: '529',
                      teamId: 'edit-team-bob',
                      status: 'draft'
                    }
                  })
                : null
            await journeys.block.create({
              data: {
                id: invalidId,
                journeyId: foreign?.id ?? journeyId,
                typename: 'IconBlock',
                parentBlockId:
                  corruption === 'wrong-parent'
                    ? `${journeyId}-card`
                    : buttonId,
                deletedAt: corruption === 'deleted' ? new Date() : null
              }
            })
          }
          if (corruption === 'submit-slot')
            await journeys.block.update({
              where: { id: buttonId },
              data: { submitIconId: invalidId }
            })
          if (corruption === 'other-owner')
            await journeys.block.create({
              data: {
                journeyId,
                typename: 'ButtonBlock',
                parentBlockId: `${journeyId}-card`,
                startIconId: invalidId
              }
            })
          const changes = z.array(z.json()).parse(entry.changes)
          const index = changes.findIndex(
            (change) => presentationInverse.safeParse(change).success
          )
          const inverse = presentationInverse.parse(changes[index])
          expect(inverse.blockId).toBe(buttonId)
          expect(inverse.fields).toEqual([
            { field, before: null, after: iconId, beforePresent: true }
          ])
          inverse.fields[0][direction === 'undo' ? 'before' : 'after'] =
            invalidId
          changes[index] = inverse
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes }
          })
          const snapshot = async () => ({
            blocks: await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            revision: await revision(),
            cursor: await history(),
            entries: await journeys.mcpEditHistory.findMany({
              where: { journeyId },
              orderBy: { ordinal: 'asc' }
            }),
            operations: await journeys.mcpEditOperation.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            counts: await counts(),
            audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
          })
          const before = await snapshot()
          const input = await historyInput(entry.id)
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          for (let attempt = 0; attempt < 2; attempt++) {
            const response = await call(`journey_${direction}`, input)
            expect(response.json.result?.isError).toBe(true)
            expect(response.text).toContain('HISTORY_UNAVAILABLE')
            expect(acceptance).not.toHaveBeenCalled()
            expect(await snapshot()).toEqual(before)
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          const restored = receipt(await call(`journey_${direction}`, input))
          expect(acceptance).toHaveBeenCalled()
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
          ).toMatchObject({
            [field]: direction === 'redo' ? iconId : null
          })
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: iconId } })
          ).toMatchObject({
            deletedAt: direction === 'redo' ? null : expect.any(Date)
          })
          const after = await snapshot()
          expect(receipt(await call(`journey_${direction}`, input))).toEqual(
            restored
          )
          expect(await snapshot()).toEqual(after)
        }
      )

      it('saves a Button label and destination atomically with one replayable undo entry', async () => {
        await seedPresentation()
        const buttonId = `${journeyId}-button`
        await journeys.action.create({
          data: {
            parentBlockId: buttonId,
            url: 'https://synthetic.example/original',
            gtmEventName: 'retained-tracking'
          }
        })
        const originalAction = await journeys.action.findUniqueOrThrow({
          where: { parentBlockId: buttonId }
        })
        const input = {
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID(),
          commands: [
            { type: 'button_set', blockId: buttonId, label: 'Continue here' },
            {
              type: 'action_set',
              block: { id: buttonId },
              action: { kind: 'step', destination: { id: `${journeyId}-step` } }
            }
          ]
        }
        const saved = receipt(await edit(input))
        expect(BigInt(saved.committedRevision)).toBe(
          BigInt(input.expectedRevision) + 1n
        )
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({ label: 'Continue here' })
        expect(
          await journeys.action.findUnique({
            where: { parentBlockId: buttonId }
          })
        ).toMatchObject({ blockId: `${journeyId}-step` })
        const committedRevision = await revision()
        expect(receipt(await edit(input))).toEqual(saved)
        expect(await revision()).toBe(committedRevision)
        expect(await counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        await historyAction('undo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({ label: 'Original button' })
        expect(
          await journeys.action.findUnique({
            where: { parentBlockId: buttonId }
          })
        ).toMatchObject({ ...originalAction, updatedAt: expect.any(Date) })
        await historyAction('redo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({ label: 'Continue here' })
        expect(
          await journeys.action.findUnique({
            where: { parentBlockId: buttonId }
          })
        ).toMatchObject({ blockId: `${journeyId}-step` })
      })

      it.each([
        'typography_set',
        'button_set',
        'button_icon_start',
        'button_icon_end',
        'spacer_set',
        'card_set',
        'card_chat_set'
      ])(
        'projects mixed %s with structural edits and preserves later unrelated fields through history',
        async (name) => {
          await seedPresentation()
          const fixture = presentationCase(name)
          const original = await journeys.block.findUniqueOrThrow({
            where: { id: fixture.targetId }
          })
          const stepId = `${journeyId}-step`
          const originalStep = await journeys.block.findUniqueOrThrow({
            where: { id: stepId }
          })
          const input = {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              fixture.command,
              {
                type: 'step_position_set',
                step: { id: stepId },
                x: 421,
                y: 219
              }
            ]
          }
          const saved = receipt(await edit(input))
          expect(await counts()).toEqual({
            operations: 1,
            history: 1,
            effects: 1
          })
          expect(receipt(await edit(input))).toEqual(saved)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: fixture.targetId }
            })
          ).toMatchObject(fixture.expected)
          await journeys.block.update({
            where: { id: fixture.targetId },
            data: fixture.unrelated
          })
          await historyAction('undo', saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: fixture.targetId }
            })
          ).toMatchObject({
            ...original,
            ...fixture.unrelated,
            updatedAt: expect.any(Date)
          })
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: stepId } })
          ).toMatchObject({ x: originalStep.x, y: originalStep.y })
          await historyAction('redo', saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: fixture.targetId }
            })
          ).toMatchObject({ ...fixture.expected, ...fixture.unrelated })
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: stepId } })
          ).toMatchObject({ x: 421, y: 219 })
        }
      )

      async function mixedSnapshot() {
        return {
          blocks: await journeys.block.findMany({
            where: { journeyId },
            orderBy: { id: 'asc' }
          }),
          actions: await journeys.action.findMany({
            where: { parentBlock: { journeyId } },
            orderBy: { parentBlockId: 'asc' }
          }),
          revision: await revision(),
          entries: await journeys.mcpEditHistory.findMany({
            where: { journeyId },
            orderBy: { ordinal: 'asc' }
          }),
          operations: await journeys.mcpEditOperation.findMany({
            where: { journeyId },
            orderBy: { id: 'asc' }
          }),
          effects: await journeys.mcpEditEffect.findMany({
            where: { journeyId },
            orderBy: { id: 'asc' }
          }),
          audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
        }
      }

      it.each([
        'duplicate-noop',
        'destroy-before',
        'destroy-after',
        'removed-destination',
        'wrong-destination'
      ])(
        'rejects mixed %s before acceptance without changing saved state',
        async (failure) => {
          await seedPresentation()
          const buttonId = `${journeyId}-button`
          const label = {
            type: 'button_set',
            blockId: buttonId,
            label: 'Original button'
          }
          const remove = { type: 'block_remove', block: { id: buttonId } }
          const route = {
            type: 'action_set',
            block: { id: buttonId },
            action: { kind: 'step', destination: { id: `${journeyId}-step` } }
          }
          const commands =
            failure === 'duplicate-noop'
              ? [label, label, route]
              : failure === 'destroy-before'
                ? [remove, label]
                : failure === 'destroy-after'
                  ? [label, remove]
                  : failure === 'removed-destination'
                    ? [
                        label,
                        route,
                        {
                          type: 'step_remove',
                          step: { id: `${journeyId}-step` }
                        }
                      ]
                    : [
                        label,
                        {
                          ...route,
                          action: {
                            kind: 'step',
                            destination: { id: buttonId }
                          }
                        }
                      ]
          const before = await mixedSnapshot()
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          const result = await edit({
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands
          })
          expect(result.json.result?.isError, result.text).toBe(true)
          expect(acceptance).not.toHaveBeenCalled()
          expect(await mixedSnapshot()).toEqual(before)
        }
      )

      it('resolves mixed forward locals and saves complete Button Icons, routes and presentation in one entry', async () => {
        const saved = receipt(
          await edit({
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              { type: 'button_set', blockId: '$continue', alignment: 'left' },
              {
                type: 'block_add',
                key: 'continue',
                cardId: '$new_card',
                placement: { position: 'end' },
                block: {
                  kind: 'button',
                  label: 'Continue',
                  startIcon: { name: 'Home4' },
                  endIcon: { name: 'ArrowForwardRounded', color: 'primary' }
                }
              },
              {
                type: 'action_set',
                block: { local: 'continue' },
                action: { kind: 'step', destination: { local: 'new_step' } }
              },
              {
                type: 'step_add',
                key: 'new_step',
                cardKey: 'new_card',
                placement: { position: 'end' }
              }
            ]
          })
        )
        const buttonId = saved.idMap.continue
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({
          parentBlockId: saved.idMap.new_card,
          label: 'Continue',
          settings: { alignment: 'left' },
          startIconId: saved.idMap['continue.startIcon'],
          endIconId: saved.idMap['continue.endIcon']
        })
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: saved.idMap['continue.startIcon'] }
          })
        ).toMatchObject({ name: 'Home4', parentBlockId: buttonId })
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: saved.idMap['continue.endIcon'] }
          })
        ).toMatchObject({ name: 'ArrowForwardRounded', color: 'primary' })
        expect(
          await journeys.action.findUnique({
            where: { parentBlockId: buttonId }
          })
        ).toMatchObject({ blockId: saved.idMap.new_step })
        await historyAction('undo', saved.historyId!)
        expect(
          await journeys.block.count({
            where: { id: { in: Object.values(saved.idMap) }, deletedAt: null }
          })
        ).toBe(0)
        await historyAction('redo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({ deletedAt: null, settings: { alignment: 'left' } })
      })

      it.each([
        {
          name: 'button_set',
          field: 'settings',
          after: { alignment: 'invalid' }
        },
        { name: 'typography_set', field: 'variant', after: 'not-a-variant' },
        { name: 'button_icon_start', field: 'name', after: 'not-an-icon' },
        { name: 'spacer_set', field: 'spacing', after: 2147483648 },
        { name: 'card_set', field: 'fullscreen', after: 'invalid' }
      ])(
        'rejects malformed mixed $name history before acceptance and recovers after repair',
        async ({ name, field, after }) => {
          await seedPresentation()
          const fixture = presentationCase(name)
          const saved = receipt(
            await edit({
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                fixture.command,
                {
                  type: 'step_position_set',
                  step: { id: `${journeyId}-step` },
                  x: 421,
                  y: 219
                }
              ]
            })
          )
          await historyAction('undo', saved.historyId!)
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          const changes = structuredClone(entry.changes) as unknown as Array<{
            blocks: Array<{
              id: string
              after: Record<string, unknown>
            }>
          }>
          changes[0].blocks.find(
            (change) => change.id === fixture.targetId
          )!.after[field] = after
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: changes as Prisma.InputJsonValue }
          })
          const before = await mixedSnapshot()
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          const input = await historyInput(entry.id)
          for (let attempt = 0; attempt < 2; attempt++) {
            const result = await call('journey_redo', input)
            expect(result.text).toContain('HISTORY_UNAVAILABLE')
            expect(acceptance).not.toHaveBeenCalled()
            expect(await mixedSnapshot()).toEqual(before)
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          const redone = receipt(await call('journey_redo', input))
          expect(receipt(await call('journey_redo', input))).toEqual(redone)
        }
      )

      it.each([
        'forward',
        'undo',
        'redo',
        'final-forward',
        'final-undo',
        'final-redo'
      ] as const)(
        'enforces mixed Card chat gates for %s and recovers with the same key',
        async (stage) => {
          const commands = [
            {
              type: 'card_chat_set',
              blockId: `${journeyId}-card`,
              enabled: true,
              collapse: false
            },
            {
              type: 'step_position_set',
              step: { id: `${journeyId}-step` },
              x: 421,
              y: 219
            }
          ]
          const direction = stage.replace('final-', '')
          let entryId: string | undefined
          if (direction !== 'forward') {
            entryId = receipt(
              await edit({
                journeyId,
                expectedRevision: await revision(),
                idempotencyKey: randomUUID(),
                commands
              })
            ).historyId!
            if (direction === 'redo') await historyAction('undo', entryId)
          }
          const tool =
            direction === 'forward' ? 'journey_edit' : `journey_${direction}`
          const input = entryId
            ? await historyInput(entryId)
            : {
                journeyId,
                expectedRevision: await revision(),
                idempotencyKey: randomUUID(),
                commands
              }
          if (stage.startsWith('final-'))
            checkpoint = async (point) => {
              if (point === 'before_accept') chatEnabled = false
            }
          else chatEnabled = false
          const before = await mixedSnapshot()
          const response = await call(tool, input)
          expect(response.json.result?.isError, response.text).toBe(true)
          expect(await mixedSnapshot()).toEqual(before)
          checkpoint = undefined
          chatEnabled = true
          const saved = receipt(await call(tool, input))
          expect(receipt(await call(tool, input))).toEqual(saved)
        }
      )

      it('rolls back a mixed batch when a required Icon child write fails', async () => {
        const before = await mixedSnapshot()
        checkpoint = async (point) => {
          if (point === 'after_child') throw new Error('injected child failure')
        }
        const input = {
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'step_position_set',
              step: { id: `${journeyId}-step` },
              x: 421,
              y: 219
            },
            {
              type: 'block_add',
              key: 'new_button',
              cardId: `${journeyId}-card`,
              placement: { position: 'end' },
              block: { kind: 'button', label: 'Complete button' }
            }
          ]
        }
        expect((await edit(input)).json.result?.isError).toBe(true)
        expect(await mixedSnapshot()).toEqual(before)
        checkpoint = undefined
        receipt(await edit(input))
      })

      it.each(['label', 'icon'] as const)(
        'rejects mixed creation %s aliases even when the repeated value is a no-op',
        async (field) => {
          const before = await mixedSnapshot()
          const response = await edit({
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'block_add',
                key: 'new_button',
                cardId: `${journeyId}-card`,
                placement: { position: 'end' },
                block: {
                  kind: 'button',
                  label: 'Complete button',
                  startIcon: { name: 'Home4' }
                }
              },
              field === 'label'
                ? {
                    type: 'button_set',
                    blockId: '$new_button',
                    label: 'Complete button'
                  }
                : {
                    type: 'button_icon_set',
                    blockId: '$new_button',
                    slot: 'start',
                    name: 'Home4'
                  },
              {
                type: 'action_set',
                block: { local: 'new_button' },
                action: {
                  kind: 'step',
                  destination: { id: `${journeyId}-step` }
                }
              }
            ]
          })
          expect(response.text).toContain('VALIDATION_FAILED')
          expect(await mixedSnapshot()).toEqual(before)
        }
      )

      it('counts structural and presentation objects together before mixed acceptance', async () => {
        await journeys.block.createMany({
          data: Array.from({ length: 80 }, (_, index) => ({
            id: `${journeyId}-sibling-${index}`,
            journeyId,
            typename: 'SpacerBlock',
            parentBlockId: `${journeyId}-card`,
            parentOrder: index + 1,
            spacing: 100
          }))
        })
        const before = await mixedSnapshot()
        const response = await edit({
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID(),
          commands: [
            ...Array.from({ length: 49 }, (_, index) => ({
              type: 'block_add',
              key: `button_${index}`,
              cardId: `${journeyId}-card`,
              placement: { position: 'before', blockId: `${journeyId}-text` },
              block: { kind: 'button', label: 'New button' }
            })),
            {
              type: 'step_position_set',
              step: { id: `${journeyId}-step` },
              x: 421,
              y: 219
            }
          ]
        })
        expect(response.text).toContain('LIMIT_EXCEEDED')
        expect(await mixedSnapshot()).toEqual(before)
      })

      it.each(
        (['start', 'end'] as const).flatMap((slot) =>
          ['other-slot', 'wrong-type'].map((corruption) => ({
            slot,
            corruption
          }))
        )
      )(
        'validates mixed restored $slot Icon slots against $corruption before redo and recovers after repair',
        async ({ slot, corruption }) => {
          await seedPresentation()
          const buttonId = `${journeyId}-button`
          const field = `${slot}IconId` as const
          await journeys.block.update({
            where: { id: buttonId },
            data: { [field]: null }
          })
          const saved = receipt(
            await edit({
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'button_icon_set',
                  blockId: buttonId,
                  slot,
                  name: 'Home4'
                },
                {
                  type: 'step_position_set',
                  step: { id: `${journeyId}-step` },
                  x: 421,
                  y: 219
                }
              ]
            })
          )
          await historyAction('undo', saved.historyId!)
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          const changes = structuredClone(entry.changes) as unknown as Array<{
            blocks: Array<{ id: string; after: Record<string, unknown> }>
          }>
          changes[0].blocks.find((change) => change.id === buttonId)!.after[
            field
          ] =
            corruption === 'wrong-type'
              ? `${journeyId}-text`
              : `${buttonId}-${slot === 'start' ? 'end' : 'start'}`
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: changes as Prisma.InputJsonValue }
          })
          const before = await mixedSnapshot()
          const input = await historyInput(entry.id)
          expect((await call('journey_redo', input)).text).toContain(
            'HISTORY_UNAVAILABLE'
          )
          expect(await mixedSnapshot()).toEqual(before)
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          receipt(await call('journey_redo', input))
        }
      )

      it.each(
        (['complete-button', 'slot-repair'] as const).flatMap((mode) =>
          (['button-slot', 'card-cover'] as const).map((reference) => ({
            mode,
            reference
          }))
        )
      )(
        'rejects mixed $mode undo when a later $reference aliases its Icon and recovers after repair',
        async ({ mode, reference }) => {
          await seedPresentation()
          const existingButton = `${journeyId}-button`
          if (mode === 'slot-repair')
            await journeys.block.update({
              where: { id: existingButton },
              data: { startIconId: null }
            })
          const saved = receipt(
            await edit({
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                mode === 'complete-button'
                  ? {
                      type: 'block_add',
                      key: 'new_button',
                      cardId: `${journeyId}-card`,
                      placement: { position: 'end' },
                      block: { kind: 'button', label: 'New button' }
                    }
                  : {
                      type: 'button_icon_set',
                      blockId: existingButton,
                      slot: 'start',
                      name: 'Home4'
                    },
                {
                  type: 'step_position_set',
                  step: { id: `${journeyId}-step` },
                  x: 421,
                  y: 219
                }
              ]
            })
          )
          const buttonId =
            mode === 'complete-button' ? saved.idMap.new_button : existingButton
          const button = await journeys.block.findUniqueOrThrow({
            where: { id: buttonId }
          })
          const alias =
            reference === 'button-slot'
              ? await journeys.block.create({
                  data: {
                    journeyId,
                    typename: 'ButtonBlock',
                    parentBlockId: `${journeyId}-card`,
                    parentOrder: null,
                    label: 'Later Icon alias',
                    startIconId: button.startIconId,
                    submitEnabled: false
                  }
                })
              : await journeys.block.update({
                  where: { id: `${journeyId}-card` },
                  data: { coverBlockId: button.startIconId }
                })
          const before = await mixedSnapshot()
          const input = await historyInput(saved.historyId!)
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          for (let attempt = 0; attempt < 2; attempt++) {
            const result = await call('journey_undo', input)
            expect(result.text).toContain('HISTORY_CONFLICT')
            expect(acceptance).not.toHaveBeenCalled()
            expect(await mixedSnapshot()).toEqual(before)
          }
          await journeys.block.update({
            where: { id: alias.id },
            data:
              reference === 'button-slot'
                ? { startIconId: null }
                : { coverBlockId: null }
          })
          checkpoint = undefined
          const undoInput = await historyInput(saved.historyId!)
          const undone = receipt(await call('journey_undo', undoInput))
          expect(receipt(await call('journey_undo', undoInput))).toEqual(undone)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: button.startIconId! }
            })
          ).toMatchObject({ deletedAt: expect.any(Date) })
          await historyAction('redo', saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
          ).toMatchObject({ deletedAt: null, startIconId: button.startIconId })
        }
      )

      it.each(['route', 'menu'] as const)(
        'rejects mixed creation undo with a later incoming %s dependency and preserves own route restoration',
        async (dependency) => {
          await seedPresentation()
          const buttonId = `${journeyId}-button`
          const saved = receipt(
            await edit({
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'step_add',
                  key: 'new_step',
                  cardKey: 'new_card',
                  placement: { position: 'end' }
                },
                {
                  type: 'button_set',
                  blockId: buttonId,
                  label: 'Updated label'
                }
              ]
            })
          )
          if (dependency === 'route')
            await journeys.action.create({
              data: { parentBlockId: buttonId, blockId: saved.idMap.new_step }
            })
          else
            await journeys.journey.update({
              where: { id: journeyId },
              data: { menuStepBlockId: saved.idMap.new_step }
            })
          const before = await mixedSnapshot()
          const input = await historyInput(saved.historyId!)
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          const result = await call('journey_undo', input)
          expect(result.text).toContain('HISTORY_CONFLICT')
          expect(acceptance).not.toHaveBeenCalled()
          expect(await mixedSnapshot()).toEqual(before)
          if (dependency === 'route')
            await journeys.action.update({
              where: { parentBlockId: buttonId },
              data: { blockId: `${journeyId}-step` }
            })
          else {
            expect(
              await journeys.journey.findUniqueOrThrow({
                where: { id: journeyId }
              })
            ).toMatchObject({ menuStepBlockId: saved.idMap.new_step })
            await journeys.journey.update({
              where: { id: journeyId },
              data: { menuStepBlockId: null }
            })
          }
          checkpoint = undefined
          await historyAction('undo', saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: saved.idMap.new_step }
            })
          ).toMatchObject({ deletedAt: expect.any(Date) })
          await historyAction('redo', saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: saved.idMap.new_step }
            })
          ).toMatchObject({ deletedAt: null })
        }
      )

      it('rejects mixed expanded layout when the final projection contains Video and preserves saved state', async () => {
        const input = {
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'card_set',
              blockId: `${journeyId}-card`,
              fullscreen: true
            },
            {
              type: 'step_position_set',
              step: { id: `${journeyId}-step` },
              x: 421,
              y: 219
            }
          ]
        }
        const saved = receipt(await edit(input))
        await historyAction('undo', saved.historyId!)
        const video = await journeys.block.create({
          data: {
            journeyId,
            typename: 'VideoBlock',
            parentBlockId: `${journeyId}-card`
          }
        })
        const before = await mixedSnapshot()
        expect(
          (
            await edit({
              ...input,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID()
            })
          ).text
        ).toContain('VALIDATION_FAILED')
        expect(await mixedSnapshot()).toEqual(before)
        const redoInput = await historyInput(saved.historyId!)
        expect((await call('journey_redo', redoInput)).text).toContain(
          'HISTORY_CONFLICT'
        )
        expect(await mixedSnapshot()).toEqual(before)
        await journeys.block.update({
          where: { id: video.id },
          data: { deletedAt: new Date() }
        })
        receipt(
          await call('journey_redo', {
            ...redoInput,
            expectedRevision: await revision()
          })
        )
      })

      it('enforces the current Card chat gate for edits and undo/redo and preserves nullable defaults', async () => {
        const input = {
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'card_chat_set',
              blockId: `${journeyId}-card`,
              enabled: true,
              collapse: false
            }
          ]
        }
        chatEnabled = false
        expect((await call('journey_edit', input)).json.result?.isError).toBe(
          true
        )
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        chatEnabled = true
        const saved = receipt(await call('journey_edit', input))
        chatEnabled = false
        expect(
          (await call('journey_undo', await historyInput(saved.historyId!)))
            .json.result?.isError
        ).toBe(true)
        chatEnabled = true
        await historyAction('undo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: `${journeyId}-card` }
          })
        ).toMatchObject({ showAssistant: null, expandChatByDefault: null })
        chatEnabled = false
        expect(
          (await call('journey_redo', await historyInput(saved.historyId!)))
            .json.result?.isError
        ).toBe(true)
      })

      it('keeps media attached and rejects expanded layout with a Video, including restoration', async () => {
        const input = {
          journeyId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'card_set',
              blockId: `${journeyId}-card`,
              fullscreen: true
            }
          ]
        }
        const saved = receipt(await call('journey_edit', input))
        await historyAction('undo', saved.historyId!)
        const video = await journeys.block.create({
          data: {
            journeyId,
            typename: 'VideoBlock',
            parentBlockId: `${journeyId}-card`
          }
        })
        await journeys.block.update({
          where: { id: `${journeyId}-card` },
          data: { coverBlockId: video.id }
        })
        const before = await revision()
        expect(
          (
            await call('journey_edit', {
              ...input,
              expectedRevision: before,
              idempotencyKey: randomUUID()
            })
          ).json.result?.isError
        ).toBe(true)
        expect(
          (await call('journey_redo', await historyInput(saved.historyId!)))
            .json.result?.isError
        ).toBe(true)
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: `${journeyId}-card` }
          })
        ).toMatchObject({ coverBlockId: video.id })
        expect(await revision()).toBe(before)
      })

      it('keeps declared insertion order at one anchor and supports subsequent batch-local edits', async () => {
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              ...['first', 'second'].map((key) => ({
                type: 'block_add',
                key,
                cardId: `${journeyId}-card`,
                placement: { position: 'after', blockId: `${journeyId}-text` },
                block: { kind: 'button', label: key }
              })),
              { type: 'button_set', blockId: '$first', alignment: 'left' },
              {
                type: 'button_icon_set',
                blockId: '$second',
                slot: 'end',
                name: 'Home4'
              }
            ]
          })
        )
        const live = await journeys.block.findMany({
          where: {
            journeyId,
            parentBlockId: `${journeyId}-card`,
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' }
        })
        expect(live.map(({ id }) => id)).toEqual([
          `${journeyId}-text`,
          saved.idMap.first,
          saved.idMap.second
        ])
        expect(live[1]).toMatchObject({ settings: { alignment: 'left' } })
        await historyAction('undo', saved.historyId!)
        await historyAction('redo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: saved.idMap['second.endIcon'] }
          })
        ).toMatchObject({ name: 'Home4' })
      })

      it('rejects expanded content writes before acceptance without a partial graph', async () => {
        await journeys.block.createMany({
          data: Array.from({ length: 200 }, (_, index) => ({
            journeyId,
            typename: 'SpacerBlock',
            parentBlockId: `${journeyId}-card`,
            parentOrder: index + 1,
            spacing: 100
          }))
        })
        const before = await revision()
        const response = await call('journey_edit', {
          journeyId,
          expectedRevision: before,
          idempotencyKey: randomUUID(),
          commands: [
            {
              type: 'block_add',
              key: 'too_large',
              cardId: `${journeyId}-card`,
              placement: { position: 'before', blockId: `${journeyId}-text` },
              block: { kind: 'button', label: 'Bounded' }
            }
          ]
        })
        expect(response.json.result?.isError).toBe(true)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
        expect(await revision()).toBe(before)
      })

      it.each([
        'button_set',
        'button_icon_start',
        'spacer_set',
        'card_set',
        'card_chat_set'
      ])(
        'rejects foreign ownership and affected-field conflicts for %s',
        async (name) => {
          await seedPresentation()
          const fixture = presentationCase(name)
          const input = {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [fixture.command]
          }
          expect(
            (
              await call('journey_edit', {
                ...input,
                commands: [{ ...fixture.command, blockId: 'foreign-block' }]
              })
            ).json.result?.isError
          ).toBe(true)
          const saved = receipt(await call('journey_edit', input))
          const changes =
            name === 'button_set'
              ? { label: 'Human replacement' }
              : name === 'button_icon_start'
                ? { name: 'Home4' }
                : name === 'spacer_set'
                  ? { spacing: 300 }
                  : name === 'card_set'
                    ? { backgroundColor: '#654321' }
                    : { showAssistant: false }
          await journeys.block.update({
            where: { id: fixture.targetId },
            data: changes
          })
          expect(
            (await call('journey_undo', await historyInput(saved.historyId!)))
              .text
          ).toContain('HISTORY_CONFLICT')
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: fixture.targetId }
            })
          ).toMatchObject(changes)
          const before = await revision()
          const context = await management()
          expect((await context.post('disconnect')).status).toBe(200)
          expect(
            (
              await call('journey_edit', {
                ...input,
                expectedRevision: before,
                idempotencyKey: randomUUID()
              })
            ).json.result?.isError
          ).toBe(true)
          expect(await revision()).toBe(before)
        }
      )

      it.each(['typography', 'button', 'spacer'])(
        'rejects foreign parents, stale revisions, View only and publication for %s creation',
        async (kind) => {
          const input = {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'block_add',
                key: 'content',
                cardId: `${journeyId}-card`,
                placement: { position: 'end' },
                block:
                  kind === 'typography'
                    ? { kind, content: 'Text' }
                    : kind === 'button'
                      ? { kind, label: 'Continue' }
                      : { kind, spacing: 200 }
              }
            ]
          }
          for (const cardId of ['foreign-card', `${journeyId}-step`])
            expect(
              (
                await call('journey_edit', {
                  ...input,
                  commands: [{ ...input.commands[0], cardId }]
                })
              ).json.result?.isError
            ).toBe(true)
          const view = await consent('alice', [journeyId], 'view')
          expect(
            (await call('journey_edit', input, view)).json.result?.isError
          ).toBe(true)
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: { content: 'Later Admin edit' }
          })
          expect((await call('journey_edit', input)).text).toContain(
            'REVISION_CONFLICT'
          )
          await journeys.journey.update({
            where: { id: journeyId },
            data: {
              status: 'published',
              publishedAt: new Date(),
              firstPublishedAt: new Date()
            }
          })
          const before = await revision()
          expect(
            (await call('journey_edit', { ...input, expectedRevision: before }))
              .text
          ).toContain('NOT_EDITABLE')
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
          expect(await revision()).toBe(before)
        }
      )

      it.each(['undo', 'redo'] as const)(
        'rejects %s after a human aliases an edited Icon into another slot',
        async (direction) => {
          await seedPresentation()
          const buttonId = `${journeyId}-button`
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'button_icon_set',
                  blockId: buttonId,
                  slot: 'start',
                  name: 'CheckCircleRounded'
                }
              ]
            })
          )
          if (direction === 'redo')
            await historyAction('undo', saved.historyId!)
          await journeys.block.update({
            where: { id: buttonId },
            data: { endIconId: `${buttonId}-start` }
          })
          const before = await revision()
          expect(
            (
              await call(
                `journey_${direction}`,
                await historyInput(saved.historyId!)
              )
            ).text
          ).toContain('HISTORY_CONFLICT')
          expect(await revision()).toBe(before)
          await journeys.block.update({
            where: { id: buttonId },
            data: { endIconId: `${buttonId}-end` }
          })
          await journeys.block.create({
            data: {
              journeyId,
              typename: 'ButtonBlock',
              parentBlockId: `${journeyId}-card`,
              parentOrder: 3,
              startIconId: `${buttonId}-start`,
              label: 'Later dependent button'
            }
          })
          expect(
            (
              await call(
                `journey_${direction}`,
                await historyInput(saved.historyId!)
              )
            ).text
          ).toContain('HISTORY_CONFLICT')
        }
      )

      it.each(['another-submit', 'missing-response'])(
        'rejects submit creation redo after %s changes its required form semantics',
        async (change) => {
          const response = await journeys.block.create({
            data: {
              journeyId,
              typename: 'TextResponseBlock',
              parentBlockId: `${journeyId}-card`,
              parentOrder: 1
            }
          })
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'block_add',
                  key: 'submit',
                  cardId: `${journeyId}-card`,
                  placement: { position: 'end' },
                  block: { kind: 'button', label: 'Send' }
                }
              ]
            })
          )
          await historyAction('undo', saved.historyId!)
          if (change === 'another-submit')
            await journeys.block.create({
              data: {
                journeyId,
                typename: 'ButtonBlock',
                parentBlockId: `${journeyId}-card`,
                parentOrder: 9,
                label: 'Human submit',
                submitEnabled: true
              }
            })
          else
            await journeys.block.update({
              where: { id: response.id },
              data: { deletedAt: new Date() }
            })
          const before = await revision()
          expect(
            (await call('journey_redo', await historyInput(saved.historyId!)))
              .text
          ).toContain('HISTORY_CONFLICT')
          expect(
            await journeys.block.count({
              where: { id: { in: Object.values(saved.idMap) }, deletedAt: null }
            })
          ).toBe(0)
          expect(await revision()).toBe(before)
        }
      )

      it('counts distinct affected objects when repeated insertions shift the same siblings', async () => {
        await journeys.block.createMany({
          data: Array.from({ length: 100 }, (_, index) => ({
            journeyId,
            typename: 'SpacerBlock',
            parentBlockId: `${journeyId}-card`,
            parentOrder: index + 1,
            spacing: 100
          }))
        })
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: ['first', 'second'].map((key) => ({
              type: 'block_add',
              key,
              cardId: `${journeyId}-card`,
              placement: { position: 'before', blockId: `${journeyId}-text` },
              block: { kind: 'spacer', spacing: 200 }
            }))
          })
        )
        expect(saved.changedFields).toHaveLength(103)
        await historyAction('undo', saved.historyId!)
        await historyAction('redo', saved.historyId!)
      })

      it('rechecks the feature flag immediately before final chat acceptance', async () => {
        checkpoint = async (point) => {
          if (point === 'before_accept') chatEnabled = false
        }
        const before = await revision()
        expect(
          (
            await call('journey_edit', {
              journeyId,
              expectedRevision: before,
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'card_chat_set',
                  blockId: `${journeyId}-card`,
                  enabled: true,
                  collapse: false
                }
              ]
            })
          ).json.result?.isError
        ).toBe(true)
        expect(await revision()).toBe(before)
        expect(await counts()).toEqual({
          operations: 0,
          history: 0,
          effects: 0
        })
      })

      it.each([
        'typography',
        'button',
        'button-change',
        'icon',
        'spacer',
        'card',
        'chat',
        'local-label',
        'local-icon'
      ])(
        'rejects duplicate requested %s fields atomically, including no-ops and local references',
        async (kind) => {
          await seedPresentation()
          const buttonId = `${journeyId}-button`
          const command =
            kind === 'typography'
              ? {
                  type: 'typography_set',
                  blockId: `${journeyId}-text`,
                  content: 'Original heading'
                }
              : kind.startsWith('button')
                ? {
                    type: 'button_set',
                    blockId: buttonId,
                    label: kind === 'button' ? 'Original button' : 'First'
                  }
                : kind === 'icon'
                  ? {
                      type: 'button_icon_set',
                      blockId: buttonId,
                      slot: 'start',
                      name: 'Home4'
                    }
                  : kind === 'spacer'
                    ? {
                        type: 'spacer_set',
                        blockId: `${journeyId}-spacer`,
                        spacing: 100
                      }
                    : kind === 'card'
                      ? {
                          type: 'card_set',
                          blockId: `${journeyId}-card`,
                          themeMode: 'light'
                        }
                      : {
                          type: 'card_chat_set',
                          blockId: `${journeyId}-card`,
                          enabled: true,
                          collapse: false
                        }
          const commands =
            kind === 'local-label' || kind === 'local-icon'
              ? [
                  {
                    type: 'block_add',
                    key: 'created',
                    cardId: `${journeyId}-card`,
                    placement: { position: 'end' },
                    block: {
                      kind: 'button',
                      label: 'First',
                      startIcon: { name: 'Home4' }
                    }
                  },
                  kind === 'local-label'
                    ? {
                        type: 'button_set',
                        blockId: '$created',
                        label: 'Second'
                      }
                    : {
                        type: 'button_icon_set',
                        blockId: '$created',
                        slot: 'start',
                        name: 'ArrowForwardRounded'
                      }
                ]
              : [
                  command,
                  kind === 'button-change'
                    ? { ...command, label: 'Second' }
                    : command
                ]
          const before = await journeys.block.findMany({
            where: { journeyId },
            orderBy: { id: 'asc' }
          })
          const current = await revision()
          const response = await call('journey_edit', {
            journeyId,
            expectedRevision: current,
            idempotencyKey: randomUUID(),
            commands
          })
          expect(response.json.result?.isError).toBe(true)
          expect(
            await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            })
          ).toEqual(before)
          expect(await revision()).toBe(current)
          expect(await counts()).toEqual({
            operations: 0,
            history: 0,
            effects: 0
          })
          expect(
            await journeys.mcpEditAudit.count({ where: { journeyId } })
          ).toBe(0)
        }
      )

      it('accepts disjoint fields on one Button and its distinct owned Icon slots in one saved batch', async () => {
        await seedPresentation()
        const buttonId = `${journeyId}-button`
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              { type: 'button_set', blockId: buttonId, label: 'Continue' },
              { type: 'button_set', blockId: buttonId, alignment: 'left' },
              { type: 'button_set', blockId: buttonId, color: 'secondary' },
              {
                type: 'button_icon_set',
                blockId: buttonId,
                slot: 'start',
                name: 'CheckCircleRounded'
              },
              {
                type: 'button_icon_set',
                blockId: buttonId,
                slot: 'start',
                color: 'error'
              },
              {
                type: 'button_icon_set',
                blockId: buttonId,
                slot: 'end',
                name: 'Home4',
                color: 'primary'
              }
            ]
          })
        )
        await historyAction('undo', saved.historyId!)
        expect(
          await journeys.block.findMany({
            where: {
              id: { in: [buttonId, `${buttonId}-start`, `${buttonId}-end`] }
            },
            orderBy: { id: 'asc' },
            select: { id: true, color: true }
          })
        ).toEqual([
          { id: buttonId, color: 'primary' },
          { id: `${buttonId}-end`, color: null },
          { id: `${buttonId}-start`, color: 'inherit' }
        ])
        await historyAction('redo', saved.historyId!)
        expect(
          await journeys.block.findUniqueOrThrow({ where: { id: buttonId } })
        ).toMatchObject({
          label: 'Continue',
          color: 'secondary',
          settings: { alignment: 'left' }
        })
        expect(
          await journeys.block.findMany({
            where: { id: { in: [`${buttonId}-start`, `${buttonId}-end`] } },
            orderBy: { id: 'asc' },
            select: { id: true, color: true }
          })
        ).toEqual([
          { id: `${buttonId}-end`, color: 'primary' },
          { id: `${buttonId}-start`, color: 'error' }
        ])
      })

      it('retains safe undo/redo for legacy sequential descriptors while new duplicate saves are rejected', async () => {
        const input = await editInput('Final')
        const saved = receipt(await edit(input))
        const legacyInput = {
          ...input,
          commands: [
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              content: 'Intermediate'
            },
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              content: 'Final'
            }
          ]
        }
        await journeys.mcpEditOperation.update({
          where: { id: saved.operationId },
          data: { payloadHash: canonicalFingerprint(legacyInput) }
        })
        await journeys.mcpEditHistory.update({
          where: { id: saved.historyId! },
          data: {
            changes: [
              {
                type: 'typography_restore',
                blockId: `${journeyId}-text`,
                parent: {
                  cardId: `${journeyId}-card`,
                  stepId: `${journeyId}-step`
                },
                fields: [
                  {
                    field: 'content',
                    before: 'Original heading',
                    after: 'Intermediate',
                    beforePresent: true
                  }
                ]
              },
              {
                type: 'typography_restore',
                blockId: `${journeyId}-text`,
                parent: {
                  cardId: `${journeyId}-card`,
                  stepId: `${journeyId}-step`
                },
                fields: [
                  {
                    field: 'content',
                    before: 'Intermediate',
                    after: 'Final',
                    beforePresent: true
                  }
                ]
              }
            ]
          }
        })
        await historyAction('undo', saved.historyId!)
        expect(await textBlock()).toMatchObject({ content: 'Original heading' })
        await historyAction('redo', saved.historyId!)
        expect(await textBlock()).toMatchObject({ content: 'Final' })
        expect(receipt(await call('journey_edit', legacyInput))).toEqual(saved)
      })

      async function history(accessToken = token, url = mcpUrl) {
        const response = await call(
          'journey_history',
          { journeyId },
          accessToken,
          url
        )
        expect(response.json.result?.isError, response.text).not.toBe(true)
        return historyResult.parse(response.json.result?.structuredContent)
      }
      async function historyInput(entryId: string) {
        return {
          journeyId,
          entryId,
          expectedRevision: await revision(),
          idempotencyKey: randomUUID()
        }
      }
      async function historyAction(
        direction: 'undo' | 'redo',
        entryId: string
      ) {
        return receipt(
          await call(`journey_${direction}`, await historyInput(entryId))
        )
      }
      async function textBlock() {
        return journeys.block.findUniqueOrThrow({
          where: { id: `${journeyId}-text` }
        })
      }

      it('undoes a multi-command batch across new chats and service replicas, then redoes the same IDs', async () => {
        const input = {
          ...(await editInput()),
          commands: [
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              content: 'Final'
            },
            {
              type: 'typography_set',
              blockId: `${journeyId}-text`,
              variant: 'h1'
            }
          ]
        }
        const saved = receipt(await call('journey_edit', input))
        const second = await replica()
        restartOwner()
        const stack = await history(token, second)
        expect(stack.entries).toEqual([
          expect.objectContaining({ entryId: saved.historyId, state: 'undo' })
        ])
        const before = await revision()
        const undone = receipt(
          await call(
            'journey_undo',
            await historyInput(stack.undoEntryId!),
            token,
            second
          )
        )
        expect(BigInt(undone.committedRevision)).toBe(BigInt(before) + 1n)
        expect(await textBlock()).toMatchObject({
          id: `${journeyId}-text`,
          content: 'Original heading',
          variant: 'h2'
        })
        expect((await history()).redoEntryId).toBe(saved.historyId)
        restartOwner()
        const redone = await historyAction('redo', saved.historyId!)
        expect(redone.historyId).toBe(saved.historyId)
        expect(redone.warnings.join(' ')).toContain(
          'no upload, generation or provider effects'
        )
        expect(await textBlock()).toMatchObject({
          content: 'Final',
          variant: 'h1'
        })
        expect(await counts()).toEqual({
          operations: 3,
          history: 1,
          effects: 3
        })
      })

      it('keeps two separately saved batches as two steps and preserves unrelated human fields, layout, Host and routes', async () => {
        const first = receipt(await edit(await editInput('First')))
        const second = receipt(await edit(await editInput('Second')))
        const host = await journeys.host.create({
          data: { teamId: 'edit-team-alice', title: 'Human Host' }
        })
        await journeys.journey.update({
          where: { id: journeyId },
          data: { hostId: host.id }
        })
        await journeys.block.update({
          where: { id: `${journeyId}-step` },
          data: { x: 345, y: 678, nextBlockId: `${journeyId}-step` }
        })
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { align: 'right', settings: { color: '#654321', human: true } }
        })
        await historyAction('undo', second.historyId!)
        expect(await textBlock()).toMatchObject({
          content: 'First',
          align: 'right',
          settings: { color: '#654321', human: true }
        })
        await historyAction('undo', first.historyId!)
        expect(await textBlock()).toMatchObject({
          content: 'Original heading',
          align: 'right'
        })
        expect(
          await journeys.journey.findUniqueOrThrow({ where: { id: journeyId } })
        ).toMatchObject({ hostId: host.id })
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: `${journeyId}-step` }
          })
        ).toMatchObject({ x: 345, y: 678, nextBlockId: `${journeyId}-step` })
        expect((await history()).entries.map((entry) => entry.state)).toEqual([
          'redo',
          'redo'
        ])
        await historyAction('redo', first.historyId!)
        await historyAction('redo', second.historyId!)
        expect(await textBlock()).toMatchObject({
          content: 'Second',
          align: 'right'
        })
      })

      it.each(['affected-field', 'parent', 'deleted-parent', 'redo-field'])(
        'rejects a %s conflict atomically after a fresh revision read',
        async (kind) => {
          const saved = receipt(await edit(await editInput()))
          if (kind === 'redo-field')
            await historyAction('undo', saved.historyId!)
          if (kind === 'affected-field' || kind === 'redo-field')
            await journeys.block.update({
              where: { id: `${journeyId}-text` },
              data: { content: 'Human conflict' }
            })
          else if (kind === 'deleted-parent')
            await journeys.block.update({
              where: { id: `${journeyId}-card` },
              data: { deletedAt: new Date() }
            })
          else {
            await journeys.block.create({
              data: {
                id: `${journeyId}-second-step`,
                journeyId,
                typename: 'StepBlock',
                parentOrder: 1
              }
            })
            await journeys.block.update({
              where: { id: `${journeyId}-card` },
              data: { parentBlockId: `${journeyId}-second-step` }
            })
          }
          const before = await counts()
          const current = await revision()
          const stack = await history()
          const response = await call(
            kind === 'redo-field' ? 'journey_redo' : 'journey_undo',
            await historyInput(saved.historyId!)
          )
          expect(response.text).toContain('HISTORY_CONFLICT')
          expect(await revision()).toBe(current)
          expect(await counts()).toEqual(before)
          expect(await history()).toEqual(stack)
        }
      )

      it.each([null, {}, { color: null }, { color: { legacy: true } }])(
        'restores sparse color presence from %j while preserving later unrelated settings',
        async (settings) => {
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: { settings: settings === null ? Prisma.JsonNull : settings }
          })
          const input = {
            ...(await editInput()),
            commands: [
              {
                type: 'typography_set',
                blockId: `${journeyId}-text`,
                color: '#abcdef'
              }
            ]
          }
          const saved = receipt(await call('journey_edit', input))
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: { settings: { color: '#abcdef', human: 'later' } }
          })
          await historyAction('undo', saved.historyId!)
          expect((await textBlock()).settings).toEqual({
            ...(settings ?? {}),
            human: 'later'
          })
          await historyAction('redo', saved.historyId!)
          expect((await textBlock()).settings).toEqual({
            color: '#abcdef',
            human: 'later'
          })
        }
      )

      it('clears only the redo tail on a new commit, preserving historical receipts and failed/replayed requests', async () => {
        const aInput = await editInput('A')
        const a = receipt(await edit(aInput))
        const b = receipt(await edit(await editInput('B')))
        await historyAction('undo', b.historyId!)
        const stack = await history()
        expect(
          (await edit({ ...(await editInput('C')), expectedRevision: '0' }))
            .text
        ).toContain('REVISION_CONFLICT')
        expect(receipt(await edit(aInput))).toEqual(a)
        expect(await history()).toEqual(stack)
        const c = receipt(await edit(await editInput('C')))
        expect((await history()).entries.map((entry) => entry.entryId)).toEqual(
          [a.historyId, c.historyId]
        )
        expect(
          (await call('journey_redo', await historyInput(b.historyId!))).text
        ).toContain('HISTORY_UNAVAILABLE')
        expect(
          receipt(
            await call('journey_operation_get', {
              journeyId,
              operationId: b.operationId
            })
          )
        ).toEqual(b)
        expect(
          await journeys.mcpEditAudit.findFirst({
            where: { operationId: b.operationId }
          })
        ).toMatchObject({ action: 'journey_edit' })
      })

      it.each(['undo', 'redo'] as const)(
        'recovers one %s after response loss, concurrent retries, restart and renewal',
        async (direction) => {
          const saved = receipt(await edit(await editInput()))
          if (direction === 'redo')
            await historyAction('undo', saved.historyId!)
          const input = await historyInput(saved.historyId!)
          const before = await revision()
          discardSavedResponse = true
          expect(
            (await call(`journey_${direction}`, input)).json.result?.isError
          ).toBe(true)
          const once = await counts()
          const second = await replica()
          restartOwner()
          const results = await Promise.all([
            call(`journey_${direction}`, input),
            call(`journey_${direction}`, input, token, second)
          ])
          const original = receipt(results[0])
          expect(receipt(results[1])).toEqual(original)
          expect(BigInt(await revision())).toBe(BigInt(before) + 1n)
          expect(await counts()).toEqual(once)
          await renew()
          expect(receipt(await call(`journey_${direction}`, input))).toEqual(
            original
          )
          expect(
            (
              await call(`journey_${direction}`, {
                ...input,
                expectedRevision: await revision()
              })
            ).text
          ).toContain('IDEMPOTENCY_KEY_REUSED')
          expect(
            (
              await call(
                direction === 'undo' ? 'journey_redo' : 'journey_undo',
                input
              )
            ).text
          ).toContain('IDEMPOTENCY_KEY_REUSED')
          expect(
            (
              await call('journey_edit', {
                ...(await editInput()),
                idempotencyKey: input.idempotencyKey
              })
            ).text
          ).toContain('IDEMPOTENCY_KEY_REUSED')
          for (const extra of [
            { hostId: 'injected' },
            { inverse: { content: 'injected' } },
            { commands: [] }
          ])
            expect(
              (await call(`journey_${direction}`, { ...input, ...extra })).text
            ).toContain('VALIDATION_FAILED')
          expect(await counts()).toEqual(once)
        }
      )

      it.each([
        'after_content',
        'after_revision',
        'after_history',
        'after_receipt',
        'after_outbox',
        'before_commit'
      ] as const)(
        'rolls back undo content, cursor and replay records at %s',
        async (point) => {
          const saved = receipt(await edit(await editInput()))
          const stack = await history()
          const input = await historyInput(saved.historyId!)
          const before = await counts()
          checkpoint = async (at) => {
            if (at === point) throw new Error('Controlled history rollback')
          }
          expect((await call('journey_undo', input)).json.result?.isError).toBe(
            true
          )
          checkpoint = undefined
          expect(await counts()).toEqual(before)
          expect(await history()).toEqual(stack)
          receipt(await call('journey_undo', input))
          expect(await textBlock()).toMatchObject({
            content: 'Original heading'
          })
        }
      )

      it('enforces five entries across both directions with independent connection and journey capacity', async () => {
        const inputs = []
        const saved = []
        for (let index = 1; index <= 6; index++) {
          const input = await editInput(`Batch ${index}`)
          inputs.push(input)
          saved.push(receipt(await edit(input)))
        }
        expect((await history()).entries.map((entry) => entry.entryId)).toEqual(
          saved.slice(1).map((entry) => entry.historyId)
        )
        await historyAction('undo', saved[5].historyId!)
        await historyAction('undo', saved[4].historyId!)
        expect((await history()).entries).toHaveLength(5)
        const connectionToken = token
        const fresh = await consent('alice', [journeyId])
        expect((await history(fresh)).entries).toEqual([])
        receipt(await edit(await editInput('Other connection'), fresh))
        expect((await history(connectionToken)).entries).toHaveLength(5)
        token = connectionToken
        // Restore the affected value through the human path before continuing the original stack.
        await journeys.block.update({
          where: { id: `${journeyId}-text` },
          data: { content: 'Batch 4' }
        })
        const c = receipt(await edit(await editInput('C')))
        expect((await history()).entries.map((entry) => entry.entryId)).toEqual(
          [...saved.slice(1, 4).map((entry) => entry.historyId), c.historyId]
        )
        const before = await counts()
        restartOwner()
        expect(receipt(await edit(inputs[0]))).toEqual(saved[0])
        expect(await counts()).toEqual(before)
        expect(
          (await call('journey_undo', await historyInput(saved[0].historyId!)))
            .text
        ).toContain('HISTORY_UNAVAILABLE')
      })

      it('keeps eligible inverses usable past result and audit expiry without reviving accepted keys', async () => {
        const input = await editInput()
        const saved = receipt(await edit(input))
        clock = new Date(new Date(saved.completedAt).getTime() + 31 * day)
        await ownerHandler.cleanup()
        expect((await edit(input)).text).toContain('RESULT_EXPIRED')
        expect((await history()).undoEntryId).toBe(saved.historyId)
        const undone = await historyAction('undo', saved.historyId!)
        await auth.securityAudit.updateMany({
          where: { journeyIds: { has: journeyId } },
          data: { expiresAt: new Date(0) }
        })
        await cleanup(auth)
        await journeys.mcpEditAudit.updateMany({
          where: { journeyId },
          data: { expiresAt: new Date(0) }
        })
        await ownerHandler.cleanup()
        expect(
          await journeys.mcpEditAudit.count({ where: { journeyId } })
        ).toBe(0)
        expect((await history()).redoEntryId).toBe(saved.historyId)
        await historyAction('redo', saved.historyId!)
        expect((await edit(input)).text).toContain('RESULT_EXPIRED')
        expect(
          await journeys.mcpEditOperation.findUnique({
            where: { id: undone.operationId }
          })
        ).not.toBeNull()
      })

      it.each([-1, 0, 1])(
        'uses the exact 30-day cutoff at offset %i for renewal and cleanup',
        async (offset) => {
          const now = new Date()
          const time = vi
            .spyOn(
              await vi.importActual<typeof import('../src/store')>(
                '../src/store'
              ),
              'databaseTime'
            )
            .mockResolvedValue(now)
          try {
            const input = await editInput()
            const saved = receipt(await edit(input))
            const context = await management()
            const expiry = new Date(now.getTime() - 30 * day - offset)
            await auth.agentConnection.update({
              where: { id: context.connection.id },
              data: { expiresAt: expiry }
            })
            expect(
              (await call('journey_history', { journeyId })).text
            ).not.toContain(saved.historyId!)
            expect(
              (await call('journey_undo', await historyInput(saved.historyId!)))
                .text
            ).not.toContain('historical_receipt')
            await ownerHandler.cleanup()
            await ownerHandler.cleanup()
            await renew()
            expect((await history()).entries).toHaveLength(offset < 0 ? 1 : 0)
            if (offset < 0) {
              const undoInput = await historyInput(saved.historyId!)
              const undone = receipt(await call('journey_undo', undoInput))
              await renew()
              expect(receipt(await call('journey_undo', undoInput))).toEqual(
                undone
              )
            } else {
              expect(
                (
                  await call(
                    'journey_undo',
                    await historyInput(saved.historyId!)
                  )
                ).text
              ).toContain('HISTORY_UNAVAILABLE')
            }
            expect(await textBlock()).toMatchObject({
              content: offset < 0 ? 'Original heading' : 'Saved heading'
            })
            expect(
              await journeys.mcpEditOperation.findUnique({
                where: { id: saved.operationId }
              })
            ).not.toBeNull()
          } finally {
            time.mockRestore()
          }
        }
      )

      it('denies another connection and missing role, retains history through role restoration and view/remove/re-add', async () => {
        const saved = receipt(await edit(await editInput()))
        const original = token
        const other = await consent('alice', [journeyId])
        expect((await history(other)).entries).toEqual([])
        expect(
          (
            await call(
              'journey_undo',
              await historyInput(saved.historyId!),
              other
            )
          ).text
        ).toContain('HISTORY_UNAVAILABLE')
        token = original
        const membership = await journeys.userTeam.findFirstOrThrow({
          where: { userId: 'alice', teamId: 'edit-team-alice' }
        })
        await journeys.userTeam.delete({ where: { id: membership.id } })
        expect(
          (await call('journey_history', { journeyId })).text
        ).not.toContain(saved.historyId!)
        expect(
          (await call('journey_undo', await historyInput(saved.historyId!)))
            .text
        ).not.toContain('historical_receipt')
        await journeys.userTeam.create({ data: membership })
        expect((await history()).undoEntryId).toBe(saved.historyId)
        // The fixture's management helper selects the latest connection.
        await auth.agentConnection.update({
          where: {
            id: (
              await journeys.mcpEditOperation.findUniqueOrThrow({
                where: { id: saved.operationId }
              })
            ).namespaceId
          },
          data: { approvedAt: new Date() }
        })
        const originalExpiry = (await management()).connection.expiresAt
        async function setAccess(journeyIds: string[], mode: string) {
          const context = await management()
          const review = await context.post('access-review', {
            journeyIds,
            mode
          })
          expect(review.status, await review.clone().text()).toBe(200)
          const reviewed = z
            .object({ reviewToken: z.string() })
            .parse(await review.json())
          expect(
            (
              await context.post('access-approve', {
                reviewToken: reviewed.reviewToken
              })
            ).status
          ).toBe(200)
          return auth.agentConnection.findUniqueOrThrow({
            where: { id: context.connection.id }
          })
        }
        let current = await setAccess([journeyId], 'view')
        token = await consent('alice', [journeyId], 'view', current)
        expect((await history()).entries).toHaveLength(1)
        expect((await history()).undoEntryId).toBeNull()
        expect(
          (await call('journey_undo', await historyInput(saved.historyId!)))
            .json.result?.isError
        ).toBe(true)
        const decoyId = journeyId + '-decoy'
        await journeys.journey.create({
          data: {
            id: decoyId,
            slug: decoyId,
            title: 'Other selected draft',
            languageId: '529',
            teamId: 'edit-team-alice',
            status: 'draft'
          }
        })
        eligible.set('alice', [journeyId, decoyId])
        current = await setAccess([decoyId], 'view')
        token = await consent('alice', [decoyId], 'view', current)
        expect(
          (await call('journey_history', { journeyId })).text
        ).not.toContain(saved.historyId!)
        current = await setAccess([journeyId], 'edit')
        token = await consent('alice', [journeyId], 'edit', current)
        expect(current.expiresAt).toEqual(originalExpiry)
        expect((await history()).undoEntryId).toBe(saved.historyId)
        await historyAction('undo', saved.historyId!)
      })

      it.each(['undo', 'redo'] as const)(
        'denies %s after publication wins the owning lock',
        async (direction) => {
          const saved = receipt(await edit(await editInput()))
          if (direction === 'redo')
            await historyAction('undo', saved.historyId!)
          const input = await historyInput(saved.historyId!)
          const pause = barrier()
          checkpoint = async (point) => {
            if (point === 'execution_prepared') await pause.pause()
          }
          const action = call(`journey_${direction}`, input)
          await pause.ready
          await journeys.journey.update({
            where: { id: journeyId },
            data: {
              status: 'published',
              publishedAt: new Date(),
              firstPublishedAt: new Date()
            }
          })
          const before = await counts()
          pause.resume()
          expect((await action).text).toContain('NOT_EDITABLE')
          checkpoint = undefined
          expect(await counts()).toEqual(before)
          expect(
            (await call('journey_history', { journeyId })).text
          ).not.toContain(saved.historyId!)
        }
      )

      it.each(['before_accept', 'after_accept'] as const)(
        'disconnects with both stack directions at %s and purges after positive settlement',
        async (point) => {
          const a = receipt(await edit(await editInput('A')))
          const b = receipt(await edit(await editInput('B')))
          await historyAction('undo', b.historyId!)
          expect((await history()).entries.map((entry) => entry.state)).toEqual(
            ['undo', 'redo']
          )
          const context = await management()
          const input = await historyInput(a.historyId!)
          const pause = barrier()
          checkpoint = async (at) => {
            if (at === point) await pause.pause()
          }
          const action = call('journey_undo', input)
          await pause.ready
          const disconnect = await context.post('disconnect')
          expect(disconnect.status, await disconnect.clone().text()).toBe(200)
          if (point === 'after_accept') {
            expect(
              await auth.connectionChange.findFirst({
                where: { connectionId: context.connection.id },
                orderBy: { requestedAt: 'desc' }
              })
            ).toMatchObject({ status: 'pending' })
          }
          expect(
            (await call('journey_history', { journeyId })).text
          ).not.toContain(a.historyId!)
          pause.resume()
          expect((await action).text).not.toContain('historical_receipt')
          checkpoint = undefined
          await ownerHandler.reconcile()
          await eventually(async () =>
            Boolean(
              await auth.connectionHistoryPurge.findUnique({
                where: { connectionId: context.connection.id }
              })
            )
          )
          lifecycleOutage = true
          expect(await ownerHandler.cleanup()).toBeGreaterThan(0)
          lifecycleOutage = false
          expect(await ownerHandler.cleanup()).toBe(0)
          expect(await ownerHandler.cleanup()).toBe(0)
          expect(
            await journeys.mcpEditHistory.count({
              where: { namespaceId: context.connection.id }
            })
          ).toBe(0)
          expect(
            await journeys.mcpEditOperation.findUnique({
              where: { id: a.operationId }
            })
          ).not.toBeNull()
          expect(
            await journeys.mcpEditAudit.findFirst({
              where: { operationId: b.operationId }
            })
          ).not.toBeNull()
          expect(await textBlock()).toMatchObject({
            content: point === 'after_accept' ? 'Original heading' : 'A'
          })
          const next = await consent('alice', [journeyId])
          expect((await history(next)).entries).toEqual([])
          expect(
            (await call('journey_undo', await historyInput(a.historyId!), next))
              .text
          ).toContain('HISTORY_UNAVAILABLE')
        }
      )

      it.each(['before', 'after'] as const)(
        'checks fixed expiry %s undo acceptance and requires fresh output authority',
        async (side) => {
          const saved = receipt(await edit(await editInput()))
          const context = await management()
          const input = await historyInput(saved.historyId!)
          const pause = barrier()
          checkpoint = async (point) => {
            if (
              point === (side === 'before' ? 'before_accept' : 'after_accept')
            )
              await pause.pause()
          }
          const action = call('journey_undo', input)
          await pause.ready
          await auth.agentConnection.update({
            where: { id: context.connection.id },
            data: { expiresAt: new Date(Date.now() - 1) }
          })
          pause.resume()
          expect((await action).text).not.toContain('historical_receipt')
          checkpoint = undefined
          expect(await textBlock()).toMatchObject({
            content: side === 'after' ? 'Original heading' : 'Saved heading'
          })
          expect(
            (await call('journey_history', { journeyId })).text
          ).not.toContain(saved.historyId!)
          await renew()
          if (side === 'after') {
            const before = await counts()
            receipt(await call('journey_undo', input))
            expect(await counts()).toEqual(before)
          } else receipt(await call('journey_undo', input))
          expect((await history()).redoEntryId).toBe(saved.historyId)
        }
      )

      it('denies buffered history and conflict output after withdrawal', async () => {
        const saved = receipt(await edit(await editInput()))
        const context = await management()
        const pause = barrier()
        beforeOutput = async () => {
          beforeOutput = undefined
          await pause.pause()
        }
        const listing = call('journey_history', { journeyId })
        await pause.ready
        expect((await context.post('disconnect')).status).toBe(200)
        pause.resume()
        expect((await listing).text).not.toContain(saved.historyId!)
      })

      it.each(
        (['content', 'variant', 'align'] as const).flatMap((field) =>
          [42, true, {}, []].map((before) => ({ field, before }))
        )
      )(
        'rejects retained Typography history with prior $field=$before before undo acceptance',
        async ({ field, before }) => {
          const saved = receipt(await edit(await editInput()))
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          const block = await textBlock()
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: {
              changes: [
                {
                  type: 'typography_restore',
                  blockId: block.id,
                  parent: {
                    cardId: `${journeyId}-card`,
                    stepId: `${journeyId}-step`
                  },
                  fields: [
                    { field, before, after: block[field], beforePresent: true }
                  ]
                }
              ]
            }
          })
          const snapshot = async () => ({
            blocks: await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            revision: await revision(),
            cursor: await history(),
            entries: await journeys.mcpEditHistory.findMany({
              where: { journeyId },
              orderBy: { ordinal: 'asc' }
            }),
            operations: await journeys.mcpEditOperation.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            counts: await counts(),
            audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
          })
          const unchanged = await snapshot()
          const input = await historyInput(entry.id)
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          for (let attempt = 0; attempt < 2; attempt++) {
            const response = await call('journey_undo', input)
            expect(response.json.result?.isError).toBe(true)
            expect(response.text).toContain('HISTORY_UNAVAILABLE')
            expect(acceptance).not.toHaveBeenCalled()
            expect(await snapshot()).toEqual(unchanged)
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          const undone = receipt(await call('journey_undo', input))
          expect(acceptance).toHaveBeenCalled()
          expect((await textBlock()).content).toBe('Original heading')
          expect((await history()).redoEntryId).toBe(entry.id)
          const afterUndo = await snapshot()
          expect(receipt(await call('journey_undo', input))).toEqual(undone)
          expect(await snapshot()).toEqual(afterUndo)
        }
      )

      it.each([
        { field: 'variant', after: 'not-a-variant' },
        { field: 'align', after: 'justify' },
        { field: 'settings.color', after: 'red' },
        { field: 'settings.color', after: '#abcdef00' },
        { field: 'content', after: 'x'.repeat(262145) }
      ])(
        'rejects malformed retained Typography forward $field before redo acceptance and recovers after repair',
        async ({ field, after }) => {
          const original = {
            content: 'Legacy heading',
            variant: 'legacy-variant',
            align: 'legacy-align',
            settings: { color: { retained: ['legacy', 42] }, human: 'preserve' }
          }
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: original
          })
          const saved = receipt(
            await edit({
              ...(await editInput()),
              commands: [
                {
                  type: 'typography_set',
                  blockId: `${journeyId}-text`,
                  content: 'Saved heading',
                  variant: 'h1',
                  align: 'center',
                  color: '#ABCDEF'
                }
              ]
            })
          )
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          await historyAction('undo', entry.id)
          expect(await textBlock()).toMatchObject(original)
          const changes = structuredClone(
            entry.changes
          ) as unknown as TypographyInverse[]
          expect(changes[0].type).toBe('typography_restore')
          const changedField = changes[0].fields.find(
            (change) => change.field === field
          )!
          expect(changedField).toBeDefined()
          changedField.after = after
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: changes as unknown as Prisma.InputJsonValue }
          })
          const snapshot = async () => ({
            blocks: await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            revision: await revision(),
            cursor: await history(),
            entries: await journeys.mcpEditHistory.findMany({
              where: { journeyId },
              orderBy: { ordinal: 'asc' }
            }),
            operations: await journeys.mcpEditOperation.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            counts: await counts(),
            audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
          })
          const before = await snapshot()
          const input = await historyInput(entry.id)
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          for (let attempt = 0; attempt < 2; attempt++) {
            const response = await call('journey_redo', input)
            expect(response.json.result?.isError).toBe(true)
            expect(response.text).toContain('HISTORY_UNAVAILABLE')
            expect(acceptance).not.toHaveBeenCalled()
            expect(await snapshot()).toEqual(before)
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          const redone = receipt(await call('journey_redo', input))
          expect(acceptance).toHaveBeenCalled()
          expect(await textBlock()).toMatchObject({
            content: 'Saved heading',
            variant: 'h1',
            align: 'center',
            settings: { color: '#ABCDEF', human: 'preserve' }
          })
          expect((await history()).undoEntryId).toBe(entry.id)
          const afterRedo = await snapshot()
          expect(receipt(await call('journey_redo', input))).toEqual(redone)
          expect(await snapshot()).toEqual(afterRedo)
        }
      )

      it.each([
        {
          label: 'markup',
          content: '<p>Historical <strong>heading</strong></p>'
        },
        { label: 'maximum length', content: 'x'.repeat(262144) }
      ])(
        'restores historically accepted Typography content with $label',
        async ({ content }) => {
          const saved = receipt(await edit(await editInput()))
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          const changes = structuredClone(
            entry.changes
          ) as unknown as TypographyInverse[]
          expect(changes[0].fields).toHaveLength(1)
          expect(changes[0].fields[0].field).toBe('content')
          changes[0].fields[0].after = content
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: changes as unknown as Prisma.InputJsonValue }
          })
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: { content }
          })
          await historyAction('undo', entry.id)
          expect((await textBlock()).content).toBe('Original heading')
          await historyAction('redo', entry.id)
          expect((await textBlock()).content).toBe(content)
        }
      )

      it.each([
        { content: null, variant: null, align: null, color: null },
        {
          content: 'Legacy heading',
          variant: 'legacy-variant',
          align: 'legacy-align',
          color: { retained: ['legacy', 42] }
        }
      ])(
        'restores retained Typography scalar values and legacy settings from $content',
        async ({ content, variant, align, color }) => {
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: { content, variant, align, settings: { color } }
          })
          const saved = receipt(
            await edit({
              ...(await editInput()),
              commands: [
                {
                  type: 'typography_set',
                  blockId: `${journeyId}-text`,
                  content: 'Saved heading',
                  variant: 'h1',
                  align: 'center',
                  color: '#abcdef'
                }
              ]
            })
          )
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          expect(entry.changes).toEqual([
            expect.objectContaining({ type: 'typography_restore' })
          ])
          await journeys.block.update({
            where: { id: `${journeyId}-text` },
            data: { settings: { color: '#abcdef', human: 'later' } }
          })
          await historyAction('undo', entry.id)
          expect(await textBlock()).toMatchObject({
            content,
            variant,
            align,
            settings: { color, human: 'later' }
          })
          await historyAction('redo', entry.id)
          expect(await textBlock()).toMatchObject({
            content: 'Saved heading',
            variant: 'h1',
            align: 'center',
            settings: { color: '#abcdef', human: 'later' }
          })
        }
      )

      it('rejects a corrupt or unsupported stored inverse without restoring arbitrary fields', async () => {
        const saved = receipt(await edit(await editInput()))
        const before = await revision()
        await journeys.mcpEditHistory.update({
          where: { id: saved.historyId! },
          data: {
            changes: [
              {
                type: 'typography_restore',
                blockId: `${journeyId}-text`,
                parent: {
                  cardId: `${journeyId}-card`,
                  stepId: `${journeyId}-step`
                },
                fields: [
                  {
                    field: 'hostId',
                    before: 'private',
                    after: 'private',
                    beforePresent: true
                  }
                ]
              }
            ]
          }
        })
        expect(
          (await call('journey_undo', await historyInput(saved.historyId!)))
            .text
        ).toContain('HISTORY_UNAVAILABLE')
        expect(await revision()).toBe(before)
        expect(await textBlock()).toMatchObject({ content: 'Saved heading' })
      })

      it.each([
        { command: 'button_set', corruption: 'field type mismatch' },
        { command: 'button_icon_start', corruption: 'missing Icon owner' },
        { command: 'card_chat_set', corruption: 'missing chat gate' },
        { command: 'spacer_set', corruption: 'invalid before value' },
        { command: 'spacer_set', corruption: 'invalid after value' },
        ...(['spacing', 'parentOrder', 'backdropBlur'] as const).flatMap(
          (field) =>
            [-2147483649, 2147483648, 1.5].map((prior) => ({
              command: field === 'backdropBlur' ? 'card_set' : 'spacer_set',
              corruption: `invalid prior ${field} ${prior}`,
              field,
              prior
            }))
        )
      ])(
        'rejects a stored presentation inverse with $corruption without advancing history or replay state',
        async (fixture) => {
          const { command, corruption } = fixture
          await seedPresentation()
          const presentation = presentationCase(command)
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [presentation.command]
            })
          )
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          const changes = z.array(presentationInverse).parse(entry.changes)
          expect(changes).toHaveLength(1)
          switch (corruption) {
            case 'field type mismatch':
              changes[0].typename = 'SpacerBlock'
              break
            case 'missing Icon owner':
              delete changes[0].owner
              break
            case 'missing chat gate':
              delete changes[0].gate
              break
            case 'invalid before value':
              changes[0].fields[0].before = 'invalid spacing'
              break
            case 'invalid after value':
              changes[0].fields[0].after = 'invalid spacing'
              break
          }
          if ('prior' in fixture) {
            const block = await journeys.block.findUniqueOrThrow({
              where: { id: presentation.targetId }
            })
            changes[0].fields = [
              {
                field: fixture.field,
                before: fixture.prior,
                after: block[fixture.field],
                beforePresent: true
              }
            ]
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes }
          })
          const snapshot = async () => ({
            blocks: await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            revision: await revision(),
            cursor: await history(),
            entries: await journeys.mcpEditHistory.findMany({
              where: { journeyId },
              orderBy: { ordinal: 'asc' }
            }),
            operations: await journeys.mcpEditOperation.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            counts: await counts(),
            audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
          })
          const before = await snapshot()
          const input = await historyInput(entry.id)
          for (let attempt = 0; attempt < 2; attempt++) {
            const response = await call('journey_undo', input)
            expect(response.json.result?.isError).toBe(true)
            expect(response.text).toContain('HISTORY_UNAVAILABLE')
            expect(await snapshot()).toEqual(before)
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          const undone = receipt(await call('journey_undo', input))
          expect((await history()).redoEntryId).toBe(entry.id)
          const afterUndo = await snapshot()
          expect(receipt(await call('journey_undo', input))).toEqual(undone)
          expect(await snapshot()).toEqual(afterUndo)
        }
      )

      it.each([
        { kind: 'alignment', legacy: { retained: ['legacy', 42] } },
        { kind: 'spacing', legacy: 100 },
        { kind: 'spacing', legacy: 25 },
        { kind: 'spacing', legacy: -2147483648 },
        { kind: 'spacing', legacy: 2147483647 }
      ])(
        'rejects malformed saved $kind on redo, preserves legacy $legacy undo and recovers after repair',
        async ({ kind, legacy }) => {
          await seedPresentation()
          const block = await journeys.block.findFirstOrThrow({
            where: {
              journeyId,
              typename: kind === 'alignment' ? 'ButtonBlock' : 'SpacerBlock'
            }
          })
          const original =
            kind === 'alignment'
              ? { settings: { alignment: legacy, unrelated: 'preserve' } }
              : { spacing: legacy as number }
          const forward =
            kind === 'alignment'
              ? { settings: { alignment: 'center', unrelated: 'preserve' } }
              : { spacing: 200 }
          await journeys.block.update({
            where: { id: block.id },
            data: original
          })
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                kind === 'alignment'
                  ? {
                      type: 'button_set',
                      blockId: block.id,
                      alignment: 'center'
                    }
                  : { type: 'spacer_set', blockId: block.id, spacing: 200 }
              ]
            })
          )
          const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
            where: { id: saved.historyId! }
          })
          await historyAction('undo', entry.id)
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: block.id } })
          ).toMatchObject(original)
          const changes = z.array(presentationInverse).parse(entry.changes)
          expect(changes[0].fields).toEqual([
            {
              field: kind === 'alignment' ? 'settings.alignment' : 'spacing',
              before: legacy,
              after: kind === 'alignment' ? 'center' : 200,
              beforePresent: true
            }
          ])
          changes[0].fields[0].after =
            kind === 'alignment' ? { malformed: true } : 25
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes }
          })
          const snapshot = async () => ({
            blocks: await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            revision: await revision(),
            cursor: await history(),
            entries: await journeys.mcpEditHistory.findMany({
              where: { journeyId },
              orderBy: { ordinal: 'asc' }
            }),
            operations: await journeys.mcpEditOperation.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            counts: await counts(),
            audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
          })
          const before = await snapshot()
          const input = await historyInput(entry.id)
          for (let attempt = 0; attempt < 2; attempt++) {
            const response = await call('journey_redo', input)
            expect(response.json.result?.isError).toBe(true)
            expect(response.text).toContain('HISTORY_UNAVAILABLE')
            expect(await snapshot()).toEqual(before)
          }
          await journeys.mcpEditHistory.update({
            where: { id: entry.id },
            data: { changes: entry.changes! }
          })
          const redone = receipt(await call('journey_redo', input))
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: block.id } })
          ).toMatchObject(forward)
          expect((await history()).undoEntryId).toBe(entry.id)
          const afterRedo = await snapshot()
          expect(receipt(await call('journey_redo', input))).toEqual(redone)
          expect(await snapshot()).toEqual(afterRedo)
        }
      )

      it.each(['undo-shifted', 'redo-shifted', 'redo-revived'] as const)(
        'rejects final sibling-order collisions for %s before acceptance and recovers after the human moves the sibling',
        async (scenario) => {
          const sibling = await journeys.block.create({
            data: {
              journeyId,
              typename: 'SpacerBlock',
              parentBlockId: `${journeyId}-card`,
              parentOrder: 1,
              spacing: 100
            }
          })
          const saved = receipt(
            await call('journey_edit', {
              journeyId,
              expectedRevision: await revision(),
              idempotencyKey: randomUUID(),
              commands: [
                {
                  type: 'block_add',
                  key: 'inserted',
                  cardId: `${journeyId}-card`,
                  placement: { position: 'before', blockId: sibling.id },
                  block: { kind: 'button', label: 'Inserted' }
                }
              ]
            })
          )
          const direction = scenario === 'undo-shifted' ? 'undo' : 'redo'
          if (direction === 'redo')
            await historyAction('undo', saved.historyId!)
          const humanSibling = await journeys.block.create({
            data: {
              journeyId,
              typename: 'TypographyBlock',
              parentBlockId: `${journeyId}-card`,
              parentOrder: scenario === 'redo-shifted' ? 2 : 1,
              content: 'Later human content'
            }
          })
          const snapshot = async () => ({
            blocks: await journeys.block.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            revision: await revision(),
            cursor: await history(),
            entries: await journeys.mcpEditHistory.findMany({
              where: { journeyId },
              orderBy: { ordinal: 'asc' }
            }),
            operations: await journeys.mcpEditOperation.findMany({
              where: { journeyId },
              orderBy: { id: 'asc' }
            }),
            counts: await counts(),
            audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
          })
          const before = await snapshot()
          const input = await historyInput(saved.historyId!)
          const acceptance = vi.fn()
          checkpoint = async (point, context) => {
            if (point === 'before_accept' && context.operationId) acceptance()
          }
          for (let attempt = 0; attempt < 2; attempt++) {
            const response = await call(`journey_${direction}`, input)
            expect(response.json.result?.isError).toBe(true)
            expect(response.text).toContain('HISTORY_CONFLICT')
            expect(acceptance).not.toHaveBeenCalled()
            expect(await snapshot()).toEqual(before)
          }
          await journeys.block.update({
            where: { id: humanSibling.id },
            data: { parentOrder: 3 }
          })
          const repairedInput = { ...input, expectedRevision: await revision() }
          const restored = receipt(
            await call(`journey_${direction}`, repairedInput)
          )
          expect(acceptance).toHaveBeenCalled()
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: humanSibling.id }
            })
          ).toMatchObject({ parentOrder: 3, content: humanSibling.content })
          const siblings = await journeys.block.findMany({
            where: {
              journeyId,
              parentBlockId: `${journeyId}-card`,
              deletedAt: null
            },
            orderBy: { parentOrder: 'asc' }
          })
          expect(siblings.map(({ id }) => id)).toEqual(
            direction === 'redo'
              ? [
                  `${journeyId}-text`,
                  saved.idMap.inserted,
                  sibling.id,
                  humanSibling.id
                ]
              : [`${journeyId}-text`, sibling.id, humanSibling.id]
          )
          expect(siblings.map(({ parentOrder }) => parentOrder)).toEqual(
            direction === 'redo' ? [0, 1, 2, 3] : [0, 1, 3]
          )
          const after = await snapshot()
          expect(
            receipt(await call(`journey_${direction}`, repairedInput))
          ).toEqual(restored)
          expect(await snapshot()).toEqual(after)
        }
      )

      it('preserves an unordered Card cover while undoing and redoing ordered content', async () => {
        const cover = await journeys.block.create({
          data: {
            journeyId,
            typename: 'ImageBlock',
            parentBlockId: `${journeyId}-card`,
            parentOrder: null,
            src: 'https://example.com/cover.jpg'
          }
        })
        await journeys.block.update({
          where: { id: `${journeyId}-card` },
          data: { coverBlockId: cover.id }
        })
        const card = await journeys.block.findUniqueOrThrow({
          where: { id: `${journeyId}-card` }
        })
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'block_add',
                key: 'inserted',
                cardId: card.id,
                placement: { position: 'before', blockId: `${journeyId}-text` },
                block: { kind: 'spacer', spacing: 100 }
              }
            ]
          })
        )
        for (const direction of ['undo', 'redo'] as const) {
          await historyAction(direction, saved.historyId!)
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: cover.id } })
          ).toEqual(cover)
          expect(
            await journeys.block.findUniqueOrThrow({ where: { id: card.id } })
          ).toEqual(card)
          expect(await textBlock()).toMatchObject({
            parentOrder: direction === 'undo' ? 0 : 1
          })
          expect(
            await journeys.block.findUniqueOrThrow({
              where: { id: saved.idMap.inserted }
            })
          ).toMatchObject({
            parentOrder: 0,
            deletedAt: direction === 'undo' ? expect.any(Date) : null
          })
        }
      })

      it('rejects unstorable saved sibling order before redo acceptance and recovers after repair', async () => {
        const saved = receipt(
          await call('journey_edit', {
            journeyId,
            expectedRevision: await revision(),
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'block_add',
                key: 'inserted',
                cardId: `${journeyId}-card`,
                placement: { position: 'before', blockId: `${journeyId}-text` },
                block: { kind: 'spacer', spacing: 100 }
              }
            ]
          })
        )
        const entry = await journeys.mcpEditHistory.findUniqueOrThrow({
          where: { id: saved.historyId! }
        })
        await historyAction('undo', entry.id)
        const changes = z.array(z.json()).parse(entry.changes)
        const index = changes.findIndex(
          (change) => presentationInverse.safeParse(change).success
        )
        expect(index).toBeGreaterThanOrEqual(0)
        const inverse = presentationInverse.parse(changes[index])
        expect(inverse.blockId).toBe(`${journeyId}-text`)
        expect(inverse.fields).toEqual([
          { field: 'parentOrder', before: 0, after: 1, beforePresent: true }
        ])
        inverse.fields[0].after = 2147483648
        changes[index] = inverse
        await journeys.mcpEditHistory.update({
          where: { id: entry.id },
          data: { changes }
        })
        const snapshot = async () => ({
          blocks: await journeys.block.findMany({
            where: { journeyId },
            orderBy: { id: 'asc' }
          }),
          revision: await revision(),
          cursor: await history(),
          entries: await journeys.mcpEditHistory.findMany({
            where: { journeyId },
            orderBy: { ordinal: 'asc' }
          }),
          operations: await journeys.mcpEditOperation.findMany({
            where: { journeyId },
            orderBy: { id: 'asc' }
          }),
          counts: await counts(),
          audit: await journeys.mcpEditAudit.count({ where: { journeyId } })
        })
        const before = await snapshot()
        const input = await historyInput(entry.id)
        const acceptance = vi.fn()
        checkpoint = async (point, context) => {
          if (point === 'before_accept' && context.operationId) acceptance()
        }
        for (let attempt = 0; attempt < 2; attempt++) {
          const response = await call('journey_redo', input)
          expect(response.json.result?.isError).toBe(true)
          expect(response.text).toContain('HISTORY_UNAVAILABLE')
          expect(acceptance).not.toHaveBeenCalled()
          expect(await snapshot()).toEqual(before)
        }
        await journeys.mcpEditHistory.update({
          where: { id: entry.id },
          data: { changes: entry.changes! }
        })
        const redone = receipt(await call('journey_redo', input))
        expect(acceptance).toHaveBeenCalled()
        expect(await textBlock()).toMatchObject({ parentOrder: 1 })
        expect(
          await journeys.block.findUniqueOrThrow({
            where: { id: saved.idMap.inserted }
          })
        ).toMatchObject({ parentOrder: 0, deletedAt: null })
        expect((await history()).undoEntryId).toBe(entry.id)
        const afterRedo = await snapshot()
        expect(receipt(await call('journey_redo', input))).toEqual(redone)
        expect(await snapshot()).toEqual(afterRedo)
      })

      it('retires both history directions with retryable account cleanup and preserves saved content', async () => {
        const a = receipt(await edit(await editInput('A')))
        const b = receipt(await edit(await editInput('B')))
        await historyAction('undo', b.historyId!)
        const namespace = (
          await journeys.mcpEditOperation.findUniqueOrThrow({
            where: { id: a.operationId }
          })
        ).namespaceId
        const retired = await request('/internal/permissions/retire-account', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${usersSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: 'alice' })
        })
        expect(retired.status).toBe(200)
        expect(
          (await call('journey_history', { journeyId })).text
        ).not.toContain(a.historyId!)
        lifecycleOutage = true
        expect(await ownerHandler.cleanup()).toBeGreaterThan(0)
        lifecycleOutage = false
        expect(await ownerHandler.cleanup()).toBe(0)
        restartOwner()
        expect(await ownerHandler.cleanup()).toBe(0)
        expect(
          await journeys.mcpEditHistory.count({
            where: { namespaceId: namespace }
          })
        ).toBe(0)
        expect(
          await journeys.mcpEditNamespace.findUniqueOrThrow({
            where: { id: namespace }
          })
        ).toMatchObject({
          retiredAt: expect.any(Date),
          actorId: null,
          clientId: null
        })
        expect(
          await journeys.mcpEditAudit.findFirst({
            where: { operationId: b.operationId }
          })
        ).not.toBeNull()
        expect(await textBlock()).toMatchObject({ content: 'A' })
      })

      it('gives each journey in one connection its own five-entry capacity', async () => {
        const other = journeyId + '-other'
        await journeys.journey.create({
          data: {
            id: other,
            slug: other,
            title: 'Other draft',
            languageId: '529',
            teamId: 'edit-team-alice',
            status: 'draft',
            blocks: {
              create: [
                { id: other + '-step', typename: 'StepBlock', parentOrder: 0 },
                {
                  id: other + '-card',
                  typename: 'CardBlock',
                  parentBlockId: other + '-step',
                  parentOrder: 0
                },
                {
                  id: other + '-text',
                  typename: 'TypographyBlock',
                  parentBlockId: other + '-card',
                  parentOrder: 0,
                  content: 'Other original'
                }
              ]
            }
          }
        })
        eligible.set('alice', [journeyId, other])
        token = await consent('alice', [journeyId, other])
        for (let index = 0; index < 6; index++)
          receipt(await edit(await editInput('Batch ' + index)))
        const otherRevision = (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId: other }
          })
        ).revision.toString()
        const saved = receipt(
          await call('journey_edit', {
            journeyId: other,
            expectedRevision: otherRevision,
            idempotencyKey: randomUUID(),
            commands: [
              {
                type: 'typography_set',
                blockId: other + '-text',
                content: 'Other saved'
              }
            ]
          })
        )
        expect((await history()).entries).toHaveLength(5)
        const listing = await call('journey_history', { journeyId: other })
        expect(
          historyResult.parse(listing.json.result?.structuredContent).entries
        ).toEqual([expect.objectContaining({ entryId: saved.historyId })])
      })
    }
  )
})
