import { fork } from 'node:child_process'
import { generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { type Server, createServer, request as httpRequest } from 'node:http'
import type { AddressInfo } from 'node:net'

import {
  createGatewayRuntime,
  usePropagateHeaders
} from '@graphql-hive/gateway'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import mailchimp from '@mailchimp/mailchimp_marketing'
import { initContextCache } from '@pothos/core'
import {
  type GraphQLObjectType,
  type GraphQLSchema,
  parse,
  subscribe
} from 'graphql'
import { createYoga } from 'graphql-yoga'
import pino from 'pino'

import { createAuthDatabase } from '@core/prisma/auth/client'
import { PrismaClient } from '@core/prisma/journeys/client'
import { PrismaClient as UsersClient } from '@core/prisma/users/client'
import { auth as firebaseAuth } from '@core/yoga/firebaseClient'
import {
  fingerprint,
  internalSignature,
  signEnvelope
} from '@core/yoga/mcp/readContract'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- This integration harness runs the actual independently deployed API participants. */
import { commonConfig } from '../../api-gateway/src/common.config'
import { useMcpReads } from '../../api-gateway/src/mcpReads'
import { lockDraftJourneyRevision } from '../../api-journeys/src/lib/journeyRevision/journeyRevision'
import type { createJourneyPermissionCoordinator } from '../../api-journeys/src/lib/mcpPermissions'
import {
  createJourneyReadHandler,
  useJourneyMcpReads
} from '../../api-journeys/src/lib/mcpReads'
import {
  privatePreviewCachePolicy,
  usePrivatePreview
} from '../../api-journeys/src/lib/privatePreview'
import { mockQueueAdd } from '../../api-journeys/test/bullmqMock'
import { readConfig as readMcpConfig } from '../../api-mcp/src/config'
import { createRuntime as createMcpRuntime } from '../../api-mcp/src/runtime'
import { message } from '../../api-mcp/test/helpers'
/* eslint-enable @nx/enforce-module-boundaries */
import { type AuthConfig, readConfig } from '../src/config'
import { createRuntime } from '../src/runtime'
import { databaseTime, digest } from '../src/store'

const authUrl = process.env.READS_TEST_AUTH_DATABASE_URL
const journeysUrl = process.env.READS_TEST_JOURNEYS_DATABASE_URL
const usersUrl = process.env.READS_TEST_USERS_DATABASE_URL

describe('granted journey read authorization', () => {
  describe.skipIf(!authUrl || !journeysUrl)(
    'granted reads through real MCP HTTP, issuer, Hive gateway and owning Journeys API',
    () => {
      const auth = createAuthDatabase(authUrl!)
      const journeys = new PrismaClient({
        adapter: new PrismaPg({ connectionString: journeysUrl })
      })
      const users = usersUrl
        ? new UsersClient({
            adapter: new PrismaPg({ connectionString: usersUrl })
          })
        : undefined
      const keys = generateKeyPairSync('rsa', { modulusLength: 2048 })
      const privateKey = keys.privateKey.export({ format: 'jwk' })
      const publicKey = keys.publicKey.export({ format: 'jwk' })
      const exchangeSecret = 'controlled-exchange-secret-for-10573-at-least-32'
      const ownerSecret = 'controlled-owner-secret-for-10573-at-least-32'
      const internalSecret = 'controlled-internal-secret-for-10573-at-least-32'
      const testExecutorId = '0b276608-2afd-4d72-8567-09c90e7433dc'
      const invalidUsers = new Set<string>()
      const servers: Server[] = []
      let issuer: Awaited<ReturnType<typeof createRuntime>>
      let gateway: ReturnType<typeof createGatewayRuntime>
      let mcp: ReturnType<typeof createMcpRuntime>
      let config: AuthConfig
      let gatewayUrl: string
      let ownerUrl: string
      let authorityUrl: string
      let mcpUrl: string
      let beforeIdentity: (() => Promise<void>) | undefined
      let beforeAcceptance: ((stage: string) => Promise<void>) | undefined
      let afterAcceptance: ((stage: string) => Promise<void>) | undefined
      let settlementOutage = false
      let permissionOutage = false
      let permissionReportOutage = false
      let beforePermissionBegin: (() => Promise<void>) | undefined
      let afterPermissionBegin: (() => Promise<void>) | undefined
      const failedFenceReports = new Set<string>()
      const anonymousProfileActors = new Set<string>()
      let ownerHandler: ReturnType<typeof createJourneyReadHandler>
      let owningSchema: GraphQLSchema
      let permissionCoordinator: ReturnType<
        typeof createJourneyPermissionCoordinator
      >
      let restartPermissionCoordinator: typeof createJourneyPermissionCoordinator
      let beforeOutput: ((executorId: string) => Promise<void>) | undefined
      let afterOutput: (() => void) | undefined
      let accessToken: string
      const cookies = new Map<string, string>()

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
        mode = 'view',
        reconnect?: { id: string; version: number }
      ) {
        cookies.clear()
        const verifier = randomBytes(32).toString('base64url')
        const query = new URLSearchParams({
          client_id: 'read-client',
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
        const details = (await (await post('details', {})).json()) as {
          csrf: string
        }
        const review = (await (
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
        ).json()) as { reviewToken: string }
        const approved = await post('decision', {
          csrf: details.csrf,
          reviewToken: review.reviewToken,
          decision: 'approve'
        })
        expect(approved.status).toBe(200)
        const resumed = await request(
          new URL(
            ((await approved.json()) as { redirectUrl: string }).redirectUrl
          ).pathname
        )
        const code = new URL(resumed.headers.get('location')!).searchParams.get(
          'code'
        )!
        const token = await request('/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: 'read-client',
            redirect_uri: 'http://127.0.0.1:4209/callback',
            resource: config.AUTH_AUDIENCE,
            code,
            code_verifier: verifier
          })
        })
        expect(token.status, await token.clone().text()).toBe(200)
        return ((await token.json()) as { access_token: string }).access_token
      }
      async function call(
        tool: string,
        input: Record<string, unknown>,
        token = accessToken,
        version = '2026-07-28'
      ) {
        const response = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            Authorization: `Bearer ${token}`,
            'mcp-protocol-version': version,
            'mcp-method': 'tools/call',
            'mcp-name': tool
          },
          body: JSON.stringify(
            message(version, 'tools/call', { name: tool, arguments: input })
          )
        })
        return { status: response.status, body: await response.text() }
      }
      const readA = () =>
        call('journey_read', { journeyId: 'read-a', view: 'steps' })
      async function internal(
        path: string,
        body: Record<string, unknown>,
        secret = ownerSecret
      ) {
        return request(`/internal/reads/${path}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            path === 'exchange' || path === 'prepare'
              ? {
                  executorId:
                    body.stage === 'read' ? randomUUID() : testExecutorId,
                  ...body
                }
              : body
          )
        })
      }

      beforeAll(async () => {
        if (
          !/^\/auth_issue_105(50|53|54|61|63|73|74|75)(_|$)/.test(
            new URL(authUrl!).pathname
          ) ||
          !/^\/journeys_issue_105(50|53|54|61|63|73|74|75)(_|$)/.test(
            new URL(journeysUrl!).pathname
          )
        )
          throw new Error('Use isolated issue databases')
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
        const triggers = await journeys.$queryRaw<
          Array<{ exists: boolean }>
        >`SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'journey_revision_root') AS exists`
        if (!triggers[0].exists) {
          const migration = readFileSync(
            new URL(
              '../../../libs/prisma/journeys/db/migrations/20261112000000_shared_journey_revision/migration.sql',
              import.meta.url
            ),
            'utf8'
          )
          await journeys.$executeRawUnsafe('DROP TABLE "JourneyRevision"')
          for (const match of migration.matchAll(
            /CREATE INDEX "([A-Za-z_]+)"/g
          ))
            await journeys.$executeRawUnsafe(`DROP INDEX "${match[1]}"`)
          await journeys.$executeRawUnsafe(migration)
        }
        await journeys.journey.deleteMany({
          where: { id: { startsWith: 'read-' } }
        })
        await journeys.team.upsert({
          where: { id: 'read-team' },
          create: {
            id: 'read-team',
            title: 'Read team',
            userTeams: { create: { userId: 'alice', role: 'manager' } }
          },
          update: {}
        })
        await journeys.journeyProfile.upsert({
          where: { userId: 'alice' },
          create: { userId: 'alice' },
          update: {}
        })
        await journeys.journeyProfile.upsert({
          where: { userId: 'bob' },
          create: { userId: 'bob' },
          update: {}
        })
        for (const id of [
          'read-a',
          'read-b',
          'read-published',
          'read-foreign'
        ]) {
          await journeys.journey.create({
            data: {
              id,
              slug: id,
              title:
                id === 'read-a' ? 'Authorized A' : `private-${id}-sentinel`,
              teamId: 'read-team',
              languageId: '529',
              status: id === 'read-published' ? 'published' : 'draft',
              userJourneys:
                id === 'read-foreign'
                  ? { create: { userId: 'bob', role: 'owner' } }
                  : undefined,
              blocks: {
                create: [
                  { id: `${id}-step`, typename: 'StepBlock', parentOrder: 0 },
                  {
                    id: `${id}-text`,
                    typename: 'TypographyBlock',
                    parentBlockId: `${id}-step`,
                    content: `${id}-text-sentinel`,
                    settings: {
                      color: '#123456',
                      privateSource: 'private-source-settings-sentinel'
                    }
                  }
                ]
              }
            }
          })
        }
        // Deliberately corrupt nested references to prove no foreign IDs escape.
        await journeys.block.update({
          where: { id: 'read-a-step' },
          data: { nextBlockId: 'read-b-step' }
        })
        await journeys.block.create({
          data: {
            id: 'read-a-button',
            journeyId: 'read-a',
            typename: 'ButtonBlock',
            parentBlockId: 'read-a-step',
            settings: { alignment: 'right' },
            action: { create: { blockId: 'read-b-step' } }
          }
        })
        await journeys.block.create({
          data: {
            id: 'read-a-card',
            journeyId: 'read-a',
            typename: 'CardBlock',
            parentBlockId: 'read-a-step',
            showAssistant: null,
            expandChatByDefault: false
          }
        })
        await journeys.journey.update({
          where: { id: 'read-a' },
          data: {
            showAssistant: true,
            seoTitle: 'Fallback title',
            displayTitle: ''
          }
        })
        await journeys.block.update({
          where: { id: 'read-a-text' },
          data: { integrationId: null }
        })
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
          AUTH_FIREBASE_PROJECT_ID: 'controlled-firebase-10573',
          AUTH_COOKIE_KEYS: 'controlled-cookie-key-for-10573-at-least-32',
          AUTH_JWKS: JSON.stringify({
            keys: [{ ...privateKey, kid: 'reads', alg: 'RS256', use: 'sig' }]
          }),
          AUTH_INTROSPECTION_CLIENT_ID: 'read-introspection',
          AUTH_INTROSPECTION_CLIENT_SECRET:
            'controlled-introspection-10573-at-least-32',
          AUTH_EXCHANGE_CLIENT_SECRET: exchangeSecret,
          AUTH_READ_OWNER_SECRET: ownerSecret,
          AUTH_PERMISSION_JOURNEYS_SECRET:
            'controlled-journeys-permission-10550-at-least-32',
          AUTH_PERMISSION_USERS_SECRET:
            'controlled-users-permission-10550-at-least-32',
          AUTH_READ_GATEWAY_AUDIENCE: 'http://127.0.0.1:4000/mcp/reads',
          PG_DATABASE_URL_AUTH: authUrl,
          AUTH_CLIENTS: JSON.stringify([
            {
              client_id: 'read-client',
              client_name: 'Read test agent',
              redirect_uris: ['http://127.0.0.1:4209/callback']
            }
          ])
        })
        issuer = await createRuntime(config, {
          db: auth,
          logger: pino({ enabled: false }),
          identity: {
            async authenticate(token) {
              if (!['alice', 'bob'].includes(token))
                throw new Error('Invalid identity')
              return {
                userId: token,
                authTime: 1794777000,
                createdAt: '2026-01-01T00:00:00.000Z'
              }
            },
            async check(evidence) {
              await beforeIdentity?.()
              if (invalidUsers.has(evidence.userId))
                throw new Error('Identity ineligible')
            }
          },
          eligibility: async (_token, user) =>
            user === 'alice'
              ? ['read-a', 'read-b', 'read-published'].map((id) => ({
                  id,
                  title: id,
                  teamId: 'read-team',
                  canEdit: id !== 'read-published'
                }))
              : [
                  {
                    id: 'read-foreign',
                    title: 'Bob',
                    teamId: 'read-team',
                    canEdit: true
                  }
                ]
        })
        await new Promise<void>((resolve) =>
          issuer.server.listen(
            Number(new URL(issuerOrigin).port),
            '127.0.0.1',
            resolve
          )
        )
        const trust = {
          issuer: issuerOrigin,
          audience: config.AUTH_READ_GATEWAY_AUDIENCE!,
          environment: 'local',
          publicKey
        }
        process.env.SKIP_ENV_VALIDATION = '1'
        if (users) {
          if (
            !/^\/users_issue_105(50|53|54|61)(_|$)/.test(
              new URL(usersUrl!).pathname
            )
          )
            throw new Error('Use isolated users issue database')
          vi.doMock('@core/prisma/users/client', async (importOriginal) => ({
            ...(await importOriginal<
              typeof import('@core/prisma/users/client')
            >()),
            prisma: users
          }))
          for (const userId of ['alice', 'bob'])
            await users.user.upsert({
              where: { userId },
              create: {
                userId,
                firstName: userId,
                email: userId + '@synthetic.example'
              },
              update: {}
            })
        }
        vi.doMock('@core/prisma/journeys/client', async (importOriginal) => ({
          ...(await importOriginal<
            typeof import('@core/prisma/journeys/client')
          >()),
          prisma: (
            await importOriginal<
              typeof import('@core/prisma/journeys/client')
            >()
          ).transactionScopedJourneyClient(journeys)
        }))
        // Load the deployed schema at runtime; its unrelated frontend type graph
        // has a separate JSX-enabled owning-project type-check target.
        const schemaModule = new URL(
          '../../api-journeys/src/schema/schema.ts',
          import.meta.url
        ).href
        const owningModule = (await import(
          /* webpackChunkName: "read-participant-schema" */ schemaModule
        )) as {
          schema: GraphQLSchema
        }
        owningSchema = owningModule.schema
        authorityUrl = await listen(
          createServer((req, res) => {
            void (async () => {
              const chunks: Buffer[] = []
              for await (const chunk of req)
                chunks.push(Buffer.from(chunk as Uint8Array))
              const raw = Buffer.concat(chunks).toString('utf8')
              const body = JSON.parse(raw) as {
                permitId?: string
                executorId?: string
              }
              const stage = body.permitId
                ? (
                    await auth.readPermit.findUniqueOrThrow({
                      where: { id: body.permitId }
                    })
                  ).stage
                : ''
              if (
                req.url?.startsWith('/internal/permissions/') &&
                (permissionOutage ||
                  (permissionReportOutage && req.url.endsWith('/complete')))
              ) {
                res.writeHead(503)
                res.end('{}')
                return
              }
              if (req.url === '/internal/permissions/begin')
                await beforePermissionBegin?.()
              if (req.url?.endsWith('/accept')) await beforeAcceptance?.(stage)
              if (
                req.url?.endsWith('/fence') &&
                (settlementOutage ||
                  failedFenceReports.has(body.executorId ?? ''))
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
              if (req.url === '/internal/permissions/begin' && response.ok)
                await afterPermissionBegin?.()
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
        ownerHandler = createJourneyReadHandler(
          {
            ...trust,
            internalSecret,
            authorityUrl,
            authoritySecret: ownerSecret,
            adminOrigin: config.AUTH_ADMIN_ORIGIN + '/'
          },
          journeys
        )
        const permissionModule = new URL(
          '../../api-journeys/src/lib/mcpPermissions.ts',
          import.meta.url
        ).href
        const {
          createJourneyPermissionCoordinator,
          coordinateJourneyPermissionMutations
        } = (await import(
          /* webpackChunkName: "permission-owner-participant" */ permissionModule
        )) as typeof import('../../api-journeys/src/lib/mcpPermissions')
        restartPermissionCoordinator = createJourneyPermissionCoordinator
        permissionCoordinator = createJourneyPermissionCoordinator(
          {
            authorityUrl,
            authoritySecret: config.AUTH_PERMISSION_JOURNEYS_SECRET!
          },
          journeys,
          undefined,
          async (userId) => {
            if (invalidUsers.has(userId))
              throw new Error('Controlled ineligible actor')
            return {
              createdAt: '2026-01-01T00:00:00.000Z',
              user: {
                id: userId,
                email: anonymousProfileActors.has(userId)
                  ? null
                  : userId + '@synthetic.example',
                firstName: userId,
                emailVerified: true,
                imageUrl: null
              }
            }
          }
        )
        coordinateJourneyPermissionMutations(
          owningSchema,
          permissionCoordinator
        )
        const owner = createYoga({
          schema: owningSchema,
          maskedErrors: true,
          context: ({ request }) => {
            const human = request.headers.get('x-controlled-human')
            return human &&
              ['alice', 'bob', 'preview-editor', 'stranger'].includes(human)
              ? {
                  ...initContextCache(),
                  type: 'authenticated' as const,
                  user: {
                    id: human,
                    email: human + '@synthetic.example',
                    firstName: human,
                    lastName: '',
                    emailVerified: true,
                    imageUrl: null
                  },
                  currentRoles: []
                }
              : { ...initContextCache(), type: 'public' as const }
          },
          logging: false,
          plugins: [
            useJourneyMcpReads(ownerHandler),
            usePrivatePreview(journeys),
            useResponseCache({
              session: () => null,
              cache: createInMemoryCache(),
              ttlPerSchemaCoordinate: {
                Journey: 0,
                ...privatePreviewCachePolicy
              }
            })
          ]
        })
        ownerUrl = await listen(
          createServer((req, res) => {
            void owner(req, res)
          })
        )
        const outputRequests = new WeakSet<Request>()
        gateway = createGatewayRuntime({
          graphqlEndpoint: '/',
          supergraph: readFileSync(
            new URL('../../api-gateway/schema.graphql', import.meta.url),
            'utf8'
          ).replaceAll('http://127.0.0.1:4004/graphql', `${ownerUrl}/graphql`),
          logging: false,
          plugins: () => [
            {
              async onRequest({ request }) {
                if (
                  new URL(request.url).pathname === '/mcp/reads' &&
                  ((await request.clone().json()) as { stage?: string })
                    .stage === 'output'
                ) {
                  outputRequests.add(request)
                  const credential = request.headers
                    .get('authorization')!
                    .slice(4)
                  const { executorId } = JSON.parse(
                    Buffer.from(credential.split('.')[0], 'base64url').toString(
                      'utf8'
                    )
                  ) as { executorId: string }
                  await beforeOutput?.(executorId)
                }
              },
              onResponse({ request }) {
                if (outputRequests.has(request)) afterOutput?.()
              }
            },
            useMcpReads({
              ...trust,
              ownerUrl: `${ownerUrl}/mcp/reads`,
              internalSecret
            }),
            usePropagateHeaders(commonConfig.propagateHeaders!)
          ]
        })
        gatewayUrl = await listen(
          createServer((req, res) => {
            void gateway(req, res)
          })
        )
        mcp = createMcpRuntime(
          {
            ...readMcpConfig({
              MCP_AUTH_MODE: 'granted-reads',
              MCP_PUBLIC_URL: config.AUTH_AUDIENCE,
              MCP_ISSUER_URL: issuerOrigin,
              MCP_GATEWAY_URL: gatewayUrl,
              MCP_EXCHANGE_CLIENT_SECRET: exchangeSecret
            }),
            port: 0
          },
          { logger: pino({ enabled: false }) }
        )
        await mcp.listen()
        mcpUrl = `http://127.0.0.1:${(mcp.server.address() as AddressInfo).port}/mcp`
      }, 120000)

      beforeEach(async () => {
        beforeIdentity = undefined
        beforeOutput = undefined
        afterOutput = undefined
        beforeAcceptance = undefined
        afterAcceptance = undefined
        settlementOutage = false
        permissionOutage = false
        permissionReportOutage = false
        beforePermissionBegin = undefined
        afterPermissionBegin = undefined
        failedFenceReports.clear()
        anonymousProfileActors.clear()
        invalidUsers.clear()
        await auth.permissionChange.deleteMany()
        await auth.retiredAccount.deleteMany()
        await journeys.mcpPermissionExecution.deleteMany()
        await auth.authorizationGate.updateMany({
          data: { open: true, generation: { increment: 1 } }
        })
        await journeys.userTeam.upsert({
          where: { teamId_userId: { teamId: 'read-team', userId: 'alice' } },
          create: { teamId: 'read-team', userId: 'alice', role: 'manager' },
          update: { role: 'manager' }
        })
        await journeys.journeyProfile.upsert({
          where: { userId: 'alice' },
          create: { userId: 'alice' },
          update: {}
        })
        accessToken = await consent('alice', ['read-a'])
      })

      afterAll(async () => {
        await mcp?.shutdown()
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
        await users?.$disconnect()
      })

      it('renews an expired connection and resumes granted MCP reads under the same identity with fresh credentials', async () => {
        expect((await readA()).body).toContain('read-a-text-sentinel')
        const previousToken = accessToken
        const connection = await auth.agentConnection.findFirstOrThrow({
          orderBy: { approvedAt: 'desc' }
        })
        const accepted = await auth.readPermit.findMany({
          where: { connectionId: connection.id }
        })
        await auth.agentConnection.update({
          where: { id: connection.id },
          data: { expiresAt: new Date(0) }
        })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        const management = async (path: string, body: unknown) =>
          request(`/connections${path}`, {
            method: 'POST',
            headers: {
              Origin: config.AUTH_ADMIN_ORIGIN,
              Authorization: 'Bearer alice',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })
        const listed = await management('', {})
        expect(listed.status).toBe(200)
        const { csrf } = (await listed.json()) as { csrf: string }
        const review = await management(`/${connection.id}/review`, {
          csrf,
          expectedVersion: connection.version,
          clientId: connection.clientId,
          duration: 'week'
        })
        expect(review.status, await review.clone().text()).toBe(200)
        const { reviewToken } = (await review.json()) as { reviewToken: string }
        const approved = await management(`/${connection.id}/approve`, {
          csrf,
          expectedVersion: connection.version,
          clientId: connection.clientId,
          reviewToken
        })
        expect(approved.status, await approved.clone().text()).toBe(200)
        const receipt = (await approved.json()) as {
          id: string
          version: number
          expiresAt: string
        }
        accessToken = await consent('alice', ['read-a'], 'view', {
          id: receipt.id,
          version: receipt.version
        })
        expect((await readA()).body).toContain('read-a-text-sentinel')
        expect(
          (await call('journey_read', { journeyId: 'read-b', view: 'steps' }))
            .body
        ).not.toContain('private-read-b-sentinel')
        expect(
          (
            await call(
              'journey_read',
              { journeyId: 'read-a', view: 'steps' },
              previousToken
            )
          ).body
        ).not.toContain('read-a-text-sentinel')
        expect(
          await auth.agentConnection.findUnique({
            where: { id: connection.id }
          })
        ).toMatchObject({
          userId: connection.userId,
          clientId: connection.clientId,
          journeyIds: ['read-a'],
          mode: 'view',
          version: receipt.version,
          expiresAt: new Date(receipt.expiresAt)
        })
        for (const permit of accepted)
          expect(
            await auth.readPermit.findUnique({ where: { id: permit.id } })
          ).toMatchObject({
            id: permit.id,
            connectionId: permit.connectionId,
            grantVersion: permit.grantVersion,
            requestHash: permit.requestHash,
            preparedAt: permit.preparedAt
          })
        await journeys.userTeam.delete({
          where: { teamId_userId: { teamId: 'read-team', userId: 'alice' } }
        })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
      })

      it('lists and reads only A despite current user rights to A and B; no nested foreign references or counts escape', async () => {
        const list = await call('journeys_list', {})
        expect(list.status).toBe(200)
        expect(list.body).toContain('Authorized A')
        expect(list.body).not.toContain('read-b')
        expect(list.body).not.toContain('totalCount')
        const read = await readA()
        expect(read.body).toContain('read-a-text-sentinel')
        expect(read.body).not.toContain('read-b-step')
        expect(read.body).toContain('NavigateToBlockAction')
        expect(read.body).not.toContain('userJourneys')
        expect(read.body).not.toContain('private-source-settings-sentinel')
        const content = JSON.parse(read.body) as {
          result: {
            structuredContent: {
              blocks: Array<{
                id: string
                settings?: Record<string, unknown>
                aiChat?: Record<string, unknown>
              }>
            }
          }
        }
        const blocks = content.result.structuredContent.blocks
        expect(
          blocks.find((block) => block.id === 'read-a-text')?.settings
        ).toEqual({ color: '#123456' })
        expect(
          blocks.find((block) => block.id === 'read-a-button')?.settings
        ).toEqual({ alignment: 'right' })
        expect(
          blocks.find((block) => block.id === 'read-a-card')?.aiChat
        ).toEqual({ enableAiChat: false, collapseChat: true })
        const outline = await call('journey_read', {
          journeyId: 'read-a',
          view: 'outline'
        })
        expect(outline.body).toContain('"parentOrder":0')
        const settings = JSON.parse(
          (
            await call('journey_read', {
              journeyId: 'read-a',
              view: 'settings'
            })
          ).body
        ) as {
          result: {
            structuredContent: { settings: { effectiveDisplayTitle: string } }
          }
        }
        expect(
          settings.result.structuredContent.settings.effectiveDisplayTitle
        ).toBe('')
        const denied = await call('journey_read', {
          journeyId: 'read-b',
          view: 'settings'
        })
        expect(denied.body).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        expect(denied.body).not.toContain('private-read-b-sentinel')
      })

      it.each(['2026-07-28', '2025-11-25'])(
        'returns contract version 1 on list, all read views and denied results on %s',
        async (version) => {
          const decode = (body: string) =>
            JSON.parse(
              body
                .split('\n')
                .find((line) => line.startsWith('data:'))
                ?.slice(5) ?? body
            )
          const results = [
            await call('journeys_list', {}, accessToken, version)
          ]
          for (const view of ['outline', 'steps', 'settings'])
            results.push(
              await call(
                'journey_read',
                { journeyId: 'read-a', view },
                accessToken,
                version
              )
            )
          for (const result of results) {
            expect(result.status).toBe(200)
            expect(decode(result.body)).toMatchObject({
              result: { structuredContent: { contractVersion: '1' } }
            })
            expect(decode(result.body).result.isError).not.toBe(true)
          }
          const denied = await call(
            'journey_read',
            { journeyId: 'read-b', view: 'settings' },
            accessToken,
            version
          )
          expect(decode(denied.body)).toMatchObject({
            result: {
              isError: true,
              structuredContent: {
                contractVersion: '1',
                code: 'ACCESS_DENIED_OR_NOT_FOUND'
              }
            }
          })
        }
      )

      it('includes the result version in owner size bounds and fresh output hashes', async () => {
        const request = {
          tool: 'journey_read',
          input: { journeyId: 'read-a', view: 'settings' }
        }
        const exchanged = await internal(
          'exchange',
          { token: accessToken, request },
          exchangeSecret
        )
        const { credential } = (await exchanged.json()) as {
          credential: string
        }
        const relay = (body: Record<string, unknown>) =>
          fetch(`${gatewayUrl}/mcp/reads`, {
            method: 'POST',
            headers: {
              Authorization: `MCP ${credential}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request, ...body })
          })
        const response = await relay({ stage: 'read' })
        expect(response.status).toBe(200)
        const { data } = (await response.json()) as {
          data: {
            contractVersion: string
            settings: { description: string | null }
          }
        }
        expect(data.contractVersion).toBe('1')
        const output = {
          stage: 'output',
          outputHash: 'a'.repeat(64),
          dataHash: fingerprint(data)
        }
        expect(
          (
            await relay({
              ...output,
              dataHash: fingerprint({ ...data, contractVersion: '2' })
            })
          ).status
        ).toBe(403)
        const accepted = await relay(output)
        expect(accepted.status).toBe(200)
        const { permitId } = (await accepted.json()) as { permitId: string }
        expect(
          (await internal('settle', { permitId }, exchangeSecret)).status
        ).toBe(200)

        const originalDescription = data.settings.description
        const fixedBytes =
          Buffer.byteLength(JSON.stringify(data)) -
          Buffer.byteLength(JSON.stringify(originalDescription)) +
          2
        const ownerRead = async () => {
          const fresh = await internal(
            'exchange',
            { token: accessToken, request },
            exchangeSecret
          )
          expect(fresh.status).toBe(200)
          const { credential: freshCredential } = (await fresh.json()) as {
            credential: string
          }
          const body = JSON.stringify({ request, stage: 'read' })
          return fetch(`${ownerUrl}/mcp/reads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-mcp-context': freshCredential,
              'x-mcp-signature': internalSignature(
                freshCredential,
                body,
                internalSecret
              )
            },
            body
          })
        }
        try {
          await journeys.journey.update({
            where: { id: 'read-a' },
            data: { description: 'x'.repeat(524289 - fixedBytes) }
          })
          const overLimit = await ownerRead()
          expect(overLimit.status).toBe(200)
          expect(await overLimit.json()).toEqual({
            data: {
              contractVersion: '1',
              kind: 'read_failure',
              code: 'LIMIT_EXCEEDED'
            }
          })
        } finally {
          await journeys.journey.update({
            where: { id: 'read-a' },
            data: { description: originalDescription }
          })
        }
      })

      it('keeps distinct OAuth identities and denies a public URL without a resource grant', async () => {
        const bob = await consent('bob', ['read-foreign'])
        expect((await readA()).body).toContain('read-a-text-sentinel')
        expect(
          (
            await call(
              'journey_read',
              { journeyId: 'read-a', view: 'steps' },
              bob
            )
          ).body
        ).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        expect(
          (
            await call('journey_read', {
              journeyId: 'read-published',
              view: 'settings'
            })
          ).body
        ).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        expect(
          (
            await call('journey_read', {
              journeyId: 'https://example.com/read-a',
              view: 'steps'
            })
          ).body
        ).toContain('ACCESS_DENIED_OR_NOT_FOUND')
      })

      it('enforces the same grant on legacy MCP HTTP requests', async () => {
        expect(
          (
            await call(
              'journey_read',
              { journeyId: 'read-a', view: 'steps' },
              accessToken,
              '2025-11-25'
            )
          ).body
        ).toContain('read-a-text-sentinel')
        const denied = await call(
          'journey_read',
          { journeyId: 'read-b', view: 'steps' },
          accessToken,
          '2025-11-25'
        )
        expect(denied.body).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        expect(denied.body).not.toContain('private-read-b-sentinel')
      })

      it('returns published ordinary journeys under a read grant and registers only the implemented tools', async () => {
        accessToken = await consent('alice', ['read-published'])
        const read = await call('journey_read', {
          journeyId: 'read-published',
          view: 'settings'
        })
        expect(read.body).toContain('published')
        expect(read.body).not.toContain('ACCESS_DENIED_OR_NOT_FOUND')
        const discovery = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'mcp-protocol-version': '2026-07-28',
            'mcp-method': 'tools/list'
          },
          body: JSON.stringify(message('2026-07-28', 'tools/list'))
        })
        const listed = (await discovery.json()) as {
          result: { tools: Array<{ name: string }> }
        }
        expect(listed.result.tools.map((tool) => tool.name)).toEqual([
          'journey_media_start',
          'journey_media_status',
          'journey_media_cancel',
          'journey_media_search',
          'journeys_list',
          'journey_read',
          'journey_edit',
          'journey_history',
          'journey_undo',
          'journey_redo',
          'journey_operation_get',
          'journey_preview'
        ])
        const malformed = await call('journey_edit', {
          journeyId: 'read-published'
        })
        expect(JSON.parse(malformed.body)).toMatchObject({
          result: {
            isError: true,
            structuredContent: {
              contractVersion: '1',
              code: 'VALIDATION_FAILED'
            }
          }
        })
      })

      it('previews the exact saved revision with a bounded private Admin handoff and rejects stale or foreign routes', async () => {
        const revision = (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId: 'read-a' }
          })
        ).revision.toString()
        const result = await call('journey_preview', {
          journeyId: 'read-a',
          expectedRevision: revision,
          startStepId: 'read-a-step'
        })
        expect(result.status).toBe(200)
        expect(result.body).toContain(
          `/journeys/read-a/preview?revision=${revision}&stepId=read-a-step`
        )
        expect(result.body).toContain('routeChecklist')
        expect(result.body).not.toContain('read-b-step')
        expect(result.body).not.toContain('read-a-text-sentinel')
        expect(
          (
            await call('journey_preview', {
              journeyId: 'read-a',
              expectedRevision: (BigInt(revision) + 1n).toString()
            })
          ).body
        ).toContain('REVISION_CONFLICT')
        expect(
          (
            await call('journey_preview', {
              journeyId: 'read-b',
              expectedRevision: revision
            })
          ).body
        ).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        expect(
          (
            await call('journey_preview', {
              journeyId: 'read-a',
              expectedRevision: revision,
              startStepId: 'read-b-step'
            })
          ).body
        ).toContain('ACCESS_DENIED_OR_NOT_FOUND')
      })

      it('fences a buffered preview result on completed withdrawal and rechecks current human preview rights independently', async () => {
        const revision = (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId: 'read-a' }
          })
        ).revision.toString()
        const context = await manageConnection()
        beforeOutput = async () => {
          const response = await context.post('disconnect')
          expect(await response.json()).toMatchObject({ status: 'complete' })
        }
        const result = await call('journey_preview', {
          journeyId: 'read-a',
          expectedRevision: revision
        })
        expect(result.body).not.toContain('previewLink')
        beforeOutput = undefined
        expect(
          (
            await call('journey_preview', {
              journeyId: 'read-a',
              expectedRevision: revision
            })
          ).body
        ).not.toContain('previewLink')
        const query = 'query { journeyPreview(id:"read-a") { id title } }'
        expect(
          (await humanMutation(query, {}, 'alice')).data?.journeyPreview
        ).toMatchObject({ id: 'read-a', title: 'Authorized A' })
        expect((await humanMutation(query, {}, 'stranger')).data).toBeNull()
        await journeys.userTeam.deleteMany({
          where: { teamId: 'read-team', userId: 'alice' }
        })
        expect((await humanMutation(query, {}, 'alice')).data).toBeNull()
      })

      it('returns owned answer and default routes from the saved revision', async () => {
        const prefix = 'preview-routes-' + randomUUID()
        const original = await journeys.block.findUniqueOrThrow({
          where: { id: 'read-b-step' }
        })
        const defaultStep = `${prefix}-default`
        const answerStep = `${prefix}-answer`
        const buttonId = `${prefix}-button`
        try {
          await journeys.block.createMany({
            data: [defaultStep, answerStep].map((id, index) => ({
              id,
              journeyId: 'read-b',
              typename: 'StepBlock',
              parentOrder: index + 1
            }))
          })
          await journeys.block.update({
            where: { id: original.id },
            data: { nextBlockId: defaultStep }
          })
          await journeys.block.create({
            data: {
              id: buttonId,
              journeyId: 'read-b',
              typename: 'ButtonBlock',
              parentBlockId: original.id,
              label: 'Synthetic answer',
              action: { create: { blockId: answerStep } }
            }
          })
          accessToken = await consent('alice', ['read-b'])
          const revision = (
            await journeys.journeyRevision.findUniqueOrThrow({
              where: { journeyId: 'read-b' }
            })
          ).revision.toString()
          const result = await call('journey_preview', {
            journeyId: 'read-b',
            expectedRevision: revision
          })
          expect(result.status).toBe(200)
          const data = JSON.parse(result.body) as {
            result: {
              structuredContent: {
                routeChecklist: {
                  complete: boolean
                  steps: Array<{ id: string; nextBlockId: string | null }>
                  answers: Array<{ blockId: string; nextStepId: string }>
                }
              }
            }
          }
          expect(data.result.structuredContent.routeChecklist).toMatchObject({
            complete: true,
            answers: [{ blockId: buttonId, nextStepId: answerStep }]
          })
          expect(
            data.result.structuredContent.routeChecklist.steps
          ).toContainEqual(
            expect.objectContaining({
              id: original.id,
              nextBlockId: defaultStep
            })
          )
        } finally {
          await journeys.block.update({
            where: { id: original.id },
            data: { nextBlockId: original.nextBlockId }
          })
          await journeys.block.deleteMany({
            where: { journeyId: 'read-b', id: { startsWith: prefix } }
          })
        }
      })

      it('bounds a large preview checklist while preserving handoff to an owned start Step beyond its first page', async () => {
        const id = 'read-b'
        const prefix = 'large-preview-' + randomUUID()
        try {
          const steps = Array.from({ length: 101 }, (_, index) => ({
            id: `${prefix}-${index}`,
            journeyId: id,
            typename: 'StepBlock',
            parentOrder: index
          }))
          await journeys.block.createMany({ data: steps })
          accessToken = await consent('alice', [id])
          const revision = (
            await journeys.journeyRevision.findUniqueOrThrow({
              where: { journeyId: id }
            })
          ).revision.toString()
          const result = await call('journey_preview', {
            journeyId: id,
            expectedRevision: revision,
            startStepId: steps[100].id
          })
          expect(result.body).toContain('previewLink')
          expect(result.body).toContain('"complete":false')
          expect(result.body).toContain('Route checklist is partial')
          expect(result.body).toContain(`stepId=${steps[100].id}`)
        } finally {
          await journeys.block.deleteMany({
            where: { journeyId: id, id: { startsWith: prefix } }
          })
        }
      })

      it('keeps preview output withdrawal pending until the accepted real sender settles', async () => {
        const revision = (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId: 'read-a' }
          })
        ).revision.toString()
        const context = await manageConnection()
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'output') await pause.pause()
        }
        const preview = call('journey_preview', {
          journeyId: 'read-a',
          expectedRevision: revision
        })
        await pause.ready
        const change = (await (await context.post('disconnect')).json()) as {
          changeId: string
          status: string
        }
        expect(change.status).toBe('pending')
        await ownerHandler.reconcile()
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'pending' })
        pause.resume()
        expect((await preview).body).toContain('previewLink')
        await vi.waitFor(async () =>
          expect(
            await auth.connectionChange.findUnique({
              where: { id: change.changeId }
            })
          ).toMatchObject({ status: 'complete' })
        )
      })

      it('keeps nested private page data in the checked revision snapshot until the bounded read finishes', async () => {
        const field = (
          owningSchema.getType('Journey') as GraphQLObjectType
        ).getFields().blocks
        const resolve = field.resolve
        if (!resolve)
          throw new Error('The owning Journey blocks resolver is required')
        const pause = barrier()
        field.resolve = async (...args) => {
          await pause.pause()
          return resolve(...args)
        }
        const revision = (
          await journeys.journeyRevision.findUniqueOrThrow({
            where: { journeyId: 'read-a' }
          })
        ).revision.toString()
        const original = await journeys.block.findUniqueOrThrow({
          where: { id: 'read-a-text' }
        })
        const reading = humanMutation(
          `query { journeyPreview(id:"read-a", expectedRevision:"${revision}") { id blocks { id ... on TypographyBlock { content } } } }`,
          {},
          'alice'
        )
        let updating: Promise<unknown> | undefined
        try {
          await pause.ready
          updating = journeys.block
            .update({
              where: { id: 'read-a-text' },
              data: { content: 'changed-after-preview' }
            })
            .then((value) => value)
          await vi.waitFor(async () => {
            const [state] = await journeys.$queryRaw<
              { waiting: boolean }[]
            >`SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()) AS waiting`
            expect(state.waiting).toBe(true)
          })
          pause.resume()
          const result = await reading
          expect(JSON.stringify(result.data)).toContain(original.content)
          expect(JSON.stringify(result.data)).not.toContain(
            'changed-after-preview'
          )
          await updating
          field.resolve = resolve
          const stale = await humanMutation(
            `query { journeyPreview(id:"read-a", expectedRevision:"${revision}") { id } }`,
            {},
            'alice'
          )
          expect(stale.data).toBeNull()
          expect(stale.errors?.[0].extensions?.code).toBe('REVISION_CONFLICT')
        } finally {
          pause.resume()
          field.resolve = resolve
          await reading
          await updating
          await journeys.block.update({
            where: { id: original.id },
            data: { content: original.content }
          })
        }
      })

      it('publishes through the ordinary human mutation with current Manage rights, preserving public playback and the shared draft fence', async () => {
        const id = 'human-publish-' + randomUUID()
        await journeys.journey.create({
          data: {
            id,
            slug: id,
            title: 'Synthetic publication',
            teamId: 'read-team',
            languageId: '529',
            status: 'draft',
            userJourneys: {
              create: { userId: 'preview-editor', role: 'editor' }
            }
          }
        })
        try {
          const permission = `query { journeyPublishPermission(id:"${id}") }`
          expect(
            (await humanMutation(permission, {}, 'alice')).data
              ?.journeyPublishPermission
          ).toBe(true)
          expect(
            (await humanMutation(permission, {}, 'preview-editor')).data
              ?.journeyPublishPermission
          ).toBe(false)
          const publish = `mutation { journeyPublish(id:"${id}") { id status } }`
          expect(
            (await humanMutation(publish, {}, 'preview-editor')).errors?.[0]
              .extensions?.code
          ).toBe('FORBIDDEN')
          expect(
            (
              await journeys.journey.findUniqueOrThrow({
                where: { id }
              })
            ).status
          ).toBe('draft')
          expect(
            (await humanMutation(publish, {}, 'alice')).data?.journeyPublish
          ).toMatchObject({ id, status: 'published' })
          expect(
            (
              await humanMutation(
                `query { journey(id:"${id}") { id status } }`,
                {},
                'stranger'
              )
            ).data?.journey
          ).toMatchObject({ id, status: 'published' })
          expect(
            (await humanMutation(permission, {}, 'alice')).data
              ?.journeyPublishPermission
          ).toBe(false)
          const revision = (
            await journeys.journeyRevision.findUniqueOrThrow({
              where: { journeyId: id }
            })
          ).revision.toString()
          await expect(
            journeys.$transaction((tx) =>
              lockDraftJourneyRevision(tx, id, revision)
            )
          ).rejects.toThrow('not an ordinary draft')
        } finally {
          await journeys.journey.delete({ where: { id } })
        }
      })

      it('binds bounded read pages to identity, filters, grant version and the shared Admin revision', async () => {
        await journeys.block.createMany({
          data: Array.from({ length: 101 }, (_, index) => ({
            id: `read-page-${index.toString().padStart(3, '0')}`,
            journeyId: 'read-a',
            typename: 'TypographyBlock',
            parentBlockId: 'read-a-step',
            content: `page-${index}`
          }))
        })
        const first = JSON.parse((await readA()).body) as {
          result: {
            structuredContent: {
              revision: string
              nextCursor: string
              blocks: unknown[]
            }
          }
        }
        expect(first.result.structuredContent.blocks).toHaveLength(100)
        const { revision, nextCursor } = first.result.structuredContent
        expect(nextCursor).toBeTruthy()
        const second = await call('journey_read', {
          journeyId: 'read-a',
          view: 'steps',
          revision,
          cursor: nextCursor
        })
        expect(second.body).toContain('read-page-100')
        const wrongView = await call('journey_read', {
          journeyId: 'read-a',
          view: 'outline',
          revision,
          cursor: nextCursor
        })
        expect(wrongView.body).toContain('REVISION_CONFLICT')
        await journeys.block.update({
          where: { id: 'read-a-text' },
          data: { content: 'Human Admin changed this' }
        })
        const changed = await call('journey_read', {
          journeyId: 'read-a',
          view: 'steps',
          revision,
          cursor: nextCursor
        })
        expect(changed.body).toContain('REVISION_CONFLICT')
        expect(changed.body).not.toContain('Human Admin changed this')
        await journeys.block.deleteMany({
          where: { id: { startsWith: 'read-page-' } }
        })
        await journeys.block.update({
          where: { id: 'read-a-text' },
          data: { content: 'read-a-text-sentinel' }
        })
      })

      it('rejects list cursors reused across filters, users, connections and grant versions', async () => {
        accessToken = await consent('alice', ['read-a', 'read-b'])
        const originalToken = accessToken
        const connection = await auth.agentConnection.findFirstOrThrow({
          orderBy: { approvedAt: 'desc' }
        })
        const first = JSON.parse(
          (await call('journeys_list', { limit: 1 })).body
        ) as { result: { structuredContent: { nextCursor: string } } }
        const cursor = first.result.structuredContent.nextCursor
        expect(cursor).toBeTruthy()
        expect(
          (await call('journeys_list', { limit: 1, cursor })).body
        ).toContain('private-read-b-sentinel')
        expect(
          (await call('journeys_list', { limit: 1, cursor, status: 'draft' }))
            .body
        ).toContain('REVISION_CONFLICT')
        const anotherConnection = await consent('alice', ['read-a', 'read-b'])
        expect(
          (await call('journeys_list', { limit: 1, cursor }, anotherConnection))
            .body
        ).toContain('REVISION_CONFLICT')
        const bob = await consent('bob', ['read-foreign'])
        const foreignCursor = await call(
          'journeys_list',
          { limit: 1, cursor },
          bob
        )
        expect(foreignCursor.body).toContain('REVISION_CONFLICT')
        expect(foreignCursor.body).not.toContain('private-read-b-sentinel')
        await auth.agentConnection.update({
          where: { id: connection.id },
          data: { version: { increment: 1 } }
        })
        expect(
          (await call('journeys_list', { limit: 1, cursor }, originalToken))
            .body
        ).toContain('REVISION_CONFLICT')
      })

      it('fails closed on unavailable current identity and enforces output bounds without truncating content', async () => {
        beforeIdentity = async () => {
          throw new Error('controlled-provider-unavailable-sentinel')
        }
        const unavailable = await readA()
        expect(unavailable.body).not.toContain('read-a-text-sentinel')
        expect(unavailable.body).not.toContain(
          'controlled-provider-unavailable-sentinel'
        )
        beforeIdentity = undefined
        try {
          await journeys.block.update({
            where: { id: 'read-a-text' },
            data: { content: '\n'.repeat(240000) }
          })
          const bounded = await readA()
          expect(bounded.status).toBe(200)
          const complete = JSON.parse(bounded.body) as {
            result: {
              structuredContent: {
                blocks: Array<{ id: string; content?: string }>
              }
            }
          }
          expect(
            complete.result.structuredContent.blocks.find(
              (block) => block.id === 'read-a-text'
            )?.content
          ).toHaveLength(240000)
          await journeys.block.update({
            where: { id: 'read-a-text' },
            data: { content: 'x'.repeat(524289) }
          })
          const first = await readA()
          const page = JSON.parse(first.body) as {
            result: {
              structuredContent: {
                revision: string
                complete: boolean
                nextCursor: string
                blocks: Array<{ id: string }>
              }
            }
          }
          expect(page.result.structuredContent.complete).toBe(false)
          expect(
            page.result.structuredContent.blocks.some(
              (block) => block.id === 'read-a-text'
            )
          ).toBe(false)
          expect(page.result.structuredContent.nextCursor).toEqual(
            expect.any(String)
          )
          const oversized = await call('journey_read', {
            journeyId: 'read-a',
            view: 'steps',
            revision: page.result.structuredContent.revision,
            cursor: page.result.structuredContent.nextCursor
          })
          expect(oversized.body).toContain('LIMIT_EXCEEDED')
          expect(oversized.body.length).toBeLessThan(1000)
        } finally {
          await journeys.block.update({
            where: { id: 'read-a-text' },
            data: { content: 'read-a-text-sentinel' }
          })
        }
      })

      it('retains an accepted bounded action across expiry until its executor positively settles it', async () => {
        const request = {
          tool: 'journey_read',
          input: { journeyId: 'read-a', view: 'outline' }
        }
        const exchanged = await internal(
          'exchange',
          { token: accessToken, request },
          exchangeSecret
        )
        const { credential } = (await exchanged.json()) as {
          credential: string
        }
        const prepared = await internal('prepare', {
          credential,
          stage: 'output',
          outputHash: 'a'.repeat(64),
          resources: [{ journeyId: 'read-a', teamId: 'read-team' }]
        })
        const { permitId } = (await prepared.json()) as { permitId: string }
        expect(
          (await internal('accept', { credential, permitId })).status
        ).toBe(200)
        expect(
          (await internal('accept', { credential, permitId })).status
        ).toBe(403)
        await auth.agentConnection.updateMany({
          data: { expiresAt: await databaseTime(auth) }
        })
        expect(
          (await auth.readPermit.findUniqueOrThrow({ where: { id: permitId } }))
            .status
        ).toBe('accepted')
        expect(
          (await internal('settle', { permitId }, ownerSecret)).status
        ).toBe(403)
        expect(
          (await internal('settle', { permitId }, exchangeSecret)).status
        ).toBe(200)
        expect(
          (await auth.readPermit.findUniqueOrThrow({ where: { id: permitId } }))
            .status
        ).toBe('settled')
      })

      it('denies removed roles, disabled identities, closed gates, expiry and unavailable required authority', async () => {
        await journeys.userTeam.delete({
          where: { teamId_userId: { teamId: 'read-team', userId: 'alice' } }
        })
        expect((await readA()).body).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        const deniedAudits = await auth.securityAudit.findMany({
          where: { action: 'read_accept', outcome: 'denied', userId: 'alice' }
        })
        expect(deniedAudits.length).toBeGreaterThan(0)
        expect(JSON.stringify(deniedAudits)).not.toContain(
          'read-a-text-sentinel'
        )
        await journeys.userTeam.create({
          data: { teamId: 'read-team', userId: 'alice', role: 'manager' }
        })
        expect((await readA()).body).toContain('read-a-text-sentinel')
        invalidUsers.add('alice')
        expect((await readA()).body).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        invalidUsers.clear()
        expect((await readA()).body).toContain('read-a-text-sentinel')
        await auth.authorizationGate.updateMany({
          where: {
            id:
              'connection:' +
              (
                await auth.agentConnection.findFirstOrThrow({
                  orderBy: { approvedAt: 'desc' }
                })
              ).id
          },
          data: { open: false }
        })
        expect((await readA()).body).toContain('ACCESS_DENIED_OR_NOT_FOUND')
        await auth.authorizationGate.updateMany({
          data: { open: true, generation: { increment: 1 } }
        })
        expect((await readA()).body).toContain('read-a-text-sentinel')
        await auth.agentConnection.updateMany({
          data: { expiresAt: await databaseTime(auth) }
        })
        expect((await readA()).body).toContain('ACCESS_DENIED_OR_NOT_FOUND')
      })

      it.each(['2026-07-28', '2025-11-25'])(
        'rejects buffered output after grant withdrawal, rights loss or expiry on %s',
        async (version) => {
          const currentRead = () =>
            call(
              'journey_read',
              { journeyId: 'read-a', view: 'steps' },
              accessToken,
              version
            )
          beforeOutput = async () => {
            await auth.agentConnection.updateMany({
              data: { revokedAt: await databaseTime(auth) }
            })
          }
          const withdrawn = await currentRead()
          expect(withdrawn.body).not.toContain('read-a-text-sentinel')
          expect(withdrawn.status).toBe(500)
          beforeOutput = undefined
          accessToken = await consent('alice', ['read-a'])
          beforeOutput = async () => {
            await journeys.userTeam.deleteMany({
              where: { teamId: 'read-team', userId: 'alice' }
            })
          }
          expect((await currentRead()).body).not.toContain(
            'read-a-text-sentinel'
          )
          beforeOutput = undefined
          await journeys.userTeam.create({
            data: { teamId: 'read-team', userId: 'alice', role: 'member' }
          })
          accessToken = await consent('alice', ['read-a'])
          beforeOutput = async () => {
            await auth.agentConnection.updateMany({
              data: { expiresAt: await databaseTime(auth) }
            })
          }
          expect((await currentRead()).body).not.toContain(
            'read-a-text-sentinel'
          )
        }
      )

      it('settles output acceptance that returns after the MCP socket has positively closed', async () => {
        let outputReady: () => void = () => undefined
        let releaseOutput: () => void = () => undefined
        const preparing = new Promise<void>((resolve) => {
          outputReady = resolve
        })
        let outputExecutorId = ''
        const outputDone = new Promise<void>((resolve) => {
          afterOutput = resolve
        })
        beforeOutput = async (executorId) => {
          outputExecutorId = executorId
          outputReady()
          await new Promise<void>((resolve) => {
            releaseOutput = resolve
          })
        }
        const closed = new Promise<void>((resolve) => {
          mcp.server.once('connection', (socket) =>
            socket.once('close', () => resolve())
          )
        })
        const outgoing = httpRequest(mcpUrl, {
          method: 'POST',
          agent: false,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'mcp-protocol-version': '2026-07-28',
            'mcp-method': 'tools/call',
            'mcp-name': 'journey_read'
          }
        })
        outgoing.on('error', () => undefined)
        outgoing.end(
          JSON.stringify(
            message('2026-07-28', 'tools/call', {
              name: 'journey_read',
              arguments: { journeyId: 'read-a', view: 'outline' }
            })
          )
        )
        await preparing
        outgoing.destroy()
        await closed
        releaseOutput()
        const connection = await auth.agentConnection.findFirstOrThrow({
          orderBy: { approvedAt: 'desc' }
        })
        await outputDone
        await vi.waitFor(async () =>
          expect(
            await auth.readExecutor.findUnique({
              where: { id: outputExecutorId }
            })
          ).toMatchObject({ executor: 'mcp', fencedAt: expect.any(Date) })
        )
        expect(
          await auth.readPermit.count({
            where: { connectionId: connection.id, status: 'accepted' }
          })
        ).toBe(0)
      })

      async function manageConnection() {
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
        const { csrf } = (await page.json()) as { csrf: string }
        const connection = await auth.agentConnection.findFirstOrThrow({
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
      function barrier() {
        let arrived!: () => void
        let resume!: () => void
        const ready = new Promise<void>((resolve) => {
          arrived = resolve
        })
        const released = new Promise<void>((resolve) => {
          resume = resolve
        })
        return {
          ready,
          resume,
          pause: async () => {
            arrived()
            await released
          }
        }
      }

      it.each(['access', 'disconnect'])(
        'blocks a real read paused before acceptance after %s',
        async (kind) => {
          const context = await manageConnection()
          const pause = barrier()
          beforeAcceptance = async (stage) => {
            if (stage === 'read') await pause.pause()
          }
          const reading = readA()
          await pause.ready
          let change: Response
          if (kind === 'access') {
            const reviewed = await context.post('access-review', {
              journeyIds: ['read-b'],
              mode: 'view'
            })
            expect(reviewed.status).toBe(200)
            const review = (await reviewed.json()) as { reviewToken: string }
            change = await context.post('access-approve', {
              reviewToken: review.reviewToken
            })
          } else change = await context.post('disconnect')
          expect(change.status).toBe(200)
          expect(await change.json()).toMatchObject({ status: 'complete' })
          pause.resume()
          expect((await reading).body).not.toContain('read-a-text-sentinel')
          beforeAcceptance = undefined
          expect((await readA()).body).not.toContain('read-a-text-sentinel')
        }
      )

      it('keeps accepted real reads pending through a lost settlement response and recovers from the owning receipt', async () => {
        const context = await manageConnection()
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const reading = readA()
        await pause.ready
        const changed = await context.post('disconnect')
        expect(changed.status).toBe(200)
        const change = (await changed.json()) as { changeId: string }
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'pending' })
        settlementOutage = true
        pause.resume()
        expect((await reading).body).not.toContain('read-a-text-sentinel')
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'pending' })
        const permit = await auth.readPermit.findFirstOrThrow({
          where: { connectionId: context.connection.id, status: 'accepted' }
        })
        expect(
          await journeys.mcpReadExecution.findUnique({
            where: { id: permit.id }
          })
        ).toMatchObject({ status: 'settled', reportedAt: null })
        settlementOutage = false
        await ownerHandler.reconcile()
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'complete' })
        expect(
          await auth.connectionHistoryPurge.findUnique({
            where: { connectionId: context.connection.id }
          })
        ).toMatchObject({ completedAt: null })
      })

      it('reconciles every receipt page despite a failed fence report and retries the retained receipt', async () => {
        // Real receipts, execution locks and authenticated authority reports.
        // The first failed row must not starve the rest of its page or page two.
        const receipts = Array.from({ length: 105 }, (_, index) => ({
          id: `pagination-${String(index).padStart(3, '0')}-${randomUUID()}`,
          executorId: randomUUID()
        }))
        await journeys.mcpReadExecution.createMany({ data: receipts })
        failedFenceReports.add(receipts[0].executorId)
        try {
          await ownerHandler.reconcile()
          const stored = await journeys.mcpReadExecution.findMany({
            where: { id: { in: receipts.map(({ id }) => id) } },
            orderBy: { id: 'asc' }
          })
          expect(stored).toHaveLength(105)
          expect(stored[0]).toMatchObject({
            status: 'fenced',
            completedAt: expect.any(Date),
            reportedAt: null
          })
          expect(stored.slice(1)).toEqual(
            receipts.slice(1).map((receipt) =>
              expect.objectContaining({
                ...receipt,
                status: 'fenced',
                completedAt: expect.any(Date),
                reportedAt: expect.any(Date)
              })
            )
          )
          expect(
            await auth.readExecutor.count({
              where: {
                id: {
                  in: receipts.slice(1).map(({ executorId }) => executorId)
                },
                executor: 'journeys',
                fencedAt: { not: null }
              }
            })
          ).toBe(104)
          failedFenceReports.clear()
          await ownerHandler.reconcile()
          expect(
            await journeys.mcpReadExecution.findUniqueOrThrow({
              where: { id: receipts[0].id }
            })
          ).toMatchObject({ reportedAt: expect.any(Date) })
          expect(
            await auth.readExecutor.findUniqueOrThrow({
              where: { id: receipts[0].executorId }
            })
          ).toMatchObject({ executor: 'journeys', fencedAt: expect.any(Date) })
        } finally {
          failedFenceReports.clear()
          await journeys.mcpReadExecution.deleteMany({
            where: { id: { in: receipts.map(({ id }) => id) } }
          })
        }
      })

      it('denies buffered private output after a completed management withdrawal', async () => {
        const context = await manageConnection()
        beforeOutput = async () => {
          const response = await context.post('disconnect')
          expect(await response.json()).toMatchObject({ status: 'complete' })
        }
        const result = await readA()
        expect(result.body).not.toContain('read-a-text-sentinel')
        expect(result.status).toBe(500)
      })

      it('counts accepted private output until its real MCP sender closes, independently from the reader', async () => {
        const context = await manageConnection()
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'output') await pause.pause()
        }
        const reading = readA()
        await pause.ready
        const changed = await context.post('disconnect')
        const change = (await changed.json()) as {
          changeId: string
          status: string
        }
        expect(change.status).toBe('pending')
        await ownerHandler.reconcile()
        expect(
          await auth.connectionChange.findUnique({
            where: { id: change.changeId }
          })
        ).toMatchObject({ status: 'pending' })
        pause.resume()
        // This bounded release was accepted before withdrawal. Its bytes are outside recall.
        expect((await reading).body).toContain('read-a-text-sentinel')
        await vi.waitFor(async () =>
          expect(
            await auth.connectionChange.findUnique({
              where: { id: change.changeId }
            })
          ).toMatchObject({ status: 'complete' })
        )
      })

      it('keeps identity/expiry through resource changes and reconnects with exactly the new grant', async () => {
        const context = await manageConnection()
        const originalToken = accessToken
        const apply = async (
          current: Awaited<ReturnType<typeof manageConnection>>,
          ids: string[]
        ) => {
          const review = await current.post('access-review', {
            journeyIds: ids,
            mode: 'view'
          })
          expect(review.status).toBe(200)
          const { reviewToken } = (await review.json()) as {
            reviewToken: string
          }
          const changed = await current.post('access-approve', { reviewToken })
          expect(await changed.json()).toMatchObject({ status: 'complete' })
          const next = await auth.agentConnection.findUniqueOrThrow({
            where: { id: current.connection.id }
          })
          expect(next.expiresAt).toEqual(context.connection.expiresAt)
          expect(next.userId).toBe(context.connection.userId)
          return next
        }
        const expanded = await apply(context, ['read-a', 'read-b'])
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        accessToken = await consent('alice', ['read-a', 'read-b'], 'view', {
          id: expanded.id,
          version: expanded.version
        })
        expect((await readA()).body).toContain('read-a-text-sentinel')
        expect(
          (await call('journey_read', { journeyId: 'read-b', view: 'steps' }))
            .body
        ).toContain('read-b-text-sentinel')
        const reduced = await apply(await manageConnection(), ['read-b'])
        accessToken = await consent('alice', ['read-b'], 'view', {
          id: reduced.id,
          version: reduced.version
        })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        expect(
          (await call('journey_read', { journeyId: 'read-b', view: 'steps' }))
            .body
        ).toContain('read-b-text-sentinel')
        expect(
          (
            await call(
              'journey_read',
              { journeyId: 'read-a', view: 'steps' },
              originalToken
            )
          ).body
        ).not.toContain('read-a-text-sentinel')
      })

      it('does not treat killing an MCP replica as proof its accepted Journeys read stopped', async () => {
        const context = await manageConnection()
        const child = fork(
          new URL(
            '../../api-mcp/test/granted-read-process.ts',
            import.meta.url
          ),
          [],
          {
            execArgv: ['--import', import.meta.resolve('tsx')],
            stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
            env: {
              ...process.env,
              MCP_AUTH_MODE: 'granted-reads',
              MCP_PUBLIC_URL: config.AUTH_AUDIENCE,
              MCP_ISSUER_URL: config.AUTH_ISSUER,
              MCP_GATEWAY_URL: gatewayUrl,
              MCP_EXCHANGE_CLIENT_SECRET: exchangeSecret
            }
          }
        )
        const exited = new Promise<void>((resolve) =>
          child.once('exit', () => resolve())
        )
        const port = await new Promise<number>((resolve, reject) => {
          child.once('message', (message: { port: number }) =>
            resolve(message.port)
          )
          child.once('exit', () =>
            reject(new Error('MCP child exited before readiness'))
          )
        })
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const previousUrl = mcpUrl
        try {
          mcpUrl = `http://127.0.0.1:${port}/mcp`
          const reading = readA().catch(() => undefined)
          await pause.ready
          const response = await context.post('disconnect')
          const change = (await response.json()) as {
            changeId: string
            status: string
          }
          expect(change.status).toBe('pending')
          child.kill('SIGKILL')
          await exited
          await reading
          expect(
            await auth.connectionChange.findUnique({
              where: { id: change.changeId }
            })
          ).toMatchObject({ status: 'pending' })
          expect(
            await auth.readPermit.count({
              where: {
                connectionId: context.connection.id,
                stage: 'read',
                status: 'accepted'
              }
            })
          ).toBe(1)
          pause.resume()
          await vi.waitFor(
            async () =>
              expect(
                await auth.connectionChange.findUnique({
                  where: { id: change.changeId }
                })
              ).toMatchObject({ status: 'complete' }),
            { timeout: 5000 }
          )
        } finally {
          mcpUrl = previousUrl
          pause.resume()
          child.kill('SIGKILL')
          await exited
        }
      })

      it('creates no durable executor state for junk-token metadata requests', async () => {
        const before = await auth.readExecutor.count()
        const response = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer junk',
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'mcp-protocol-version': '2026-07-28',
            'mcp-method': 'tools/list'
          },
          body: JSON.stringify(message('2026-07-28', 'tools/list'))
        })
        expect(response.status).toBe(200)
        await response.text()
        expect(await auth.readExecutor.count()).toBe(before)
      })

      it('rejects stale gate generations and final acceptance after a lock wait reaches expiry', async () => {
        const request = {
          tool: 'journey_read',
          input: { journeyId: 'read-a', view: 'outline' }
        }
        const exchanged = await internal(
          'exchange',
          { token: accessToken, request },
          exchangeSecret
        )
        expect(exchanged.status).toBe(200)
        const { credential } = (await exchanged.json()) as {
          credential: string
        }
        const prepared = await internal('prepare', {
          credential,
          stage: 'read',
          resources: [{ journeyId: 'read-a', teamId: 'read-team' }]
        })
        const { permitId } = (await prepared.json()) as { permitId: string }
        await auth.authorizationGate.update({
          where: { id: 'journey:read-a' },
          data: { generation: { increment: 2 } }
        })
        expect(
          (await internal('accept', { credential, permitId })).status
        ).toBe(403)
        const next = await internal('prepare', {
          credential,
          stage: 'read',
          resources: [{ journeyId: 'read-a', teamId: 'read-team' }]
        })
        const nextPermit = (await next.json()) as { permitId: string }
        let releaseLock: () => void = () => undefined
        let locked: () => void = () => undefined
        const ready = new Promise<void>((resolve) => {
          locked = resolve
        })
        const blocker = auth.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "AuthorizationGate" WHERE id = 'account:alice' FOR UPDATE`
          await tx.agentConnection.updateMany({
            where: { userId: 'alice' },
            data: { expiresAt: await databaseTime(tx) }
          })
          locked()
          await new Promise<void>((resolve) => {
            releaseLock = resolve
          })
        })
        await ready
        const acceptance = internal('accept', {
          credential,
          permitId: nextPermit.permitId
        })
        let observedWait = false
        const waitDeadline = Date.now() + 1500
        while (!observedWait && Date.now() < waitDeadline) {
          const [row] = await auth.$queryRaw<
            Array<{ waiting: boolean }>
          >`SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()) AS waiting`
          observedWait = row.waiting
          if (!observedWait)
            await new Promise((resolve) => setTimeout(resolve, 10))
        }
        releaseLock()
        await blocker
        expect(observedWait).toBe(true)
        expect((await acceptance).status).toBe(403)
      })

      it('checks current time after waiting for the permit row lock', async () => {
        const request = {
          tool: 'journey_read',
          input: { journeyId: 'read-a', view: 'outline' }
        }
        const exchange = await internal(
          'exchange',
          { token: accessToken, request },
          exchangeSecret
        )
        const { credential } = (await exchange.json()) as { credential: string }
        const prepared = await internal('prepare', {
          credential,
          stage: 'read',
          resources: [{ journeyId: 'read-a', teamId: 'read-team' }]
        })
        const { permitId } = (await prepared.json()) as { permitId: string }
        const expiresAt = new Date((await databaseTime(auth)).getTime() + 1500)
        await auth.agentConnection.updateMany({
          where: { userId: 'alice' },
          data: { expiresAt }
        })
        let unlock: () => void = () => undefined
        let locked: () => void = () => undefined
        const ready = new Promise<void>((resolve) => {
          locked = resolve
        })
        const blocker = auth.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "ReadPermit" WHERE id = ${permitId} FOR UPDATE`
          locked()
          await new Promise<void>((resolve) => {
            unlock = resolve
          })
        })
        await ready
        const acceptance = internal('accept', { credential, permitId })
        let observedWait = false
        const deadline = Date.now() + 1000
        while (!observedWait && Date.now() < deadline) {
          const [row] = await auth.$queryRaw<
            Array<{ waiting: boolean }>
          >`SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()) AS waiting`
          observedWait = row.waiting
          if (!observedWait)
            await new Promise((resolve) => setTimeout(resolve, 10))
        }
        const beforeExpiry = (await databaseTime(auth)) < expiresAt
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.max(0, expiresAt.getTime() - Date.now()) + 50
          )
        )
        unlock()
        await blocker
        expect(observedWait).toBe(true)
        expect(beforeExpiry).toBe(true)
        expect((await acceptance).status).toBe(403)
        expect(
          (await auth.readPermit.findUniqueOrThrow({ where: { id: permitId } }))
            .acceptedAt
        ).toBeNull()
      })

      it('rejects exchange credential confusion, arbitrary identity, forged headers and GraphQL/entity/batch bypasses', async () => {
        const request = {
          tool: 'journey_read',
          input: { journeyId: 'read-a', view: 'outline' }
        }
        for (const secret of [
          '',
          ownerSecret,
          config.AUTH_INTROSPECTION_CLIENT_SECRET
        ])
          expect(
            (
              await internal(
                'exchange',
                { token: accessToken, request },
                secret
              )
            ).status
          ).toBe(403)
        expect(
          (
            await internal(
              'exchange',
              { token: accessToken, request, userId: 'bob' },
              exchangeSecret
            )
          ).status
        ).toBe(403)
        for (const url of [gatewayUrl, `${ownerUrl}/graphql`]) {
          const exchanged = await internal(
            'exchange',
            { token: accessToken, request },
            exchangeSecret
          )
          const { credential } = (await exchanged.json()) as {
            credential: string
          }
          for (const query of [
            '{ adminJourney(id:"read-b") { id } }',
            '{ _entities(representations:[{__typename:"Journey",id:"read-b"}]) { __typename } }'
          ]) {
            const denied = await fetch(url, {
              method: 'POST',
              headers: {
                Authorization: `MCP ${credential}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query })
            })
            expect(denied.status).toBe(403)
            expect(await denied.text()).toBe(
              '{"error":"ACCESS_DENIED_OR_NOT_FOUND"}'
            )
          }
          const batch = await fetch(url, {
            method: 'POST',
            headers: {
              'x-mcp-context': 'forged',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ query: '{ health }' }])
          })
          expect(batch.status).toBe(403)
        }
        const publicQuery =
          '{ journey(id:"read-published", idType: databaseId) { id title } }'
        const publicRead = await fetch(gatewayUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: publicQuery })
        })
        expect(await publicRead.text()).toContain(
          'private-read-published-sentinel'
        )
        const bearerRead = await fetch(gatewayUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ query: publicQuery })
        })
        const bearerBody = await bearerRead.text()
        expect(JSON.parse(bearerBody)).toMatchObject({
          data: null,
          errors: [expect.anything()]
        })
        expect(bearerBody).not.toContain('read-published')
        const directBearer = await fetch(`${ownerUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ query: publicQuery })
        })
        expect(directBearer.status).toBe(403)
        expect(await directBearer.text()).toBe(
          '{"error":"ACCESS_DENIED_OR_NOT_FOUND"}'
        )
        const wrong = signEnvelope(
          {
            purpose: 'gateway-read',
            issuer: config.AUTH_ISSUER,
            audience: config.AUTH_READ_GATEWAY_AUDIENCE,
            environment: 'stage',
            expiresAt: Date.now() + 60000,
            subject: 'alice',
            connectionId: 'forged',
            grantVersion: 1,
            journeyIds: ['read-a'],
            mode: 'view',
            scope: 'journeys:read',
            requestId: randomBytes(16).toString('hex'),
            requestHash: fingerprint(request)
          },
          privateKey
        )
        const body = JSON.stringify({ request, stage: 'read' })
        expect(
          (
            await fetch(`${ownerUrl}/mcp/reads`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-mcp-context': wrong,
                'x-mcp-signature': internalSignature(
                  wrong,
                  body,
                  internalSecret
                )
              },
              body
            })
          ).status
        ).toBe(403)
      })

      async function humanMutation(
        query: string,
        variables: Record<string, unknown> = {},
        user = 'bob'
      ) {
        const response = await fetch(`${ownerUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-controlled-human': user
          },
          body: JSON.stringify({ query, variables })
        })
        return (await response.json()) as {
          data?: Record<string, unknown>
          errors?: Array<{
            message: string
            extensions?: { code?: string; changeId?: string }
          }>
        }
      }
      async function permissionActors() {
        await journeys.userTeam.upsert({
          where: { teamId_userId: { teamId: 'read-team', userId: 'bob' } },
          create: { teamId: 'read-team', userId: 'bob', role: 'manager' },
          update: { role: 'manager' }
        })
        return journeys.userTeam.findUniqueOrThrow({
          where: { teamId_userId: { teamId: 'read-team', userId: 'alice' } }
        })
      }
      const deleteMembership = (id: string) =>
        humanMutation(
          'mutation RemoveMembership($id: ID!) { userTeamDelete(id: $id) { id } }',
          { id }
        )
      async function inviteAlice() {
        await journeys.userTeamInvite.upsert({
          where: {
            teamId_email: {
              teamId: 'read-team',
              email: 'alice@synthetic.example'
            }
          },
          create: {
            teamId: 'read-team',
            email: 'alice@synthetic.example',
            senderId: 'bob'
          },
          update: { acceptedAt: null, removedAt: null }
        })
        return humanMutation(
          'mutation RestoreMembership { userTeamInviteAcceptAll { id } }',
          {},
          'alice'
        )
      }

      it.each([
        'commit',
        'rollback',
        'delivery-retry',
        'report-retry',
        'existing-profile',
        'anonymous-profile'
      ] as const)(
        'persists profile subscription with the owner receipt: %s',
        async (mode) => {
          if (mode === 'anonymous-profile') anonymousProfileActors.add('alice')
          vi.stubEnv('MAILCHIMP_AUDIENCE_ID', 'controlled-profile-audience')
          const subscription = vi
            .spyOn(mailchimp.lists, 'setListMember')
            .mockImplementation(async () => {
              expect(
                await journeys.journeyProfile.findUnique({
                  where: { userId: 'alice' }
                })
              ).toMatchObject({ acceptedTermsAt: expect.any(Date) })
              expect(
                await journeys.mcpPermissionExecution.findFirst({
                  where: { status: 'committed' }
                })
              ).not.toBeNull()
              if (mode === 'delivery-retry')
                throw new Error('Controlled Mailchimp outage')
              return {} as Awaited<
                ReturnType<typeof mailchimp.lists.setListMember>
              >
            })
          const configure = vi.spyOn(mailchimp, 'setConfig').mockReturnValue()
          if (mode !== 'existing-profile')
            await journeys.journeyProfile.delete({
              where: { userId: 'alice' }
            })
          if (mode === 'rollback') {
            await journeys.$executeRawUnsafe(
              `CREATE FUNCTION review_10600_fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.status = 'committed' THEN RAISE EXCEPTION 'Controlled receipt failure'; END IF; RETURN NEW; END $$`
            )
            await journeys.$executeRawUnsafe(
              `CREATE TRIGGER review_10600_fail_receipt BEFORE UPDATE ON "McpPermissionExecution" FOR EACH ROW EXECUTE FUNCTION review_10600_fail_receipt()`
            )
          }
          permissionReportOutage = mode === 'report-retry'
          try {
            const result = await humanMutation(
              'mutation CreateProfile { journeyProfileCreate { id acceptedTermsAt } }',
              {},
              'alice'
            )
            if (mode === 'rollback') {
              expect(result.errors).toHaveLength(1)
              expect(
                await journeys.journeyProfile.findUnique({
                  where: { userId: 'alice' }
                })
              ).toBeNull()
              expect(subscription).not.toHaveBeenCalled()
              return
            }
            const receipt =
              await journeys.mcpPermissionExecution.findFirstOrThrow({
                where: { status: 'committed' }
              })
            const user = {
              email: 'alice@synthetic.example',
              firstName: 'alice'
            }
            expect(receipt.intent).toMatchObject({
              effects:
                mode === 'existing-profile' || mode === 'anonymous-profile'
                  ? []
                  : [{ type: 'mailchimpSubscription', user }]
            })
            if (mode === 'delivery-retry' || mode === 'report-retry') {
              expect(result.errors).toHaveLength(1)
              expect(receipt.reportedAt).toBeNull()
              if (mode === 'report-retry')
                expect(subscription).not.toHaveBeenCalled()
              else expect(subscription).toHaveBeenCalled()
              subscription
                .mockClear()
                .mockResolvedValue(
                  {} as Awaited<
                    ReturnType<typeof mailchimp.lists.setListMember>
                  >
                )
              permissionReportOutage = false
              const restarted = restartPermissionCoordinator(
                {
                  authorityUrl,
                  authoritySecret: config.AUTH_PERMISSION_JOURNEYS_SECRET!
                },
                journeys
              )
              expect(await restarted.reconcile(receipt.id)).toBe(0)
              expect(subscription).toHaveBeenCalledExactlyOnceWith(
                'controlled-profile-audience',
                user.email,
                {
                  email_address: user.email,
                  status_if_new: 'subscribed',
                  merge_fields: { FNAME: user.firstName, LNAME: undefined }
                }
              )
              expect(
                await journeys.mcpPermissionExecution.findUnique({
                  where: { id: receipt.id }
                })
              ).toMatchObject({ reportedAt: expect.any(Date) })
              expect(await restarted.reconcile(receipt.id)).toBe(0)
              expect(subscription).toHaveBeenCalledOnce()
            } else {
              expect(result.errors).toBeUndefined()
              expect(receipt.reportedAt).not.toBeNull()
              if (mode === 'existing-profile' || mode === 'anonymous-profile')
                expect(subscription).not.toHaveBeenCalled()
              else expect(subscription).toHaveBeenCalledOnce()
            }
          } finally {
            subscription.mockRestore()
            configure.mockRestore()
            vi.unstubAllEnvs()
            if (mode === 'rollback') {
              await journeys.$executeRawUnsafe(
                'DROP TRIGGER review_10600_fail_receipt ON "McpPermissionExecution"'
              )
              await journeys.$executeRawUnsafe(
                'DROP FUNCTION review_10600_fail_receipt()'
              )
            }
          }
        }
      )

      it.each(['commit', 'rollback', 'delivery-retry'] as const)(
        'delivers team removal only from a committed durable receipt: %s',
        async (mode) => {
          const membership = await permissionActors()
          if (mode === 'rollback') {
            await journeys.$executeRawUnsafe(
              `CREATE FUNCTION review_10600_fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.status = 'committed' THEN RAISE EXCEPTION 'Controlled receipt failure'; END IF; RETURN NEW; END $$`
            )
            await journeys.$executeRawUnsafe(
              `CREATE TRIGGER review_10600_fail_receipt BEFORE UPDATE ON "McpPermissionExecution" FOR EACH ROW EXECUTE FUNCTION review_10600_fail_receipt()`
            )
          }
          mockQueueAdd.mockImplementation(async (name) => {
            if (name !== 'team-removed') return
            expect(
              await journeys.userTeam.findUnique({
                where: { id: membership.id }
              })
            ).toBeNull()
            expect(
              await journeys.mcpPermissionExecution.findFirst({
                where: { status: 'committed' }
              })
            ).not.toBeNull()
            if (mode === 'delivery-retry')
              throw new Error('Controlled email queue outage')
          })
          try {
            const result = await deleteMembership(membership.id)
            if (mode === 'rollback') {
              expect(result.errors).toHaveLength(1)
              expect(
                await journeys.userTeam.findUnique({
                  where: { id: membership.id }
                })
              ).not.toBeNull()
              expect(
                mockQueueAdd.mock.calls.filter(
                  ([name]) => name === 'team-removed'
                )
              ).toHaveLength(0)
            } else {
              const receipt =
                await journeys.mcpPermissionExecution.findFirstOrThrow({
                  where: { status: 'committed' }
                })
              expect(receipt.intent).toMatchObject({
                effects: [
                  {
                    type: 'teamRemoved',
                    userId: 'alice',
                    teamName: expect.any(String)
                  }
                ]
              })
              if (mode === 'delivery-retry') {
                expect(result.errors).toHaveLength(1)
                expect(receipt.reportedAt).toBeNull()
                const attempts = mockQueueAdd.mock.calls.filter(
                  ([name]) => name === 'team-removed'
                )
                expect(attempts.length).toBeGreaterThan(0)
                const options = attempts[0][2]
                mockQueueAdd.mockResolvedValue(undefined)
                expect(await permissionCoordinator.reconcile()).toBe(0)
                expect(mockQueueAdd).toHaveBeenLastCalledWith(
                  'team-removed',
                  { teamName: expect.any(String), userId: 'alice' },
                  options
                )
              } else expect(result.errors).toBeUndefined()
            }
          } finally {
            if (mode === 'rollback') {
              await journeys.$executeRawUnsafe(
                'DROP TRIGGER review_10600_fail_receipt ON "McpPermissionExecution"'
              )
              await journeys.$executeRawUnsafe(
                'DROP FUNCTION review_10600_fail_receipt()'
              )
            }
          }
        }
      )

      it.each([
        'commit',
        'rollback',
        'delivery-retry',
        'report-retry'
      ] as const)(
        'captures invitation acceptance notification with the owner receipt: %s',
        async (mode) => {
          const membership = await permissionActors()
          await journeys.userTeam.delete({ where: { id: membership.id } })
          if (mode === 'rollback') {
            await journeys.$executeRawUnsafe(
              `CREATE FUNCTION review_10600_fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.status = 'committed' THEN RAISE EXCEPTION 'Controlled receipt failure'; END IF; RETURN NEW; END $$`
            )
            await journeys.$executeRawUnsafe(
              `CREATE TRIGGER review_10600_fail_receipt BEFORE UPDATE ON "McpPermissionExecution" FOR EACH ROW EXECUTE FUNCTION review_10600_fail_receipt()`
            )
          }
          permissionReportOutage = mode === 'report-retry'
          mockQueueAdd.mockImplementation(async (name) => {
            if (name !== 'team-invite-accepted') return
            expect(
              await journeys.userTeam.findUnique({
                where: {
                  teamId_userId: { teamId: 'read-team', userId: 'alice' }
                }
              })
            ).not.toBeNull()
            expect(
              await journeys.mcpPermissionExecution.findFirst({
                where: { status: 'committed' }
              })
            ).not.toBeNull()
            if (mode === 'delivery-retry')
              throw new Error('Controlled email outage')
          })
          try {
            const result = await inviteAlice()
            if (mode === 'rollback') {
              expect(result.errors).toHaveLength(1)
              expect(
                await journeys.userTeam.findUnique({
                  where: {
                    teamId_userId: { teamId: 'read-team', userId: 'alice' }
                  }
                })
              ).toBeNull()
              expect(
                await journeys.userTeamInvite.findUnique({
                  where: {
                    teamId_email: {
                      teamId: 'read-team',
                      email: 'alice@synthetic.example'
                    }
                  }
                })
              ).toMatchObject({ acceptedAt: null })
              expect(
                mockQueueAdd.mock.calls.filter(
                  ([name]) => name === 'team-invite-accepted'
                )
              ).toHaveLength(0)
              return
            }
            const receipt =
              await journeys.mcpPermissionExecution.findFirstOrThrow({
                where: { status: 'committed' }
              })
            expect(receipt.intent).toMatchObject({
              effects: [
                {
                  type: 'teamInviteAccepted',
                  notification: {
                    team: {
                      id: 'read-team',
                      userTeams: expect.arrayContaining([
                        expect.objectContaining({
                          userId: 'alice',
                          role: 'member'
                        })
                      ])
                    },
                    sender: {
                      firstName: 'alice',
                      email: 'alice@synthetic.example'
                    }
                  }
                }
              ]
            })
            if (mode === 'commit') {
              expect(result.errors).toBeUndefined()
              expect(receipt.reportedAt).not.toBeNull()
            } else {
              expect(result.errors).toHaveLength(1)
              expect(receipt.reportedAt).toBeNull()
              if (mode === 'report-retry')
                expect(
                  mockQueueAdd.mock.calls.filter(
                    ([name]) => name === 'team-invite-accepted'
                  )
                ).toHaveLength(0)
              const effects = (
                receipt.intent as { effects: Array<{ notification: unknown }> }
              ).effects
              mockQueueAdd.mockResolvedValue(undefined)
              permissionReportOutage = false
              const restarted = restartPermissionCoordinator(
                {
                  authorityUrl,
                  authoritySecret: config.AUTH_PERMISSION_JOURNEYS_SECRET!
                },
                journeys
              )
              expect(await restarted.reconcile(receipt.id)).toBe(0)
              expect(mockQueueAdd).toHaveBeenLastCalledWith(
                'team-invite-accepted',
                effects[0].notification,
                {
                  jobId: `permission-${receipt.id}-0`,
                  removeOnComplete: { age: 24 * 3600 },
                  removeOnFail: { age: 24 * 3600 }
                }
              )
              expect(
                await journeys.mcpPermissionExecution.findUnique({
                  where: { id: receipt.id }
                })
              ).toMatchObject({ reportedAt: expect.any(Date) })
            }
          } finally {
            if (mode === 'rollback') {
              await journeys.$executeRawUnsafe(
                'DROP TRIGGER review_10600_fail_receipt ON "McpPermissionExecution"'
              )
              await journeys.$executeRawUnsafe(
                'DROP FUNCTION review_10600_fail_receipt()'
              )
            }
          }
        }
      )

      describe.each(['approval', 'template'] as const)(
        '%s durable jobs',
        (kind) => {
          it.each([
            'commit',
            'rollback',
            'delivery-retry',
            'report-retry'
          ] as const)(
            'dispatches only after commit and recovers the exact intent: %s',
            async (mode) => {
              await permissionActors()
              const journeyId = `read-effect-${kind}-${mode}`
              const journey = await journeys.journey.create({
                data: {
                  id: journeyId,
                  slug: journeyId,
                  title: 'Original notification title',
                  status: 'draft',
                  languageId: '529',
                  teamId: 'read-team',
                  userJourneys: {
                    create: { userId: 'alice', role: 'inviteRequested' }
                  }
                },
                include: { userJourneys: true }
              })
              const collaboratorId = journey.userJourneys[0].id
              const jobName =
                kind === 'approval'
                  ? 'journey-request-approved'
                  : 'create-template-site'
              const readState = async () =>
                kind === 'approval'
                  ? (
                      await journeys.userJourney.findUniqueOrThrow({
                        where: { id: collaboratorId }
                      })
                    ).role
                  : (
                      await journeys.journey.findUniqueOrThrow({
                        where: { id: journeyId }
                      })
                    ).template
              const committedState = kind === 'approval' ? 'editor' : true
              if (mode === 'rollback') {
                await journeys.$executeRawUnsafe(
                  `CREATE FUNCTION review_10600_fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.status = 'committed' THEN RAISE EXCEPTION 'Controlled receipt failure'; END IF; RETURN NEW; END $$`
                )
                await journeys.$executeRawUnsafe(
                  `CREATE TRIGGER review_10600_fail_receipt BEFORE UPDATE ON "McpPermissionExecution" FOR EACH ROW EXECUTE FUNCTION review_10600_fail_receipt()`
                )
              }
              permissionReportOutage = mode === 'report-retry'
              mockQueueAdd.mockImplementation(async (name) => {
                if (name !== jobName) return
                expect(await readState()).toBe(committedState)
                expect(
                  await journeys.mcpPermissionExecution.count({
                    where: { status: 'committed' }
                  })
                ).toBe(1)
                if (mode === 'delivery-retry')
                  throw new Error('Controlled job queue outage')
              })
              try {
                const result =
                  kind === 'approval'
                    ? await humanMutation(
                        'mutation Approve($id: ID!) { userJourneyApprove(id: $id) { id role } }',
                        { id: collaboratorId }
                      )
                    : await humanMutation(
                        'mutation Template($id: ID!) { journeyTemplate(id: $id, input: {template: true}) { id template } }',
                        { id: journeyId }
                      )
                const attempts = () =>
                  mockQueueAdd.mock.calls.filter(([name]) => name === jobName)
                if (mode === 'rollback') {
                  expect(result.errors).toHaveLength(1)
                  expect(await readState()).toBe(
                    kind === 'approval' ? 'inviteRequested' : false
                  )
                  expect(attempts()).toHaveLength(0)
                  expect(
                    await journeys.mcpPermissionExecution.count({
                      where: { status: 'committed' }
                    })
                  ).toBe(0)
                  expect(await permissionCoordinator.reconcile()).toBe(1)
                  expect(
                    await journeys.mcpPermissionExecution.findFirstOrThrow()
                  ).toMatchObject({
                    status: 'failed',
                    reportedAt: null
                  })
                  expect(attempts()).toHaveLength(0)
                  return
                }
                expect(await readState()).toBe(committedState)
                const receipt =
                  await journeys.mcpPermissionExecution.findFirstOrThrow({
                    where: { status: 'committed' }
                  })
                const payload =
                  kind === 'approval'
                    ? {
                        userId: 'alice',
                        url: expect.stringContaining(journeyId),
                        journey: expect.objectContaining({
                          id: journeyId,
                          title: journey.title,
                          primaryImageBlock: null
                        }),
                        sender: expect.objectContaining({
                          firstName: 'bob',
                          email: 'bob@synthetic.example'
                        })
                      }
                    : {
                        __typename: 'plausibleCreateTemplateSite',
                        templateId: journeyId
                      }
                expect(receipt.intent).toMatchObject({
                  effects: [
                    kind === 'approval'
                      ? { type: 'journeyApproved', notification: payload }
                      : { type: 'templateSite', templateId: journeyId }
                  ]
                })
                const options = {
                  jobId: `permission-${receipt.id}-0`,
                  removeOnComplete: {
                    age: kind === 'approval' ? 24 * 3600 : 5 * 24 * 3600
                  },
                  removeOnFail:
                    kind === 'approval'
                      ? { age: 24 * 3600 }
                      : { age: 5 * 24 * 3600, count: 50 }
                }
                if (mode === 'commit') {
                  expect(result.errors).toBeUndefined()
                  expect(receipt.reportedAt).not.toBeNull()
                  expect(attempts()).toHaveLength(1)
                } else {
                  expect(result.errors).toHaveLength(1)
                  expect(receipt.reportedAt).toBeNull()
                  if (mode === 'report-retry')
                    expect(attempts()).toHaveLength(0)
                  else {
                    expect(attempts().length).toBeGreaterThan(0)
                    for (const attempt of attempts())
                      expect(attempt).toEqual([jobName, payload, options])
                  }
                  await journeys.journey.update({
                    where: { id: journeyId },
                    data: { title: 'Changed after commit' }
                  })
                  const beforeRecovery =
                    await journeys.userJourney.findUniqueOrThrow({
                      where: { id: collaboratorId }
                    })
                  const restarted = restartPermissionCoordinator(
                    {
                      authorityUrl,
                      authoritySecret: config.AUTH_PERMISSION_JOURNEYS_SECRET!
                    },
                    journeys
                  )
                  permissionReportOutage = false
                  mockQueueAdd.mockResolvedValue(undefined)
                  expect(await restarted.reconcile()).toBe(0)
                  expect(
                    await journeys.userJourney.findUniqueOrThrow({
                      where: { id: collaboratorId }
                    })
                  ).toEqual(beforeRecovery)
                  expect(await journeys.mcpPermissionExecution.count()).toBe(1)
                  expect(
                    (
                      await journeys.mcpPermissionExecution.findUniqueOrThrow({
                        where: { id: receipt.id }
                      })
                    ).reportedAt
                  ).not.toBeNull()
                  const delivered = attempts().length
                  expect(await restarted.reconcile()).toBe(0)
                  expect(attempts()).toHaveLength(delivered)
                }
                expect(attempts().at(-1)).toEqual([jobName, payload, options])
              } finally {
                permissionReportOutage = false
                if (mode === 'rollback') {
                  await journeys.$executeRawUnsafe(
                    'DROP TRIGGER review_10600_fail_receipt ON "McpPermissionExecution"'
                  )
                  await journeys.$executeRawUnsafe(
                    'DROP FUNCTION review_10600_fail_receipt()'
                  )
                }
                await journeys.journey.delete({ where: { id: journeyId } })
              }
            }
          )
        }
      )

      it('applies actual team roles/removal and collaboration removal/restoration without widening the grant', async () => {
        const membership = await permissionActors()
        const connection = await auth.agentConnection.findFirstOrThrow({
          orderBy: { approvedAt: 'desc' }
        })
        const direct = await journeys.userJourney.create({
          data: { journeyId: 'read-a', userId: 'alice', role: 'editor' }
        })
        const role = await humanMutation(
          'mutation ChangeRole($id: ID!) { userTeamUpdate(id: $id, input: {role: member}) { role } }',
          { id: membership.id }
        )
        expect(role.errors).toBeUndefined()
        expect((await readA()).body).toContain('read-a-text-sentinel')
        expect((await deleteMembership(membership.id)).errors).toBeUndefined()
        // The independent direct collaboration survives team membership removal.
        expect((await readA()).body).toContain('read-a-text-sentinel')
        const removed = await humanMutation(
          'mutation RemoveCollaborator($id: ID!) { userJourneyRemove(id: $id) { id } }',
          { id: direct.id }
        )
        expect(removed.errors).toBeUndefined()
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        expect((await inviteAlice()).errors).toBeUndefined()
        expect((await readA()).body).toContain('read-a-text-sentinel')
        expect(
          (await call('journey_read', { journeyId: 'read-b', view: 'steps' }))
            .body
        ).not.toContain('read-b-text-sentinel')
        const unchanged = await auth.agentConnection.findUniqueOrThrow({
          where: { id: connection.id }
        })
        expect([
          unchanged.version,
          unchanged.expiresAt,
          unchanged.journeyIds,
          unchanged.mode
        ]).toEqual([
          connection.version,
          connection.expiresAt,
          connection.journeyIds,
          connection.mode
        ])
        await auth.agentConnection.update({
          where: { id: connection.id },
          data: { expiresAt: new Date(0) }
        })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
      })

      it('rejects a paused old ACL snapshot across completed real removal and restoration', async () => {
        const membership = await permissionActors()
        const pause = barrier()
        beforeAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const reading = readA()
        await pause.ready
        try {
          expect((await deleteMembership(membership.id)).errors).toBeUndefined()
          expect((await inviteAlice()).errors).toBeUndefined()
        } finally {
          pause.resume()
        }
        expect((await reading).body).not.toContain('read-a-text-sentinel')
        beforeAcceptance = undefined
        expect((await readA()).body).toContain('read-a-text-sentinel')
      })

      it('keeps an actual membership removal pending until accepted work settles and replays its durable intent', async () => {
        const membership = await permissionActors()
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const reading = readA()
        await pause.ready
        let changeId: string | undefined
        try {
          const pending = await deleteMembership(membership.id)
          expect(
            pending.errors?.[0].extensions?.code,
            JSON.stringify(pending)
          ).toBe('PERMISSION_CHANGE_PENDING')
          changeId = pending.errors?.[0].extensions?.changeId
          expect(changeId).toBeTruthy()
          const repeated = await deleteMembership(membership.id)
          expect(repeated.errors?.[0].extensions).toMatchObject({
            code: 'PERMISSION_CHANGE_PENDING',
            changeId
          })
          expect(await journeys.mcpPermissionExecution.count()).toBe(1)
          expect(await auth.permissionChange.count()).toBe(1)
          expect(
            await journeys.userTeam.findUnique({ where: { id: membership.id } })
          ).not.toBeNull()
          expect(
            await auth.permissionChange.findUnique({ where: { id: changeId! } })
          ).toMatchObject({ status: 'pending' })
          expect((await readA()).body).not.toContain('read-a-text-sentinel')
        } finally {
          pause.resume()
        }
        await reading
        afterAcceptance = undefined
        const reconciled = await permissionCoordinator.reconcile()
        expect(
          reconciled,
          JSON.stringify({
            local: await journeys.mcpPermissionExecution.findUnique({
              where: { id: changeId! }
            }),
            remote: await auth.permissionChange.findUnique({
              where: { id: changeId! }
            }),
            accepted: await auth.readPermit.findMany({
              where: { status: 'accepted' },
              select: { id: true, executor: true }
            })
          })
        ).toBe(0)
        expect(
          await journeys.userTeam.findUnique({ where: { id: membership.id } })
        ).toBeNull()
        expect(
          await auth.permissionChange.findUnique({ where: { id: changeId! } })
        ).toMatchObject({ status: 'complete', outcome: 'committed' })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        expect((await inviteAlice()).errors).toBeUndefined()
      })

      it('coordinates ownership promotion and lifecycle state through real GraphQL entrypoints', async () => {
        await permissionActors()
        const owner = await journeys.userJourney.upsert({
          where: { journeyId_userId: { journeyId: 'read-a', userId: 'alice' } },
          create: { journeyId: 'read-a', userId: 'alice', role: 'owner' },
          update: { role: 'owner' }
        })
        const target = await journeys.userJourney.upsert({
          where: { journeyId_userId: { journeyId: 'read-a', userId: 'bob' } },
          create: { journeyId: 'read-a', userId: 'bob', role: 'editor' },
          update: { role: 'editor' }
        })
        expect(
          (
            await humanMutation(
              'mutation Promote($id: ID!) { userJourneyPromote(id: $id) { id role } }',
              { id: target.id }
            )
          ).errors
        ).toBeUndefined()
        expect(
          await journeys.userJourney.findUnique({ where: { id: owner.id } })
        ).toMatchObject({ role: 'editor' })
        expect(
          await journeys.userJourney.findUnique({ where: { id: target.id } })
        ).toMatchObject({ role: 'owner' })
        expect(
          (
            await humanMutation(
              'mutation Archive($ids: [ID!]!) { journeysArchive(ids: $ids) { id } }',
              { ids: ['read-a'] }
            )
          ).errors
        ).toBeUndefined()
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        expect(
          (
            await humanMutation(
              'mutation Restore($ids: [ID!]!) { journeysRestore(ids: $ids) { id } }',
              { ids: ['read-a'] }
            )
          ).errors
        ).toBeUndefined()
        expect((await readA()).body).toContain('read-a-text-sentinel')
        await journeys.userJourney.deleteMany({
          where: { journeyId: 'read-a' }
        })
      })

      it('retires account authority through the real users retirement participant, including accepted work and other users', async () => {
        const bobToken = await consent('bob', ['read-foreign'])
        // Restore the current Alice credential, whose logical connection is independent.
        const alice = await auth.agentConnection.findFirstOrThrow({
          where: { userId: 'alice' },
          orderBy: { approvedAt: 'desc' }
        })
        const pause = barrier()
        afterAcceptance = async (stage) => {
          if (stage === 'read') await pause.pause()
        }
        const reading = readA()
        await pause.ready
        vi.stubEnv('MCP_READS_ENABLED', 'true')
        vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', config.AUTH_ISSUER)
        vi.stubEnv(
          'MCP_ACCOUNT_AUTHORITY_SECRET',
          config.AUTH_PERMISSION_USERS_SECRET
        )
        const participantModule = new URL(
          '../../api-users/src/schema/userDelete/service/retireMcpAccount.ts',
          import.meta.url
        ).href
        const { retireMcpAccount } = (await import(
          /* webpackChunkName: "account-retirement-participant" */ participantModule
        )) as { retireMcpAccount(userId: string): Promise<void> }
        try {
          await expect(retireMcpAccount('alice')).rejects.toThrow(
            'MCP authority retirement pending'
          )
          expect(
            await auth.agentConnection.findUnique({ where: { id: alice.id } })
          ).toMatchObject({ revokedAt: expect.any(Date) })
          expect((await readA()).body).not.toContain('read-a-text-sentinel')
        } finally {
          pause.resume()
        }
        await reading
        afterAcceptance = undefined
        await vi.waitFor(() => retireMcpAccount('alice'), { timeout: 5000 })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        expect(
          (
            await call(
              'journey_read',
              { journeyId: 'read-foreign', view: 'steps' },
              bobToken
            )
          ).body
        ).toContain('read-foreign-text-sentinel')
        expect(
          await auth.connectionHistoryPurge.findUnique({
            where: { connectionId: alice.id }
          })
        ).not.toBeNull()
        expect(
          await auth.authorizationGate.findUnique({
            where: { id: 'account:alice' }
          })
        ).toMatchObject({ open: false })
        vi.unstubAllEnvs()
      })

      it('fails closed on permission authority outage and recovers a committed ownership receipt without repeating it', async () => {
        const membership = await permissionActors()
        permissionOutage = true
        const unavailable = await deleteMembership(membership.id)
        expect(unavailable.errors).toHaveLength(1)
        expect(
          await journeys.userTeam.findUnique({ where: { id: membership.id } })
        ).not.toBeNull()
        permissionOutage = false
        expect(await permissionCoordinator.reconcile()).toBe(0)
        expect(
          await journeys.userTeam.findUnique({ where: { id: membership.id } })
        ).toBeNull()
        expect((await inviteAlice()).errors).toBeUndefined()
        const owner = await journeys.userJourney.create({
          data: { journeyId: 'read-a', userId: 'alice', role: 'owner' }
        })
        const target = await journeys.userJourney.create({
          data: { journeyId: 'read-a', userId: 'bob', role: 'editor' }
        })
        permissionReportOutage = true
        const lost = await humanMutation(
          'mutation Promote($id: ID!) { userJourneyPromote(id: $id) { id } }',
          { id: target.id }
        )
        expect(lost.errors).toHaveLength(1)
        expect(
          await journeys.userJourney.findUnique({ where: { id: owner.id } })
        ).toMatchObject({ role: 'editor' })
        const receipt = await journeys.mcpPermissionExecution.findFirstOrThrow({
          where: { status: 'committed', reportedAt: null }
        })
        expect(
          await auth.permissionChange.findUnique({ where: { id: receipt.id } })
        ).toMatchObject({ status: 'ready' })
        expect((await readA()).body).not.toContain('read-a-text-sentinel')
        permissionReportOutage = false
        expect(await permissionCoordinator.reconcile()).toBe(0)
        expect(
          await auth.permissionChange.findUnique({ where: { id: receipt.id } })
        ).toMatchObject({ status: 'complete' })
        expect(
          await journeys.userJourney.findUnique({ where: { id: target.id } })
        ).toMatchObject({ role: 'owner' })
        expect((await readA()).body).toContain('read-a-text-sentinel')
        await journeys.userJourney.deleteMany({
          where: { journeyId: 'read-a' }
        })
      })

      it('coordinates both teams during the existing ownership transfer entrypoint', async () => {
        await permissionActors()
        await journeys.userJourney.create({
          data: { journeyId: 'read-a', userId: 'alice', role: 'owner' }
        })
        await journeys.team.upsert({
          where: { id: 'read-transfer-team' },
          create: {
            id: 'read-transfer-team',
            title: 'Transfer destination',
            userTeams: { create: { userId: 'alice', role: 'manager' } }
          },
          update: {}
        })
        const move = (teamId: string) =>
          humanMutation(
            'mutation Move($team: ID!) { journeyTransferFromAnonymous(journeyId: "read-a", teamId: $team) { id team { id } } }',
            { team: teamId },
            'alice'
          )
        expect((await move('read-transfer-team')).errors).toBeUndefined()
        expect(
          await journeys.journey.findUnique({ where: { id: 'read-a' } })
        ).toMatchObject({ teamId: 'read-transfer-team' })
        const execution =
          await journeys.mcpPermissionExecution.findFirstOrThrow({
            where: { actorId: 'alice' },
            orderBy: { createdAt: 'desc' }
          })
        expect(execution.gateIds).toEqual(
          expect.arrayContaining([
            'journey:read-a',
            'team:read-team',
            'team:read-transfer-team'
          ])
        )
        expect((await readA()).body).toContain('read-a-text-sentinel')
        expect((await move('read-team')).errors).toBeUndefined()
        await journeys.userJourney.deleteMany({
          where: { journeyId: 'read-a' }
        })
      })

      it.each([998, 999, 1000])(
        'preserves a %i-journey account deletion across accepted-work draining',
        async (count) => {
          await permissionActors()
          const existingCount = await journeys.journey.count({
            where: { teamId: 'read-team' }
          })
          const ids = Array.from(
            { length: count - existingCount },
            (_, index) => `read-large-delete-${count}-${index}`
          )
          await journeys.journey.createMany({
            data: ids.map((id) => ({
              id,
              slug: id,
              title: 'Large deletion fixture',
              languageId: '529',
              teamId: 'read-team',
              status: 'draft'
            }))
          })
          await journeys.userJourney.createMany({
            data: ids.map((journeyId) => ({
              journeyId,
              userId: 'alice',
              role: 'owner'
            }))
          })
          await journeys.userJourney.upsert({
            where: { journeyId_userId: { journeyId: 'read-a', userId: 'bob' } },
            create: { journeyId: 'read-a', userId: 'bob', role: 'owner' },
            update: { role: 'owner' }
          })
          expect((await readA()).body).toContain('read-a-text-sentinel')
          const pause = barrier()
          afterAcceptance = async (stage) => {
            if (stage === 'read') await pause.pause()
          }
          const reading = readA()
          await pause.ready
          const deletion = () =>
            humanMutation(
              'mutation LargeDeletion { userDeleteJourneysConfirm(userId: "alice") { success } }',
              {},
              'alice'
            )
          let changeId: string | undefined
          try {
            const pending = await deletion()
            expect(
              pending.errors?.[0].extensions?.code,
              JSON.stringify(pending)
            ).toBe('PERMISSION_CHANGE_PENDING')
            changeId = pending.errors?.[0].extensions?.changeId
            expect((await deletion()).errors?.[0].extensions?.changeId).toBe(
              changeId
            )
            expect(
              await journeys.journey.count({ where: { id: { in: ids } } })
            ).toBe(ids.length)
            const change = await auth.permissionChange.findUniqueOrThrow({
              where: { id: changeId }
            })
            expect(change.gateIds).toHaveLength(count + 2)
            expect(
              await auth.authorizationGate.count({
                where: { id: { in: change.gateIds }, open: false }
              })
            ).toBe(count + 2)
            expect(
              await journeys.mcpPermissionExecution.count({
                where: { status: 'committed' }
              })
            ).toBe(0)
            expect((await readA()).body).not.toContain('read-a-text-sentinel')
          } finally {
            pause.resume()
          }
          await reading
          afterAcceptance = undefined
          try {
            expect(await permissionCoordinator.reconcile()).toBe(0)
            expect(
              await auth.permissionChange.findUnique({
                where: { id: changeId }
              })
            ).toMatchObject({ status: 'complete', outcome: 'committed' })
            expect(
              await journeys.mcpPermissionExecution.findUnique({
                where: { id: changeId }
              })
            ).toMatchObject({ status: 'committed' })
            expect(
              await journeys.journey.count({ where: { id: { in: ids } } })
            ).toBe(0)
            expect(
              await journeys.journey.findUnique({ where: { id: 'read-a' } })
            ).not.toBeNull()
            expect(
              await journeys.userTeam.findUnique({
                where: { teamId_userId: { teamId: 'read-team', userId: 'bob' } }
              })
            ).not.toBeNull()
            expect(await permissionCoordinator.reconcile()).toBe(0)
            expect(await auth.permissionChange.count()).toBe(1)
          } finally {
            await journeys.journey.deleteMany({ where: { id: { in: ids } } })
            await journeys.userJourney.deleteMany({
              where: { journeyId: 'read-a', userId: 'bob' }
            })
          }
        },
        30000
      )

      it.each([
        ['journeysArchive', 'archived'],
        ['journeysRestore', 'draft'],
        ['journeysTrash', 'trashed'],
        ['journeysDelete', 'deleted']
      ])(
        'coordinates %s with more than 5,000 duplicate IDs',
        async (field, status) => {
          await permissionActors()
          await journeys.journey.update({
            where: { id: 'read-a' },
            data: { status: 'archived', archivedAt: new Date() }
          })
          try {
            const result = await humanMutation(
              `mutation Batch($ids: [ID!]!) { ${field}(ids: $ids) { id } }`,
              {
                ids: [
                  ...Array<string>(5001).fill('read-a'),
                  'read-missing',
                  '',
                  'x'.repeat(201)
                ]
              }
            )
            expect(result.errors).toBeUndefined()
            expect(result.data?.[field]).toEqual([{ id: 'read-a' }])
            expect(
              await journeys.journey.findUnique({ where: { id: 'read-a' } })
            ).toMatchObject({ status })
            const change = await auth.permissionChange.findFirstOrThrow()
            expect(change).toMatchObject({
              status: 'complete',
              outcome: 'committed',
              gateIds: ['account:bob', 'journey:read-a', 'team:read-team']
            })
            expect(await auth.permissionChange.count()).toBe(1)
            expect(
              await journeys.mcpPermissionExecution.findUnique({
                where: { id: change.id }
              })
            ).toMatchObject({ status: 'committed' })
            expect(await journeys.mcpPermissionExecution.count()).toBe(1)
            expect(await permissionCoordinator.reconcile()).toBe(0)
          } finally {
            await journeys.journey.update({
              where: { id: 'read-a' },
              data: {
                status: 'draft',
                archivedAt: null,
                trashedAt: null,
                deletedAt: null
              }
            })
          }
        }
      )

      it('recovers more than 5,000 distinct lifecycle resources after losing a manifest-page response', async () => {
        await permissionActors()
        const ids = Array.from(
          { length: 5001 },
          (_, index) => `read-large-archive-${index}`
        )
        await journeys.journey.createMany({
          data: ids.map((id) => ({
            id,
            slug: id,
            title: 'Large lifecycle fixture',
            languageId: '529',
            teamId: 'read-team',
            status: 'draft'
          }))
        })
        let pages = 0
        afterPermissionBegin = async () => {
          if (++pages === 2) throw new Error('Controlled page outage')
        }
        try {
          const failed = await humanMutation(
            'mutation LargeArchive($ids: [ID!]!) { journeysArchive(ids: $ids) { id } }',
            { ids }
          )
          expect(failed.errors).toHaveLength(1)
          const change = await auth.permissionChange.findFirstOrThrow()
          expect(change).toMatchObject({
            status: 'collecting',
            gateCount: ids.length + 2
          })
          expect(change.gateIds).toHaveLength(500)
          expect(
            await journeys.journey.count({
              where: { id: { in: ids }, status: 'draft' }
            })
          ).toBe(ids.length)
          afterPermissionBegin = undefined
          expect(await permissionCoordinator.reconcile()).toBe(0)
          expect(
            await journeys.journey.count({
              where: { id: { in: ids }, status: 'archived' }
            })
          ).toBe(ids.length)
          expect(
            await auth.permissionChange.findUnique({ where: { id: change.id } })
          ).toMatchObject({ status: 'complete', outcome: 'committed' })
          const complete = await auth.permissionChange.findUniqueOrThrow({
            where: { id: change.id }
          })
          expect(complete.gateIds).toHaveLength(ids.length + 2)
          expect(
            await auth.authorizationGate.count({
              where: { id: { in: complete.gateIds }, open: true }
            })
          ).toBe(ids.length + 2)
          expect(await permissionCoordinator.reconcile()).toBe(0)
          expect(await journeys.mcpPermissionExecution.count()).toBe(1)
        } finally {
          afterPermissionBegin = undefined
          await journeys.journey.deleteMany({ where: { id: { in: ids } } })
        }
      }, 120000)

      it.skipIf(!users)(
        'rejects a foreign ownership transfer before closing any gates',
        async () => {
          await permissionActors()
          await journeys.userJourney.create({
            data: { journeyId: 'read-a', userId: 'alice', role: 'owner' }
          })
          const result = await humanMutation(
            'mutation ForeignTransfer { journeyTransferFromAnonymous(journeyId: "read-a", teamId: "foreign-team") { id } }'
          )
          expect(result.errors).toHaveLength(1)
          expect(await journeys.mcpPermissionExecution.count()).toBe(0)
          expect(await auth.permissionChange.count()).toBe(0)
          expect(
            await auth.authorizationGate.count({ where: { open: false } })
          ).toBe(0)
          expect((await readA()).body).toContain('read-a-text-sentinel')
          await journeys.userJourney.deleteMany({
            where: { journeyId: 'read-a' }
          })
        }
      )

      it('fences an invitation arriving after an empty rights-change discovery', async () => {
        const membership = await permissionActors()
        await journeys.userTeamInvite.updateMany({
          where: { email: 'alice@synthetic.example' },
          data: { acceptedAt: new Date() }
        })
        beforePermissionBegin = async () => {
          beforePermissionBegin = undefined
          await journeys.userTeamInvite.upsert({
            where: {
              teamId_email: {
                teamId: 'read-team',
                email: 'alice@synthetic.example'
              }
            },
            create: {
              teamId: 'read-team',
              email: 'alice@synthetic.example',
              senderId: 'bob'
            },
            update: { acceptedAt: null, removedAt: null }
          })
        }
        const result = await humanMutation(
          'mutation AcceptInvites { userTeamInviteAcceptAll { id } }',
          {},
          'alice'
        )
        expect(result.errors).toHaveLength(1)
        expect(
          await journeys.userTeam.findUnique({ where: { id: membership.id } })
        ).toMatchObject({ role: 'manager' })
        expect(
          await journeys.userTeamInvite.findUnique({
            where: {
              teamId_email: {
                teamId: 'read-team',
                email: 'alice@synthetic.example'
              }
            }
          })
        ).toMatchObject({ acceptedAt: null })
        expect(await auth.permissionChange.findFirst()).toMatchObject({
          status: 'failed'
        })
      })

      it
        .skipIf(!users)
        .each([
          'pending',
          'lost',
          'delete-failure',
          'lookup-failure',
          'lookup-absent'
        ] as const)(
        'resumes a recorded email fallback through the Admin database-ID entrypoint after %s',
        async (mode) => {
          const target = await users!.user.upsert({
            where: { userId: 'alice' },
            create: {
              userId: 'alice',
              firstName: 'alice',
              email: 'alice@synthetic.example'
            },
            update: { superAdmin: false }
          })
          await users!.user.update({
            where: { userId: 'bob' },
            data: { superAdmin: true }
          })
          vi.stubEnv('MCP_READS_ENABLED', 'true')
          vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', config.AUTH_ISSUER)
          vi.stubEnv(
            'MCP_ACCOUNT_AUTHORITY_SECRET',
            config.AUTH_PERMISSION_USERS_SECRET
          )
          const getUser = vi.spyOn(firebaseAuth, 'getUser').mockResolvedValue({
            uid: 'alice',
            email: 'alice@synthetic.example',
            emailVerified: true,
            disabled: false,
            providerData: [],
            metadata: {
              creationTime: '2026-01-01T00:00:00.000Z',
              lastSignInTime: '2026-01-01T00:00:00.000Z',
              toJSON: () => ({})
            },
            toJSON: () => ({})
          })
          const emailLookup = vi
            .spyOn(firebaseAuth, 'getUserByEmail')
            .mockResolvedValue({
              uid: 'fallback-alice',
              email: 'alice@synthetic.example',
              emailVerified: true,
              disabled: false,
              providerData: [],
              metadata: {
                creationTime: '2026-01-02T00:00:00.000Z',
                lastSignInTime: '2026-01-02T00:00:00.000Z',
                toJSON: () => ({})
              },
              toJSON: () => ({})
            })
          const lookupInterrupted =
            mode === 'lookup-failure' || mode === 'lookup-absent'
          if (lookupInterrupted)
            emailLookup.mockRejectedValueOnce(
              new Error('Controlled Firebase email lookup outage')
            )
          let interrupted = false
          const deleteUser = vi
            .spyOn(firebaseAuth, 'deleteUser')
            .mockImplementation(async (uid) => {
              if (uid === 'alice')
                throw Object.assign(new Error('Firebase user not found'), {
                  code: 'auth/user-not-found'
                })
              expect(uid).toBe('fallback-alice')
              const audit = await users!.userDeleteAuditLog.findFirstOrThrow({
                where: { deletedUserId: target.id }
              })
              expect(audit.retiredFirebaseUids).toContain(uid)
              if (mode === 'delete-failure' && !interrupted) {
                interrupted = true
                throw new Error('Controlled Firebase delete failure')
              }
            })
          const originalFetch = globalThis.fetch
          const retireFetch = vi
            .spyOn(globalThis, 'fetch')
            .mockImplementation(async (input, init) => {
              const requestUrl =
                input instanceof Request
                  ? input.url
                  : input instanceof URL
                    ? input.href
                    : input
              const fallback =
                requestUrl.endsWith('/internal/permissions/retire-account') &&
                typeof init?.body === 'string' &&
                JSON.parse(init.body).userId === 'fallback-alice'
              if (fallback) {
                const audit = await users!.userDeleteAuditLog.findFirstOrThrow({
                  where: { deletedUserId: target.id }
                })
                expect(audit).toMatchObject({
                  firebaseCleanupUids: expect.arrayContaining([
                    'alice',
                    'fallback-alice'
                  ]),
                  retiredFirebaseUids: ['alice'],
                  success: false
                })
              }
              const response = await originalFetch(input, init)
              if (
                fallback &&
                (mode === 'pending' || mode === 'lost') &&
                !interrupted
              ) {
                interrupted = true
                expect(response.ok).toBe(true)
                if (mode === 'lost')
                  throw new Error(
                    'Controlled lost fallback retirement response'
                  )
                return Response.json({ status: 'pending' })
              }
              return response
            })
          try {
            const usersSchemaModule = new URL(
              '../../api-users/src/schema/schema.ts',
              import.meta.url
            ).href
            const { schema: usersSchema } = (await import(
              /* webpackChunkName: "users-deletion-fallback-participant" */ usersSchemaModule
            )) as { schema: GraphQLSchema }
            const attempt = async () => {
              const progress = await subscribe({
                schema: usersSchema,
                document: parse(
                  'subscription DeleteFallback($id: String!) { userDeleteConfirm(idType: databaseId, id: $id, deletedJourneyIds: [], deletedTeamIds: [], deletedUserJourneyIds: [], deletedUserTeamIds: []) { done success } }'
                ),
                variableValues: { id: target.id },
                contextValue: {
                  ...initContextCache(),
                  type: 'authenticated',
                  currentUser: { id: 'bob', email: 'bob@synthetic.example' }
                }
              })
              if (!(Symbol.asyncIterator in progress))
                throw new Error(JSON.stringify(progress))
              const results = []
              for await (const result of progress) results.push(result)
              return results.at(-1)
            }
            expect(await attempt()).toMatchObject({
              data: { userDeleteConfirm: { done: true, success: false } }
            })
            expect(
              await users!.user.findUnique({ where: { id: target.id } })
            ).toBeNull()
            const audit = await users!.userDeleteAuditLog.findFirstOrThrow({
              where: { deletedUserId: target.id }
            })
            expect(audit).toMatchObject({
              success: false,
              firebaseCleanupEmail: 'alice@synthetic.example',
              firebaseEmailLookupPending: lookupInterrupted,
              firebaseCleanupUids: lookupInterrupted
                ? ['alice']
                : ['alice', 'fallback-alice'],
              retiredFirebaseUids:
                mode === 'delete-failure'
                  ? ['alice', 'fallback-alice']
                  : ['alice']
            })
            if (lookupInterrupted) {
              emailLookup.mockRejectedValueOnce(
                new Error('Controlled repeated Firebase email lookup outage')
              )
              expect(await attempt()).toMatchObject({
                data: { userDeleteConfirm: { done: true, success: false } }
              })
              expect(
                await users!.userDeleteAuditLog.findUnique({
                  where: { id: audit.id }
                })
              ).toMatchObject({ success: false })
              if (mode === 'lookup-absent')
                emailLookup.mockRejectedValue(
                  Object.assign(new Error('Firebase user not found'), {
                    code: 'auth/user-not-found'
                  })
                )
            } else
              emailLookup.mockRejectedValue(
                new Error('Retry must use the recorded UID')
              )
            expect(await attempt()).toMatchObject({
              data: { userDeleteConfirm: { done: true, success: true } }
            })
            expect(emailLookup).toHaveBeenCalledTimes(lookupInterrupted ? 3 : 1)
            if (mode !== 'lookup-absent')
              expect(deleteUser).toHaveBeenCalledWith('fallback-alice')
            else expect(deleteUser).not.toHaveBeenCalledWith('fallback-alice')
            expect(
              await users!.userDeleteAuditLog.findUnique({
                where: { id: audit.id }
              })
            ).toMatchObject({
              success: true,
              firebaseEmailLookupPending: false,
              retiredFirebaseUids:
                mode === 'lookup-absent'
                  ? ['alice']
                  : ['alice', 'fallback-alice']
            })
            const retiredFallback = await auth.retiredAccount.findUnique({
              where: { userId: 'fallback-alice' }
            })
            if (mode === 'lookup-absent') expect(retiredFallback).toBeNull()
            else expect(retiredFallback).not.toBeNull()
          } finally {
            retireFetch.mockRestore()
            getUser.mockRestore()
            emailLookup.mockRestore()
            deleteUser.mockRestore()
            vi.unstubAllEnvs()
            await users!.user.update({
              where: { userId: 'bob' },
              data: { superAdmin: false }
            })
          }
        }
      )

      it
        .skipIf(!users)
        .each([
          'complete',
          'lost',
          'pending',
          'recovered',
          'auth-after-sql',
          'firebase-retry'
        ] as const)(
        'preserves shared deletion outcomes and resumes the Admin workflow after a %s retirement response',
        async (retirementResponse) => {
          for (const userId of ['alice', 'bob'])
            await users!.user.upsert({
              where: { userId },
              create: {
                userId,
                firstName: userId,
                email: userId + '@synthetic.example'
              },
              update: { superAdmin: false }
            })
          await journeys.userJourney.deleteMany({
            where: { journeyId: 'read-a' }
          })
          await journeys.journey.deleteMany({
            where: { id: 'read-delete-exclusive' }
          })
          await journeys.team.deleteMany({
            where: { id: 'read-delete-exclusive-team' }
          })
          await permissionActors()
          const bobToken = await consent('bob', ['read-foreign'])
          await journeys.team.upsert({
            where: { id: 'read-delete-exclusive-team' },
            create: {
              id: 'read-delete-exclusive-team',
              title: 'Exclusive',
              userTeams: { create: { userId: 'alice', role: 'manager' } }
            },
            update: {}
          })
          await journeys.journey.create({
            data: {
              id: 'read-delete-exclusive',
              slug: 'read-delete-exclusive',
              title: 'Exclusive',
              languageId: '529',
              teamId: 'read-delete-exclusive-team',
              status: 'draft',
              userJourneys: { create: { userId: 'alice', role: 'owner' } }
            }
          })
          await journeys.userJourney.createMany({
            data: [
              { journeyId: 'read-a', userId: 'alice', role: 'owner' },
              { journeyId: 'read-a', userId: 'bob', role: 'editor' }
            ]
          })
          if (retirementResponse === 'recovered')
            await journeys.qrCode.create({
              data: {
                teamId: 'read-delete-exclusive-team',
                journeyId: 'read-delete-exclusive',
                toJourneyId: 'read-delete-exclusive',
                shortLinkId: 'deletion-recovery-short-link'
              }
            })
          permissionOutage = retirementResponse === 'recovered'
          let deleted = await humanMutation(
            'mutation DeleteJourneys { userDeleteJourneysConfirm(userId: "alice") { success deletedJourneyIds deletedTeamIds deletedUserJourneyIds deletedUserTeamIds } }',
            {},
            'alice'
          )
          if (retirementResponse === 'recovered') {
            expect(deleted.errors).toHaveLength(1)
            permissionOutage = false
            permissionReportOutage = true
            expect(await permissionCoordinator.reconcile()).toBe(1)
            const receipt =
              await journeys.mcpPermissionExecution.findFirstOrThrow({
                where: { status: 'committed' }
              })
            expect(receipt.reportedAt).toBeNull()
            expect(receipt.intent).toMatchObject({
              effects: [
                {
                  type: 'shortLinkDelete',
                  shortLinkIds: ['deletion-recovery-short-link']
                }
              ]
            })
            expect(
              await journeys.qrCode.findFirst({
                where: { shortLinkId: 'deletion-recovery-short-link' }
              })
            ).toBeNull()
            mockQueueAdd.mockClear()
            permissionReportOutage = false
            expect(await permissionCoordinator.reconcile()).toBe(0)
            expect(mockQueueAdd).toHaveBeenCalledWith(
              'api-journeys-shortlink-delete-job',
              { shortLinkId: 'deletion-recovery-short-link' },
              expect.objectContaining({
                jobId: 'shortlink-delete-deletion-recovery-short-link'
              })
            )
            deleted = await humanMutation(
              'mutation DeleteJourneys { userDeleteJourneysConfirm(userId: "alice") { success deletedJourneyIds deletedTeamIds deletedUserJourneyIds deletedUserTeamIds } }',
              {},
              'alice'
            )
          }
          expect(deleted.errors).toBeUndefined()
          const outcomes = deleted.data?.userDeleteJourneysConfirm as {
            success: boolean
            deletedJourneyIds: string[]
            deletedTeamIds: string[]
            deletedUserJourneyIds: string[]
            deletedUserTeamIds: string[]
          }
          expect(outcomes.success).toBe(true)
          expect(outcomes.deletedJourneyIds).toContain('read-delete-exclusive')
          expect(outcomes.deletedTeamIds).toContain(
            'read-delete-exclusive-team'
          )
          expect(
            await journeys.journey.findUnique({ where: { id: 'read-a' } })
          ).not.toBeNull()
          expect(
            await journeys.userJourney.findUnique({
              where: {
                journeyId_userId: { journeyId: 'read-a', userId: 'bob' }
              }
            })
          ).toMatchObject({ role: 'owner' })
          expect((await readA()).body).not.toContain('read-a-text-sentinel')
          const uidRecord = await users!.user.findUniqueOrThrow({
            where: { userId: 'alice' }
          })
          vi.stubEnv('MCP_READS_ENABLED', 'true')
          vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', config.AUTH_ISSUER)
          vi.stubEnv(
            'MCP_ACCOUNT_AUTHORITY_SECRET',
            config.AUTH_PERMISSION_USERS_SECRET
          )
          const getUser = vi
            .spyOn(firebaseAuth, 'getUser')
            .mockImplementation(async (uid) => ({
              uid,
              email: uid + '@synthetic.example',
              emailVerified: true,
              disabled: false,
              providerData: [],
              metadata: {
                creationTime: '2026-01-01T00:00:00.000Z',
                lastSignInTime: '2026-01-01T00:00:00.000Z',
                toJSON: () => ({})
              },
              toJSON: () => ({})
            }))
          const deleteUser = vi
            .spyOn(firebaseAuth, 'deleteUser')
            .mockResolvedValue(undefined)
          const originalFetch = globalThis.fetch
          let interruptRetirement = ['lost', 'pending'].includes(
            retirementResponse
          )
          const retirementFetch = vi
            .spyOn(globalThis, 'fetch')
            .mockImplementation(async (input, init) => {
              const requestUrl =
                input instanceof Request
                  ? input.url
                  : input instanceof URL
                    ? input.href
                    : input
              if (
                requestUrl.endsWith('/internal/permissions/retire-account') &&
                ['auth-after-sql', 'firebase-retry'].includes(
                  retirementResponse
                ) &&
                !(await users!.user.findUnique({ where: { userId: 'alice' } }))
              )
                throw new Error('Controlled Auth outage after SQL deletion')
              const response = await originalFetch(input, init)
              if (
                requestUrl.endsWith('/internal/permissions/retire-account') &&
                interruptRetirement
              ) {
                interruptRetirement = false
                expect(response.ok).toBe(true)
                if (retirementResponse === 'lost')
                  throw new Error('Controlled lost retirement response')
                return Response.json({ status: 'pending' })
              }
              return response
            })
          try {
            const usersSchemaModule = new URL(
              '../../api-users/src/schema/schema.ts',
              import.meta.url
            ).href
            const { schema: usersSchema } = (await import(
              /* webpackChunkName: "users-deletion-participant" */ usersSchemaModule
            )) as { schema: GraphQLSchema }
            const deleteAccount = async () => {
              const progress = await subscribe({
                schema: usersSchema,
                document: parse(
                  'subscription DeleteAccount($id: String!, $journeys: [String!]!, $teams: [String!]!, $collaborations: [String!]!, $memberships: [String!]!) { userDeleteConfirm(idType: databaseId, id: $id, deletedJourneyIds: $journeys, deletedTeamIds: $teams, deletedUserJourneyIds: $collaborations, deletedUserTeamIds: $memberships) { done success } }'
                ),
                variableValues: {
                  id: uidRecord.id,
                  journeys: outcomes.deletedJourneyIds,
                  teams: outcomes.deletedTeamIds,
                  collaborations: outcomes.deletedUserJourneyIds,
                  memberships: outcomes.deletedUserTeamIds
                },
                contextValue: {
                  ...initContextCache(),
                  type: 'authenticated',
                  currentUser: { id: 'alice', email: 'alice@synthetic.example' }
                }
              })
              if (!(Symbol.asyncIterator in progress))
                throw new Error(JSON.stringify(progress))
              const results = []
              for await (const result of progress) results.push(result)
              return results
            }
            if (['lost', 'pending'].includes(retirementResponse)) {
              const interrupted = await deleteAccount()
              expect(interrupted.at(-1)).toMatchObject({
                data: { userDeleteConfirm: { done: true, success: false } }
              })
              expect(deleteUser).not.toHaveBeenCalled()
              expect(
                await users!.user.findUnique({ where: { userId: 'alice' } })
              ).not.toBeNull()
              expect(
                await auth.retiredAccount.findUnique({
                  where: { userId: 'alice' }
                })
              ).not.toBeNull()
              const closedGate = await auth.authorizationGate.findUniqueOrThrow(
                { where: { id: 'account:alice' } }
              )
              expect(closedGate.open).toBe(false)
              expect(await permissionCoordinator.reconcile()).toBe(0)
              const resumed = await humanMutation(
                'mutation DeleteJourneys { userDeleteJourneysConfirm(userId: "alice") { success deletedJourneyIds deletedTeamIds deletedUserJourneyIds deletedUserTeamIds } }',
                {},
                'alice'
              )
              expect(resumed.errors).toBeUndefined()
              expect(resumed.data?.userDeleteJourneysConfirm).toEqual(outcomes)
              expect(await journeys.mcpPermissionExecution.count()).toBe(1)
              expect(await auth.permissionChange.count()).toBe(1)
              expect(
                await auth.authorizationGate.findUniqueOrThrow({
                  where: { id: 'account:alice' }
                })
              ).toEqual(closedGate)
            }
            if (retirementResponse === 'firebase-retry') {
              deleteUser.mockRejectedValueOnce(
                new Error('Controlled Firebase outage')
              )
              expect((await deleteAccount()).at(-1)).toMatchObject({
                data: { userDeleteConfirm: { done: true, success: false } }
              })
              expect(
                await users!.user.findUnique({ where: { userId: 'alice' } })
              ).toBeNull()
            }
            const results = await deleteAccount()
            expect(results.at(-1)).toMatchObject({
              data: { userDeleteConfirm: { done: true, success: true } }
            })
            expect(deleteUser).toHaveBeenCalledWith('alice')
            expect(
              await users!.user.findUnique({ where: { userId: 'alice' } })
            ).toBeNull()
            expect(
              await users!.user.findUnique({ where: { userId: 'bob' } })
            ).not.toBeNull()
            expect(
              await auth.retiredAccount.findUnique({
                where: { userId: 'alice' }
              })
            ).not.toBeNull()
            expect(
              (
                await call(
                  'journey_read',
                  { journeyId: 'read-foreign', view: 'steps' },
                  bobToken
                )
              ).body
            ).toContain('read-foreign-text-sentinel')
            // Account retirement never calls a media deletion participant.
            expect(
              await journeys.journey.findUnique({
                where: { id: 'read-foreign' }
              })
            ).not.toBeNull()
          } finally {
            retirementFetch.mockRestore()
            getUser.mockRestore()
            deleteUser.mockRestore()
            vi.unstubAllEnvs()
          }
        }
      )
    }
  )
})
