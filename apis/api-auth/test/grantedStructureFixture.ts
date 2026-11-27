import {
  type JsonWebKey,
  generateKeyPairSync,
  randomBytes,
  randomUUID
} from 'node:crypto'
import { readFileSync } from 'node:fs'
import { type Server, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { createGatewayRuntime } from '@graphql-hive/gateway'
import { initContextCache } from '@pothos/core'
import { type GraphQLSchema, graphql } from 'graphql'
import pino from 'pino'
import { z } from 'zod'

import { createAuthDatabase } from '@core/prisma/auth/client'
import { PrismaClient } from '@core/prisma/journeys/client'
import { operationReceipt } from '@core/yoga/mcp/editContract'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- Exercise independent deployed HTTP participants together. */
import { useMcpReads } from '../../api-gateway/src/mcpReads'
import '../../api-journeys/test/bullmqMock'
import { createJourneyEditHandler } from '../../api-journeys/src/lib/mcpEdits'
import {
  type JourneyReadsConfig,
  createJourneyReadHandler
} from '../../api-journeys/src/lib/mcpReads'
import { readConfig as readMcpConfig } from '../../api-mcp/src/config'
import { createRuntime as createMcpRuntime } from '../../api-mcp/src/runtime'
import { message } from '../../api-mcp/test/helpers'
/* eslint-enable @nx/enforce-module-boundaries */
import { type AuthConfig, readConfig } from '../src/config'
import type { Identity } from '../src/identity'
import { createRuntime } from '../src/runtime'
import { digest } from '../src/store'

export const structureAuthUrl = process.env.STRUCTURE_TEST_AUTH_DATABASE_URL
export const structureJourneysUrl =
  process.env.STRUCTURE_TEST_JOURNEYS_DATABASE_URL

type Checkpoint = NonNullable<
  Parameters<typeof createJourneyEditHandler>[2]
>['checkpoint']

/** Only Firebase identity/selection and explicit owner fault hooks are controlled.
 * OAuth, grants, protocol, gateway, owning executor and both stores are real.
 */
export function structureFixture(
  options: {
    canUseFeature?: NonNullable<
      Parameters<typeof createJourneyEditHandler>[2]
    >['canUseFeature']
    useProductionFeatureGate?: boolean
    issue?: string
    startupTimeoutMs?: number
    authUrl?: string
    journeysUrl?: string
    authEnv?: NodeJS.ProcessEnv
    checkIdentity?: Identity['check']
    media?: (context: {
      config: AuthConfig
      journeys: PrismaClient
      publicKey: JsonWebKey
      listen: (server: Server) => Promise<string>
    }) => Promise<NonNullable<JourneyReadsConfig['media']>>
  } = {}
) {
  const authUrl = options.authUrl ?? structureAuthUrl!
  const journeysUrl = options.journeysUrl ?? structureJourneysUrl!
  const auth = createAuthDatabase(authUrl)
  const journeys = new PrismaClient({
    adapter: new PrismaPg({ connectionString: journeysUrl })
  })
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const privateKey = keys.privateKey.export({ format: 'jwk' })
  const publicKey = keys.publicKey.export({ format: 'jwk' })
  const ownerSecret = 'controlled-structure-owner-10557-at-least-32-characters'
  const exchangeSecret =
    'controlled-structure-exchange-10557-at-least-32-characters'
  const internalSecret =
    'controlled-structure-internal-10557-at-least-32-characters'
  const servers: Server[] = []
  const cookies = new Map<string, string>()
  const eligible = new Map<string, string[]>()
  let issuer: Awaited<ReturnType<typeof createRuntime>>
  let gateway: ReturnType<typeof createGatewayRuntime>
  let mcp: ReturnType<typeof createMcpRuntime>
  let config: AuthConfig
  let ownerHandler: ReturnType<typeof createJourneyEditHandler>
  let mcpUrl: string
  const refreshTokens = new Map<string, string>()
  let token: string
  let journeyId: string
  let checkpoint: Checkpoint
  let discardResponse = false
  let adminSchema: GraphQLSchema
  let ownerConfig: JourneyReadsConfig

  async function adminBlockMutation(
    operation: 'Delete' | 'Restore',
    id: string
  ) {
    const result = await graphql({
      schema: adminSchema,
      source: `mutation($id: ID!) { block${operation}(id: $id) { id parentOrder } }`,
      variableValues: { id },
      contextValue: {
        ...initContextCache(),
        type: 'authenticated',
        user: { id: 'alice', email: 'alice@synthetic.example' },
        currentRoles: []
      }
    })
    expect(result.errors).toBeUndefined()
    return result.data
  }

  const id = (suffix: string) => `${journeyId}-${suffix}`
  async function listen(server: Server) {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
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
      const split = pair.indexOf('=')
      cookies.set(pair.slice(0, split), pair.slice(split + 1))
    }
    return response
  }
  async function consent(mode: 'edit' | 'view' = 'edit') {
    cookies.clear()
    const verifier = randomBytes(32).toString('base64url')
    const query = new URLSearchParams({
      client_id: 'structure-client',
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
    const uid = new URL(interaction.headers.get('location')!).searchParams.get(
      'interaction'
    )!
    const post = (suffix: string, body: unknown) =>
      request(`/interaction/${uid}/${suffix}`, {
        method: 'POST',
        headers: {
          Origin: config.AUTH_ADMIN_ORIGIN,
          Authorization: 'Bearer alice',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    const { csrf } = z
      .object({ csrf: z.string() })
      .parse(await (await post('details', {})).json())
    const { reviewToken } = z.object({ reviewToken: z.string() }).parse(
      await (
        await post('review', {
          csrf,
          journeyIds: [journeyId],
          mode,
          duration: 'week'
        })
      ).json()
    )
    const approved = await post('decision', {
      csrf,
      reviewToken,
      decision: 'approve'
    })
    expect(approved.status, await approved.clone().text()).toBe(200)
    const { redirectUrl } = z
      .object({ redirectUrl: z.string() })
      .parse(await approved.json())
    const resumed = await request(new URL(redirectUrl).pathname)
    const code = new URL(resumed.headers.get('location')!).searchParams.get(
      'code'
    )!
    const exchanged = await request('/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'structure-client',
        redirect_uri: 'http://127.0.0.1:4209/callback',
        resource: config.AUTH_AUDIENCE,
        code,
        code_verifier: verifier
      })
    })
    expect(exchanged.status, await exchanged.clone().text()).toBe(200)
    const tokens = z
      .object({
        access_token: z.string(),
        refresh_token: z.string().optional()
      })
      .parse(await exchanged.json())
    if (tokens.refresh_token)
      refreshTokens.set(tokens.access_token, tokens.refresh_token)
    return tokens.access_token
  }
  async function call(
    tool: string,
    input: Record<string, unknown>,
    accessToken = token
  ) {
    const response = await fetch(mcpUrl, {
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
        message('2026-07-28', 'tools/call', { name: tool, arguments: input })
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
  const revision = async () =>
    (
      await journeys.journeyRevision.findUniqueOrThrow({ where: { journeyId } })
    ).revision.toString()
  async function input(commands: unknown[], key = randomUUID()) {
    return {
      journeyId,
      expectedRevision: await revision(),
      idempotencyKey: key,
      commands
    }
  }
  const edit = (
    value: Awaited<ReturnType<typeof input>>,
    accessToken = token
  ) => call('journey_edit', value, accessToken)
  function receipt(response: Awaited<ReturnType<typeof call>>) {
    expect(response.json.error, response.text).toBeUndefined()
    expect(response.json.result?.isError, response.text).not.toBe(true)
    expect(response.json.result?.structuredContent, response.text).toBeDefined()
    return operationReceipt.parse(response.json.result?.structuredContent)
  }
  async function save(commands: unknown[]) {
    return receipt(await edit(await input(commands)))
  }
  async function historyAction(direction: 'undo' | 'redo', entryId: string) {
    return call(`journey_${direction}`, {
      journeyId,
      expectedRevision: await revision(),
      entryId,
      idempotencyKey: randomUUID()
    })
  }
  async function counts() {
    return {
      operations: await journeys.mcpEditOperation.count({
        where: { journeyId }
      }),
      history: await journeys.mcpEditHistory.count({ where: { journeyId } }),
      effects: await journeys.mcpEditEffect.count({ where: { journeyId } })
    }
  }
  async function snapshot() {
    return {
      journey: await journeys.journey.findUniqueOrThrow({
        where: { id: journeyId }
      }),
      blocks: await journeys.block.findMany({
        where: { journeyId },
        orderBy: { id: 'asc' }
      }),
      actions: await journeys.action.findMany({
        where: { parentBlock: { journeyId } },
        orderBy: { parentBlockId: 'asc' }
      }),
      revision: await revision(),
      counts: await counts()
    }
  }

  beforeAll(async () => {
    const issue =
      options.issue ??
      process.env.MCP_STRUCTURE_TEST_ISSUE ??
      process.env.STRUCTURE_TEST_ISSUE ??
      '10557'
    if (
      !/^[0-9]+(?:_[a-z0-9]+)?$/.test(issue) ||
      !new RegExp(`^/auth_issue_${issue}(_|$)`).test(
        new URL(authUrl).pathname
      ) ||
      !new RegExp(`^/journeys_issue_${issue}(_|$)`).test(
        new URL(journeysUrl).pathname
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
    await journeys.mcpEditAudit.deleteMany()
    await journeys.mcpEditExecution.deleteMany()
    await journeys.mcpEditEffect.deleteMany()
    await journeys.mcpEditHistory.deleteMany()
    await journeys.mcpEditOperation.deleteMany()
    await journeys.mcpEditNamespace.deleteMany()
    const [trigger] = await journeys.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'journey_revision_root') AS exists`
    expect(trigger.exists, 'Shared revision migrations must be installed').toBe(
      true
    )
    const reservation = createServer()
    const issuerUrl = await listen(reservation)
    await new Promise<void>((resolve) => reservation.close(() => resolve()))
    servers.pop()
    config = readConfig({
      AUTH_ENVIRONMENT: 'local',
      AUTH_ISSUER: issuerUrl,
      AUTH_ADMIN_ORIGIN: 'http://127.0.0.1:4200',
      AUTH_AUDIENCE: 'http://127.0.0.1:4010/mcp',
      AUTH_GATEWAY_URL: 'http://127.0.0.1:4000/graphql',
      AUTH_FIREBASE_PROJECT_ID: 'controlled-firebase-10557',
      AUTH_COOKIE_KEYS:
        'controlled-structure-cookie-10557-at-least-32-characters',
      AUTH_JWKS: JSON.stringify({
        keys: [{ ...privateKey, kid: 'structure', alg: 'RS256', use: 'sig' }]
      }),
      AUTH_INTROSPECTION_CLIENT_ID: 'structure-introspection',
      AUTH_INTROSPECTION_CLIENT_SECRET:
        'controlled-structure-introspection-10557-at-least-32-characters',
      AUTH_EXCHANGE_CLIENT_SECRET: exchangeSecret,
      AUTH_READ_OWNER_SECRET: ownerSecret,
      AUTH_PERMISSION_JOURNEYS_SECRET:
        'controlled-structure-permission-10557-at-least-32-characters',
      AUTH_PERMISSION_USERS_SECRET:
        'controlled-structure-users-10557-at-least-32-characters',
      AUTH_READ_GATEWAY_AUDIENCE: 'http://127.0.0.1:4000/mcp/reads',
      PG_DATABASE_URL_AUTH: authUrl,
      ...options.authEnv,
      AUTH_CLIENTS: JSON.stringify([
        {
          client_id: 'structure-client',
          client_name: 'Controlled structural agent',
          redirect_uris: ['http://127.0.0.1:4209/callback']
        }
      ])
    })
    const firebaseAuthTime = Math.floor(Date.now() / 1000) - 60
    issuer = await createRuntime(config, {
      db: auth,
      logger: pino({ enabled: false }),
      identity: {
        async authenticate(userId) {
          if (userId !== 'alice') throw new Error('Controlled identity denied')
          return {
            userId,
            authTime: firebaseAuthTime,
            createdAt: '2026-01-01T00:00:00.000Z'
          }
        },
        async check(evidence) {
          if (evidence.userId !== 'alice')
            throw new Error('Controlled identity denied')
          await options.checkIdentity?.(evidence)
        }
      },
      eligibility: async (_token, userId) =>
        (eligible.get(userId) ?? []).map((journey) => ({
          id: journey,
          title: journey,
          teamId: 'structure-team-alice',
          canEdit: true
        }))
    })
    await new Promise<void>((resolve) =>
      issuer.server.listen(
        Number(new URL(issuerUrl).port),
        '127.0.0.1',
        resolve
      )
    )
    ownerConfig = {
      issuer: issuerUrl,
      audience: config.AUTH_READ_GATEWAY_AUDIENCE!,
      environment: 'local',
      publicKey,
      internalSecret,
      authorityUrl: issuerUrl,
      authoritySecret: ownerSecret,
      adminOrigin: config.AUTH_ADMIN_ORIGIN + '/',
      editsEnabled: true
    }
    if (options.media)
      ownerConfig.media = await options.media({
        config,
        journeys,
        publicKey,
        listen
      })
    ownerHandler = createJourneyEditHandler(ownerConfig, journeys, {
      checkpoint: async (point, context) => checkpoint?.(point, context),
      canUseFeature: options.useProductionFeatureGate
        ? undefined
        : (options.canUseFeature ?? (async () => true)),
      canEditChat: async () => false
    })
    const readHandler = createJourneyReadHandler(ownerConfig, journeys)
    const ownerUrl = await listen(
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
              headers.set(name, Array.isArray(value) ? value.join(',') : value)
          const handler = [
            'journey_edit',
            'journey_operation_get',
            'journey_history',
            'journey_undo',
            'journey_redo'
          ].includes(body.request.tool)
            ? ownerHandler
            : readHandler
          const response = await handler(
            new Request(ownerUrl + req.url, {
              method: 'POST',
              headers,
              body: raw
            })
          )
          if (discardResponse && body.stage === 'read' && response.ok) {
            discardResponse = false
            res.writeHead(503)
            res.end('{}')
            return
          }
          res.writeHead(response.status, Object.fromEntries(response.headers))
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
        useMcpReads({ ...ownerConfig, ownerUrl: `${ownerUrl}/mcp/reads` })
      ]
    })
    const gatewayUrl = await listen(
      createServer((req, res) => {
        void gateway(req, res)
      })
    )
    mcp = createMcpRuntime(
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
    await mcp.listen()
    mcpUrl = `http://127.0.0.1:${(mcp.server.address() as AddressInfo).port}/mcp`

    process.env.SKIP_ENV_VALIDATION = '1'
    vi.doMock('@core/prisma/journeys/client', async (importOriginal) => ({
      ...(await importOriginal<
        typeof import('@core/prisma/journeys/client')
      >()),
      prisma: journeys
    }))
    const schemaModule = new URL(
      '../../api-journeys/src/schema/schema.ts',
      import.meta.url
    ).href
    ;({ schema: adminSchema } = (await import(
      /* webpackChunkName: "structure-admin-schema" */ schemaModule
    )) as {
      schema: GraphQLSchema
    })
  }, options.startupTimeoutMs ?? 120000)

  beforeEach(async () => {
    checkpoint = undefined
    discardResponse = false
    refreshTokens.clear()
    await auth.retiredAccount.deleteMany()
    await auth.authorizationGate.updateMany({
      data: { open: true, generation: { increment: 1 } }
    })
    journeyId = `structure-${randomUUID()}`
    eligible.set('alice', [journeyId])
    await journeys.team.upsert({
      where: { id: 'structure-team-alice' },
      create: {
        id: 'structure-team-alice',
        title: 'Synthetic structural team',
        userTeams: { create: { userId: 'alice', role: 'manager' } }
      },
      update: {}
    })
    await journeys.userTeam.upsert({
      where: {
        teamId_userId: { teamId: 'structure-team-alice', userId: 'alice' }
      },
      create: {
        teamId: 'structure-team-alice',
        userId: 'alice',
        role: 'manager'
      },
      update: { role: 'manager' }
    })
    await journeys.journeyProfile.upsert({
      where: { userId: 'alice' },
      create: { userId: 'alice' },
      update: {}
    })
    await journeys.journey.create({
      data: {
        id: journeyId,
        slug: journeyId,
        title: 'Synthetic structural draft',
        teamId: 'structure-team-alice',
        languageId: '529',
        status: 'draft',
        blocks: {
          create: [
            {
              id: id('a'),
              typename: 'StepBlock',
              parentOrder: 0,
              x: 12,
              y: 34
            },
            {
              id: id('ac'),
              typename: 'CardBlock',
              parentBlockId: id('a'),
              parentOrder: 0
            },
            {
              id: id('heading'),
              typename: 'TypographyBlock',
              parentBlockId: id('ac'),
              parentOrder: 0,
              content: 'Human heading',
              variant: 'h2',
              settings: { unmounted: true }
            },
            {
              id: id('poll'),
              typename: 'RadioQuestionBlock',
              parentBlockId: id('ac'),
              parentOrder: 1,
              gridView: false
            },
            {
              id: id('yes'),
              typename: 'RadioOptionBlock',
              parentBlockId: id('poll'),
              parentOrder: 0,
              label: 'Yes'
            },
            {
              id: id('no'),
              typename: 'RadioOptionBlock',
              parentBlockId: id('poll'),
              parentOrder: 1,
              label: 'No'
            },
            {
              id: id('b'),
              typename: 'StepBlock',
              parentOrder: 1,
              x: 300,
              y: 100
            },
            {
              id: id('bc'),
              typename: 'CardBlock',
              parentBlockId: id('b'),
              parentOrder: 0
            },
            {
              id: id('btext'),
              typename: 'TypographyBlock',
              parentBlockId: id('bc'),
              parentOrder: 0,
              content: 'B body',
              variant: 'body1'
            },
            {
              id: id('button'),
              typename: 'ButtonBlock',
              parentBlockId: id('bc'),
              parentOrder: 1,
              label: 'Continue',
              submitEnabled: true
            },
            {
              id: id('start'),
              typename: 'IconBlock',
              parentBlockId: id('button'),
              parentOrder: null,
              name: 'None'
            },
            {
              id: id('end'),
              typename: 'IconBlock',
              parentBlockId: id('button'),
              parentOrder: null,
              name: 'ArrowForwardRounded'
            },
            {
              id: id('video'),
              typename: 'VideoBlock',
              parentBlockId: id('bc'),
              parentOrder: 2,
              source: 'youTube',
              videoId: options.media ? 'dQw4w9WgXcQ' : null,
              muted: false,
              autoplay: true
            },
            {
              id: id('poster'),
              typename: 'ImageBlock',
              parentBlockId: id('video'),
              parentOrder: null,
              src: options.media
                ? 'https://example.com/synthetic-poster.jpg'
                : null,
              alt: 'Synthetic existing poster'
            },
            {
              id: id('cover'),
              typename: 'ImageBlock',
              parentBlockId: id('bc'),
              parentOrder: null,
              src: options.media
                ? 'https://example.com/synthetic-cover.jpg'
                : null,
              alt: 'Synthetic existing cover'
            },
            {
              id: id('c'),
              typename: 'StepBlock',
              parentOrder: 2,
              x: 550,
              y: 100
            },
            {
              id: id('cc'),
              typename: 'CardBlock',
              parentBlockId: id('c'),
              parentOrder: 0
            },
            {
              id: id('legacy'),
              typename: 'SignUpBlock',
              parentBlockId: id('cc'),
              parentOrder: 0,
              submitLabel: 'Legacy sign up'
            },
            {
              id: id('response'),
              typename: 'TextResponseBlock',
              parentBlockId: id('cc'),
              parentOrder: 1,
              label: 'Existing response',
              placeholder: 'Preserve this',
              type: 'email',
              required: true
            }
          ]
        }
      }
    })
    await journeys.block.update({
      where: { id: id('a') },
      data: { nextBlockId: id('b') }
    })
    await journeys.block.update({
      where: { id: id('b') },
      data: { nextBlockId: id('c') }
    })
    await journeys.block.update({
      where: { id: id('bc') },
      data: { coverBlockId: id('cover') }
    })
    await journeys.block.update({
      where: { id: id('button') },
      data: { startIconId: id('start'), endIconId: id('end') }
    })
    await journeys.block.update({
      where: { id: id('video') },
      data: { posterBlockId: id('poster') }
    })
    for (const [source, destination] of [
      ['yes', 'b'],
      ['no', 'c'],
      ['button', 'c']
    ])
      await journeys.action.create({
        data: {
          parentBlockId: id(source),
          parentStepId: id(source === 'button' ? 'b' : 'a'),
          blockId: id(destination),
          gtmEventName: 'human-tracking'
        }
      })
    token = await consent()
  })
  afterEach(async () => {
    checkpoint = undefined
    await ownerHandler?.reconcile()
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
  return {
    auth,
    journeys,
    id,
    revision,
    input,
    edit,
    call,
    save,
    receipt,
    historyAction,
    counts,
    snapshot,
    consent,
    async refreshAccessToken() {
      const refresh = refreshTokens.get(token)
      if (!refresh) throw new Error('Missing refresh credential')
      const response = await request('/token', {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: 'structure-client',
          resource: config.AUTH_AUDIENCE,
          refresh_token: refresh
        })
      })
      expect(response.status).toBe(200)
      const tokens = z
        .object({ access_token: z.string(), refresh_token: z.string() })
        .parse(await response.json())
      refreshTokens.delete(token)
      token = tokens.access_token
      refreshTokens.set(token, tokens.refresh_token)
    },
    adminBlockMutation,
    async adminRead(fields: string) {
      return graphql({
        schema: adminSchema,
        source:
          'query($id: ID!) { adminJourney(id: $id, idType: databaseId) { ' +
          fields +
          ' } }',
        variableValues: { id: journeyId },
        contextValue: {
          ...initContextCache(),
          type: 'authenticated',
          user: { id: 'alice', email: 'alice@synthetic.example' },
          currentRoles: []
        }
      })
    },
    get ownerConfig() {
      return ownerConfig
    },
    get journeyId() {
      return journeyId
    },
    set checkpoint(value: Checkpoint) {
      checkpoint = value
    },
    loseNextResponse() {
      discardResponse = true
    }
  }
}
