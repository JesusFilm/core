import { createHash, createHmac, randomUUID } from 'node:crypto'
import { type RequestListener, createServer } from 'node:http'
import {
  setImmediate as yieldToIO,
  setTimeout as delay
} from 'node:timers/promises'

import { buildSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'

import { PrismaClient as LanguagesDatabase } from '@core/prisma/languages/client'
import { PrismaClient as MediaDatabase } from '@core/prisma/media/client'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- Exercise the real Media participant through MCP and Admin ingress. */
import type { MediaJobs } from '../../api-media/src/lib/mcpMediaJobs'
import { mediaRuntime } from '../../api-media/src/lib/mcpMediaRuntime'
import type { UploadStorage } from '../../api-media/src/lib/mcpUploadStorage'
import { captureGates, lockGates } from '../src/store'
import { beginConnectionChange } from '../src/withdrawal'

/* eslint-enable @nx/enforce-module-boundaries */
import { structureFixture } from './grantedStructureFixture'

const authUrl = process.env.UPLOAD_TEST_AUTH_DATABASE_URL
const journeysUrl = process.env.UPLOAD_TEST_JOURNEYS_DATABASE_URL
const mediaUrl = process.env.UPLOAD_TEST_MEDIA_DATABASE_URL
const languagesUrl = process.env.UPLOAD_TEST_LANGUAGES_DATABASE_URL
const hash = (input: Buffer) => createHash('sha256').update(input).digest('hex')
const webhookSecret = 'controlled-mux-webhook-10554-at-least-32-characters'
const chunkSize = 1048576
function partAt(offset: number, size: number) {
  const bytes = Buffer.alloc(Math.min(chunkSize, size - offset))
  if (!offset) {
    bytes.writeUInt32BE(24)
    bytes.write('ftypisom', 4)
  }
  return bytes
}
function manifest(size = 128) {
  const digest = createHash('sha256')
  for (let offset = 0; offset < size; offset += chunkSize)
    digest.update(partAt(offset, size))
  return {
    name: 'synthetic.mp4',
    mime: 'video/mp4',
    size,
    sha256: digest.digest('hex')
  }
}

function pauseProviderRequest() {
  let release!: () => void
  let entered!: () => void
  const paused = new Promise<void>((resolve) => {
    release = resolve
  })
  const started = new Promise<void>((resolve) => {
    entered = resolve
  })
  return {
    started,
    release,
    pause() {
      entered()
      return paused
    }
  }
}

describe('video upload through OAuth, MCP, gateway, Media and separate draft attachment', () => {
  if (![authUrl, journeysUrl, mediaUrl, languagesUrl].every(Boolean))
    throw new Error('Run node tools/scripts/test-mcp-video-upload.mjs')
  if (!/^\/media_issue_10554(_|$)/.test(new URL(mediaUrl!).pathname))
    throw new Error('Use isolated issue 10554 databases')
  const media = new MediaDatabase({
    adapter: new PrismaPg({ connectionString: mediaUrl })
  })
  const languages = new LanguagesDatabase({
    adapter: new PrismaPg({ connectionString: languagesUrl })
  })
  const objects = new Map<string, Buffer>()
  const deduplicated = new Map<string, Buffer>()
  const uploads = new Map<
    string,
    {
      id: string
      status: string
      asset_id?: string
      url: string
      new_asset_settings: { passthrough: string }
    }
  >()
  let assetReadiness: 'video' | 'audio' | 'signed' | 'too_short' | 'foreign' =
    'video'
  let rejectCreation = false
  let muxState: 'preparing' | 'ready' | 'errored' = 'preparing'
  let unknownCreate = false,
    unknownPut = false,
    statusUnavailable = false,
    cancelUnavailable = false,
    cleanupUnavailable = false
  let creates = 0,
    puts = 0,
    transferred = 0
  let jobs: MediaJobs
  let worker: () => MediaJobs
  let uploadOrigin = ''
  let process: () => Promise<void>
  let beforeCreate: (() => Promise<void>) | undefined
  let beforePut: (() => Promise<void>) | undefined
  let throttlePut = false
  let beforeAccept: ((action: string) => Promise<void>) | undefined
  let mediaLibrary = false
  const originalFetch = globalThis.fetch
  const storage: UploadStorage = {
    async put(key, bytes) {
      const digest = hash(bytes)
      if (!deduplicated.has(digest)) deduplicated.set(digest, bytes)
      objects.set(key, deduplicated.get(digest)!)
    },
    async get(key) {
      // A staging read yields to the HTTP server and its socket timers.
      await yieldToIO()
      const value = objects.get(key)
      if (!value) throw new Error('Missing controlled staging')
      return value
    },
    async removeJob(id) {
      if (cleanupUnavailable) throw new Error('Controlled cleanup failure')
      for (const key of objects.keys())
        if (key.startsWith(id + '/')) objects.delete(key)
    }
  }
  const f = structureFixture({
    issue: '10554',
    authUrl,
    journeysUrl,
    startupTimeoutMs: 120000,
    authEnv: {
      AUTH_READ_MEDIA_SECRET:
        'controlled-upload-authority-10554-at-least-32-characters',
      AUTH_PERMISSION_MEDIA_SECRET:
        'controlled-upload-permission-10554-at-least-32-characters'
    },
    async media({ config, journeys, publicKey, listen }) {
      await media.mcpMediaChunk.deleteMany()
      await media.mcpMediaJob.deleteMany()
      await media.mcpMediaExecution.deleteMany()
      let handleRequest: RequestListener = (_req, res) => {
        res.writeHead(503)
        res.end()
      }
      uploadOrigin = await listen(
        createServer((req, res) => {
          handleRequest(req, res)
        })
      )
      const env = {
        MCP_MEDIA_ENABLED: 'true',
        MCP_IMAGE_UPLOADS_ENABLED: 'true',
        MCP_VIDEO_UPLOADS_ENABLED: 'true',
        MCP_READ_ISSUER: config.AUTH_ISSUER,
        MCP_READ_GATEWAY_AUDIENCE: config.AUTH_READ_GATEWAY_AUDIENCE,
        MCP_READ_ENVIRONMENT: 'local',
        MCP_READ_PUBLIC_KEY: JSON.stringify(publicKey),
        MEDIA_MCP_INTERNAL_SECRET:
          'controlled-upload-internal-10554-at-least-32-characters',
        MEDIA_MCP_AUTHORITY_SECRET: config.AUTH_READ_MEDIA_SECRET,
        MCP_READ_AUTHORITY_URL: config.AUTH_ISSUER,
        MCP_PERMISSION_MEDIA_SECRET: config.AUTH_PERMISSION_MEDIA_SECRET,
        CLOUDFLARE_IMAGE_ACCOUNT: 'synthetic-account',
        JOURNEYS_ADMIN_URL: config.AUTH_ADMIN_ORIGIN,
        MCP_MEDIA_INGRESS_URL: uploadOrigin,
        MCP_MEDIA_UPLOAD_TICKET_SECRET:
          'controlled-upload-ticket-10554-at-least-32-characters',
        MUX_UGC_ACCESS_TOKEN_ID: 'mux-token-sentinel',
        MUX_UGC_SECRET_KEY: 'mux-secret-sentinel',
        MCP_MUX_WEBHOOK_SECRET: webhookSecret
      }
      const dependencies: Parameters<typeof mediaRuntime>[1] = {
        media,
        journeys,
        languages,
        flags: async () => ({ mediaLibrary, websiteMode: true }),
        providers: {
          catalog: async () => undefined,
          image: async () => {
            throw new Error('unused')
          },
          unsplash: async () => {
            throw new Error('unused')
          },
          searchUnsplash: async () => [],
          youtube: async () => {
            throw new Error('unused')
          }
        },
        uploads: {
          storage,
          provider: {
            dispatch: async () => 'processing',
            status: async () => 'unknown'
          },
          browserIdentity: async (token) => {
            if (token !== 'alice') throw new Error('Denied')
            return token
          },
          scheduleProcessing: (work) => {
            process = work
          },
          hooks: { beforeAccept: async (action) => beforeAccept?.(action) }
        }
      }
      worker = () => mediaRuntime(env, dependencies).jobs!
      const runtime = mediaRuntime(env, dependencies)
      jobs = runtime.jobs!
      const yoga = createYoga({
        schema: buildSchema('type Query { ping: Boolean }'),
        plugins: runtime.plugins,
        logging: false
      })
      handleRequest = (req, res) => {
        void yoga(req, res)
      }
      return {
        url: uploadOrigin + '/mcp/media-sources',
        internalSecret: env.MEDIA_MCP_INTERNAL_SECRET
      }
    }
  })

  beforeEach(async () => {
    assetReadiness = 'video'
    rejectCreation = false
    muxState = 'preparing'
    unknownCreate = false
    unknownPut = false
    statusUnavailable = false
    cancelUnavailable = false
    cleanupUnavailable = false
    creates = 0
    puts = 0
    transferred = 0
    beforeCreate = undefined
    beforePut = undefined
    throttlePut = false
    beforeAccept = undefined
    mediaLibrary = false
    await f.journeys.block.update({
      where: { id: f.id('video') },
      data: { source: null, videoId: null, videoVariantLanguageId: null }
    })
    await f.journeys.block.update({
      where: { id: f.id('poster') },
      data: { src: null, width: null, height: null, blurhash: null }
    })
    uploads.clear()
    objects.clear()
    deduplicated.clear()
    await media.mcpMediaChunk.deleteMany()
    await media.mcpMediaJob.deleteMany()
    await media.mcpMediaExecution.deleteMany()
    vi.stubGlobal(
      'fetch',
      async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
        const url = new URL(
          input instanceof Request ? input.url : input.toString()
        )
        if (url.hostname === 'storage.googleapis.com') {
          puts++
          expect(init?.headers).not.toHaveProperty('Authorization')
          await beforePut?.()
          if (unknownPut) throw new Error('Controlled lost PUT response')
          const digest = createHash('sha256')
          const signal = init!.signal!
          const started = performance.now()
          for await (const part of init!
            .body as unknown as AsyncIterable<Buffer>) {
            signal.throwIfAborted()
            transferred += part.length
            if (throttlePut) {
              // Deliver at most 100 Mbps, including time spent reading staging.
              const due = started + transferred / 12500
              await delay(Math.max(0, due - performance.now()), undefined, {
                signal
              })
            }
            digest.update(part)
          }
          expect(String(transferred)).toBe(
            (init?.headers as Record<string, string>)['Content-Length']
          )
          const value = [...uploads.values()].find(
            (value) => value.url === url.href
          )!
          value.status = 'asset_created'
          value.asset_id = 'asset-' + value.id
          return new Response(null, { status: 200 })
        }
        if (url.hostname !== 'api.mux.com') return originalFetch(input, init)
        expect((init?.headers as Record<string, string>).Authorization).toBe(
          'Basic ' +
            Buffer.from('mux-token-sentinel:mux-secret-sentinel').toString(
              'base64'
            )
        )
        if (url.pathname.endsWith('/uploads') && init?.method === 'POST') {
          creates++
          if (rejectCreation)
            return Response.json(
              { errors: ['Too many requests, retry later.'] },
              { status: 429 }
            )
          if (typeof init.body !== 'string')
            throw new Error('Expected JSON body')
          const settings = (
            JSON.parse(init.body) as {
              new_asset_settings: { passthrough: string }
            }
          ).new_asset_settings
          const id = randomUUID()
          const value = {
            id,
            status: 'waiting',
            url: `https://storage.googleapis.com/controlled/${id}?secret=provider-url-sentinel`,
            new_asset_settings: settings
          }
          uploads.set(id, value)
          await beforeCreate?.()
          if (unknownCreate)
            throw new Error('Controlled lost creation response')
          return Response.json({ data: value })
        }
        if (statusUnavailable) throw new Error('Controlled Mux outage')
        if (url.pathname.endsWith('/cancel')) {
          if (cancelUnavailable)
            throw new Error('Controlled cancellation outage')
          const value = uploads.get(url.pathname.split('/').at(-2)!)!
          if (value.status !== 'waiting')
            return new Response(null, { status: 409 })
          value.status = 'cancelled'
          return Response.json({ data: value })
        }
        if (url.pathname.includes('/assets/')) {
          const id = url.pathname.split('/').at(-1)!
          const value = [...uploads.values()].find(
            (value) => value.asset_id === id
          )!
          return Response.json({
            data: {
              id,
              passthrough:
                assetReadiness === 'foreign'
                  ? 'foreign-attempt'
                  : value.new_asset_settings.passthrough,
              status: muxState,
              duration: assetReadiness === 'too_short' ? 2.5 : 12.8,
              tracks: [
                { type: assetReadiness === 'audio' ? 'audio' : 'video' }
              ],
              playback_ids: [
                {
                  policy: assetReadiness === 'signed' ? 'signed' : 'public',
                  id: 'playback-' + value.id
                }
              ],
              url: 'https://untrusted.invalid/raw-file.mp4'
            }
          })
        }
        return Response.json({
          data: url.search
            ? [...uploads.values()]
            : uploads.get(url.pathname.split('/').at(-1)!)
        })
      }
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  afterAll(async () => {
    await media.$disconnect()
    await languages.$disconnect()
  })

  function content(response: Awaited<ReturnType<typeof f.call>>) {
    expect(response.json.result?.isError, response.text).not.toBe(true)
    return response.json.result!.structuredContent!
  }
  const start = async (
    file?: Record<string, unknown>,
    kind = 'video_upload',
    key = randomUUID()
  ) =>
    content(
      await f.call('journey_media_start', {
        journeyId: f.journeyId,
        kind,
        idempotencyKey: key,
        ...(file ? { file } : {})
      })
    )
  const status = async (id: string) =>
    content(
      await f.call('journey_media_status', {
        journeyId: f.journeyId,
        jobId: id
      })
    )
  async function browser(
    id: string,
    method = 'GET',
    action?: string,
    body?: string | Buffer,
    user = 'alice',
    extra: Record<string, string> = {}
  ) {
    const response = await fetch(`${uploadOrigin}/mcp/uploads/${id}`, {
      method,
      headers: {
        Authorization: user.startsWith('Upload ') ? user : `JWT ${user}`,
        Origin: 'http://127.0.0.1:4200',
        ...(action ? { 'X-Upload-Action': action } : {}),
        ...extra
      },
      body: Buffer.isBuffer(body) ? new Uint8Array(body) : body
    })
    return { status: response.status, text: await response.text() }
  }
  async function transfer(id: string, size = 128, user = 'alice') {
    expect(
      (await browser(id, 'POST', 'bind', JSON.stringify(manifest(size)), user))
        .status
    ).toBe(200)
    for (let offset = 0; offset < size; offset += chunkSize) {
      const part = partAt(offset, size)
      const response = await browser(id, 'PUT', undefined, part, user, {
        'X-Upload-Offset': String(offset),
        'X-Upload-Sha256': hash(part)
      })
      expect(response.status, response.text).toBe(200)
      expect(JSON.parse(response.text).data.receivedBytes).toBe(
        offset + part.length
      )
    }
  }
  async function callback(
    id: string,
    tamper = false,
    timestamp = Math.floor(Date.now() / 1000)
  ) {
    const raw = JSON.stringify({
      type: 'video.asset.ready',
      data: {
        passthrough: id,
        status: 'ready',
        url: 'https://untrusted.invalid/raw.mp4'
      }
    })
    const signature = createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${raw}`)
      .digest('hex')
    return fetch(uploadOrigin + '/mcp/mux-callback', {
      method: 'POST',
      headers: {
        'mux-signature': `t=${timestamp},v1=${tamper ? 'a'.repeat(64) : signature}`
      },
      body: raw
    })
  }
  async function withdraw(id: string) {
    const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    const connection = await f.auth.agentConnection.findUniqueOrThrow({
      where: { id: job.connectionId }
    })
    const gates = await captureGates(f.auth, [`connection:${connection.id}`])
    return f.auth.$transaction(async (tx) => {
      await lockGates(tx, gates)
      await tx.$queryRaw`SELECT id FROM "AgentConnection" WHERE id = ${connection.id} FOR UPDATE`
      return beginConnectionChange(tx, connection, undefined)
    })
  }

  it.each(['alice', 'forwarded'])(
    'streams exactly 1,000,000,000 bytes via %s and rejects one byte over on the original job',
    async (transport) => {
      const job = await start()
      const id = String(job.jobId)
      const user =
        transport === 'forwarded'
          ? `Upload ${String(job.ingressTicket)}`
          : 'alice'
      expect(
        (
          await browser(
            id,
            'POST',
            'bind',
            JSON.stringify({ ...manifest(128), size: 1_000_000_001 }),
            user
          )
        ).status
      ).toBe(403)
      await transfer(id, 1_000_000_000, user)
      await f.refreshAccessToken()
      const before = await status(id)
      expect(before).toMatchObject({
        state: 'validating',
        receivedBytes: 1_000_000_000,
        transferDeadline: job.transferDeadline
      })
      expect(
        (
          await browser(id, 'PUT', undefined, Buffer.from([0]), user, {
            'X-Upload-Offset': '1000000000',
            'X-Upload-Sha256': hash(Buffer.from([0]))
          })
        ).status
      ).toBe(403)
      throttlePut = transport === 'forwarded'
      await process()
      expect(await status(id)).toMatchObject({
        state: 'processing',
        active: true
      })
      expect(transferred).toBe(1_000_000_000)
      expect(creates).toBe(1)
      expect(puts).toBe(1)
      muxState = 'ready'
      await jobs.recover()
      expect(await status(id)).toMatchObject({ state: 'ready', active: false })
      expect(objects.size).toBe(0)
    },
    3600000
  )

  it.each(['iso4', 'iso5', 'iso6'])(
    'dispatches MP4 with the %s brand and waits for authenticated playable readiness',
    async (brand) => {
      const data = partAt(0, 128)
      data.write(brand, 8)
      data.write('iso6mp41', 16)
      const job = await start()
      const id = String(job.jobId)
      expect(
        (
          await browser(
            id,
            'POST',
            'bind',
            JSON.stringify({ ...manifest(), sha256: hash(data) })
          )
        ).status
      ).toBe(200)
      expect(
        (
          await browser(id, 'PUT', undefined, data, 'alice', {
            'X-Upload-Offset': '0',
            'X-Upload-Sha256': hash(data)
          })
        ).status
      ).toBe(200)
      await process()
      expect(await status(id)).toMatchObject({
        state: 'processing',
        active: true,
        receivedBytes: data.length,
        transferDeadline: job.transferDeadline
      })
      expect(creates).toBe(1)
      expect(puts).toBe(1)
      expect(transferred).toBe(data.length)
      muxState = 'ready'
      await jobs.recover()
      expect(await status(id)).toMatchObject({ state: 'ready', active: false })
    }
  )

  it('shares the two-job ceiling across image/video and replicas without changing exact replay', async () => {
    const key = randomUUID()
    const job = await start(undefined, 'video_upload', key)
    expect(job.ingressUrl).toBe(
      `${uploadOrigin}/mcp/uploads/${String(job.jobId)}`
    )
    await f.refreshAccessToken()
    expect(await start(undefined, 'video_upload', key)).toEqual(job)
    await start(undefined, 'image_upload')
    const denied = await f.call('journey_media_start', {
      journeyId: f.journeyId,
      kind: 'video_upload',
      idempotencyKey: randomUUID()
    })
    expect(denied.json.result?.isError).toBe(true)
    const stored = await media.mcpMediaJob.findUniqueOrThrow({
      where: { id: String(job.jobId) }
    })
    await expect(
      worker().admit(
        {
          userId: stored.userId,
          connectionId: stored.connectionId,
          journeyId: stored.journeyId
        },
        {
          kind: 'video_upload',
          idempotencyKey: randomUUID()
        }
      )
    ).rejects.toThrow('LIMIT_EXCEEDED')
    expect(creates).toBe(0)
  })

  it('keeps a completed transfer past its original deadline and uses authenticated status for duplicate or missed callbacks', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    await media.mcpMediaJob.update({
      where: { id },
      data: { transferDeadline: new Date(Date.now() - 1) }
    })
    await process()
    const stored = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    expect((await callback(stored.providerId, true)).status).toBe(403)
    expect((await callback(stored.providerId, false, 1)).status).toBe(403)
    expect((await callback(stored.providerId)).status).toBe(204)
    expect(await status(id)).toMatchObject({
      state: 'processing',
      active: true
    })
    muxState = 'ready'
    expect((await callback(stored.providerId)).status).toBe(204)
    expect((await callback(stored.providerId)).status).toBe(204)
    expect(await status(id)).toMatchObject({ state: 'ready', active: false })
    expect(creates).toBe(1)
    expect(JSON.stringify(await status(id))).not.toMatch(
      /mux-secret|provider-url|mux-token/
    )
  })

  it('reconciles ambiguous allocation without another creation and retries waiting cancellation only with positive provider evidence', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    unknownCreate = true
    statusUnavailable = true
    await process()
    expect(await status(id)).toMatchObject({
      state: 'reconciling',
      active: true
    })
    statusUnavailable = false
    await worker().recover()
    expect(await status(id)).toMatchObject({
      state: 'provider_allocated',
      active: true
    })
    cancelUnavailable = true
    expect((await browser(id, 'POST', 'cancel')).status).toBe(200)
    await jobs.recover()
    expect(await status(id)).toMatchObject({
      state: 'cancel_requested',
      active: true
    })
    const change = await withdraw(id)
    await jobs.recover()
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'pending' })
    cancelUnavailable = false
    cleanupUnavailable = true
    await jobs.recover()
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { active: true }
    )
    cleanupUnavailable = false
    await worker().recover()
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { state: 'cancelled', active: false }
    )
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'complete' })
    expect((await browser(id)).status).toBe(403)
    expect(creates).toBe(1)
    expect(puts).toBe(0)
  })

  it('preserves processing and ready assets after retirement without attachment authority', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    await process()
    const stored = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    const retired = await fetch(
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
    expect(retired.ok).toBe(true)
    muxState = 'ready'
    await worker().recover()
    expect((await browser(id)).status).toBe(403)
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { state: 'ready', active: false, file: null, metadata: null }
    )
    expect(
      await media.muxVideo.findUnique({ where: { id: stored.providerId } })
    ).toMatchObject({ readyToStream: true })
    expect(creates).toBe(1)
  })

  it('attaches a ready video once at the current revision, replays a lost response and undoes content while retaining the asset', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    muxState = 'ready'
    await process()
    const ready = await status(id)
    const input = await f.input([
      {
        type: 'video_source_set',
        block: { id: f.id('video') },
        source: ready.asset
      }
    ])
    f.loseNextResponse()
    expect((await f.edit(input)).json.result?.isError).toBe(true)
    const saved = content(await f.edit(input))
    expect(content(await f.edit(input))).toEqual(saved)
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('video') } })
    ).toMatchObject({
      videoId: (ready.asset as { videoId: string }).videoId,
      source: 'mux'
    })
    expect(await f.counts()).toEqual({ operations: 1, history: 1, effects: 1 })
    const receipt = f.receipt(await f.edit(input))
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect(
      await media.muxVideo.findUnique({
        where: { id: (ready.asset as { videoId: string }).videoId }
      })
    ).toMatchObject({ readyToStream: true })
  })

  it('keeps an uncertain provider PUT on the same allocation and confirms waiting-state cancellation', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    unknownPut = true
    await process()
    expect(await status(id)).toMatchObject({
      state: 'provider_allocated',
      active: true
    })
    await browser(id, 'POST', 'resume')
    await worker().recover()
    expect(creates).toBe(1)
    expect(puts).toBe(1)
    await browser(id, 'POST', 'cancel')
    await jobs.recover()
    expect(await status(id)).toMatchObject({
      state: 'cancelled',
      active: false
    })
    expect(creates).toBe(1)
    expect(puts).toBe(1)
  })

  it('retains a processing slot after withdrawal and finishes through missed-callback polling without attaching', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    await process()
    const stored = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    await browser(id, 'POST', 'cancel')
    const change = await withdraw(id)
    await jobs.recover()
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { state: 'cancel_requested', active: true }
    )
    expect((await browser(id)).status).toBe(403)
    muxState = 'ready'
    await worker().recover()
    expect(await media.mcpMediaJob.findUnique({ where: { id } })).toMatchObject(
      { state: 'ready', active: false }
    )
    expect(
      await f.auth.connectionChange.findUnique({ where: { id: change.id } })
    ).toMatchObject({ status: 'complete' })
    expect(
      await media.muxVideo.findUnique({ where: { id: stored.providerId } })
    ).toMatchObject({ readyToStream: true })
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('video') } })
    ).not.toMatchObject({ videoId: stored.providerId })
    expect(creates).toBe(1)
  })

  it('fails unsupported video content and terminal Mux processing without attaching or redispatching', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    muxState = 'errored'
    await process()
    expect(await status(id)).toMatchObject({ state: 'failed', active: false })
    expect(objects.size).toBe(0)
    await browser(id, 'POST', 'resume')
    expect(creates).toBe(1)
    const invalidId = String((await start()).jobId)
    const data = Buffer.alloc(128)
    await browser(
      invalidId,
      'POST',
      'bind',
      JSON.stringify({ ...manifest(), sha256: hash(data) })
    )
    await browser(invalidId, 'PUT', undefined, data, 'alice', {
      'X-Upload-Offset': '0',
      'X-Upload-Sha256': hash(data)
    })
    await process()
    expect(await status(invalidId)).toMatchObject({
      state: 'failed',
      active: false
    })
    expect(creates).toBe(1)
  })

  it('denies a copied Admin locator and publication, then requires explicit same-job resume after a permission change', async () => {
    const id = String((await start()).jobId)
    expect((await browser(id, 'GET', undefined, undefined, 'bob')).status).toBe(
      403
    )
    await transfer(id)
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        firstPublishedAt: new Date()
      }
    })
    expect((await browser(id, 'POST', 'resume')).status).toBe(403)
    expect(creates).toBe(0)
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: { status: 'draft' }
    })
    await f.auth.authorizationGate.update({
      where: { id: 'user-team:alice:structure-team-alice' },
      data: { generation: { increment: 1 } }
    })
    await process()
    expect(await status(id)).toMatchObject({
      state: 'validating',
      active: true
    })
    expect(creates).toBe(0)
    expect((await browser(id, 'POST', 'resume')).status).toBe(200)
    expect(creates).toBe(1)
  })

  it('settles documented Mux refusal before processing and releases capacity after safe cleanup', async () => {
    rejectCreation = true
    const id = String((await start()).jobId)
    await transfer(id)
    await process()
    expect(await status(id)).toMatchObject({ state: 'failed', active: false })
    expect(creates).toBe(1)
    expect(puts).toBe(0)
    expect(objects.size).toBe(0)
    expect(uploads.size).toBe(0)
  })

  it('reports delayed processing as reconciliation during provider outages without releasing the slot', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    await process()
    const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    await media.mcpMediaExecution.update({
      where: { id: job.dispatchReceiptId! },
      data: { createdAt: new Date(Date.now() - 6 * 3600000 - 1) }
    })
    statusUnavailable = true
    await jobs.recover()
    expect(await status(id)).toMatchObject({
      state: 'reconciling',
      active: true
    })
    expect(creates).toBe(1)
    statusUnavailable = false
    muxState = 'ready'
    await jobs.recover()
    expect(await status(id)).toMatchObject({ state: 'ready', active: false })
    expect(creates).toBe(1)
  })

  it('keeps an unacknowledged provider creation uncertain instead of claiming asset processing', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    const creation = pauseProviderRequest()
    beforeCreate = creation.pause
    const pending = process()
    try {
      await creation.started
      expect(await status(id)).toMatchObject({
        state: 'reconciling',
        active: true
      })
      expect(puts).toBe(0)
    } finally {
      creation.release()
      await pending
    }
    expect(await status(id)).toMatchObject({
      state: 'processing',
      active: true
    })
    expect(creates).toBe(1)
    expect(puts).toBe(1)
  })

  it('accepts cancellation during a stalled PUT and keeps capacity until Mux confirms cancellation', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    const put = pauseProviderRequest()
    beforePut = put.pause
    const pending = process()
    try {
      await put.started
      cancelUnavailable = true
      expect((await browser(id, 'POST', 'cancel')).status).toBe(200)
      await worker().recover()
      expect(await status(id)).toMatchObject({
        state: 'cancel_requested',
        active: true
      })
      const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      expect(
        await media.mcpMediaExecution.findUniqueOrThrow({
          where: { id: job.dispatchReceiptId! }
        })
      ).toMatchObject({ status: 'sending', reportedAt: null })
      cancelUnavailable = false
      await worker().recover()
      expect(await status(id)).toMatchObject({
        state: 'cancelled',
        active: false
      })
    } finally {
      unknownPut = true
      put.release()
      await pending
    }
    expect(await status(id)).toMatchObject({
      state: 'cancelled',
      active: false
    })
    expect(creates).toBe(1)
    expect(puts).toBe(1)
  })

  it.each(['audio', 'signed', 'too_short'] as const)(
    'rejects provider-ready %s metadata instead of exposing a raw file as playable video',
    async (metadata) => {
      const id = String((await start()).jobId)
      await transfer(id)
      assetReadiness = metadata
      muxState = 'ready'
      await process()
      const result = await status(id)
      expect(result).toMatchObject({ state: 'failed', active: false })
      expect(result.asset).toBeUndefined()
      const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
      expect(
        await media.muxVideo.findUnique({ where: { id: job.providerId } })
      ).toMatchObject({ readyToStream: false })
      expect(creates).toBe(1)
      expect(puts).toBe(1)
    }
  )

  it('keeps a foreign provider binding unresolved and reconciles only the original attempt', async () => {
    const id = String((await start()).jobId)
    await transfer(id)
    assetReadiness = 'foreign'
    muxState = 'ready'
    await process()
    expect(await status(id)).toMatchObject({
      state: 'reconciling',
      active: true
    })
    const job = await media.mcpMediaJob.findUniqueOrThrow({ where: { id } })
    expect(
      await media.muxVideo.findUnique({ where: { id: job.providerId } })
    ).toMatchObject({ readyToStream: false })
    assetReadiness = 'video'
    await jobs.recover()
    expect(await status(id)).toMatchObject({ state: 'ready', active: false })
    expect(creates).toBe(1)
    expect(puts).toBe(1)
  })

  it.each(['dispatch', 'transfer', 'release'])(
    'denies video %s at final acceptance after grant expiry',
    async (action) => {
      const id = String((await start()).jobId)
      if (action === 'dispatch') await transfer(id)
      const stored = await media.mcpMediaJob.findUniqueOrThrow({
        where: { id }
      })
      beforeAccept = async (current) => {
        if (current === action)
          await f.auth.agentConnection.update({
            where: { id: stored.connectionId },
            data: { expiresAt: new Date(Date.now() - 1) }
          })
      }
      if (action === 'dispatch') await process()
      else
        expect(
          (
            await browser(
              id,
              action === 'transfer' ? 'POST' : 'GET',
              action === 'transfer' ? 'bind' : undefined,
              action === 'transfer' ? JSON.stringify(manifest()) : undefined
            )
          ).status
        ).toBe(403)
      expect(creates).toBe(0)
      expect((await browser(id)).status).toBe(403)
    }
  )
})
