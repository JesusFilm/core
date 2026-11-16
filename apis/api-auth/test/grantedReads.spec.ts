import { generateKeyPairSync, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { type Server, createServer, request as httpRequest } from 'node:http'
import type { AddressInfo } from 'node:net'

import {
  createGatewayRuntime,
  usePropagateHeaders
} from '@graphql-hive/gateway'
import { initContextCache } from '@pothos/core'
import type { GraphQLSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'
import pino from 'pino'

import { createAuthDatabase } from '@core/prisma/auth/client'
import { PrismaClient } from '@core/prisma/journeys/client'
import {
  fingerprint,
  internalSignature,
  signEnvelope
} from '@core/yoga/mcp/readContract'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- This integration harness runs the actual independently deployed API participants. */
import { commonConfig } from '../../api-gateway/src/common.config'
import { useMcpReads } from '../../api-gateway/src/mcpReads'
import '../../api-journeys/test/bullmqMock'
import {
  createJourneyReadHandler,
  useJourneyMcpReads
} from '../../api-journeys/src/lib/mcpReads'
import { readConfig as readMcpConfig } from '../../api-mcp/src/config'
import { createRuntime as createMcpRuntime } from '../../api-mcp/src/runtime'
import { message } from '../../api-mcp/test/helpers'
/* eslint-enable @nx/enforce-module-boundaries */
import { type AuthConfig, readConfig } from '../src/config'
import { createRuntime } from '../src/runtime'
import { databaseTime, digest } from '../src/store'

const authUrl = process.env.READS_TEST_AUTH_DATABASE_URL
const journeysUrl = process.env.READS_TEST_JOURNEYS_DATABASE_URL

describe('granted journey read authorization', () => {
  describe.skipIf(!authUrl || !journeysUrl)(
    'granted reads through real MCP HTTP, issuer, Hive gateway and owning Journeys API',
    () => {
      const auth = createAuthDatabase(authUrl!)
      const journeys = new PrismaClient({
        adapter: new PrismaPg({ connectionString: journeysUrl })
      })
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
      let mcpUrl: string
      let beforeIdentity: (() => Promise<void>) | undefined
      let beforeOutput: (() => Promise<void>) | undefined
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
      async function consent(user: string, ids: string[], mode = 'view') {
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
            duration: 'week'
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
              ? { executorId: testExecutorId, ...body }
              : body
          )
        })
      }

      beforeAll(async () => {
        if (
          !new URL(authUrl!).pathname.startsWith('/auth_issue_10573') ||
          !new URL(journeysUrl!).pathname.startsWith('/journeys_issue_10573')
        )
          throw new Error('Use isolated issue databases')
        for (const table of [
          auth.readPermit,
          auth.oAuthArtifact,
          auth.agentConnection,
          auth.consentReview,
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
                  canEdit: id !== 'read-published'
                }))
              : [{ id: 'read-foreign', title: 'Bob', canEdit: true }]
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
        vi.doMock('@core/prisma/journeys/client', async (importOriginal) => ({
          ...(await importOriginal<
            typeof import('@core/prisma/journeys/client')
          >()),
          prisma: journeys
        }))
        // Load the deployed schema at runtime; its unrelated frontend type graph
        // has a separate JSX-enabled owning-project type-check target.
        const schemaModule = new URL(
          '../../api-journeys/src/schema/schema.ts',
          import.meta.url
        ).href
        const { schema: owningSchema } = (await import(
          /* webpackChunkName: "read-participant-schema" */ schemaModule
        )) as {
          schema: GraphQLSchema
        }
        const owner = createYoga({
          schema: owningSchema,
          context: () => ({ ...initContextCache(), type: 'public' as const }),
          logging: false,
          plugins: [
            useJourneyMcpReads(
              createJourneyReadHandler(
                {
                  ...trust,
                  internalSecret,
                  authorityUrl: issuerOrigin + '/',
                  authoritySecret: ownerSecret,
                  adminOrigin: config.AUTH_ADMIN_ORIGIN + '/'
                },
                journeys
              )
            )
          ]
        })
        ownerUrl = await listen(
          createServer((req, res) => {
            void owner(req, res)
          })
        )
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
                )
                  await beforeOutput?.()
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
      }, 30000)

      beforeEach(async () => {
        beforeIdentity = undefined
        beforeOutput = undefined
        invalidUsers.clear()
        await auth.authorizationGate.updateMany({
          data: { open: true, generation: { increment: 1 } }
        })
        await journeys.userTeam.upsert({
          where: { teamId_userId: { teamId: 'read-team', userId: 'alice' } },
          create: { teamId: 'read-team', userId: 'alice', role: 'manager' },
          update: { role: 'manager' }
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

      it('returns published ordinary journeys under a read grant and registers exactly two read tools', async () => {
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
          'journeys_list',
          'journey_read'
        ])
        expect(
          (await call('journey_edit', { journeyId: 'read-published' })).body
        ).not.toContain('structuredContent')
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
        const oversized = await readA()
        expect(oversized.body).toContain('LIMIT_EXCEEDED')
        expect(oversized.body.length).toBeLessThan(1000)
        await journeys.block.update({
          where: { id: 'read-a-text' },
          data: { content: 'read-a-text-sentinel' }
        })
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
        beforeOutput = async () => {
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
        let settled = false
        const deadline = Date.now() + 3000
        while (!settled && Date.now() < deadline) {
          settled =
            (await auth.readPermit.count({
              where: {
                connectionId: connection.id,
                stage: 'output',
                status: 'settled'
              }
            })) === 1
          if (!settled) await new Promise((resolve) => setTimeout(resolve, 10))
        }
        expect(settled).toBe(true)
        expect(
          await auth.readPermit.count({
            where: { connectionId: connection.id, status: 'accepted' }
          })
        ).toBe(0)
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
    }
  )
})
