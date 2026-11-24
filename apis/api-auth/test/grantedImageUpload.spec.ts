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
import { imageHash } from '../../api-media/src/lib/mcpImageInput'
import type { ImageUploadProvider } from '../../api-media/src/lib/mcpImageProvider'
import type { MediaJobs } from '../../api-media/src/lib/mcpMediaJobs'
import { mediaRuntime } from '../../api-media/src/lib/mcpMediaRuntime'
import type { UploadStorage } from '../../api-media/src/lib/mcpUploadStorage'
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
  if (!/^\/media_issue_10560(_|$)/.test(new URL(mediaUrl!).pathname))
    throw new Error('Use isolated issue 10560 databases')
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
  let loseDispatch = false
  let rejectDispatch = false
  let cleanupUnavailable = false
  let stagingUnknown = false
  let stagingRejected = false
  let stagingWrites = 0
  let mediaLibrary = true
  let providerReady = true
  let providerUnknown = false
  let jobs: MediaJobs
  let createWorker: () => MediaJobs
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
      return providerUnknown ? 'unknown' : (providerAssets.get(id) ?? 'unknown')
    }
  }
  const internalSecret =
    'controlled-upload-internal-10560-at-least-32-characters'
  const mediaSecret = 'controlled-upload-authority-10560-at-least-32-characters'
  function configureRuntime(...settings: Parameters<typeof mediaRuntime>) {
    createWorker = () => mediaRuntime(...settings).jobs!
    return mediaRuntime(...settings)
  }
  const f = structureFixture({
    issue: '10560',
    authUrl,
    journeysUrl,
    startupTimeoutMs: 120000,
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
    loseDispatch = false
    rejectDispatch = false
    cleanupUnavailable = false
    stagingUnknown = false
    stagingRejected = false
    stagingWrites = 0
    providerReady = true
    mediaLibrary = true
    providerUnknown = false
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
    f.loseNextResponse()
    await f.call('journey_media_status', { journeyId: f.journeyId, jobId: id })
    const ready = await processedStatus(id)
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
                : jobs.result(context, id)
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
