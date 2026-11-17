import { fork } from 'node:child_process'
import { generateKeyPairSync, randomBytes } from 'node:crypto'
import { request as nodeRequest } from 'node:http'
import { type AddressInfo, createServer as createTcpServer } from 'node:net'

import pino from 'pino'

import { createAuthDatabase } from '@core/prisma/auth/client'

import { type AuthConfig, readConfig } from '../src/config'
import type { Identity } from '../src/identity'
import { createRuntime } from '../src/runtime'
import { databaseTime, digest } from '../src/store'
import { reconcileConnectionChanges } from '../src/withdrawal'

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL

describe('durable issuer integration', () => {
  describe.skipIf(!databaseUrl)(
    'issuer HTTP with durable PostgreSQL and controlled identity/gateway adapters',
    () => {
      const db = createAuthDatabase(databaseUrl!)
      const privateKey = generateKeyPairSync('rsa', {
        modulusLength: 2048
      }).privateKey.export({ format: 'jwk' })
      let instances: Array<{
        server: { address(): AddressInfo | string | null }
        close(): Promise<void>
      }> = []
      let config: AuthConfig
      let origin: string
      const invalidUsers = new Set<string>()
      let missingRights = false
      let eligibilityTeam = 'read-team'
      let afterEligibility: (() => Promise<void>) | undefined
      const identity: Identity = {
        async authenticate(token) {
          if (!['alice', 'bob'].includes(token) || invalidUsers.has(token))
            throw new Error('Invalid session sentinel')
          return {
            userId: token,
            authTime: 1794777000,
            createdAt: '2026-01-01T00:00:00.000Z'
          }
        },
        async check(evidence) {
          if (invalidUsers.has(evidence.userId))
            throw new Error('Revoked session sentinel')
        }
      }
      const cookies = new Map<string, string>()
      const headers = () => ({
        Origin: config.AUTH_ADMIN_ORIGIN,
        Cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; ')
      })
      async function request(
        path: string,
        init: RequestInit = {},
        replica = 0
      ): Promise<Response> {
        const target = instances[replica].server.address() as AddressInfo
        const response = await new Promise<Response>((resolve, reject) => {
          const body =
            init.body instanceof URLSearchParams
              ? init.body.toString()
              : (init.body as string | undefined)
          const outgoing = nodeRequest(
            `http://127.0.0.1:${target.port}${path}`,
            {
              method: init.method ?? 'GET',
              headers: {
                ...headers(),
                Host: new URL(origin).host,
                ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
                ...(init.body instanceof URLSearchParams
                  ? { 'Content-Type': 'application/x-www-form-urlencoded' }
                  : {}),
                ...Object.fromEntries(new Headers(init.headers))
              }
            },
            (incoming) => {
              const chunks: Buffer[] = []
              incoming.on('data', (chunk: Buffer) => chunks.push(chunk))
              incoming.on('end', () => {
                const receivedHeaders = new Headers()
                for (
                  let index = 0;
                  index < incoming.rawHeaders.length;
                  index += 2
                )
                  receivedHeaders.append(
                    incoming.rawHeaders[index],
                    incoming.rawHeaders[index + 1]
                  )
                resolve(
                  new Response(
                    incoming.statusCode === 204 ? null : Buffer.concat(chunks),
                    { status: incoming.statusCode, headers: receivedHeaders }
                  )
                )
              })
            }
          )
          outgoing.on('error', reject)
          outgoing.end(body)
        })
        for (const cookie of response.headers.getSetCookie()) {
          const [pair] = cookie.split(';')
          const position = pair.indexOf('=')
          cookies.set(pair.slice(0, position), pair.slice(position + 1))
        }
        return response
      }
      async function post(
        path: string,
        body: unknown,
        user = 'alice',
        replica = 0
      ): Promise<Response> {
        return request(
          path,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${user}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          },
          replica
        )
      }
      async function interaction(
        clientId = 'synthetic-client'
      ): Promise<string> {
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: 'http://127.0.0.1:4209/callback',
          response_type: 'code',
          scope: 'journeys:read journeys:edit offline_access',
          resource: config.AUTH_AUDIENCE,
          code_challenge: digestVerifier(),
          code_challenge_method: 'S256',
          state: randomBytes(16).toString('hex')
        })
        const response = await request(`/auth?${params}`)
        expect(response.status, await response.clone().text()).toBe(303)
        const location = new URL(response.headers.get('Location')!, origin)
        const redirect = await request(location.pathname)
        expect(redirect.status).toBe(302)
        return new URL(redirect.headers.get('Location')!).searchParams.get(
          'interaction'
        )!
      }
      const verifier = randomBytes(32).toString('base64url')
      function digestVerifier() {
        return Buffer.from(digest(verifier), 'hex').toString('base64url')
      }

      async function processReplica() {
        const child = fork(
          new URL('./fixture-process.ts', import.meta.url),
          [],
          {
            execArgv: ['--import', import.meta.resolve('tsx')],
            env: {
              PATH: process.env.PATH,
              AUTH_FIXTURE_CONFIG: JSON.stringify(config)
            },
            stdio: ['ignore', 'ignore', 'pipe', 'ipc']
          }
        )
        const exited = new Promise<void>((resolve) =>
          child.once('exit', () => resolve())
        )
        const port = await new Promise<number>((resolve, reject) => {
          child.once('message', (message: { port?: number }) =>
            message.port
              ? resolve(message.port)
              : reject(new Error('Fixture startup failed'))
          )
          child.once('exit', () =>
            reject(new Error('Fixture exited before listening'))
          )
        })
        return {
          server: {
            address: () => ({ port, address: '127.0.0.1', family: 'IPv4' })
          },
          async close() {
            child.kill('SIGTERM')
            await exited
          }
        }
      }

      async function approvedCode(
        mode = 'edit',
        clientId = 'synthetic-client',
        duration = 'day'
      ) {
        const uid = await interaction(clientId)
        const view = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as { csrf: string }
        const reviewResponse = await post(`/interaction/${uid}/review`, {
          csrf: view.csrf,
          journeyIds: ['draft-a'],
          mode,
          duration
        })
        expect(reviewResponse.status).toBe(200)
        const review = (await reviewResponse.json()) as { reviewToken: string }
        const approved = await post(`/interaction/${uid}/decision`, {
          csrf: view.csrf,
          reviewToken: review.reviewToken,
          decision: 'approve'
        })
        expect(approved.status).toBe(200)
        const result = (await approved.json()) as { redirectUrl: string }
        const resumed = await request(new URL(result.redirectUrl).pathname)
        const code = new URL(
          resumed.headers.get('Location')!,
          origin
        ).searchParams.get('code')!
        expect(code).toBeTruthy()
        return new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          code_verifier: verifier,
          client_id: clientId,
          redirect_uri: 'http://127.0.0.1:4209/callback',
          resource: config.AUTH_AUDIENCE
        })
      }

      const readEligibility = async (_token: string, userId: string) => {
        const snapshot =
          userId === 'alice'
            ? [
                {
                  id: 'draft-a',
                  title: 'Synthetic draft',
                  teamId: eligibilityTeam,
                  canEdit: true
                },
                {
                  id: 'draft-b',
                  title: 'Other eligible draft',
                  teamId: eligibilityTeam,
                  canEdit: true
                }
              ]
            : [
                {
                  id: 'bob-draft',
                  title: 'Bob draft',
                  teamId: eligibilityTeam,
                  canEdit: true
                }
              ]
        await afterEligibility?.()
        return missingRights ? [] : snapshot
      }

      beforeAll(async () => {
        for (const model of [
          db.readPermit,
          db.agentAccessReview,
          db.connectionChange,
          db.connectionHistoryPurge,
          db.readExecutor,
          db.oAuthArtifact,
          db.agentConnection,
          db.consentReview,
          db.agentRenewalReview,
          db.authorizationGate,
          db.securityAudit,
          db.authEnvironment
        ])
          await (model.deleteMany as () => Promise<unknown>)()
        config = readConfig({
          AUTH_ENVIRONMENT: 'local',
          AUTH_ISSUER: 'http://127.0.0.1:14011',
          AUTH_ADMIN_ORIGIN: 'http://127.0.0.1:4200',
          AUTH_AUDIENCE: 'http://127.0.0.1:4010/mcp',
          AUTH_GATEWAY_URL: 'http://127.0.0.1:4000/graphql',
          AUTH_FIREBASE_PROJECT_ID: 'controlled-firebase',
          AUTH_COOKIE_KEYS: 'synthetic-cookie-key-for-10549-at-least-32-bytes',
          AUTH_JWKS: JSON.stringify({
            keys: [
              { ...privateKey, kid: 'synthetic', use: 'sig', alg: 'RS256' }
            ]
          }),
          AUTH_INTROSPECTION_CLIENT_ID: 'resource-server',
          AUTH_INTROSPECTION_CLIENT_SECRET:
            'synthetic-introspection-secret-10549-32bytes',
          PG_DATABASE_URL_AUTH: databaseUrl!,
          AUTH_CLIENTS: JSON.stringify([
            {
              client_id: 'synthetic-client',
              client_name: 'Synthetic agent',
              redirect_uris: ['http://127.0.0.1:4209/callback']
            }
          ])
        })
        origin = config.AUTH_ISSUER
        for (let index = 0; index < 2; index++) {
          const runtime = await createRuntime(config, {
            db,
            identity,
            eligibility: readEligibility,
            logger: pino({ enabled: false })
          })
          await new Promise<void>((resolve) =>
            runtime.server.listen(0, '127.0.0.1', resolve)
          )
          instances.push(runtime)
        }
      })

      afterAll(async () => {
        await Promise.all(instances.map((instance) => instance.close()))
        instances = []
        await db.$disconnect()
      })

      it('lists only the signed-in owner connections and requires a browser session for renewal', async () => {
        await approvedCode()
        const listed = await post('/connections', {})
        expect(listed.status, await listed.clone().text()).toBe(200)
        const body = (await listed.json()) as {
          csrf: string
          connections: Array<{
            id: string
            clientId: string
            version: number
            status: string
            expiresAt: string
          }>
        }
        expect(body.connections.length).toBeGreaterThan(0)
        expect(body.connections[0]).toMatchObject({
          clientId: 'synthetic-client',
          version: 1,
          status: 'active'
        })
        expect(body.csrf.length).toBeGreaterThan(31)
        const foreign = await post(
          `/connections/${body.connections[0].id}/review`,
          {
            csrf: body.csrf,
            expectedVersion: 1,
            clientId: 'synthetic-client',
            duration: 'week'
          },
          'bob'
        )
        expect(foreign.status).toBe(403)
      })

      async function renewableConnection(duration = 'year') {
        const issued = await request('/token', {
          method: 'POST',
          body: await approvedCode('view', 'synthetic-client', duration)
        })
        expect(issued.status).toBe(200)
        const tokens = (await issued.json()) as {
          access_token: string
          refresh_token: string
        }
        const listed = await post('/connections', {})
        expect(listed.status, await listed.clone().text()).toBe(200)
        const page = (await listed.json()) as {
          csrf: string
          connections: Array<{ id: string; version: number }>
        }
        const connection = await db.agentConnection.findFirstOrThrow({
          orderBy: { approvedAt: 'desc' }
        })
        return {
          connection,
          tokens,
          csrf: page.csrf,
          expectedVersion: connection.version,
          clientId: connection.clientId
        }
      }
      async function previewRenewal(
        context: Awaited<ReturnType<typeof renewableConnection>>,
        duration = 'day'
      ) {
        const response = await post(
          `/connections/${context.connection.id}/review`,
          {
            csrf: context.csrf,
            expectedVersion: context.expectedVersion,
            clientId: context.clientId,
            duration
          }
        )
        expect(response.status, await response.clone().text()).toBe(200)
        return (await response.json()) as {
          reviewToken: string
          previewExpiresAt: string
        }
      }
      function approveRenewal(
        context: Awaited<ReturnType<typeof renewableConnection>>,
        reviewToken: string,
        replica = 0
      ) {
        return post(
          `/connections/${context.connection.id}/approve`,
          {
            csrf: context.csrf,
            expectedVersion: context.expectedVersion,
            clientId: context.clientId,
            reviewToken
          },
          'alice',
          replica
        )
      }

      it('renews early at approval, can shorten expiry, retires credentials and serializes replica approvals', async () => {
        const context = await renewableConnection()
        const priorAudits = await db.securityAudit.findMany()
        const preview = await previewRenewal(context)
        expect(
          preview.previewExpiresAt < context.connection.expiresAt.toISOString()
        ).toBe(true)
        const approvals = await Promise.all([
          approveRenewal(context, preview.reviewToken),
          approveRenewal(context, preview.reviewToken, 1)
        ])
        expect(approvals.map((response) => response.status).sort()).toEqual([
          200, 409
        ])
        const receipt = (await approvals
          .find((response) => response.status === 200)!
          .json()) as {
          id: string
          version: number
          expiresAt: string
          approvedAt: string
        }
        expect(receipt).toMatchObject({ id: context.connection.id, version: 2 })
        expect(
          Date.parse(receipt.expiresAt) - Date.parse(receipt.approvedAt)
        ).toBe(86400000)
        expect(receipt.expiresAt >= preview.previewExpiresAt).toBe(true)
        const current = await db.agentConnection.findUniqueOrThrow({
          where: { id: receipt.id }
        })
        expect(current).toMatchObject({
          userId: 'alice',
          clientId: context.clientId,
          mode: 'view',
          journeyIds: ['draft-a'],
          version: 2,
          credentialsPending: true
        })
        expect(current.grantId).not.toBe(context.connection.grantId)
        for (const previous of priorAudits)
          expect(
            await db.securityAudit.findUnique({ where: { id: previous.id } })
          ).toEqual(previous)
        const oldRefresh = await request('/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: context.tokens.refresh_token,
            client_id: context.clientId,
            resource: config.AUTH_AUDIENCE
          })
        })
        expect(oldRefresh.status).not.toBe(200)
        const oldAccess = await request('/token/introspection', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${config.AUTH_INTROSPECTION_CLIENT_ID}:${config.AUTH_INTROSPECTION_CLIENT_SECRET}`).toString('base64')}`
          },
          body: new URLSearchParams({ token: context.tokens.access_token })
        })
        expect(await oldAccess.json()).toMatchObject({ active: false })
        const uid = await interaction()
        const details = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as {
          csrf: string
          reconnectableConnections: Array<{ id: string; version: number }>
        }
        expect(details.reconnectableConnections).toContainEqual(
          expect.objectContaining({ id: receipt.id, version: 2 })
        )
        const review = (await (
          await post(`/interaction/${uid}/review`, {
            csrf: details.csrf,
            journeyIds: ['draft-a'],
            mode: 'view',
            duration: 'year',
            connectionId: receipt.id,
            expectedVersion: 2
          })
        ).json()) as {
          reviewToken: string
          expiresAt: string
          reconnect: boolean
        }
        expect(review).toMatchObject({
          expiresAt: receipt.expiresAt,
          reconnect: true
        })
        const decision = await post(`/interaction/${uid}/decision`, {
          csrf: details.csrf,
          reviewToken: review.reviewToken,
          decision: 'approve'
        })
        expect(decision.status, await decision.clone().text()).toBe(200)
        const result = (await decision.json()) as { redirectUrl: string }
        const resumed = await request(new URL(result.redirectUrl).pathname)
        const code = new URL(resumed.headers.get('Location')!).searchParams.get(
          'code'
        )!
        const fresh = await request('/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            code_verifier: verifier,
            client_id: context.clientId,
            redirect_uri: 'http://127.0.0.1:4209/callback',
            resource: config.AUTH_AUDIENCE
          })
        })
        expect(fresh.status, await fresh.clone().text()).toBe(200)
        expect(
          await db.agentConnection.findUnique({ where: { id: receipt.id } })
        ).toMatchObject({
          version: 2,
          expiresAt: new Date(receipt.expiresAt),
          credentialsPending: false
        })
        const retryUid = await interaction()
        const retryDetails = (await (
          await post(`/interaction/${retryUid}/details`, {})
        ).json()) as {
          csrf: string
          reconnectableConnections: Array<{ id: string }>
        }
        expect(retryDetails.reconnectableConnections).toContainEqual(
          expect.objectContaining({ id: receipt.id })
        )
        const retryReview = await post(`/interaction/${retryUid}/review`, {
          csrf: retryDetails.csrf,
          journeyIds: ['draft-a'],
          mode: 'view',
          duration: 'year',
          connectionId: receipt.id,
          expectedVersion: 2
        })
        expect(retryReview.status).toBe(200)
        const retryTerms = (await retryReview.json()) as {
          reviewToken: string
          expiresAt: string
        }
        expect(retryTerms.expiresAt).toBe(receipt.expiresAt)
        expect(
          (
            await post(`/interaction/${retryUid}/decision`, {
              csrf: retryDetails.csrf,
              reviewToken: retryTerms.reviewToken,
              decision: 'approve'
            })
          ).status
        ).toBe(200)
      })

      async function accessReview(
        context: Awaited<ReturnType<typeof renewableConnection>>,
        journeyIds = ['draft-a', 'draft-b'],
        mode = 'edit'
      ) {
        const response = await post(
          `/connections/${context.connection.id}/access-review`,
          {
            csrf: context.csrf,
            clientId: context.clientId,
            expectedVersion: context.expectedVersion,
            journeyIds,
            mode
          }
        )
        expect(response.status, await response.clone().text()).toBe(200)
        return (await response.json()) as {
          reviewToken: string
          expiresAt: string
        }
      }
      const management = (
        context: Awaited<ReturnType<typeof renewableConnection>>
      ) => ({
        csrf: context.csrf,
        clientId: context.clientId,
        expectedVersion: context.expectedVersion
      })

      it('explicitly changes resources/mode on the same identity without extending expiry and rejects stale/forged approval', async () => {
        const context = await renewableConnection()
        const unrelated = await db.agentConnection.findFirstOrThrow({
          where: { id: { not: context.connection.id } }
        })
        const review = await accessReview(context)
        expect(review.expiresAt).toBe(
          context.connection.expiresAt.toISOString()
        )
        for (const patch of [
          { journeyIds: ['bob-draft'] },
          { mode: 'edit' },
          { clientId: 'forged' },
          { expectedVersion: 99 },
          { csrf: 'x'.repeat(43) }
        ]) {
          expect(
            (
              await post(
                `/connections/${context.connection.id}/access-approve`,
                {
                  ...management(context),
                  reviewToken: review.reviewToken,
                  ...patch
                }
              )
            ).status
          ).not.toBe(200)
        }
        expect(
          (
            await post(
              `/connections/${context.connection.id}/access-approve`,
              { ...management(context), reviewToken: review.reviewToken },
              'bob'
            )
          ).status
        ).toBe(403)
        const approved = await post(
          `/connections/${context.connection.id}/access-approve`,
          { ...management(context), reviewToken: review.reviewToken }
        )
        expect(approved.status).toBe(200)
        expect(await approved.json()).toMatchObject({
          status: 'complete',
          version: context.expectedVersion + 1
        })
        const updated = await db.agentConnection.findUniqueOrThrow({
          where: { id: context.connection.id }
        })
        expect(updated).toMatchObject({
          userId: context.connection.userId,
          clientId: context.clientId,
          mode: 'edit',
          journeyIds: ['draft-a', 'draft-b'],
          expiresAt: context.connection.expiresAt
        })
        expect(
          await db.agentConnection.findUniqueOrThrow({
            where: { id: unrelated.id }
          })
        ).toEqual(unrelated)
        expect(
          await db.connectionHistoryPurge.findUnique({
            where: { connectionId: updated.id }
          })
        ).toBeNull()
        expect(
          (
            await post(`/connections/${updated.id}/access-approve`, {
              ...management(context),
              reviewToken: review.reviewToken
            })
          ).status
        ).toBe(409)
      })

      it('rechecks expansion rights and generations but permits relinquishing access after rights loss', async () => {
        const context = await renewableConnection()
        const review = await accessReview(context)
        missingRights = true
        try {
          expect(
            (
              await post(
                `/connections/${context.connection.id}/access-approve`,
                { ...management(context), reviewToken: review.reviewToken }
              )
            ).status
          ).toBe(403)
          const reduction = await accessReview(context, ['draft-a'], 'view')
          expect(
            (
              await post(
                `/connections/${context.connection.id}/access-approve`,
                { ...management(context), reviewToken: reduction.reviewToken }
              )
            ).status
          ).toBe(200)
        } finally {
          missingRights = false
        }
        const next = await renewableConnection()
        const stale = await accessReview(next)
        let reads = 0
        afterEligibility = async () => {
          if (++reads !== 2) return
          afterEligibility = undefined
          await db.authorizationGate.update({
            where: { id: 'user-team:alice:read-team' },
            data: { generation: { increment: 1 } }
          })
        }
        expect(
          (
            await post(`/connections/${next.connection.id}/access-approve`, {
              ...management(next),
              reviewToken: stale.reviewToken
            })
          ).status
        ).toBe(409)
      })

      it('keeps withdrawal Pending across restart until accepted participants positively settle, then schedules disconnect purge', async () => {
        const context = await renewableConnection()
        const renewal = await previewRenewal(context)
        const permit = await db.readPermit.create({
          data: {
            connectionId: context.connection.id,
            grantVersion: context.expectedVersion,
            requestId: 'controlled',
            requestHash: 'a'.repeat(64),
            stage: 'read',
            executor: 'journeys',
            executorId: 'accepted-remote',
            journeyIds: ['draft-a'],
            gates: [],
            status: 'accepted',
            preparedAt: new Date(0),
            acceptedAt: new Date(0)
          }
        })
        const disconnect = await post(
          `/connections/${context.connection.id}/disconnect`,
          management(context)
        )
        expect(disconnect.status).toBe(200)
        const receipt = (await disconnect.json()) as {
          changeId: string
          status: string
        }
        expect(receipt.status).toBe('pending')
        expect(
          (await approveRenewal(context, renewal.reviewToken)).status
        ).toBe(409)
        expect(
          await db.connectionHistoryPurge.findUnique({
            where: { connectionId: context.connection.id }
          })
        ).toBeNull()
        const replica = await processReplica()
        instances.push(replica)
        try {
          const listed = await post(
            '/connections',
            {},
            'alice',
            instances.length - 1
          )
          expect(await listed.json()).toMatchObject({
            connections: expect.arrayContaining([
              expect.objectContaining({
                id: context.connection.id,
                status: 'pending',
                change: expect.objectContaining({ id: receipt.changeId })
              })
            ])
          })
          expect(
            (
              await db.readPermit.findUniqueOrThrow({
                where: { id: permit.id }
              })
            ).status
          ).toBe('accepted')
          // Simulate the real owning participant's positive durable completion receipt.
          await db.readPermit.update({
            where: { id: permit.id },
            data: { status: 'settled', settledAt: new Date() }
          })
          const completed = await post(
            '/connections',
            {},
            'alice',
            instances.length - 1
          )
          expect(await completed.json()).toMatchObject({
            connections: expect.arrayContaining([
              expect.objectContaining({
                id: context.connection.id,
                status: 'disconnected',
                change: expect.objectContaining({ status: 'complete' })
              })
            ])
          })
          expect(
            await db.connectionHistoryPurge.findUnique({
              where: { connectionId: context.connection.id }
            })
          ).toMatchObject({ changeId: receipt.changeId, completedAt: null })
        } finally {
          instances.pop()
          await replica.close()
        }
      })

      it('shows only owner grant metadata and allows disconnect during an owning-API outage', async () => {
        const context = await renewableConnection()
        cookies.clear()
        afterEligibility = async () => {
          throw new Error('Controlled owning outage')
        }
        try {
          const response = await post('/connections', {})
          expect(response.status).toBe(200)
          const listed = (await response.json()) as {
            csrf: string
            titlesUnavailable: boolean
            connections: Array<{ journeys: Array<{ title: string | null }> }>
          }
          expect(listed.titlesUnavailable).toBe(true)
          expect(
            listed.connections.every((c) =>
              c.journeys.every((j) => j.title === null)
            )
          ).toBe(true)
          const disconnected = await post(
            `/connections/${context.connection.id}/disconnect`,
            { ...management(context), csrf: listed.csrf }
          )
          expect(disconnected.status).toBe(200)
          expect(await disconnected.json()).toMatchObject({
            status: 'complete'
          })
          invalidUsers.add('alice')
          expect((await post('/connections', {})).status).not.toBe(200)
        } finally {
          afterEligibility = undefined
          invalidUsers.delete('alice')
        }
      })

      it('rejects replaced access reviews and cross-session approvals', async () => {
        const context = await renewableConnection()
        const first = await accessReview(context)
        const second = await accessReview(context, ['draft-b'], 'view')
        const approve = (reviewToken: string, csrf = context.csrf) =>
          post(`/connections/${context.connection.id}/access-approve`, {
            ...management(context),
            csrf,
            reviewToken
          })
        expect((await approve(first.reviewToken)).status).toBe(409)
        const fresh = await post('/connections', {})
        const { csrf } = (await fresh.json()) as { csrf: string }
        expect((await approve(second.reviewToken, csrf)).status).toBe(409)
        expect(
          await db.agentConnection.findUniqueOrThrow({
            where: { id: context.connection.id }
          })
        ).toEqual(context.connection)
      })

      it('rejects access approval when its review expires across the final review-row lock wait', async () => {
        const context = await renewableConnection()
        const review = await accessReview(context)
        const id = digest(review.reviewToken)
        const expiresAt = new Date((await databaseTime(db)).getTime() + 1200)
        await db.agentAccessReview.update({
          where: { id },
          data: { validUntil: expiresAt }
        })
        let unlock!: () => void
        let locked!: () => void
        const ready = new Promise<void>((resolve) => {
          locked = resolve
        })
        const blocker = db.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "AgentAccessReview" WHERE id = ${id} FOR UPDATE`
          locked()
          await new Promise<void>((resolve) => {
            unlock = resolve
          })
        })
        await ready
        const approval = post(
          `/connections/${context.connection.id}/access-approve`,
          { ...management(context), reviewToken: review.reviewToken }
        )
        let waited = false
        try {
          await vi.waitFor(async () => {
            const [row] = await db.$queryRaw<
              Array<{ waiting: boolean }>
            >`SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()) AS waiting`
            expect(row.waiting).toBe(true)
            waited = true
          })
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.max(0, expiresAt.getTime() - Date.now()) + 30
            )
          )
        } finally {
          unlock()
          await blocker
        }
        expect(waited).toBe(true)
        expect((await approval).status).toBe(409)
        expect(
          await db.agentConnection.findUniqueOrThrow({
            where: { id: context.connection.id }
          })
        ).toEqual(context.connection)
      })

      it('drains later connections beyond 100 unresolved withdrawals and isolates one failed change', async () => {
        const prefix = 'drain-10575-'
        const ids = Array.from(
          { length: 101 },
          (_, index) => prefix + String(index).padStart(3, '0')
        )
        const now = new Date()
        try {
          await db.$transaction(async (tx) => {
            await tx.agentConnection.createMany({
              data: ids.map((id) => ({
                id,
                grantId: id,
                userId: 'drain-fixture',
                clientId: 'drain-client',
                environment: config.AUTH_ENVIRONMENT,
                mode: 'view',
                journeyIds: ['draft-a'],
                version: 2,
                expiresAt: new Date(now.getTime() + 86400000),
                approvedAt: now,
                firebaseAuthTime: 1794777000,
                firebaseCreatedAt: '2026-01-01T00:00:00.000Z'
              }))
            })
            await tx.authorizationGate.createMany({
              data: ids.map((id) => ({
                id: 'connection:' + id,
                generation: 1,
                open: false
              }))
            })
            await tx.connectionChange.createMany({
              data: ids.map((id, index) => ({
                id,
                connectionId: id,
                expectedVersion: 1,
                version: 2,
                kind: 'access',
                mode: 'view',
                journeyIds: ['draft-a'],
                gateGeneration: index === 0 ? 99 : 1,
                requestedAt: now
              }))
            })
            await tx.readPermit.createMany({
              data: ids.slice(0, 100).map((id) => ({
                connectionId: id,
                grantVersion: 1,
                requestId: id,
                requestHash: 'a'.repeat(64),
                stage: 'read',
                executor: 'journeys',
                executorId: id,
                journeyIds: ['draft-a'],
                gates: [],
                status: 'accepted',
                preparedAt: new Date(0),
                acceptedAt: new Date(0)
              }))
            })
          })
          expect(await reconcileConnectionChanges(db)).toBe(1)
          expect(
            await db.connectionChange.findUnique({ where: { id: ids[100] } })
          ).toMatchObject({ status: 'complete' })
          expect(
            await db.connectionChange.count({
              where: { id: { in: ids }, status: 'pending' }
            })
          ).toBe(100)
          expect(
            await db.readPermit.count({
              where: { connectionId: { in: ids }, status: 'accepted' }
            })
          ).toBe(100)
        } finally {
          await db.readPermit.deleteMany({
            where: { connectionId: { in: ids } }
          })
          await db.connectionChange.deleteMany({ where: { id: { in: ids } } })
          await db.agentConnection.deleteMany({ where: { id: { in: ids } } })
          await db.authorizationGate.deleteMany({
            where: { id: { in: ids.map((id) => 'connection:' + id) } }
          })
        }
      })

      it('renews expired consent but never terminal disconnect or pending withdrawal', async () => {
        const context = await renewableConnection()
        await db.agentConnection.update({
          where: { id: context.connection.id },
          data: { expiresAt: new Date(0) }
        })
        const preview = await previewRenewal(context, 'month')
        expect(
          (await approveRenewal(context, preview.reviewToken)).status
        ).toBe(200)
        const next = await renewableConnection()
        const reviewed = await previewRenewal(next)
        await db.agentConnection.update({
          where: { id: next.connection.id },
          data: { revokedAt: new Date() }
        })
        expect((await approveRenewal(next, reviewed.reviewToken)).status).toBe(
          409
        )
        const pending = await renewableConnection()
        const pendingReview = await previewRenewal(pending)
        await db.authorizationGate.update({
          where: { id: `connection:${pending.connection.id}` },
          data: { open: false, generation: { increment: 1 } }
        })
        expect(
          (await approveRenewal(pending, pendingReview.reviewToken)).status
        ).not.toBe(200)
        const listed = (await (await post('/connections', {})).json()) as {
          connections: Array<{
            id: string
            status: string
            journeys: Array<{ title: string | null }>
          }>
        }
        expect(
          listed.connections.find(
            (connection) => connection.id === pending.connection.id
          )
        ).toMatchObject({
          status: 'pending',
          journeys: [{ id: 'draft-a', title: null }]
        })
        await db.authorizationGate.update({
          where: { id: `connection:${pending.connection.id}` },
          data: { open: true, generation: { increment: 1 } }
        })
      })

      it('rejects missing cookies, CSRF, client/version changes, tampered terms and lost current rights', async () => {
        const context = await renewableConnection()
        const base = {
          csrf: context.csrf,
          expectedVersion: context.expectedVersion,
          clientId: context.clientId,
          duration: 'week'
        }
        for (const patch of [
          { csrf: 'x'.repeat(43) },
          { clientId: 'other-client' },
          { expectedVersion: 9 },
          { expiresAt: '2099-01-01' },
          { journeyIds: ['draft-b'] },
          { duration: 'forever' }
        ]) {
          expect(
            (
              await post(`/connections/${context.connection.id}/review`, {
                ...base,
                ...patch
              })
            ).status
          ).not.toBe(200)
        }
        const savedCookies = new Map(cookies)
        cookies.clear()
        expect(
          (await post(`/connections/${context.connection.id}/review`, base))
            .status
        ).toBe(403)
        for (const [key, value] of savedCookies) cookies.set(key, value)
        const preview = await previewRenewal(context)
        missingRights = true
        try {
          expect(
            (await approveRenewal(context, preview.reviewToken)).status
          ).toBe(403)
          const page = (await (await post('/connections', {})).json()) as {
            connections: Array<{ journeys: Array<{ title: string | null }> }>
          }
          expect(
            page.connections.every((connection) =>
              connection.journeys.every((journey) => journey.title === null)
            )
          ).toBe(true)
        } finally {
          missingRights = false
        }
        const renewedContext = {
          ...context,
          csrf: (
            (await (await post('/connections', {})).json()) as { csrf: string }
          ).csrf
        }
        const currentReview = await previewRenewal(renewedContext)
        invalidUsers.add('alice')
        try {
          expect(
            (await approveRenewal(renewedContext, currentReview.reviewToken))
              .status
          ).not.toBe(200)
        } finally {
          invalidUsers.delete('alice')
        }
      })

      it('rejects stale permission generations and an expired review after lock waits', async () => {
        const context = await renewableConnection()
        const preview = await previewRenewal(context)
        afterEligibility = async () => {
          afterEligibility = undefined
          await db.authorizationGate.update({
            where: { id: 'journey:draft-a' },
            data: { generation: { increment: 2 } }
          })
        }
        expect(
          (await approveRenewal(context, preview.reviewToken)).status
        ).not.toBe(200)
        const review = await previewRenewal(context)
        let unlock!: () => void
        let locked!: () => void
        const lockAcquired = new Promise<void>((resolve) => {
          locked = resolve
        })
        const release = new Promise<void>((resolve) => {
          unlock = resolve
        })
        let holding!: Promise<void>
        afterEligibility = async () => {
          afterEligibility = undefined
          holding = db.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "AuthorizationGate" WHERE id = ${`connection:${context.connection.id}`} FOR UPDATE`
            locked()
            await release
          })
          await lockAcquired
        }
        const delayed = approveRenewal(context, review.reviewToken)
        await lockAcquired
        await db.agentRenewalReview.update({
          where: { id: digest(review.reviewToken) },
          data: { validUntil: new Date(0) }
        })
        unlock()
        await holding
        expect((await delayed).status).toBe(409)
        expect(
          await db.agentConnection.findUnique({
            where: { id: context.connection.id }
          })
        ).toMatchObject({ version: 1, grantId: context.connection.grantId })
      })

      it('rejects stale team membership and ownership snapshots during renewal', async () => {
        const context = await renewableConnection()
        const preview = await previewRenewal(context)
        let reads = 0
        afterEligibility = async () => {
          if (++reads !== 2) return
          afterEligibility = undefined
          await db.authorizationGate.update({
            where: { id: 'user-team:alice:read-team' },
            data: { generation: { increment: 2 } }
          })
        }
        expect(
          (await approveRenewal(context, preview.reviewToken)).status
        ).toBe(409)
        const ownershipPreview = await previewRenewal(context)
        afterEligibility = async () => {
          afterEligibility = undefined
          eligibilityTeam = 'transferred-team'
        }
        try {
          expect(
            (await approveRenewal(context, ownershipPreview.reviewToken)).status
          ).toBe(409)
        } finally {
          eligibilityTeam = 'read-team'
        }
        const current = await previewRenewal(context)
        const denied = await request(
          `/connections/${context.connection.id}/approve`,
          {
            method: 'POST',
            headers: {
              Origin: 'https://foreign.example',
              Authorization: 'Bearer alice',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              csrf: context.csrf,
              expectedVersion: 1,
              clientId: context.clientId,
              reviewToken: current.reviewToken
            })
          }
        )
        expect(denied.status).toBe(403)
        const managementCookie = cookies.get('agent_management')!
        cookies.set('agent_management', managementCookie + 'tampered')
        expect(
          (await approveRenewal(context, current.reviewToken)).status
        ).toBe(403)
        cookies.set('agent_management', managementCookie)
      })

      it('fences renewed OAuth reconnect against membership changes at final approval', async () => {
        const context = await renewableConnection()
        const preview = await previewRenewal(context)
        expect(
          (await approveRenewal(context, preview.reviewToken)).status
        ).toBe(200)
        const uid = await interaction()
        const details = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as { csrf: string }
        const reconnectReview = await post(`/interaction/${uid}/review`, {
          csrf: details.csrf,
          journeyIds: ['draft-a'],
          mode: 'view',
          duration: 'week',
          connectionId: context.connection.id,
          expectedVersion: 2
        })
        expect(reconnectReview.status).toBe(200)
        const { reviewToken } = (await reconnectReview.json()) as {
          reviewToken: string
        }
        let reads = 0
        afterEligibility = async () => {
          if (++reads !== 2) return
          afterEligibility = undefined
          await db.authorizationGate.update({
            where: { id: 'user-team:alice:read-team' },
            data: { generation: { increment: 2 } }
          })
        }
        const decision = await post(`/interaction/${uid}/decision`, {
          csrf: details.csrf,
          reviewToken,
          decision: 'approve'
        })
        expect(decision.status).not.toBe(200)
        expect(
          await db.agentConnection.findUnique({
            where: { id: context.connection.id }
          })
        ).toMatchObject({ version: 2, credentialsPending: true })
      })

      it('invalidates an older duration review before accepting a replacement', async () => {
        const context = await renewableConnection()
        const first = await previewRenewal(context, 'day')
        const second = await previewRenewal(context, 'year')
        expect((await approveRenewal(context, first.reviewToken)).status).toBe(
          409
        )
        expect((await approveRenewal(context, second.reviewToken)).status).toBe(
          200
        )
      })

      it('advertises discovery and rejects unsafe registration and missing PKCE', async () => {
        const discovery = await request(
          '/.well-known/oauth-authorization-server'
        )
        expect(discovery.status, await discovery.clone().text()).toBe(200)
        expect(await discovery.json()).toMatchObject({
          issuer: config.AUTH_ISSUER,
          code_challenge_methods_supported: ['S256']
        })
        const response = await request('/reg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: 'unsafe',
            redirect_uris: ['javascript:alert(1)'],
            token_endpoint_auth_method: 'none',
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code']
          })
        })
        expect(response.status).toBe(400)
        const deniedAuthorizations = await db.securityAudit.count({
          where: { action: 'authorization', outcome: 'denied' }
        })
        const missingPkce = await request(
          '/auth?client_id=synthetic-client&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A4209%2Fcallback&resource=http%3A%2F%2F127.0.0.1%3A4010%2Fmcp'
        )
        expect(
          new URL(missingPkce.headers.get('Location')!).searchParams.get(
            'error'
          )
        ).toBe('invalid_request')
        expect(
          await db.securityAudit.count({
            where: { action: 'authorization', outcome: 'denied' }
          })
        ).toBe(deniedAuthorizations + 1)
      })

      it('shows current eligible journeys, defaults to a week and rejects CSRF, other users and tampered resources', async () => {
        const uid = await interaction()
        const details = await post(`/interaction/${uid}/details`, {})
        expect(details.status).toBe(200)
        const view = (await details.json()) as {
          csrf: string
          duration: string
          journeys: Array<{ id: string }>
        }
        expect(view.duration).toBe('week')
        expect(view.journeys.map((journey) => journey.id)).toEqual([
          'draft-a',
          'draft-b'
        ])
        expect(
          (
            await post(`/interaction/${uid}/review`, {
              csrf: 'wrong'.repeat(10),
              journeyIds: ['draft-a'],
              mode: 'edit',
              duration: 'week'
            })
          ).status
        ).toBe(403)
        expect(
          (
            await post(`/interaction/${uid}/review`, {
              csrf: view.csrf,
              journeyIds: ['bob-draft'],
              mode: 'edit',
              duration: 'week'
            })
          ).status
        ).toBe(403)
        expect(
          (await post(`/interaction/${uid}/details`, {}, 'bob')).status
        ).toBe(409)
        expect(
          (
            await post(`/interaction/${uid}/review`, {
              csrf: view.csrf,
              journeyIds: ['draft-a'],
              mode: 'edit',
              duration: 'week',
              expiresAt: '2099-01-01'
            })
          ).status
        ).toBe(400)
      })

      it('issues opaque authority only after approval and rotates refresh tokens across replicas', async () => {
        const uid = await interaction()
        const view = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as { csrf: string }
        const review = (await (
          await post(`/interaction/${uid}/review`, {
            csrf: view.csrf,
            journeyIds: ['draft-a'],
            mode: 'view',
            duration: 'week'
          })
        ).json()) as { reviewToken: string; expiresAt: string }
        const approved = await post(
          `/interaction/${uid}/decision`,
          {
            csrf: view.csrf,
            reviewToken: review.reviewToken,
            decision: 'approve'
          },
          'alice',
          1
        )
        expect(approved.status).toBe(200)
        const result = (await approved.json()) as { redirectUrl: string }
        const resumed = await request(
          new URL(result.redirectUrl).pathname,
          {},
          1
        )
        expect(resumed.status).toBe(303)
        const callback = new URL(resumed.headers.get('Location')!, origin)
        expect(callback.searchParams.get('iss')).toBe(config.AUTH_ISSUER)
        const code = callback.searchParams.get('code')!
        expect(code).toBeTruthy()
        const tokenBody = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          code_verifier: verifier,
          client_id: 'synthetic-client',
          redirect_uri: 'http://127.0.0.1:4209/callback',
          resource: config.AUTH_AUDIENCE
        })
        const exchanged = await request(
          '/token',
          { method: 'POST', body: tokenBody },
          0
        )
        expect(exchanged.status).toBe(200)
        const tokens = (await exchanged.json()) as {
          access_token: string
          refresh_token: string
          scope: string
        }
        expect(tokens.access_token.split('.')).toHaveLength(1)
        expect(tokens.scope).not.toContain('journeys:edit')
        const introspection = async (accessToken: string) => {
          const response = await request(
            '/token/introspection',
            {
              method: 'POST',
              headers: {
                Authorization: `Basic ${Buffer.from(`${config.AUTH_INTROSPECTION_CLIENT_ID}:${config.AUTH_INTROSPECTION_CLIENT_SECRET}`).toString('base64')}`
              },
              body: new URLSearchParams({ token: accessToken })
            },
            1
          )
          expect(response.status).toBe(200)
          return response.json() as Promise<Record<string, unknown>>
        }
        expect(await introspection(tokens.access_token)).toMatchObject({
          active: true,
          aud: config.AUTH_AUDIENCE,
          iss: config.AUTH_ISSUER,
          journey_ids: ['draft-a'],
          mode: 'view',
          consent_expires_at: Math.floor(Date.parse(review.expiresAt) / 1000)
        })
        const refreshBody = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
          client_id: 'synthetic-client',
          resource: config.AUTH_AUDIENCE
        })
        const refreshed = await request(
          '/token',
          { method: 'POST', body: refreshBody },
          1
        )
        expect(refreshed.status).toBe(200)
        const rotated = (await refreshed.json()) as {
          refresh_token: string
          access_token: string
        }
        expect(rotated.refresh_token).not.toBe(tokens.refresh_token)
        expect(await introspection(rotated.access_token)).toMatchObject({
          active: true,
          consent_expires_at: Math.floor(Date.parse(review.expiresAt) / 1000)
        })
        expect(
          (await request('/token', { method: 'POST', body: refreshBody }))
            .status
        ).not.toBe(200)
        expect(await introspection(rotated.access_token)).toMatchObject({
          active: false
        })
      })

      it('binds a new consent to the currently verified Firebase account instead of an older issuer session', async () => {
        const uid = await interaction()
        const response = await post(`/interaction/${uid}/details`, {}, 'bob')
        expect(response.status).toBe(200)
        const details = (await response.json()) as {
          csrf: string
          journeys: Array<{ id: string }>
        }
        expect(details.journeys.map((journey) => journey.id)).toEqual([
          'bob-draft'
        ])
        expect(
          (
            await post(
              `/interaction/${uid}/review`,
              {
                csrf: details.csrf,
                journeyIds: ['draft-a'],
                mode: 'edit',
                duration: 'week'
              },
              'bob'
            )
          ).status
        ).toBe(403)
        expect(
          (
            await post(
              `/interaction/${uid}/review`,
              {
                csrf: details.csrf,
                journeyIds: ['bob-draft'],
                mode: 'view',
                duration: 'week'
              },
              'bob'
            )
          ).status
        ).toBe(200)
        expect(
          (await post(`/interaction/${uid}/details`, {}, 'alice')).status
        ).toBe(409)
      })

      it('rejects an expired consent review and permits an explicit fresh review in the same interaction', async () => {
        const uid = await interaction()
        const details = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as { csrf: string }
        const selection = {
          csrf: details.csrf,
          journeyIds: ['draft-a'],
          mode: 'edit',
          duration: 'week'
        }
        const first = (await (
          await post(`/interaction/${uid}/review`, selection)
        ).json()) as { reviewToken: string }
        await db.consentReview.update({
          where: { interactionId: uid },
          data: { validUntil: new Date(0) }
        })
        expect(
          (
            await post(`/interaction/${uid}/decision`, {
              csrf: details.csrf,
              reviewToken: first.reviewToken,
              decision: 'approve'
            })
          ).status
        ).toBe(409)
        const reviewed = await post(`/interaction/${uid}/review`, selection)
        expect(reviewed.status).toBe(200)
        const next = (await reviewed.json()) as { reviewToken: string }
        expect(next.reviewToken).not.toBe(first.reviewToken)
        expect(
          (
            await post(`/interaction/${uid}/decision`, {
              csrf: details.csrf,
              reviewToken: first.reviewToken,
              decision: 'approve'
            })
          ).status
        ).toBe(403)
      })

      it.each([
        ['code_verifier', 'incorrect-verifier-with-at-least-thirty-two-bytes'],
        ['redirect_uri', 'https://client.example/unregistered'],
        ['resource', 'https://unrelated.example/mcp']
      ])(
        'rejects an incorrect %s during token exchange',
        async (parameter, value) => {
          const body = await approvedCode()
          body.set(parameter, value)
          const denied = await request('/token', { method: 'POST', body })
          expect(denied.status).toBe(400)
          expect(await denied.json()).not.toHaveProperty('access_token')
        }
      )

      it('denies without selecting resources and creates no usable authorization', async () => {
        const uid = await interaction()
        const view = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as { csrf: string }
        const denied = await post(`/interaction/${uid}/decision`, {
          csrf: view.csrf,
          decision: 'deny'
        })
        expect(denied.status).toBe(200)
        const result = (await denied.json()) as { redirectUrl: string }
        const response = await request(new URL(result.redirectUrl).pathname)
        const callback = new URL(response.headers.get('Location')!, origin)
        expect(callback.searchParams.get('error')).toBe('access_denied')
        expect(callback.searchParams.has('code')).toBe(false)
      })

      it('rejects a changed gate generation after reading authoritative rights', async () => {
        const uid = await interaction()
        const view = (await (
          await post(`/interaction/${uid}/details`, {})
        ).json()) as { csrf: string }
        let captured!: () => void
        const capturedRights = new Promise<void>((resolve) => {
          captured = resolve
        })
        let resume!: () => void
        const resumed = new Promise<void>((resolve) => {
          resume = resolve
        })
        afterEligibility = async () => {
          captured()
          await resumed
        }
        const pending = post(`/interaction/${uid}/review`, {
          csrf: view.csrf,
          journeyIds: ['draft-a'],
          mode: 'edit',
          duration: 'week'
        })
        await capturedRights
        await db.authorizationGate.update({
          where: { id: 'journey:draft-a' },
          data: { generation: { increment: 1 } }
        })
        resume()
        try {
          expect((await pending).status).not.toBe(200)
        } finally {
          afterEligibility = undefined
        }
      })

      it('binds the database to its configured issuer, audience, environment and Firebase project', async () => {
        await expect(
          createRuntime(
            { ...config, AUTH_ISSUER: 'https://wrong-issuer.example' },
            { db, identity, eligibility: async () => [] }
          )
        ).rejects.toThrow('Auth environment mismatch')
        await expect(
          createRuntime(
            { ...config, AUTH_ENVIRONMENT: 'stage' },
            { db, identity, eligibility: async () => [] }
          )
        ).rejects.toThrow('Auth environment mismatch')
        await expect(
          createRuntime(
            { ...config, AUTH_AUDIENCE: 'https://wrong-audience.example/mcp' },
            { db, identity, eligibility: async () => [] }
          )
        ).rejects.toThrow('Auth environment mismatch')
      })

      it('requires current identity and consent after expiry and excludes raw input from audit', async () => {
        const body = await approvedCode()
        const exchanged = await request('/token', { method: 'POST', body })
        expect(exchanged.status).toBe(200)
        const tokens = (await exchanged.json()) as {
          access_token: string
          refresh_token: string
        }
        invalidUsers.add('alice')
        const invalid = await request('/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token,
            client_id: 'synthetic-client',
            resource: config.AUTH_AUDIENCE
          })
        })
        expect(invalid.status).not.toBe(200)
        invalidUsers.delete('alice')
        await db.agentConnection.updateMany({
          where: { userId: 'alice' },
          data: { expiresAt: new Date(0) }
        })
        const introspection = await request('/token/introspection', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${config.AUTH_INTROSPECTION_CLIENT_ID}:${config.AUTH_INTROSPECTION_CLIENT_SECRET}`).toString('base64')}`
          },
          body: new URLSearchParams({ token: tokens.access_token })
        })
        expect(await introspection.json()).toMatchObject({ active: false })
        const expiredRefresh = await request('/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token,
            client_id: 'synthetic-client',
            resource: config.AUTH_AUDIENCE
          })
        })
        expect(expiredRefresh.status).not.toBe(200)
        const serializedAudit = JSON.stringify(
          await db.securityAudit.findMany()
        )
        for (const sentinel of [
          tokens.access_token,
          tokens.refresh_token,
          'Invalid session sentinel',
          'Synthetic draft',
          'firebase-evidence'
        ])
          expect(serializedAudit).not.toContain(sentinel)
        expect(
          await db.securityAudit.count({
            where: { action: 'token', outcome: 'denied' }
          })
        ).toBeGreaterThan(0)
      })

      it('checks authorization-code expiry after waiting for its database row lock', async () => {
        const body = await approvedCode()
        const id = body.get('code')!
        expect(
          await db.oAuthArtifact.findUnique({
            where: { model_id: { model: 'AuthorizationCode', id } }
          })
        ).not.toBeNull()
        let locked!: () => void
        const lockHeld = new Promise<void>((resolve) => {
          locked = resolve
        })
        let release!: () => void
        const released = new Promise<void>((resolve) => {
          release = resolve
        })
        const lock = db.$transaction(async (transaction) => {
          await transaction.$queryRaw`SELECT id FROM "OAuthArtifact" WHERE model = 'AuthorizationCode' AND id = ${id} FOR UPDATE`
          locked()
          await released
          await transaction.oAuthArtifact.update({
            where: { model_id: { model: 'AuthorizationCode', id } },
            data: { expiresAt: await databaseTime(transaction) }
          })
        })
        await lockHeld
        const pending = request('/token', { method: 'POST', body })
        try {
          await vi.waitFor(
            async () => {
              const [waiters] = await db.$queryRaw<
                Array<{ count: bigint }>
              >`SELECT count(*) FROM pg_stat_activity WHERE usename = current_user AND wait_event_type = 'Lock' AND query LIKE '%OAuthArtifact%'`
              expect(Number(waiters.count)).toBeGreaterThan(0)
            },
            { timeout: 2000, interval: 10 }
          )
        } finally {
          release()
          await lock
        }
        expect((await pending).status).toBe(400)
      })

      it('honors a closed durable gate for introspection and refresh, and audits early HTTP denials', async () => {
        const exchanged = await request('/token', {
          method: 'POST',
          body: await approvedCode()
        })
        const tokens = (await exchanged.json()) as {
          access_token: string
          refresh_token: string
        }
        await db.authorizationGate.update({
          where: { id: 'journey:draft-a' },
          data: { open: false, generation: { increment: 1 } }
        })
        try {
          const introspection = await request('/token/introspection', {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from(`${config.AUTH_INTROSPECTION_CLIENT_ID}:${config.AUTH_INTROSPECTION_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({ token: tokens.access_token })
          })
          expect(await introspection.json()).not.toMatchObject({ active: true })
          const refresh = await request('/token', {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: tokens.refresh_token,
              client_id: 'synthetic-client',
              resource: config.AUTH_AUDIENCE
            })
          })
          expect(refresh.status).not.toBe(200)
        } finally {
          await db.authorizationGate.update({
            where: { id: 'journey:draft-a' },
            data: { open: true, generation: { increment: 1 } }
          })
        }
        const before = await db.securityAudit.count({
          where: { action: 'token', outcome: 'denied' }
        })
        expect(
          (
            await request('/token', {
              method: 'POST',
              headers: { Origin: 'https://csrf.invalid' }
            })
          ).status
        ).toBe(403)
        expect(
          await db.securityAudit.count({
            where: { action: 'token', outcome: 'denied' }
          })
        ).toBe(before + 1)
      })

      it.each(['oversize', 'redirect', 'timeout'])(
        'bounds CIMD %s using controlled network failures',
        async (failure) => {
          const clientId = `https://metadata.example/${failure}.json`
          config.AUTH_CIMD_ORIGINS.push('https://metadata.example')
          vi.stubGlobal(
            'fetch',
            vi.fn(async (_url: unknown, init?: RequestInit) => {
              expect(init?.redirect).toBe('error')
              expect(init?.signal).toBeDefined()
              if (failure === 'redirect')
                return new Response(null, {
                  status: 302,
                  headers: { Location: 'https://untrusted.example/client.json' }
                })
              if (failure === 'timeout')
                return new Promise<Response>((_resolve, reject) => {
                  init!.signal!.addEventListener(
                    'abort',
                    () => reject(new Error('controlled timeout')),
                    { once: true }
                  )
                })
              return new Response(
                JSON.stringify({
                  client_id: clientId,
                  client_name: 'Synthetic metadata',
                  redirect_uris: ['https://client.example/callback'],
                  grant_types: ['authorization_code', 'refresh_token'],
                  response_types: ['code'],
                  token_endpoint_auth_method: 'none'
                }).padEnd(16385, ' '),
                { headers: { 'Content-Type': 'application/json' } }
              )
            })
          )
          try {
            const response = await request(
              `/auth?${new URLSearchParams({ client_id: clientId, redirect_uri: 'https://client.example/callback', response_type: 'code', scope: 'journeys:read', resource: config.AUTH_AUDIENCE, code_challenge: digestVerifier(), code_challenge_method: 'S256' })}`
            )
            expect(response.status).toBe(400)
            expect(await response.json()).toMatchObject({
              error: 'invalid_client'
            })
          } finally {
            vi.unstubAllGlobals()
            config.AUTH_CIMD_ORIGINS.pop()
          }
        }
      )

      it.each(['127.0.0.1', 'localhost.'])(
        'blocks private-address CIMD %s before opening a network connection',
        async (hostname) => {
          let connections = 0
          const destination = createTcpServer((socket) => {
            connections++
            socket.destroy()
          })
          await new Promise<void>((resolve) =>
            destination.listen(0, '127.0.0.1', resolve)
          )
          const port = (destination.address() as AddressInfo).port
          const metadataOrigin = `https://${hostname}:${port}`
          config.AUTH_CIMD_ORIGINS.push(metadataOrigin)
          try {
            const response = await request(
              `/auth?${new URLSearchParams({ client_id: `${metadataOrigin}/client.json`, redirect_uri: 'https://client.example/callback', response_type: 'code', scope: 'journeys:read', resource: config.AUTH_AUDIENCE, code_challenge: digestVerifier(), code_challenge_method: 'S256' })}`
            )
            expect(response.status).toBe(400)
            expect(connections).toBe(0)
          } finally {
            config.AUTH_CIMD_ORIGINS.pop()
            await new Promise<void>((resolve) =>
              destination.close(() => resolve())
            )
          }
        }
      )

      it.skipIf(!process.env.AUTH_TEST_MIGRATION_DATABASE_URL)(
        'fails closed and loses readiness when durable authority is unreadable',
        async () => {
          const migration = createAuthDatabase(
            process.env.AUTH_TEST_MIGRATION_DATABASE_URL!
          )
          const [role] = await db.$queryRaw<
            Array<{ name: string }>
          >`SELECT current_user AS name`
          if (!/^[a-z0-9_]+$/.test(role.name))
            throw new Error('Unexpected test role')
          const exchanged = await request('/token', {
            method: 'POST',
            body: await approvedCode()
          })
          const tokens = (await exchanged.json()) as {
            access_token: string
            refresh_token: string
          }
          try {
            await migration.$executeRawUnsafe(
              `REVOKE SELECT ON "AgentConnection" FROM "${role.name}"`
            )
            expect((await request('/ready')).status).toBe(503)
            const introspection = await request('/token/introspection', {
              method: 'POST',
              headers: {
                Authorization: `Basic ${Buffer.from(`${config.AUTH_INTROSPECTION_CLIENT_ID}:${config.AUTH_INTROSPECTION_CLIENT_SECRET}`).toString('base64')}`
              },
              body: new URLSearchParams({ token: tokens.access_token })
            })
            expect(await introspection.json()).not.toMatchObject({
              active: true
            })
            const refresh = await request('/token', {
              method: 'POST',
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token,
                client_id: 'synthetic-client',
                resource: config.AUTH_AUDIENCE
              })
            })
            expect(refresh.status).not.toBe(200)
          } finally {
            await migration.$executeRawUnsafe(
              `GRANT SELECT ON "AgentConnection" TO "${role.name}"`
            )
            await migration.$disconnect()
          }
          expect((await request('/ready')).status).toBe(200)
        }
      )

      it('persists client registration and single-use credentials through process replacement and concurrent replicas', async () => {
        await Promise.all(instances.map((instance) => instance.close()))
        instances = [await processReplica(), await processReplica()]
        const registration = await request('/reg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: 'Registered local agent',
            redirect_uris: ['http://127.0.0.1:4209/callback'],
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            token_endpoint_auth_method: 'none'
          })
        })
        expect(registration.status).toBe(201)
        const registered = (await registration.json()) as { client_id: string }
        const persistedRegistration = await db.oAuthArtifact.findUniqueOrThrow({
          where: { model_id: { model: 'Client', id: registered.client_id } }
        })
        expect(persistedRegistration.expiresAt).toBeNull()
        await instances[0].close()
        instances[0] = await processReplica()
        const body = await approvedCode('edit', registered.client_id, 'year')
        const simultaneousCodes = await Promise.all([
          request('/token', { method: 'POST', body }, 0),
          request('/token', { method: 'POST', body }, 1)
        ])
        expect(
          simultaneousCodes.filter((response) => response.status === 200)
        ).toHaveLength(1)
        // Code replay invalidates its grant. Use a new explicit approval for the refresh race.
        const fresh = await request('/token', {
          method: 'POST',
          body: await approvedCode()
        })
        const tokens = (await fresh.json()) as { refresh_token: string }
        expect(tokens.refresh_token).toBeTruthy()
        const refreshBody = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
          client_id: 'synthetic-client',
          resource: config.AUTH_AUDIENCE
        })
        const simultaneousRefresh = await Promise.all([
          request('/token', { method: 'POST', body: refreshBody }, 0),
          request('/token', { method: 'POST', body: refreshBody }, 1)
        ])
        expect(
          simultaneousRefresh.filter((response) => response.status === 200)
        ).toHaveLength(1)
        // Three issuer process starts and several complete OAuth exchanges share
        // the test runner with the owning API suites.
      }, 60000)
    }
  )
})
