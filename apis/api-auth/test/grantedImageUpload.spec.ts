import { fork } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

import { buildSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'
import sharp from 'sharp'

import { PrismaClient as LanguagesDatabase } from '@core/prisma/languages/client'
import { PrismaClient as MediaDatabase } from '@core/prisma/media/client'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- Qualify the actual separately deployed media executor. */
import type { ImageGenerationProvider } from '../../api-media/src/lib/mcpImageGenerationProvider'
import { imageHash } from '../../api-media/src/lib/mcpImageInput'
import type { ImageUploadProvider } from '../../api-media/src/lib/mcpImageProvider'
import type { MediaJobs } from '../../api-media/src/lib/mcpMediaJobs'
import { mediaRuntime } from '../../api-media/src/lib/mcpMediaRuntime'
import type { UploadStorage } from '../../api-media/src/lib/mcpUploadStorage'
import { IdentityIneligible } from '../src/identity'
import { captureGates, lockGates } from '../src/store'
import {
  beginConnectionChange,
  reconcileConnectionChanges
} from '../src/withdrawal'

/* eslint-enable @nx/enforce-module-boundaries */
import { structureFixture } from './grantedStructureFixture'

const authUrl = process.env.UPLOAD_TEST_AUTH_DATABASE_URL
const journeysUrl = process.env.UPLOAD_TEST_JOURNEYS_DATABASE_URL
const mediaUrl = process.env.UPLOAD_TEST_MEDIA_DATABASE_URL
const languagesUrl = process.env.UPLOAD_TEST_LANGUAGES_DATABASE_URL

describe('same-job image upload through authenticated MCP and Admin HTTP', () => {
  if (![authUrl, journeysUrl, mediaUrl, languagesUrl].every(Boolean))
    throw new Error('Run node tools/scripts/test-mcp-image-upload.mjs')
  if (!/^\/media_issue_(10560|10548)(_|$)/.test(new URL(mediaUrl!).pathname))
    throw new Error('Use isolated media issue databases')
  const media = new MediaDatabase({
    adapter: new PrismaPg({ connectionString: mediaUrl })
  })
  const languages = new LanguagesDatabase({
    adapter: new PrismaPg({ connectionString: languagesUrl })
  })
  // External storage/Cloudflare and Firebase are explicitly controlled. Job
  // state, streaming validation, OAuth, grant gates, owning ACL and SQL are real.
  const objects = new Map<string, Buffer>()
  const providerAssets = new Map<string, 'processing' | 'ready'>()
  let dispatchCount = 0
  let generationCount = 0
  let generationObservations = 0
  let generationEnabled = true
  const promptSentinel = 'private-generation-prompt-sentinel'
  let loseDispatch = false
  let rejectDispatch = false
  let cleanupUnavailable = false
  let stagingUnknown = false
  let stagingRejected = false
  let stagingWrites = 0
  let identityFailure: Error | undefined
  let beforeStagedRead: (() => Promise<void>) | undefined
  let mediaLibrary = true
  let providerReady = true
  let providerUnknown = false
  let providerStatusUnavailable = false
  let jobs: MediaJobs
  let createWorker: (
    uploadLimit?: string,
    adapter?: 'controlled' | 'cloudflare'
  ) => MediaJobs
  let processCompletedTransfers: () => Promise<void>
  let duringProviderDispatch: (() => Promise<void>) | undefined
  let uploadOrigin = ''
  let authorityUrl = ''
  let afterPrepare: ((action: string) => Promise<void>) | undefined
  let beforeAccept: ((action: string) => Promise<void>) | undefined
  let beforeSend: (() => Promise<void>) | undefined
  let beforeStagingWrite: (() => Promise<void>) | undefined
  const storage: UploadStorage = {
    async put(key, bytes) {
      stagingWrites++
      if (stagingRejected) return 'rejected' as const
      objects.set(key, Buffer.from(bytes))
      if (stagingUnknown) throw new Error('Controlled lost storage response')
    },
    async get(key) {
      await beforeStagedRead?.()
      if (stagingUnknown)
        throw new Error('Controlled unresolved storage status')
      const bytes = objects.get(key)
      if (!bytes) throw new Error('Missing controlled object')
      return Buffer.from(bytes)
    },
    async removeJob(jobId) {
      if (cleanupUnavailable) throw new Error('Controlled cleanup failure')
      for (const key of objects.keys())
        if (key.startsWith(jobId + '/')) objects.delete(key)
    }
  }
  const provider: ImageUploadProvider = {
    async dispatch(id) {
      dispatchCount++
      await duringProviderDispatch?.()
      if (rejectDispatch) return 'rejected'
      providerAssets.set(id, providerReady ? 'ready' : 'processing')
      if (loseDispatch)
        throw new Error('controlled lost response credential-sentinel')
      return providerReady ? 'ready' : 'processing'
    },
    async status(id) {
      if (providerStatusUnavailable)
        throw new Error('Controlled provider status outage')
      return providerUnknown ? 'unknown' : (providerAssets.get(id) ?? 'unknown')
    }
  }
  const generation: ImageGenerationProvider = {
    async dispatch(id, prompt) {
      expect(prompt).toBe(promptSentinel)
      generationCount++
      return provider.dispatch(id, Buffer.alloc(0), 'image/jpeg')
    },
    async status(id) {
      generationObservations++
      const state = await provider.status(id)
      return state === 'ready'
        ? { state, metadata: { width: 2, height: 2, blurhash: 'controlled' } }
        : state
    }
  }
  const internalSecret =
    'controlled-upload-internal-10560-at-least-32-characters'
  const mediaSecret = 'controlled-upload-authority-10560-at-least-32-characters'
  function configureRuntime(
    env: Parameters<typeof mediaRuntime>[0],
    dependencies: Parameters<typeof mediaRuntime>[1]
  ) {
    const uploads = dependencies?.uploads
    if (!uploads) throw new Error('Missing upload dependencies for the fixture')
    createWorker = (uploadLimit, adapter = 'controlled') =>
      mediaRuntime(
        {
          ...env,
          CLOUDFLARE_ACCOUNT_ID: 'controlled-account',
          CLOUDFLARE_IMAGES_TOKEN: 'images-credential-sentinel',
          CLOUDFLARE_WORKERS_AI_TOKEN: 'ai-credential-sentinel',
          MCP_MEDIA_UPLOAD_LIMIT: uploadLimit,
          MCP_IMAGE_GENERATION_ENABLED: String(generationEnabled)
        },
        {
          ...dependencies,
          uploads: {
            ...uploads,
            generation: adapter === 'cloudflare' ? undefined : generation
          }
        }
      ).jobs!
    return mediaRuntime(env, dependencies)
  }
  const f = structureFixture({
    issue: process.env.MCP_MEDIA_TEST_ISSUE ?? '10560',
    authUrl,
    journeysUrl,
    startupTimeoutMs: 120000,
    async checkIdentity() {
      if (identityFailure) throw identityFailure
    },
    authEnv: {
      AUTH_READ_MEDIA_SECRET: mediaSecret,
      AUTH_PERMISSION_MEDIA_SECRET:
        'controlled-upload-permission-10560-at-least-32-characters'
    },
    async media({ config, journeys, publicKey, listen }) {
      authorityUrl = config.AUTH_ISSUER
      await media.mcpMediaChunk.deleteMany()
      await media.mcpMediaJob.deleteMany()
      await media.mcpMediaExecution.deleteMany()
      const runtime = configureRuntime(
        {
          MCP_MEDIA_ENABLED: 'true',
          MCP_IMAGE_UPLOADS_ENABLED: 'true',
          MCP_IMAGE_GENERATION_ENABLED: 'true',
          MCP_GENERATION_POLL_INTERVAL_MS: '60000',
          MCP_READ_ISSUER: config.AUTH_ISSUER,
          MCP_READ_GATEWAY_AUDIENCE: config.AUTH_READ_GATEWAY_AUDIENCE,
          MCP_READ_ENVIRONMENT: 'local',
          MCP_READ_PUBLIC_KEY: JSON.stringify(publicKey),
          MEDIA_MCP_INTERNAL_SECRET: internalSecret,
          MEDIA_MCP_AUTHORITY_SECRET: mediaSecret,
          MCP_READ_AUTHORITY_URL: config.AUTH_ISSUER,
          MCP_PERMISSION_MEDIA_SECRET: config.AUTH_PERMISSION_MEDIA_SECRET,
          CLOUDFLARE_IMAGE_ACCOUNT: 'synthetic-account',
          JOURNEYS_ADMIN_URL: config.AUTH_ADMIN_ORIGIN,
          MCP_MEDIA_INGRESS_URL: 'http://127.0.0.1:4005',
          MCP_MEDIA_UPLOAD_TICKET_SECRET:
            'controlled-upload-ticket-10560-at-least-32-characters'
        },
        {
          media,
          journeys,
          languages,
          // Recovery runs explicitly at each lifecycle/race boundary below.
          scheduleBackgroundWork: () => undefined,
          flags: async () => ({ mediaLibrary, websiteMode: true }),
          providers: {
            async image(src) {
              return {
                kind: 'image',
                src,
                width: 2,
                height: 2,
                blurhash: 'controlled'
              }
            },
            catalog: async () => undefined,
            async unsplash() {
              throw new Error('unused')
            },
            async searchUnsplash() {
              return []
            },
            async youtube() {
              throw new Error('unused')
            }
          },
          uploads: {
            // Drive the production periodic work explicitly at race boundaries.
            scheduleProcessing: (work) => {
              processCompletedTransfers = work
            },
            storage,
            provider,
            generation,
            browserIdentity: async (token) => {
              if (!['alice', 'bob'].includes(token))
                throw new Error('Controlled identity denied')
              return token
            },
            hooks: {
              afterPrepare: async (action) => afterPrepare?.(action),
              beforeAccept: async (action) => beforeAccept?.(action),
              beforeSend: async () => beforeSend?.(),
              beforeStagingWrite: async () => beforeStagingWrite?.()
            }
          }
        }
      )
      jobs = runtime.jobs!
      const yoga = createYoga({
        schema: buildSchema('type Query { ping: Boolean }'),
        plugins: runtime.plugins,
        logging: false
      })
      uploadOrigin = await listen(
        createServer((req, res) => {
          void yoga(req, res)
        })
      )
      return { url: uploadOrigin + '/mcp/media-sources', internalSecret }
    }
  })

  beforeEach(async () => {
    duringProviderDispatch = undefined
    afterPrepare = undefined
    beforeAccept = undefined
    beforeSend = undefined
    beforeStagingWrite = undefined
    dispatchCount = 0
    generationCount = 0
    generationObservations = 0
    generationEnabled = true
    loseDispatch = false
    rejectDispatch = false
    cleanupUnavailable = false
    stagingUnknown = false
    stagingRejected = false
    stagingWrites = 0
    identityFailure = undefined
    beforeStagedRead = undefined
    providerReady = true
    mediaLibrary = true
    providerUnknown = false
    providerStatusUnavailable = false
    objects.clear()
    providerAssets.clear()
    await f.journeys.block.create({
      data: {
        id: f.id('image'),
        journeyId: f.journeyId,
        typename: 'ImageBlock',
        parentBlockId: f.id('bc'),
        parentOrder: 3
      }
    })
    await media.mcpMediaChunk.deleteMany()
    await media.mcpMediaJob.deleteMany()
    await media.mcpMediaExecution.deleteMany()
  })

  afterAll(async () => {
    await media.$disconnect()
    await languages.$disconnect()
  })

  afterEach(() => {
    identityFailure = undefined
  })

  const content = (response: Awaited<ReturnType<typeof f.call>>) => {
    expect(response.json.result?.isError, response.text).not.toBe(true)
    expect(response.json.result?.structuredContent, response.text).toBeDefined()
    return response.json.result!.structuredContent!
  }
  const start = async (file?: Record<string, unknown>, key = randomUUID()) =>
    content(
      await f.call('journey_media_start', {
        journeyId: f.journeyId,
        idempotencyKey: key,
        kind: 'image_upload',
        ...(file ? { file } : {})
      })
    )
  const status = async (jobId: string) =>
    content(
      await f.call('journey_media_status', { journeyId: f.journeyId, jobId })
    )
  async function processedStatus(jobId: string) {
    await processCompletedTransfers()
    return status(jobId)
  }
  async function browser(
    jobId: string,
    method = 'GET',
    action?: string,
    body?: BodyInit | Buffer,
    user = 'alice',
    headers: Record<string, string> = {}
  ) {
    const response = await fetch(`${uploadOrigin}/mcp/uploads/${jobId}`, {
      method,
      headers: {
        Authorization: user.startsWith('Upload ') ? user : `JWT ${user}`,
        Origin: 'http://127.0.0.1:4200',
        ...(action ? { 'X-Upload-Action': action } : {}),
        ...headers
      },
      body: Buffer.isBuffer(body) ? new Uint8Array(body) : body
    })
    return {
      status: response.status,
      headers: response.headers,
      json: (await response.json()) as {
        data: Record<string, unknown>
        error?: string
      }
    }
  }
  async function fileBytes(size?: number) {
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: 'red' }
    })
      .png()
      .toBuffer()
    return size ? Buffer.concat([png, Buffer.alloc(size - png.length)]) : png
  }
  const manifest = (
    bytes: Buffer,
    overrides: Record<string, unknown> = {}
  ) => ({
    name: 'synthetic.png',
    mime: 'image/png',
    size: bytes.length,
    sha256: imageHash(bytes),
    ...overrides
  })
  async function upload(jobId: string, bytes: Buffer, user = 'alice') {
    expect(
      (
        await browser(
          jobId,
          'POST',
          'bind',
          JSON.stringify(manifest(bytes)),
          user
        )
      ).status
    ).toBe(200)
    for (let offset = 0; offset < bytes.length; offset += 1048576) {
      const part = bytes.subarray(offset, offset + 1048576)
      const response = await browser(jobId, 'PUT', undefined, part, user, {
        'X-Upload-Offset': String(offset),
        'X-Upload-Sha256': imageHash(part)
      })
      expect(
        response.status,
        `chunk ${offset}: ${response.json.error ?? 'ok'}`
      ).toBe(200)
    }
  }
  async function connectionFor(jobId: string) {
    const job = await media.mcpMediaJob.findUniqueOrThrow({
      where: { id: jobId }
    })
    return f.auth.agentConnection.findUniqueOrThrow({
      where: { id: job.connectionId }
    })
  }
  async function withdraw(jobId: string) {
    const connection = await connectionFor(jobId)
    const gates = await captureGates(f.auth, [`connection:${connection.id}`])
    return f.auth.$transaction(async (tx) => {
      await lockGates(tx, gates)
      await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR UPDATE`
      return beginConnectionChange(tx, connection, undefined)
    })
  }

  it('uses one job, slot, identity and original deadline through duplicate opens, refresh, retries and a second chat', async () => {
    const key = randomUUID()
    const job = await start(undefined, key)
    const replay = await start(undefined, key)
    expect(replay).toEqual(job)
    const id = String(job.jobId)
    for (let i = 0; i < 3; i++) {
      const opened = await browser(id)
      expect(opened.status).toBe(200)
      expect(opened.json.data.transferDeadline).toBe(job.transferDeadline)
      expect(opened.headers.get('cache-control')).toContain('no-store')
    }
    expect(new URL(String(job.adminLink)).search).toBe('')
    expect(String(job.adminLink)).not.toContain('Upload')
    await upload(id, await fileBytes())
    expect((await processedStatus(id)).state).toBe('ready')
    expect(dispatchCount).toBe(1)
    expect((await status(id)).state).toBe('ready')
    expect(dispatchCount).toBe(1)
  })

  describe('user-requested generation', () => {
    const generateInput = (key = randomUUID()) => ({
      journeyId: f.journeyId,
      idempotencyKey: key,
      kind: 'image_generation',
      prompt: promptSentinel
    })
    const generate = async (key = randomUUID()) =>
      content(await f.call('journey_media_start', generateInput(key)))
    const contextFor = async (id: string) => ({
      userId: 'alice',
      connectionId: (await connectionFor(id)).id,
      journeyId: f.journeyId
    })

    it('generates only through an explicit operation, replays once and saves attachment in a separate revision/history step', async () => {
      mediaLibrary = false
      const before = await f.snapshot()
      const text = await f.save([
        {
          type: 'typography_set',
          blockId: f.id('heading'),
          content: 'Ordinary text edit'
        }
      ])
      expect(generationCount).toBe(0)
      const edited = await f.snapshot()
      expect(edited.blocks).not.toEqual(before.blocks)
      const key = randomUUID()
      const job = await generate(key)
      const id = String(job.jobId)
      expect(job).toMatchObject({
        state: 'dispatch_pending',
        mediaKind: 'image_generation'
      })
      expect(job).not.toHaveProperty('ingressTicket')
      expect(job).not.toHaveProperty('adminLink')
      expect(job).not.toHaveProperty('transferDeadline')
      expect(await generate(key)).toEqual(job)
      expect(
        (
          await f.call('journey_media_start', {
            ...generateInput(key),
            prompt: 'A changed private prompt'
          })
        ).json.result?.isError
      ).toBe(true)
      expect(
        await media.mcpMediaJob.count({ where: { kind: 'image_generation' } })
      ).toBe(1)
      expect(generationCount).toBe(0)
      const ready = await processedStatus(id)
      expect(ready.state).toBe('ready')
      expect(generationCount).toBe(1)
      expect((await generate(key)).jobId).toBe(id)
      expect((await processedStatus(id)).state).toBe('ready')
      expect(generationCount).toBe(1)
      expect(
        await media.mcpMediaJob.findUnique({ where: { id } })
      ).toMatchObject({
        generationPrompt: null,
        dispatchedAt: expect.any(Date)
      })
      expect((await f.snapshot()).blocks).toEqual(edited.blocks)
      const stale = await f.input([
        {
          type: 'image_set',
          block: { id: f.id('image') },
          source: { source: 'upload', jobId: id }
        }
      ])
      await f.journeys.block.update({
        where: { id: f.id('heading') },
        data: { content: 'Human revision' }
      })
      expect((await f.edit(stale)).json.result?.structuredContent?.code).toBe(
        'REVISION_CONFLICT'
      )
      const fresh = {
        ...stale,
        expectedRevision: await f.revision(),
        idempotencyKey: randomUUID()
      }
      const saved = f.receipt(await f.edit(fresh))
      expect(saved.historyId).not.toBe(text.historyId)
      expect(f.receipt(await f.edit(fresh))).toEqual(saved)
      f.receipt(await f.historyAction('undo', saved.historyId!))
      f.receipt(await f.historyAction('redo', saved.historyId!))
      expect(
        await media.cloudflareImage.findUnique({
          where: { id: String((ready.asset as { id: string }).id) }
        })
      ).toMatchObject({ isAi: true, uploaded: true })
      expect(JSON.stringify(await f.auth.securityAudit.findMany())).not.toMatch(
        /private-generation-prompt-sentinel|credential-sentinel/
      )
      expect(JSON.stringify(ready)).not.toContain(promptSentinel)
    })

    it('admits one active generation across connections and replacement workers while uploads have independent capacity', async () => {
      const second = await f.consent()
      const requests = await Promise.all([
        f.call('journey_media_start', generateInput()),
        f.call('journey_media_start', generateInput(), second)
      ])
      expect(requests.filter((r) => !r.json.result?.isError)).toHaveLength(1)
      expect(
        await media.mcpMediaJob.count({
          where: { kind: 'image_generation', active: true }
        })
      ).toBe(1)
      await start()
      await start()
      providerReady = false
      await Promise.all([
        processCompletedTransfers(),
        createWorker().processCompletedTransfers()
      ])
      expect(generationCount).toBe(1)
      expect(await media.mcpMediaJob.count({ where: { active: true } })).toBe(3)
    })

    it('dispatches through the configured Cloudflare adapter and recovers its real ready asset without a second creation', async () => {
      const id = String((await generate()).jobId)
      const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      const bytes = await sharp({
        create: { width: 4, height: 3, channels: 3, background: 'red' }
      })
        .jpeg()
        .toBuffer()
      const transport = globalThis.fetch
      const calls: Array<{ url: string; method: string }> = []
      const controlledCloudflare = vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation(async (input, init) => {
          const url =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.href
                : input.url
          if (!url.startsWith('https://api.cloudflare.com/'))
            return transport(input, init)
          calls.push({ url, method: init?.method ?? 'GET' })
          if (url.includes('/ai/run/'))
            return Response.json({
              success: true,
              result: { image: bytes.toString('base64') }
            })
          if (init?.method === 'POST') {
            expect(init.body).toBeInstanceOf(FormData)
            expect((init.body as FormData).get('id')).toBe(job.providerId)
          }
          if (url.endsWith('/blob')) return new Response(new Uint8Array(bytes))
          return Response.json({
            success: true,
            result: { id: job.providerId, uploaded: new Date().toISOString() }
          })
        })
      try {
        const worker = createWorker(undefined, 'cloudflare')
        await worker.processCompletedTransfers()
        expect((await status(id)).state).toBe('ready')
        await worker.recover()
        expect(
          calls.filter((call) => call.url.includes('/ai/run/'))
        ).toHaveLength(1)
        expect(calls.filter((call) => call.method === 'POST')).toHaveLength(2)
        expect(
          await media.cloudflareImage.findUnique({
            where: { id: job.providerId }
          })
        ).toMatchObject({ uploaded: true, isAi: true })
        expect(
          await media.mcpMediaJob.findUnique({ where: { id } })
        ).toMatchObject({ generationPrompt: null, active: false })
        expect(JSON.stringify(await status(id))).not.toMatch(
          /credential-sentinel|private-generation-prompt-sentinel/
        )
      } finally {
        controlledCloudflare.mockRestore()
      }
    })

    it('counts failed dispatch usage, exact replay and each side of the rolling window independently', async () => {
      rejectDispatch = true
      const connection = await f.auth.agentConnection.findFirstOrThrow({
        where: { userId: 'alice', journeyIds: { has: f.journeyId } }
      })
      const journey = await f.journeys.journey.findUniqueOrThrow({
        where: { id: f.journeyId }
      })
      const historicalTime = new Date(Date.now() - 3600000)
      const historicalIds = Array.from({ length: 9 }, () => randomUUID())
      const otherUserIds = Array.from({ length: 10 }, () => randomUUID())
      // Persist historical usage in real SQL. New attempts below execute the
      // production admission, provider handoff and failed-job settlement path.
      await media.mcpMediaJob.createMany({
        data: [...historicalIds, ...otherUserIds].map((id, index) => ({
          id,
          connectionId: index < 9 ? connection.id : 'other-user-connection',
          userId: index < 9 ? 'alice' : 'bob',
          clientId: connection.clientId,
          journeyId: f.journeyId,
          teamId: journey.teamId,
          key: randomUUID(),
          payloadHash: imageHash(Buffer.from(id)),
          kind: 'image_generation',
          state: 'failed',
          active: false,
          admittedAt: historicalTime,
          transferCompletedAt: historicalTime,
          transferDeadline: historicalTime,
          providerId: randomUUID(),
          dispatchedAt: historicalTime,
          completedAt: historicalTime,
          resultExpiresAt: new Date(historicalTime.getTime() + 30 * 86400000)
        }))
      })
      const key = randomUUID()
      const id = String((await generate(key)).jobId)
      expect((await processedStatus(id)).state).toBe('failed')
      expect((await generate(key)).jobId).toBe(id)
      expect(generationCount).toBe(1)
      expect(
        await media.mcpMediaJob.count({
          where: { kind: 'image_generation', active: true }
        })
      ).toBe(0)
      const denied = async (token?: string) => {
        const response = await f.call(
          'journey_media_start',
          generateInput(),
          token
        )
        expect(response.json.result?.isError).toBe(true)
      }
      await denied()
      await denied(await f.consent())
      await media.mcpMediaJob.update({
        where: { id: historicalIds[0] },
        data: { dispatchedAt: new Date(Date.now() - 86400000 + 60000) }
      })
      await denied()
      await media.mcpMediaJob.update({
        where: { id: historicalIds[0] },
        data: { dispatchedAt: new Date(Date.now() - 86400000 - 1000) }
      })
      expect(
        (await processedStatus(String((await generate()).jobId))).state
      ).toBe('failed')
      expect(generationCount).toBe(2)
      await denied()
      await media.mcpMediaJob.update({
        where: { id: historicalIds[1] },
        data: { dispatchedAt: new Date(Date.now() + 86400000) }
      })
      expect(
        (await processedStatus(String((await generate()).jobId))).state
      ).toBe('failed')
      expect(generationCount).toBe(3)
      await denied()
      expect((await generate(key)).jobId).toBe(id)
      expect(generationCount).toBe(3)
      expect(
        await media.mcpMediaJob.count({
          where: { userId: 'bob', dispatchedAt: { not: null } }
        })
      ).toBe(10)
    })

    it('consumes no dispatch allowance for a denied or positively fenced unsent intent and recovers the same job', async () => {
      const id = String((await generate()).jobId)
      const context = await contextFor(id)
      beforeAccept = async (action) => {
        if (action === 'dispatch')
          throw new Error('Controlled pre-accept failure')
      }
      await processCompletedTransfers()
      expect(generationCount).toBe(0)
      expect(
        await media.mcpMediaJob.findUnique({ where: { id } })
      ).toMatchObject({ dispatchedAt: null })
      beforeAccept = undefined
      beforeSend = async () => {
        throw new Error('Controlled pre-send failure')
      }
      await processCompletedTransfers()
      expect(generationCount).toBe(0)
      expect(
        await media.mcpMediaJob.findUnique({ where: { id } })
      ).toMatchObject({
        dispatchReceiptId: null,
        dispatchedAt: null,
        generationPrompt: promptSentinel
      })
      beforeSend = undefined
      await jobs.resume(context, id)
      expect((await status(id)).state).toBe('ready')
      expect(generationCount).toBe(1)
    })

    it('retains an ambiguous dispatch, counts it once and keeps withdrawal Pending until positive provider evidence', async () => {
      const key = randomUUID()
      const id = String((await generate(key)).jobId)
      loseDispatch = true
      providerStatusUnavailable = true
      await processCompletedTransfers()
      expect((await status(id)).state).toBe('reconciling')
      expect((await generate(key)).jobId).toBe(id)
      await createWorker().recover()
      await createWorker().processCompletedTransfers()
      expect(generationCount).toBe(1)
      expect(
        await media.mcpMediaJob.count({
          where: { dispatchedAt: { not: null } }
        })
      ).toBe(1)
      expect(
        (await f.call('journey_media_start', generateInput())).json.result
          ?.isError
      ).toBe(true)
      const connection = await connectionFor(id)
      await withdraw(id)
      await reconcileConnectionChanges(f.auth)
      expect(
        await f.auth.connectionChange.findFirst({
          where: { connectionId: connection.id }
        })
      ).toMatchObject({ status: 'pending' })
      expect((await browser(id)).status).toBe(403)
      providerStatusUnavailable = false
      await media.mcpMediaJob.update({
        where: { id },
        data: { metadata: { attempt: 1, nextAt: 0 } }
      })
      await jobs.recover()
      await reconcileConnectionChanges(f.auth)
      expect(
        await media.mcpMediaJob.findUnique({ where: { id } })
      ).toMatchObject({ state: 'ready', active: false })
      expect(
        await media.cloudflareImage.count({
          where: { isAi: true, uploaded: true }
        })
      ).toBeGreaterThan(0)
      expect(generationCount).toBe(1)
    })

    it('honors cancellation after dispatch acceptance before sending without consuming allowance', async () => {
      const key = randomUUID()
      const id = String((await generate(key)).jobId)
      let receiptId!: string
      beforeSend = async () => {
        const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        receiptId = job.dispatchReceiptId!
        expect(
          await media.mcpMediaExecution.findUniqueOrThrow({
            where: { id: receiptId }
          })
        ).toMatchObject({ status: 'accepted' })
        expect(
          content(
            await f.call('journey_media_cancel', {
              journeyId: f.journeyId,
              jobId: id,
              idempotencyKey: randomUUID()
            })
          )
        ).toMatchObject({ state: 'cancel_requested' })
      }
      await processCompletedTransfers()
      expect(generationCount).toBe(0)
      expect(dispatchCount).toBe(0)
      expect(
        await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      ).toMatchObject({
        state: 'cancelled',
        active: false,
        dispatchedAt: null,
        dispatchReceiptId: null,
        generationPrompt: null
      })
      expect(
        await media.mcpMediaExecution.findUniqueOrThrow({
          where: { id: receiptId }
        })
      ).toMatchObject({ status: 'fenced', reportedAt: expect.any(Date) })
      expect(
        await f.auth.readPermit.findUniqueOrThrow({ where: { id: receiptId } })
      ).toMatchObject({ status: 'settled' })
      expect((await generate(key)).jobId).toBe(id)
      beforeSend = undefined
      const next = String((await generate()).jobId)
      expect(next).not.toBe(id)
      await processCompletedTransfers()
      expect((await status(next)).state).toBe('ready')
      expect(generationCount).toBe(1)
    })

    it('cancels unsent work without usage and reconciles dispatched cancellation without deleting its asset', async () => {
      const id = String((await generate()).jobId)
      content(
        await f.call('journey_media_cancel', {
          journeyId: f.journeyId,
          jobId: id,
          idempotencyKey: randomUUID()
        })
      )
      await processCompletedTransfers()
      expect((await status(id)).state).toBe('cancelled')
      expect(generationCount).toBe(0)
      const active = String((await generate()).jobId)
      providerReady = false
      await processCompletedTransfers()
      content(
        await f.call('journey_media_cancel', {
          journeyId: f.journeyId,
          jobId: active,
          idempotencyKey: randomUUID()
        })
      )
      expect((await status(active)).state).toBe('cancel_requested')
      const job = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id: active }
      })
      providerAssets.set(job.providerId, 'ready')
      await media.mcpMediaJob.update({
        where: { id: active },
        data: { metadata: { attempt: 1, nextAt: 0 } }
      })
      await jobs.recover()
      expect((await status(active)).state).toBe('ready')
      expect(generationCount).toBe(1)
    })

    it('blocks dispatch at expiry, requires explicit same-job resume after permission changes and protects private output', async () => {
      const id = String((await generate()).jobId)
      const connection = await connectionFor(id)
      await f.auth.agentConnection.update({
        where: { id: connection.id },
        data: { expiresAt: new Date(0) }
      })
      await processCompletedTransfers()
      expect(generationCount).toBe(0)
      expect((await browser(id)).status).toBe(403)
      await f.auth.agentConnection.update({
        where: { id: connection.id },
        data: { expiresAt: new Date(Date.now() + 3600000) }
      })
      const gates = await captureGates(f.auth, [
        `user-team:alice:structure-team-alice`
      ])
      await f.auth.$transaction(async (tx) => {
        await lockGates(tx, gates)
        await tx.authorizationGate.updateMany({
          where: { id: { in: gates.map((g) => g.id) } },
          data: { generation: { increment: 1 } }
        })
      })
      await processCompletedTransfers()
      expect(generationCount).toBe(0)
      expect(
        content(
          await f.call('journey_media_status', {
            journeyId: f.journeyId,
            jobId: id,
            resume: true
          })
        ).state
      ).toBe('dispatch_pending')
      expect((await processedStatus(id)).state).toBe('ready')
      await f.auth.agentConnection.update({
        where: { id: connection.id },
        data: { mode: 'view' }
      })
      expect((await browser(id)).status).toBe(403)
      expect(generationCount).toBe(1)
    })

    it('does not turn the upload deadline into a generation timeout and retains ready assets after account retirement', async () => {
      const id = String((await generate()).jobId)
      await media.mcpMediaJob.update({
        where: { id },
        data: { transferDeadline: new Date(0) }
      })
      await jobs.recover()
      expect((await processedStatus(id)).state).toBe('ready')
      const response = await fetch(
        new URL(
          '/internal/permissions/retire-account',
          f.ownerConfig.authorityUrl
        ),
        {
          method: 'POST',
          headers: {
            Authorization:
              'Bearer controlled-structure-users-10557-at-least-32-characters',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: 'alice' })
        }
      )
      expect(response.ok).toBe(true)
      await jobs.recover()
      expect((await browser(id)).status).toBe(403)
      const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      expect(
        await media.cloudflareImage.findUnique({
          where: { id: job.providerId }
        })
      ).toMatchObject({ isAi: true, uploaded: true })
      expect(
        JSON.stringify(await f.auth.securityAudit.findMany())
      ).not.toContain(promptSentinel)
    })

    it('rechecks expiry after the generation user lock and consumes no dispatch on denial', async () => {
      const id = String((await generate()).jobId)
      const connection = await connectionFor(id)
      let release!: () => void
      let locked!: () => void
      let prepared!: () => void
      const canUnlock = new Promise<void>((resolve) => {
        release = resolve
      })
      const hasLock = new Promise<void>((resolve) => {
        locked = resolve
      })
      const hasPrepared = new Promise<void>((resolve) => {
        prepared = resolve
      })
      const blocking = media.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT "userId" FROM "McpMediaUser" WHERE "userId" = 'alice' FOR UPDATE`
          locked()
          await canUnlock
        },
        { timeout: 10000 }
      )
      await hasLock
      afterPrepare = async (action) => {
        if (action === 'dispatch') prepared()
      }
      const processing = createWorker().processCompletedTransfers()
      try {
        await hasPrepared
        await f.auth.agentConnection.update({
          where: { id: connection.id },
          data: { expiresAt: new Date(0) }
        })
      } finally {
        release()
        await blocking
        await processing
      }
      expect(generationCount).toBe(0)
      expect(
        await media.mcpMediaJob.findUnique({ where: { id } })
      ).toMatchObject({ dispatchedAt: null, dispatchReceiptId: null })
    })

    it('keeps delayed generation uncertain, rejects file ingress and never dispatches while disabled', async () => {
      const id = String((await generate()).jobId)
      const context = await contextFor(id)
      expect(
        (
          await browser(
            id,
            'POST',
            'bind',
            JSON.stringify(manifest(await fileBytes()))
          )
        ).status
      ).toBe(403)
      generationEnabled = false
      const disabled = createWorker()
      await expect(
        disabled.admit(context, {
          kind: 'image_generation',
          idempotencyKey: randomUUID(),
          prompt: promptSentinel
        })
      ).rejects.toThrow('ACCESS_DENIED_OR_NOT_FOUND')
      await disabled.processCompletedTransfers()
      expect(generationCount).toBe(0)
      generationEnabled = true
      providerReady = false
      await createWorker().processCompletedTransfers()
      expect(generationCount).toBe(1)
      await media.mcpMediaJob.update({
        where: { id },
        data: { dispatchedAt: new Date(Date.now() - 16 * 60 * 1000) }
      })
      await jobs.recover()
      expect(await status(id)).toMatchObject({
        state: 'reconciling',
        active: true
      })
      providerUnknown = true
      await createWorker().recover()
      expect(await status(id)).toMatchObject({
        state: 'reconciling',
        active: true
      })
      expect(generationCount).toBe(1)
    })

    it('backs off generation observations across workers and permits explicit same-job recovery without another generation', async () => {
      providerReady = false
      const id = String((await generate()).jobId)
      const initial = await processedStatus(id)
      expect(initial.state).toBe('processing')
      expect(typeof initial.nextObservationAt).toBe('string')
      await Promise.all([jobs.recover(), createWorker().recover()])
      expect(generationObservations).toBe(1)
      const resumed = content(
        await f.call('journey_media_status', {
          journeyId: f.journeyId,
          jobId: id,
          resume: true
        })
      )
      expect(resumed.state).toBe('processing')
      await jobs.recover()
      expect(generationObservations).toBe(2)
      const observed = await status(id)
      expect(
        Date.parse(String(observed.nextObservationAt)) -
          Date.parse(String(initial.nextObservationAt))
      ).toBeGreaterThanOrEqual(60000)
      for (const assetId of providerAssets.keys())
        providerAssets.set(assetId, 'ready')
      content(
        await f.call('journey_media_status', {
          journeyId: f.journeyId,
          jobId: id,
          resume: true
        })
      )
      await jobs.recover()
      expect((await status(id)).state).toBe('ready')
      expect(generationObservations).toBe(3)
      expect(generationCount).toBe(1)
    })

    it('escalates unresolved generation after 24 hours without freeing capacity, discarding uncertainty or repeating dispatch', async () => {
      providerReady = false
      const id = String((await generate()).jobId)
      await processedStatus(id)
      await media.mcpMediaJob.update({
        where: { id },
        data: {
          dispatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 1000)
        }
      })
      await createWorker().recover()
      const delayed = await status(id)
      expect(delayed).toMatchObject({
        state: 'reconciling',
        active: true,
        operationsRequired: true
      })
      expect(typeof delayed.escalateAfter).toBe('string')
      expect(String(delayed.recovery)).toContain('operations')
      expect(
        (await f.call('journey_media_start', generateInput())).json.result
          ?.isError
      ).toBe(true)
      expect(generationCount).toBe(1)
      expect(generationObservations).toBe(1)
    })

    it.each(['view', 'revoked', 'published'] as const)(
      'rejects %s attachment while retaining the generated asset',
      async (denied) => {
        const id = String((await generate()).jobId)
        const ready = await processedStatus(id)
        const input = await f.input([
          {
            type: 'image_set',
            block: { id: f.id('image') },
            source: { source: 'upload', jobId: id }
          }
        ])
        const connection = await connectionFor(id)
        if (denied === 'published')
          await f.journeys.journey.update({
            where: { id: f.journeyId },
            data: {
              status: 'published',
              publishedAt: new Date(),
              firstPublishedAt: new Date()
            }
          })
        else
          await f.auth.agentConnection.update({
            where: { id: connection.id },
            data:
              denied === 'view' ? { mode: 'view' } : { revokedAt: new Date() }
          })
        expect((await f.edit(input)).json.result?.isError).toBe(true)
        expect(
          (await f.call('journey_media_start', generateInput())).json.result
            ?.isError
        ).toBe(true)
        expect(
          await media.mcpMediaJob.count({ where: { kind: 'image_generation' } })
        ).toBe(1)
        expect(
          await media.cloudflareImage.findUnique({
            where: { id: (ready.asset as { id: string }).id }
          })
        ).toMatchObject({ isAi: true, uploaded: true })
        expect(generationCount).toBe(1)
      }
    )
  })

  it('resumes a completed transfer from storage in a replacement worker without a connected client', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    expect(await status(id)).toMatchObject({ jobId: id, state: 'validating' })
    await createWorker().processCompletedTransfers()
    const receipt = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    expect(receipt.dispatchReceiptId).toEqual(expect.any(String))
    await processCompletedTransfers()
    expect(await status(id)).toMatchObject({
      jobId: id,
      state: 'ready',
      transferDeadline: job.transferDeadline
    })
    expect(
      (await media.mcpMediaJob.findUniqueOrThrow({ where: { id } }))
        .dispatchReceiptId
    ).toBe(receipt.dispatchReceiptId)
    expect(dispatchCount).toBe(1)
  })

  it.each([
    ['validating', true],
    ['dispatch_pending', true],
    ['dispatch_pending', false]
  ] as const)(
    'requires explicit same-job resume in %s after real renewal, expired=%s',
    async (state, expired) => {
      const job = await start()
      const id = String(job.jobId)
      await upload(id, await fileBytes())
      const connection = await connectionFor(id)
      const context = {
        userId: 'alice',
        connectionId: connection.id,
        journeyId: f.journeyId
      }
      if (state === 'dispatch_pending') await jobs.validate(context, id)
      if (expired) {
        await f.auth.agentConnection.update({
          where: { id: connection.id },
          data: { expiresAt: new Date(0) }
        })
        await createWorker().processCompletedTransfers()
      }
      expect(dispatchCount).toBe(0)
      // Exercise the owner/CSRF/version-bound production renewal route.
      const cookies = new Map<string, string>()
      const manage = async (suffix: string, body: unknown) => {
        const response = await fetch(authorityUrl + '/connections' + suffix, {
          method: 'POST',
          headers: {
            Origin: 'http://127.0.0.1:4200',
            Authorization: 'Bearer alice',
            'Content-Type': 'application/json',
            Cookie: [...cookies]
              .map(([key, value]) => `${key}=${value}`)
              .join('; ')
          },
          body: JSON.stringify(body)
        })
        for (const cookie of response.headers.getSetCookie()) {
          const [pair] = cookie.split(';')
          const split = pair.indexOf('=')
          cookies.set(pair.slice(0, split), pair.slice(split + 1))
        }
        expect(response.status, await response.clone().text()).toBe(200)
        return response.json()
      }
      const { csrf } = await manage('', {})
      const bound = {
        csrf,
        expectedVersion: connection.version,
        clientId: connection.clientId
      }
      const { reviewToken } = await manage(`/${connection.id}/review`, {
        ...bound,
        duration: 'week'
      })
      await manage(`/${connection.id}/approve`, { ...bound, reviewToken })
      await createWorker().processCompletedTransfers()
      await processCompletedTransfers()
      expect(dispatchCount).toBe(0)
      const opened = await browser(id)
      expect(opened.status).toBe(200)
      expect(opened.json.data).toMatchObject({
        jobId: id,
        state,
        active: true,
        transferDeadline: job.transferDeadline
      })
      expect(
        (await browser(id, 'POST', 'resume', undefined, 'bob')).status
      ).toBe(403)
      expect(dispatchCount).toBe(0)
      expect((await browser(id, 'POST', 'resume')).status).toBe(200)
      await createWorker().processCompletedTransfers()
      expect(dispatchCount).toBe(1)
      expect((await browser(id)).json.data).toMatchObject({
        jobId: id,
        state: 'ready',
        transferDeadline: job.transferDeadline
      })
      expect(await media.mcpMediaJob.count()).toBe(1)
      await expect
        .poll(() =>
          f.auth.readPermit.count({
            where: {
              connectionId: connection.id,
              status: { in: ['prepared', 'accepted'] }
            }
          })
        )
        .toBe(0)
    }
  )

  it.each(
    (['journey', 'team'] as const).flatMap((role) =>
      (['validating', 'dispatch_pending'] as const).flatMap((state) =>
        [true, false].map((observeRemoval) => ({ role, state, observeRemoval }))
      )
    )
  )(
    'requires same-job resume after $role role restoration in $state, worker observed removal=$observeRemoval',
    async ({ role, state, observeRemoval }) => {
      const membership = await f.journeys.userTeam.findUniqueOrThrow({
        where: {
          teamId_userId: { teamId: 'structure-team-alice', userId: 'alice' }
        }
      })
      const collaboration =
        role === 'journey'
          ? await f.journeys.userJourney.create({
              data: { journeyId: f.journeyId, userId: 'alice', role: 'editor' }
            })
          : undefined
      if (collaboration)
        await f.journeys.userTeam.delete({ where: { id: membership.id } })
      const job = await start()
      const id = String(job.jobId)
      await upload(id, await fileBytes())
      const connection = await connectionFor(id)
      if (state === 'dispatch_pending')
        await jobs.validate(
          {
            userId: 'alice',
            connectionId: connection.id,
            journeyId: f.journeyId
          },
          id
        )
      const original = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      const gateIds = collaboration
        ? [`user-journey:alice:${f.journeyId}`]
        : [`user-team:alice:${membership.teamId}`]
      // Exercise the production permission close/drain/reopen protocol around
      // real owning membership changes, without a consent version change.
      async function changeRole(restore: boolean) {
        const changeId = randomUUID()
        const request = async (action: string, body: unknown) => {
          const response = await fetch(
            authorityUrl + '/internal/permissions/' + action,
            {
              method: 'POST',
              headers: {
                Authorization:
                  'Bearer controlled-structure-permission-10557-at-least-32-characters',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            }
          )
          expect(response.status, await response.clone().text()).toBe(200)
          return response.json()
        }
        await expect
          .poll(
            async () =>
              (
                await request('begin', {
                  changeId,
                  gateIds,
                  intentHash: imageHash(Buffer.from(String(restore)))
                })
              ).status
          )
          .toBe('ready')
        if (collaboration) {
          if (restore)
            await f.journeys.userJourney.create({ data: collaboration })
          else
            await f.journeys.userJourney.delete({
              where: { id: collaboration.id }
            })
        } else {
          if (restore) await f.journeys.userTeam.create({ data: membership })
          else
            await f.journeys.userTeam.delete({ where: { id: membership.id } })
        }
        expect(
          await request('complete', { changeId, outcome: 'committed' })
        ).toMatchObject({ status: 'complete' })
      }
      await changeRole(false)
      if (observeRemoval) {
        await createWorker().processCompletedTransfers()
        expect((await browser(id, 'POST', 'resume')).status).toBe(403)
      }
      expect(dispatchCount).toBe(0)
      await changeRole(true)
      expect((await connectionFor(id)).version).toBe(connection.version)
      await createWorker().processCompletedTransfers()
      await processCompletedTransfers()
      expect(dispatchCount).toBe(0)
      expect((await browser(id)).json.data).toMatchObject({
        jobId: id,
        state,
        active: true,
        transferDeadline: job.transferDeadline
      })
      expect(
        (await browser(id, 'POST', 'resume', undefined, 'bob')).status
      ).toBe(403)
      expect((await browser(id, 'POST', 'resume')).status).toBe(200)
      await createWorker().processCompletedTransfers()
      expect(dispatchCount).toBe(1)
      const resumed = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      expect(resumed).toMatchObject({
        id,
        state: 'ready',
        file: original.file,
        providerId: original.providerId,
        admittedAt: original.admittedAt,
        transferDeadline: original.transferDeadline,
        transferCompletedAt: original.transferCompletedAt,
        receivedBytes: original.receivedBytes
      })
      expect(await media.mcpMediaJob.count()).toBe(1)
    }
  )

  it.each(['progressionGrantVersion', 'progressionPermissionHash'] as const)(
    'requires explicit resume for a legacy job without %s',
    async (binding) => {
      const job = await start()
      const id = String(job.jobId)
      await upload(id, await fileBytes())
      await media.mcpMediaJob.update({
        where: { id },
        data: { [binding]: null }
      })
      await createWorker().processCompletedTransfers()
      expect(dispatchCount).toBe(0)
      expect((await browser(id)).json.data).toMatchObject({
        jobId: id,
        state: 'validating',
        transferDeadline: job.transferDeadline
      })
      expect((await browser(id, 'POST', 'resume')).status).toBe(200)
      expect(dispatchCount).toBe(1)
      expect((await browser(id)).json.data.state).toBe('ready')
    }
  )

  it.each(['3', '0', '-1', '1.5', 'invalid'])(
    'rejects invalid configured shared upload ceiling %s',
    (limit) => {
      expect(() => createWorker(limit)).toThrow()
    }
  )

  it.each(['1', '2'])(
    'enforces the configured shared ceiling of %s across connections',
    async (limit) => {
      const worker = createWorker(limit)
      const secondToken = await f.consent()
      // Both connections already have production-created grants.
      const first = await start()
      const firstConnection = await connectionFor(String(first.jobId))
      const second = content(
        await f.call(
          'journey_media_start',
          {
            journeyId: f.journeyId,
            idempotencyKey: randomUUID(),
            kind: 'image_upload'
          },
          secondToken
        )
      )
      const secondConnection = await connectionFor(String(second.jobId))
      await media.mcpMediaJob.deleteMany()
      const context = (connectionId: string) => ({
        userId: 'alice',
        journeyId: f.journeyId,
        connectionId
      })
      for (let i = 0; i < Number(limit); i++)
        await worker.admit(
          context(i % 2 ? secondConnection.id : firstConnection.id),
          { kind: 'image_upload', idempotencyKey: randomUUID() }
        )
      await expect(
        worker.admit(context(secondConnection.id), {
          kind: 'image_upload',
          idempotencyKey: randomUUID()
        })
      ).rejects.toThrow('LIMIT_EXCEEDED')
      expect(await media.mcpMediaJob.count({ where: { active: true } })).toBe(
        Number(limit)
      )
    }
  )

  it('accepts exactly 10,000,000 real bytes and requires a separate fresh revision save and undo', async () => {
    const job = await start()
    const id = String(job.jobId)
    const before = await f.snapshot()
    await upload(id, await fileBytes(10000000))
    // Hold the provider call while a different client polls the committed
    // state. The original five-second read budget applies to every request.
    let started!: () => void
    let release!: () => void
    const dispatchStarted = new Promise<void>((resolve) => {
      started = resolve
    })
    const providerCanReturn = new Promise<void>((resolve) => {
      release = resolve
    })
    duringProviderDispatch = () => {
      started()
      return providerCanReturn
    }
    const work = browser(id, 'POST', 'resume')
    try {
      await dispatchStarted
      for (let poll = 0; poll < 2; poll++) {
        expect(await status(id)).toMatchObject({
          jobId: id,
          state: 'processing',
          active: true,
          receivedBytes: 10000000,
          transferDeadline: job.transferDeadline
        })
      }
      expect(dispatchCount).toBe(1)
    } finally {
      release()
      expect((await work).status).toBe(200)
    }
    const ready = await status(id)
    expect(dispatchCount).toBe(1)
    expect(ready.state).toBe('ready')
    expect(await f.snapshot()).toEqual(before)
    const asset = ready.asset as { id: string }
    mediaLibrary = false
    const input = await f.input([
      {
        type: 'image_set',
        block: { id: f.id('image') },
        source: { source: 'upload', jobId: id }
      }
    ])
    await f.journeys.block.update({
      where: { id: f.id('heading') },
      data: { content: 'Human change' }
    })
    const conflict = await f.edit(input)
    expect(conflict.json.result?.structuredContent?.code).toBe(
      'REVISION_CONFLICT'
    )
    const saved = f.receipt(
      await f.edit({
        ...input,
        expectedRevision: await f.revision(),
        idempotencyKey: randomUUID()
      })
    )
    f.receipt(await f.historyAction('undo', saved.historyId!))
    f.receipt(await f.historyAction('redo', saved.historyId!))
    expect(
      await media.cloudflareImage.findUnique({ where: { id: asset.id } })
    ).toMatchObject({ uploaded: true })
    expect(objects.size).toBe(0)
  })

  it('rejects one byte over, forged size/MIME/extension and replacing the admitted file', async () => {
    const over = await f.call('journey_media_start', {
      journeyId: f.journeyId,
      idempotencyKey: randomUUID(),
      kind: 'image_upload',
      file: { ...manifest(await fileBytes()), size: 10000001 }
    })
    expect(over.json.result?.isError).toBe(true)
    for (const override of [
      { mime: 'image/jpeg', name: 'fake.jpg' },
      { name: 'fake.jpg' },
      { size: 1 }
    ]) {
      const bytes = await fileBytes()
      const job = await start(manifest(bytes, override))
      const id = String(job.jobId)
      const sent = await browser(id, 'PUT', undefined, bytes, 'alice', {
        'X-Upload-Offset': '0',
        'X-Upload-Sha256': imageHash(bytes)
      })
      if ('size' in override) expect(sent.status).toBe(403)
      else {
        expect(sent.status).toBe(200)
        expect((await processedStatus(id)).state).toBe('failed')
      }
      await jobs.cancel(
        {
          userId: 'alice',
          connectionId: (await connectionFor(id)).id,
          journeyId: f.journeyId
        },
        id,
        randomUUID()
      )
    }
    const job = await start()
    const id = String(job.jobId)
    const bytes = await fileBytes()
    expect(
      (await browser(id, 'POST', 'bind', JSON.stringify(manifest(bytes))))
        .status
    ).toBe(200)
    expect(
      (
        await browser(
          id,
          'POST',
          'bind',
          JSON.stringify(manifest(bytes, { name: 'replacement.png' }))
        )
      ).status
    ).toBe(403)
    expect(dispatchCount).toBe(0)
  })

  it('serializes the combined two-job cap across connections and preserves it for processing and unknown outcomes', async () => {
    const token2 = await f.consent()
    const inputs = [0, 1, 2].map(() => ({
      journeyId: f.journeyId,
      idempotencyKey: randomUUID(),
      kind: 'image_upload'
    }))
    const results = await Promise.all(
      inputs.map((input, i) =>
        f.call('journey_media_start', input, i % 2 ? token2 : undefined)
      )
    )
    expect(results.filter((r) => !r.json.result?.isError)).toHaveLength(2)
    expect(await media.mcpMediaJob.count({ where: { active: true } })).toBe(2)
    const first = results.find((r) => !r.json.result?.isError)!.json.result!
      .structuredContent!
    providerReady = false
    providerUnknown = true
    loseDispatch = true
    await upload(String(first.jobId), await fileBytes())
    expect((await processedStatus(String(first.jobId))).state).toBe(
      'reconciling'
    )
    expect(dispatchCount).toBe(1)
    expect((await status(String(first.jobId))).active).toBe(true)
    expect(dispatchCount).toBe(1)
  })

  it.each(['journey', 'team'] as const)(
    'audits denied Admin status after %s role removal with verified redacted identifiers',
    async (role) => {
      const membership = await f.journeys.userTeam.findUniqueOrThrow({
        where: {
          teamId_userId: { teamId: 'structure-team-alice', userId: 'alice' }
        }
      })
      if (role === 'journey') {
        await f.journeys.userJourney.create({
          data: { journeyId: f.journeyId, userId: 'alice', role: 'editor' }
        })
        await f.journeys.userTeam.delete({ where: { id: membership.id } })
      }
      const sentinel = 'journey-prompt-file-token-raw-error-sentinel.png'
      const job = await start(manifest(await fileBytes(), { name: sentinel }))
      const id = String(job.jobId)
      const connection = await connectionFor(id)
      const before = await f.auth.securityAudit.findMany()
      const existingIds = before.map((event) => event.id)
      if (role === 'journey')
        await f.journeys.userJourney.deleteMany({
          where: { journeyId: f.journeyId, userId: 'alice' }
        })
      else await f.journeys.userTeam.delete({ where: { id: membership.id } })

      expect((await browser(id)).status).toBe(403)
      const events = await f.auth.securityAudit.findMany({
        where: { id: { notIn: existingIds } }
      })
      expect(events).toHaveLength(1)
      expect(events[0]).toEqual({
        id: expect.any(String),
        action: 'media_release',
        outcome: 'denied',
        userId: connection.userId,
        clientId: connection.clientId,
        journeyIds: [f.journeyId],
        occurredAt: expect.any(Date),
        expiresAt: expect.any(Date)
      })
      expect(
        events[0].expiresAt.getTime() - events[0].occurredAt.getTime()
      ).toBe(90 * 86400000)
      expect(JSON.stringify(events)).not.toContain(sentinel)
      expect(JSON.stringify(events)).not.toContain(String(job.ingressTicket))
      expect(await connectionFor(id)).toEqual(connection)
      const permit = await f.auth.readPermit.findFirstOrThrow({
        where: { connectionId: connection.id, stage: 'media_release' },
        orderBy: { preparedAt: 'desc' }
      })
      expect(permit.status).toBe('settled')
      expect(permit.acceptedAt).toBeNull()
      expect(dispatchCount).toBe(0)
      expect(await media.mcpMediaJob.count({ where: { active: true } })).toBe(1)
    }
  )

  it.each(
    (['preparation', 'acceptance'] as const).flatMap((stage) =>
      (
        [
          'expired',
          'view-only',
          'revoked',
          'out-of-scope',
          'withdrawn'
        ] as const
      ).map((reason) => [stage, reason] as const)
    )
  )(
    'audits denied Admin status at %s for originating grant %s',
    async (stage, reason) => {
      const sentinel = 'journey-prompt-file-token-raw-error-sentinel.png'
      const job = await start(manifest(await fileBytes(), { name: sentinel }))
      const id = String(job.jobId)
      const connection = await connectionFor(id)
      const stored = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      const existingIds = (await f.auth.securityAudit.findMany()).map(
        (event) => event.id
      )
      const existingPermitIds = (await f.auth.readPermit.findMany()).map(
        (permit) => permit.id
      )
      const interrupt = async () => {
        if (reason === 'withdrawn') {
          await withdraw(id)
          return
        }
        await f.auth.agentConnection.update({
          where: { id: connection.id },
          data:
            reason === 'expired'
              ? { expiresAt: new Date(Date.now() - 1) }
              : reason === 'view-only'
                ? { mode: 'view', version: { increment: 1 } }
                : reason === 'revoked'
                  ? { revokedAt: new Date(), version: { increment: 1 } }
                  : { journeyIds: [], version: { increment: 1 } }
        })
      }
      if (stage === 'preparation') await interrupt()
      else beforeAccept = interrupt

      expect((await browser(id)).status).toBe(403)
      const events = await f.auth.securityAudit.findMany({
        where: { id: { notIn: existingIds }, outcome: 'denied' }
      })
      expect(events).toHaveLength(1)
      expect(events[0]).toEqual({
        id: expect.any(String),
        action: 'media_release',
        outcome: 'denied',
        userId: connection.userId,
        clientId: connection.clientId,
        journeyIds:
          stage === 'preparation' && reason === 'out-of-scope'
            ? []
            : [f.journeyId],
        occurredAt: expect.any(Date),
        expiresAt: expect.any(Date)
      })
      expect(
        events[0].expiresAt.getTime() - events[0].occurredAt.getTime()
      ).toBe(90 * 86400000)
      expect(JSON.stringify(events)).not.toContain(sentinel)
      expect(JSON.stringify(events)).not.toContain(String(job.ingressTicket))
      expect(
        await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      ).toEqual(stored)
      expect(dispatchCount).toBe(0)
      const permits = await f.auth.readPermit.findMany({
        where: {
          connectionId: connection.id,
          stage: 'media_release',
          id: { notIn: existingPermitIds }
        }
      })
      expect(permits).toHaveLength(stage === 'preparation' ? 0 : 1)
      for (const permit of permits) {
        expect(permit.acceptedAt).toBeNull()
        expect(permit.status).toBe(
          reason === 'withdrawn' ? 'cancelled' : 'settled'
        )
      }
    }
  )

  it('audits an ineligible originating Firebase session through Admin status', async () => {
    const job = await start(manifest(await fileBytes()))
    const id = String(job.jobId)
    const connection = await connectionFor(id)
    const stored = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    const existingIds = (await f.auth.securityAudit.findMany()).map(
      (event) => event.id
    )
    identityFailure = new IdentityIneligible(
      'raw-identity-error-token-sentinel'
    )

    // The fresh Admin browser identity succeeds independently of the old
    // Firebase evidence bound to the originating connection.
    expect((await browser(id)).status).toBe(403)
    const events = await f.auth.securityAudit.findMany({
      where: { id: { notIn: existingIds } }
    })
    expect(events).toEqual([
      {
        id: expect.any(String),
        action: 'media_release',
        outcome: 'denied',
        userId: connection.userId,
        clientId: connection.clientId,
        journeyIds: [f.journeyId],
        occurredAt: expect.any(Date),
        expiresAt: expect.any(Date)
      }
    ])
    expect(events[0].expiresAt.getTime() - events[0].occurredAt.getTime()).toBe(
      90 * 86400000
    )
    expect(JSON.stringify(events)).not.toContain(
      'raw-identity-error-token-sentinel'
    )
    expect(JSON.stringify(events)).not.toContain(String(job.ingressTicket))
    expect(JSON.stringify(events)).not.toContain('synthetic.png')
    expect(
      await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    ).toEqual(stored)
    const permit = await f.auth.readPermit.findFirstOrThrow({
      where: { connectionId: connection.id, stage: 'media_release' },
      orderBy: { preparedAt: 'desc' }
    })
    expect(permit).toMatchObject({ status: 'settled', acceptedAt: null })
    expect(dispatchCount).toBe(0)
  })

  it('keeps unknown identity-provider failures distinct from verified media denials', async () => {
    const id = String((await start()).jobId)
    const existingIds = (await f.auth.securityAudit.findMany()).map(
      (event) => event.id
    )
    identityFailure = new Error('controlled identity provider unavailable')
    expect((await browser(id)).status).toBe(403)
    expect(
      await f.auth.securityAudit.findMany({
        where: { id: { notIn: existingIds } }
      })
    ).toMatchObject([
      {
        action: 'read_accept',
        outcome: 'denied',
        userId: null,
        clientId: null,
        journeyIds: []
      }
    ])
  })

  it('rejects untrusted or caller-supplied denial audit identifiers', async () => {
    const job = await start()
    const connection = await connectionFor(String(job.jobId))
    const permit = await f.auth.readPermit.findFirstOrThrow({
      where: { connectionId: connection.id, executor: 'media' }
    })
    const foreignPermit = await f.auth.readPermit.findFirstOrThrow({
      where: { executor: { not: 'media' } }
    })
    const mediaAudits = { where: { action: { startsWith: 'media_' } } }
    const before = await f.auth.securityAudit.count(mediaAudits)
    const prepare = {
      connectionId: connection.id,
      userId: connection.userId,
      journeyId: f.journeyId,
      teamId: 'structure-team-alice',
      executorId: randomUUID(),
      action: 'release',
      requestHash: imageHash(Buffer.from('controlled-audit-request'))
    }
    for (const [action, secret, body] of [
      ['deny', 'untrusted', { permitId: permit.id }],
      ['deny', mediaSecret, { permitId: permit.id, userId: 'forged-user' }],
      ['deny', mediaSecret, { permitId: foreignPermit.id }],
      ['prepare', 'untrusted', prepare],
      ['prepare', mediaSecret, { ...prepare, userId: 'forged-user' }]
    ] as const) {
      const response = await fetch(
        authorityUrl + '/internal/reads/media-jobs/' + action,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + secret,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )
      expect(response.status).toBe(403)
    }
    expect(await f.auth.securityAudit.count(mediaAudits)).toBe(before)
  })

  it('denies another signed-in user and a broader Admin owner with a reduced, expired or disconnected origin grant', async () => {
    const job = await start()
    const id = String(job.jobId)
    expect((await browser(id, 'GET', undefined, undefined, 'bob')).status).toBe(
      403
    )
    const connection = await connectionFor(id)
    await f.auth.agentConnection.update({
      where: { id: connection.id },
      data: { mode: 'view' }
    })
    expect((await browser(id)).status).toBe(403)
    await f.auth.agentConnection.update({
      where: { id: connection.id },
      data: { mode: 'edit', expiresAt: new Date(Date.now() - 1) }
    })
    expect((await browser(id)).status).toBe(403)
    await f.auth.agentConnection.update({
      where: { id: connection.id },
      data: { expiresAt: new Date(Date.now() + 60000) }
    })
    await withdraw(id)
    expect((await browser(id)).status).toBe(403)
    expect(
      (
        await browser(
          id,
          'PUT',
          undefined,
          await fileBytes(),
          `Upload ${String(job.ingressTicket)}`
        )
      ).status
    ).toBe(403)
  })

  it('preserves the transfer cutoff and rejects further chunks before safely expiring incomplete input', async () => {
    const job = await start()
    const id = String(job.jobId)
    await browser(
      id,
      'POST',
      'bind',
      JSON.stringify(manifest(await fileBytes()))
    )
    await media.mcpMediaJob.update({
      where: { id },
      data: { transferDeadline: new Date(Date.now() - 1) }
    })
    const bytes = await fileBytes()
    expect(
      (
        await browser(id, 'PUT', undefined, bytes, 'alice', {
          'X-Upload-Offset': '0',
          'X-Upload-Sha256': imageHash(bytes)
        })
      ).status
    ).toBe(403)
    await jobs.recover()
    expect((await browser(id)).json.data.state).toBe('transfer_expired')
    expect(await media.mcpMediaJob.count({ where: { active: true } })).toBe(0)
  })

  it('allows pre-cutoff completed transfer to process later and retains successful assets after result expiry and disconnect', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    await media.mcpMediaJob.update({
      where: { id },
      data: { transferDeadline: new Date(Date.now() - 1) }
    })
    await jobs.recover()
    const ready = await processedStatus(id)
    expect(ready.state).toBe('ready')
    const asset = ready.asset as { id: string }
    await media.mcpMediaJob.update({
      where: { id },
      data: { resultExpiresAt: new Date(Date.now() - 1) }
    })
    await jobs.recover()
    expect((await browser(id)).json.data.code).toBe('RESULT_EXPIRED')
    await withdraw(id)
    expect(
      await media.cloudflareImage.findUnique({ where: { id: asset.id } })
    ).toMatchObject({ uploaded: true })
  })

  it.each(['retry', 'cancel', 'withdrawal'] as const)(
    'recovers a failed staged GET before provider dispatch through %s after restart',
    async (recovery) => {
      const id = String((await start()).jobId)
      await upload(id, await fileBytes())
      const context = {
        userId: 'alice',
        connectionId: (await connectionFor(id)).id,
        journeyId: f.journeyId
      }
      await jobs.validate(context, id)
      const original = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      stagingUnknown = true
      await browser(id, 'POST', 'resume')
      expect(dispatchCount).toBe(0)
      const receipt = await f.auth.readPermit.findFirstOrThrow({
        where: { connectionId: context.connectionId, stage: 'media_dispatch' },
        orderBy: { preparedAt: 'desc' }
      })
      const restarted = createWorker()
      await restarted.recover()
      expect(
        await f.auth.readPermit.findUniqueOrThrow({ where: { id: receipt.id } })
      ).toMatchObject({ status: 'settled', acceptedAt: null })
      expect(
        await media.mcpMediaExecution.findUniqueOrThrow({
          where: { id: receipt.id }
        })
      ).toMatchObject({ status: 'fenced', reportedAt: expect.any(Date) })
      expect(
        await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      ).toEqual(original)
      if (recovery === 'withdrawal') {
        const change = await withdraw(id)
        cleanupUnavailable = true
        await restarted.recover()
        await reconcileConnectionChanges(f.auth)
        expect(
          await f.auth.connectionChange.findUniqueOrThrow({
            where: { id: change.id }
          })
        ).toMatchObject({ status: 'complete' })
        expect(
          await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({ active: true })
        expect(objects.size).toBeGreaterThan(0)
        cleanupUnavailable = false
        await createWorker().recover()
        expect(
          await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({
          active: false,
          state: 'cancelled',
          file: original.file,
          transferDeadline: original.transferDeadline
        })
        expect(objects.size).toBe(0)
        expect(dispatchCount).toBe(0)
        const newConnectionToken = await f.consent()
        for (let index = 0; index < 2; index++)
          content(
            await f.call(
              'journey_media_start',
              {
                journeyId: f.journeyId,
                idempotencyKey: randomUUID(),
                kind: 'image_upload'
              },
              newConnectionToken
            )
          )
        expect(
          await media.mcpMediaJob.count({
            where: { userId: 'alice', active: true }
          })
        ).toBe(2)
      } else if (recovery === 'cancel') {
        await restarted.cancel(context, id, randomUUID())
        expect(
          await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({ active: false, state: 'cancelled' })
        expect(objects.size).toBe(0)
      } else {
        stagingUnknown = false
        await restarted.resume(context, id)
        expect(
          await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({
          active: false,
          state: 'ready',
          file: original.file,
          transferDeadline: original.transferDeadline
        })
        expect(dispatchCount).toBe(1)
      }
    }
  )

  it('checks final dispatch authority after staged-input preparation', async () => {
    const id = String((await start()).jobId)
    await upload(id, await fileBytes())
    const connection = await connectionFor(id)
    const context = {
      userId: 'alice',
      connectionId: connection.id,
      journeyId: f.journeyId
    }
    await jobs.validate(context, id)
    let reads = 0
    beforeStagedRead = async () => {
      reads++
      const permit = await f.auth.readPermit.findFirstOrThrow({
        where: { connectionId: connection.id, stage: 'media_dispatch' },
        orderBy: { preparedAt: 'desc' }
      })
      expect(permit).toMatchObject({ status: 'prepared', acceptedAt: null })
      await f.auth.agentConnection.update({
        where: { id: connection.id },
        data: { expiresAt: new Date(0) }
      })
    }
    await expect(jobs.dispatch(context, id)).rejects.toThrow()
    expect(reads).toBe(1)
    expect(dispatchCount).toBe(0)
    expect(
      await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    ).toMatchObject({ state: 'dispatch_pending', dispatchReceiptId: null })
    const permit = await f.auth.readPermit.findFirstOrThrow({
      where: { connectionId: connection.id, stage: 'media_dispatch' },
      orderBy: { preparedAt: 'desc' }
    })
    expect(permit).toMatchObject({ status: 'settled', acceptedAt: null })
  })

  it('finishes an upload when background recovery overlaps preparation and accepted dispatch', async () => {
    afterPrepare = async (action) => {
      if (action === 'admit') await jobs.recover()
    }
    const job = await start()
    const id = String(job.jobId)
    afterPrepare = undefined
    await upload(id, await fileBytes())
    beforeSend = () => jobs.recover()
    expect((await processedStatus(id)).state).toBe('ready')
    expect(dispatchCount).toBe(1)
  })

  it('fences an abandoned pre-send receipt and lets the same job dispatch once on retry', async () => {
    const id = String((await start()).jobId)
    await upload(id, await fileBytes())
    let receiptId!: string
    beforeSend = async () => {
      const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      receiptId = job.dispatchReceiptId!
      const abandonedAt = new Date(0)
      await media.mcpMediaExecution.update({
        where: { id: receiptId },
        data: { createdAt: abandonedAt, completedAt: abandonedAt }
      })
      await jobs.recover()
    }

    expect((await browser(id, 'POST', 'resume')).status).toBe(403)
    expect(receiptId).toBeDefined()
    expect(
      await media.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
    ).toMatchObject({ status: 'fenced', reportedAt: expect.any(Date) })
    expect(
      await f.auth.readPermit.findUniqueOrThrow({ where: { id: receiptId } })
    ).toMatchObject({ status: 'settled' })
    expect(dispatchCount).toBe(0)

    beforeSend = undefined
    expect((await processedStatus(id)).state).toBe('ready')
    expect(dispatchCount).toBe(1)
  })

  it('keeps withdrawal Pending for an accepted dispatcher and positively fences it before HTTP send', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    let release!: () => void
    let reached!: () => void
    const paused = new Promise<void>((resolve) => {
      reached = resolve
    })
    beforeSend = async () => {
      reached()
      await new Promise<void>((resolve) => {
        release = resolve
      })
    }
    const pending = browser(id, 'POST', 'resume')
    await paused
    const change = await withdraw(id)
    await reconcileConnectionChanges(f.auth)
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'pending' })
    const persisted = await media.mcpMediaJob.findUniqueOrThrow({
      where: { id }
    })
    await jobs.recoverExecution(persisted.dispatchReceiptId!)
    release()
    await pending
    await reconcileConnectionChanges(f.auth)
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'complete' })
    expect(dispatchCount).toBe(0)
  })

  it('reconciles lost provider and tool responses without duplicate allocation and preserves assets on cancellation', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    loseDispatch = true
    providerStatusUnavailable = true
    f.loseNextResponse()
    await f.call('journey_media_status', { journeyId: f.journeyId, jobId: id })
    expect((await processedStatus(id)).state).toBe('reconciling')
    expect((await browser(id, 'POST', 'resume')).status).toBe(200)
    expect((await status(id)).state).toBe('reconciling')
    providerStatusUnavailable = false
    expect((await browser(id, 'POST', 'resume')).status).toBe(200)
    const ready = await status(id)
    expect(ready.state).toBe('ready')
    expect(dispatchCount).toBe(1)
    const cancelled = content(
      await f.call('journey_media_cancel', {
        journeyId: f.journeyId,
        idempotencyKey: randomUUID(),
        jobId: id
      })
    )
    expect(cancelled.state).toBe('ready')
    expect(
      await media.cloudflareImage.findUnique({
        where: { id: (ready.asset as { id: string }).id }
      })
    ).toMatchObject({ uploaded: true })
  })

  it('rejects actual excess chunk bytes, checksum substitution, file reuse and unsafe source inputs', async () => {
    const bytes = await fileBytes()
    const job = await start(manifest(bytes))
    const id = String(job.jobId)
    const oversized = Buffer.concat([bytes, Buffer.from([0])])
    expect(
      (
        await browser(id, 'PUT', undefined, oversized, 'alice', {
          'X-Upload-Offset': '0',
          'X-Upload-Sha256': imageHash(oversized)
        })
      ).status
    ).toBe(403)
    expect(
      (
        await browser(id, 'PUT', undefined, bytes, 'alice', {
          'X-Upload-Offset': '0',
          'X-Upload-Sha256': '0'.repeat(64)
        })
      ).status
    ).toBe(403)
    expect(
      (
        await browser(
          id,
          'PUT',
          undefined,
          bytes,
          `Upload ${String(job.ingressTicket)}`,
          { 'X-Upload-Offset': '0', 'X-Upload-Sha256': imageHash(bytes) }
        )
      ).status
    ).toBe(200)
    expect(
      (
        await browser(
          id,
          'PUT',
          undefined,
          bytes,
          `Upload ${String(job.ingressTicket)}`,
          { 'X-Upload-Offset': '0', 'X-Upload-Sha256': imageHash(bytes) }
        )
      ).status
    ).toBe(403)
    const other = await start()
    expect(
      (
        await browser(
          String(other.jobId),
          'POST',
          'bind',
          JSON.stringify(manifest(bytes)),
          `Upload ${String(job.ingressTicket)}`
        )
      ).status
    ).toBe(403)
    const unsafe = await f.call('journey_media_start', {
      journeyId: f.journeyId,
      idempotencyKey: randomUUID(),
      kind: 'image_upload',
      sourceUrl: 'http://169.254.169.254/latest/meta-data'
    })
    expect(unsafe.json.result?.isError).toBe(true)
    expect(dispatchCount).toBe(0)
  })

  it.each(['retry', 'cancel', 'expire'] as const)(
    'recovers a definitively rejected staging write through %s without resetting its identity or deadline',
    async (ending) => {
      const id = String((await start()).jobId)
      const bytes = await fileBytes()
      await browser(id, 'POST', 'bind', JSON.stringify(manifest(bytes)))
      const original = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      stagingRejected = true
      await browser(id, 'PUT', undefined, bytes, 'alice', {
        'X-Upload-Offset': '0',
        'X-Upload-Sha256': imageHash(bytes)
      })
      expect(
        await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      ).toMatchObject({
        receivedBytes: 0,
        active: true,
        transferDeadline: original.transferDeadline,
        file: original.file
      })
      expect(await media.mcpMediaChunk.count({ where: { jobId: id } })).toBe(0)
      expect(
        await media.mcpMediaExecution.count({
          where: { jobId: id, reportedAt: null }
        })
      ).toBe(0)
      stagingRejected = false
      if (ending === 'retry') {
        const substituted = Buffer.from(bytes)
        substituted[0] ^= 1
        expect(
          (
            await browser(id, 'PUT', undefined, substituted, 'alice', {
              'X-Upload-Offset': '0',
              'X-Upload-Sha256': imageHash(substituted)
            })
          ).status
        ).toBe(403)
        expect(objects.size).toBe(0)
        await upload(id, bytes)
        expect((await processedStatus(id)).state).toBe('ready')
        expect(
          await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({
          transferDeadline: original.transferDeadline,
          file: original.file
        })
        return
      }
      if (ending === 'cancel') await browser(id, 'POST', 'cancel')
      else
        await media.mcpMediaJob.update({
          where: { id },
          data: { transferDeadline: new Date(0) }
        })
      const change = await withdraw(id)
      await jobs.recover()
      await reconcileConnectionChanges(f.auth)
      expect(
        await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      ).toMatchObject({
        active: false,
        state: ending === 'cancel' ? 'cancelled' : 'transfer_expired'
      })
      expect(
        await f.auth.connectionChange.findUniqueOrThrow({
          where: { id: change.id }
        })
      ).toMatchObject({ status: 'complete' })
    }
  )

  it.each(['cancel', 'expire'] as const)(
    'fences an unsent staging intent before %s and settles withdrawal',
    async (ending) => {
      const id = String((await start()).jobId)
      const bytes = await fileBytes()
      await browser(id, 'POST', 'bind', JSON.stringify(manifest(bytes)))
      let release!: () => void
      let reached!: () => void
      const paused = new Promise<void>((resolve) => {
        reached = resolve
      })
      beforeStagingWrite = async () => {
        reached()
        await new Promise<void>((resolve) => {
          release = resolve
        })
      }
      const pending = browser(id, 'PUT', undefined, bytes, 'alice', {
        'X-Upload-Offset': '0',
        'X-Upload-Sha256': imageHash(bytes)
      })
      await paused
      const receipt = await media.mcpMediaExecution.findFirstOrThrow({
        where: { jobId: id, status: 'staging_prepared' }
      })
      try {
        if (ending === 'cancel') await browser(id, 'POST', 'cancel')
        else
          await media.mcpMediaJob.update({
            where: { id },
            data: { transferDeadline: new Date(0) }
          })
        const change = await withdraw(id)
        await jobs.recoverExecution(receipt.id)
        await jobs.recover()
        await reconcileConnectionChanges(f.auth)
        expect(
          await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({
          state: ending === 'cancel' ? 'cancelled' : 'transfer_expired',
          active: false
        })
        expect(
          await f.auth.connectionChange.findUniqueOrThrow({
            where: { id: change.id }
          })
        ).toMatchObject({ status: 'complete' })
        expect(
          await f.auth.readPermit.findUniqueOrThrow({
            where: { id: receipt.id }
          })
        ).toMatchObject({ status: 'settled' })
      } finally {
        release()
        await pending
      }
      expect(objects.size).toBe(0)
    }
  )

  it('recovers an output receipt only after its original process is proven stopped', async () => {
    const id = String((await start()).jobId)
    const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    const context = {
      userId: job.userId,
      connectionId: job.connectionId,
      journeyId: job.journeyId
    }
    const child = fork(
      resolve('apis/api-media/test/mcpMediaOutputExecutor.ts'),
      [],
      {
        execArgv: ['--import', 'tsx'],
        env: {
          ...process.env,
          TSX_TSCONFIG_PATH: resolve('apis/api-auth/tsconfig.json')
        },
        stdio: ['ignore', 'ignore', 'inherit', 'ipc']
      }
    )
    await once(child, 'spawn')
    try {
      const accepted = once(child, 'message', {
        signal: AbortSignal.timeout(10000)
      })
      child.send({
        config: {
          authorityUrl,
          authoritySecret: mediaSecret,
          ticketSecret: 'controlled-upload-ticket-10560-at-least-32-characters',
          adminOrigin: 'http://127.0.0.1:4200',
          ingressOrigin: uploadOrigin,
          uploadLimit: 2
        },
        context,
        jobId: id,
        mediaUrl,
        journeysUrl
      })
      const [message] = (await accepted) as [
        { permitId?: string; error?: string }
      ]
      expect(message.error).toBeUndefined()
      expect(message.permitId).toBeDefined()
      const receiptId = message.permitId!
      const receipt = await media.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
      expect(receipt.executor).toMatchObject({ pid: child.pid })
      const change = await withdraw(id)
      await jobs.recover()
      await reconcileConnectionChanges(f.auth)
      expect(
        await f.auth.connectionChange.findUniqueOrThrow({
          where: { id: change.id }
        })
      ).toMatchObject({ status: 'pending' })
      expect(
        await media.mcpMediaExecution.findUniqueOrThrow({
          where: { id: receiptId }
        })
      ).toMatchObject({ status: 'output', reportedAt: null })
      const exit = once(child, 'exit')
      child.kill('SIGKILL')
      await exit
      await jobs.recover()
      await reconcileConnectionChanges(f.auth)
      expect(
        await media.mcpMediaExecution.findUniqueOrThrow({
          where: { id: receiptId }
        })
      ).toMatchObject({ status: 'fenced', reportedAt: expect.any(Date) })
      expect(
        await f.auth.connectionChange.findUniqueOrThrow({
          where: { id: change.id }
        })
      ).toMatchObject({ status: 'complete' })
    } finally {
      if (child.exitCode === null) child.kill('SIGKILL')
    }
  })

  it.each(['writing', 'staging'])(
    'keeps a missing object in uncertain %s pending until its immutable write is observed',
    async (receiptStatus) => {
      const job = await start()
      const id = String(job.jobId)
      const bytes = await fileBytes()
      await browser(id, 'POST', 'bind', JSON.stringify(manifest(bytes)))
      stagingUnknown = true
      const response = await browser(id, 'PUT', undefined, bytes, 'alice', {
        'X-Upload-Offset': '0',
        'X-Upload-Sha256': imageHash(bytes)
      })
      expect(response.status).toBe(200)
      expect(response.json.data.receivedBytes).toBe(0)
      const objectKey = [...objects.keys()][0]
      objects.clear()
      await media.mcpMediaExecution.updateMany({
        where: { jobId: id, status: 'writing' },
        data: { status: receiptStatus }
      })
      const replay = await browser(id, 'PUT', undefined, bytes, 'alice', {
        'X-Upload-Offset': '0',
        'X-Upload-Sha256': imageHash(bytes)
      })
      expect(replay.status).toBe(200)
      expect(replay.json.data.receivedBytes).toBe(0)
      expect(stagingWrites).toBe(1)
      await browser(id, 'POST', 'cancel')
      await media.mcpMediaJob.update({
        where: { id },
        data: { transferDeadline: new Date(Date.now() - 1) }
      })
      await jobs.recover()
      expect((await browser(id)).json.data.active).toBe(true)
      expect(objects.size).toBe(0)
      stagingUnknown = false
      await jobs.recover()
      expect((await browser(id)).json.data.active).toBe(true)
      expect(
        await media.mcpMediaChunk.count({ where: { jobId: id, stored: false } })
      ).toBe(1)
      // The controlled remote store completes the earlier uncertain write later.
      objects.set(objectKey, Buffer.from(bytes))
      await jobs.recover()
      expect((await browser(id)).json.data.state).toBe('cancelled')
      expect((await browser(id)).json.data.active).toBe(false)
      expect(objects.size).toBe(0)
      expect(dispatchCount).toBe(0)
    }
  )

  it('keeps unknown provider cancellation and withdrawal pending until authenticated status proves handoff', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    providerReady = false
    providerUnknown = true
    loseDispatch = true
    expect((await processedStatus(id)).state).toBe('reconciling')
    expect((await browser(id, 'POST', 'cancel')).json.data.state).toBe(
      'cancel_requested'
    )
    const change = await withdraw(id)
    await jobs.recover()
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'pending' })
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { active: true }
    )
    const stored = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    providerAssets.set(stored.providerId, 'ready')
    providerUnknown = false
    await jobs.recover()
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { state: 'ready', active: false }
    )
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'complete' })
    expect((await browser(id)).status).toBe(403)
    expect(dispatchCount).toBe(1)
  })

  it.each(['admit', 'dispatch', 'transfer', 'cancel', 'release'] as const)(
    'denies %s after an actual owning lock wait crosses connection expiry',
    async (action) => {
      const id = String((await start()).jobId)
      const stored = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      const context = {
        userId: stored.userId,
        connectionId: stored.connectionId,
        journeyId: stored.journeyId
      }
      if (action === 'dispatch') {
        await upload(id, await fileBytes())
        await jobs.validate(context, id)
      }
      const before = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      const existingAuditIds = (await f.auth.securityAudit.findMany()).map(
        (event) => event.id
      )
      let unlock!: () => void
      let locked!: () => void
      const acquired = new Promise<void>((resolve) => {
        locked = resolve
      })
      const release = new Promise<void>((resolve) => {
        unlock = resolve
      })
      const blocker = media.$transaction(
        async (tx) => {
          if (action === 'admit' || action === 'cancel')
            await tx.$queryRaw`SELECT "userId" FROM "McpMediaUser" WHERE "userId" = ${stored.userId} FOR UPDATE`
          else
            await tx.$queryRaw`SELECT id FROM "McpMediaJob" WHERE id = ${id} FOR UPDATE`
          locked()
          await release
        },
        { timeout: 20000 }
      )
      await acquired
      const pending = (
        action === 'admit'
          ? jobs.admit(context, {
              kind: 'image_upload',
              idempotencyKey: randomUUID()
            })
          : action === 'dispatch'
            ? jobs.dispatch(context, id)
            : action === 'transfer'
              ? jobs.bind(
                  context,
                  id,
                  manifest(await fileBytes()) as Parameters<typeof jobs.bind>[2]
                )
              : action === 'cancel'
                ? jobs.cancel(context, id, randomUUID())
                : browser(id).then((response) => {
                    if (response.status !== 200) throw new Error('Denied')
                  })
      ).then(
        () => 'accepted',
        () => 'denied'
      )
      try {
        await vi.waitFor(
          async () => {
            const waiting = await media.$queryRaw<
              Array<{ count: bigint }>
            >`SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'`
            expect(Number(waiting[0].count)).toBeGreaterThan(0)
          },
          { timeout: 10000 }
        )
        await f.auth.agentConnection.update({
          where: { id: stored.connectionId },
          data: { expiresAt: new Date(Date.now() - 1) }
        })
      } finally {
        unlock()
        await blocker
      }
      expect(await pending).toBe('denied')
      expect(
        await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      ).toEqual(before)
      expect(
        await media.mcpMediaJob.count({ where: { userId: stored.userId } })
      ).toBe(1)
      expect(dispatchCount).toBe(0)
      const permits = await f.auth.readPermit.findMany({
        where: { connectionId: stored.connectionId, stage: 'media_' + action },
        orderBy: { preparedAt: 'desc' }
      })
      expect(permits[0].acceptedAt).toBeNull()
      expect(permits[0].status).toBe('settled')
      expect(
        await f.auth.securityAudit.findMany({
          where: { id: { notIn: existingAuditIds } }
        })
      ).toEqual([
        expect.objectContaining({
          action: 'media_' + action,
          outcome: 'denied',
          userId: stored.userId,
          clientId: (await connectionFor(id)).clientId,
          journeyIds: [stored.journeyId]
        })
      ])
    }
  )

  it('releases capacity and settles definitive provider rejections without allocating or retrying', async () => {
    rejectDispatch = true
    for (let index = 0; index < 3; index++) {
      const id = String((await start()).jobId)
      await upload(id, await fileBytes())
      expect((await browser(id, 'POST', 'resume')).json.data.state).toBe(
        'failed'
      )
      const stored = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      expect(stored.active).toBe(false)
      expect([...objects.keys()].some((key) => key.startsWith(id + '/'))).toBe(
        false
      )
      expect(
        await media.mcpMediaExecution.findUniqueOrThrow({
          where: { id: stored.dispatchReceiptId! }
        })
      ).toMatchObject({ status: 'settled', reportedAt: expect.any(Date) })
      expect(
        await f.auth.readPermit.findUniqueOrThrow({
          where: { id: stored.dispatchReceiptId! }
        })
      ).toMatchObject({ status: 'settled' })
    }
    expect(dispatchCount).toBe(3)
    expect(providerAssets.size).toBe(0)
  })

  it('preserves durable rejection and pending withdrawal until failed cleanup safely retries', async () => {
    const id = String((await start()).jobId)
    await upload(id, await fileBytes())
    rejectDispatch = true
    cleanupUnavailable = true
    await browser(id, 'POST', 'resume')
    const stored = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    expect(stored).toMatchObject({ state: 'reconciling', active: true })
    expect(
      await media.mcpMediaExecution.findUniqueOrThrow({
        where: { id: stored.dispatchReceiptId! }
      })
    ).toMatchObject({ status: 'rejected', reportedAt: null })
    const change = await withdraw(id)
    await reconcileConnectionChanges(f.auth)
    expect(
      await f.auth.connectionChange.findUniqueOrThrow({
        where: { id: change.id }
      })
    ).toMatchObject({ status: 'pending' })
    cleanupUnavailable = false
    await jobs.recover()
    expect(
      await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    ).toMatchObject({ state: 'failed', active: false })
    expect(
      await f.auth.connectionChange.findUniqueOrThrow({
        where: { id: change.id }
      })
    ).toMatchObject({ status: 'complete' })
    expect(dispatchCount).toBe(1)
    expect(providerAssets.size).toBe(0)
    expect(objects.size).toBe(0)
  })

  it('denies new final acceptance at expiry and after a captured rights generation changes', async () => {
    const job = await start()
    const id = String(job.jobId)
    const connection = await connectionFor(id)
    beforeAccept = async (action) => {
      if (action !== 'release') return
      await f.auth.agentConnection.update({
        where: { id: connection.id },
        data: { expiresAt: new Date(Date.now() - 1) }
      })
    }
    expect((await browser(id)).status).toBe(403)
    beforeAccept = undefined
    await f.auth.agentConnection.update({
      where: { id: connection.id },
      data: { expiresAt: new Date(Date.now() + 60000) }
    })
    beforeAccept = async (action) => {
      if (action !== 'transfer') return
      await f.auth.authorizationGate.update({
        where: { id: `user-team:alice:structure-team-alice` },
        data: { open: false, generation: { increment: 1 } }
      })
    }
    expect(
      (
        await browser(
          id,
          'POST',
          'bind',
          JSON.stringify(manifest(await fileBytes()))
        )
      ).status
    ).toBe(403)
    expect(dispatchCount).toBe(0)
  })

  it('denies dispatch and attachment after publication and preserves a ready library asset', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        firstPublishedAt: new Date()
      }
    })
    expect((await browser(id, 'POST', 'resume')).status).toBe(403)
    expect(dispatchCount).toBe(0)
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: { status: 'draft' }
    })
    const ready = await processedStatus(id)
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: {
        status: 'published',
        publishedAt: new Date()
      }
    })
    const asset = ready.asset as { id: string }
    const result = await f.edit(
      await f.input([
        {
          type: 'image_set',
          block: { id: f.id('image') },
          source: { source: 'library', id: asset.id }
        }
      ])
    )
    expect(result.json.result?.isError).toBe(true)
    expect(
      await media.cloudflareImage.findUnique({ where: { id: asset.id } })
    ).toMatchObject({ uploaded: true })
  })

  it('retires account authority, purges safe private results and retains unattached successful images and redacted audit', async () => {
    const job = await start()
    const id = String(job.jobId)
    await upload(id, await fileBytes())
    const ready = await processedStatus(id)
    const asset = ready.asset as { id: string }
    const response = await fetch(
      new URL(
        '/internal/permissions/retire-account',
        f.ownerConfig.authorityUrl
      ),
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer controlled-structure-users-10557-at-least-32-characters',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: 'alice' })
      }
    )
    expect(response.ok).toBe(true)
    await jobs.recover()
    expect((await browser(id)).status).toBe(403)
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { file: null, metadata: null }
    )
    expect(
      await media.cloudflareImage.findUnique({ where: { id: asset.id } })
    ).toMatchObject({ uploaded: true })
    const audits = await f.auth.securityAudit.findMany({
      where: { action: { startsWith: 'media_' } }
    })
    expect(audits.length).toBeGreaterThan(0)
    expect(JSON.stringify(audits)).not.toContain('synthetic.png')
    expect(JSON.stringify(audits)).not.toContain('credential-sentinel')
    for (const audit of audits)
      expect(audit.expiresAt.getTime() - audit.occurredAt.getTime()).toBe(
        90 * 86400000
      )
  })
})
