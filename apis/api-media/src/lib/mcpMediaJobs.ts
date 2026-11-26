import { createHmac, randomUUID } from 'node:crypto'

import { z } from 'zod'

import type { PrismaClient as JourneysDatabase } from '@core/prisma/journeys/client'
import {
  type McpMediaJob,
  Prisma,
  type PrismaClient
} from '@core/prisma/media/client'
import {
  type MediaFile,
  type MediaStart,
  fileMatchesKind,
  generationDispatchLimit,
  generationWindowMs,
  imageByteLimit,
  mediaFile,
  transferLifetimeMs,
  uploadChunkBytes,
  videoByteLimit
} from '@core/yoga/mcp/mediaJobContract'
import {
  type ReadCredential,
  fingerprint,
  postJson,
  sameSecret
} from '@core/yoga/mcp/readContract'

import {
  type ImageGenerationProvider,
  generatedImageMetadata
} from './mcpImageGenerationProvider'
import { imageHash, validateImageInput } from './mcpImageInput'
import type { ImageUploadProvider } from './mcpImageProvider'
import { mediaExecutorIdentity, mediaExecutorStopped } from './mcpMediaExecutor'
import type { UploadStorage } from './mcpUploadStorage'
import { InvalidVideoInput, validateVideoInput } from './mcpVideoInput'
import type { VideoUploadProvider, VideoUploadStatus } from './mcpVideoProvider'

interface JobContext {
  userId: string
  connectionId: string
  journeyId: string
  grantVersion?: number
}
interface JobConfig {
  authorityUrl: string
  authoritySecret: string
  ticketSecret: string
  adminOrigin: string
  ingressOrigin: string
  uploadLimit: number
  generationPollIntervalMs?: number
  generationObservationMs?: number
}
type Action = 'admit' | 'transfer' | 'dispatch' | 'cancel' | 'release'
type Transaction = Prisma.TransactionClient
const resultLifetime = 30 * 86400000
// Allow the bounded execution (up to 65s plus lock acquisition) to start.
const backgroundFenceDelayMs = 120_000
const terminal = ['ready', 'failed', 'cancelled', 'transfer_expired']
const videoCleanupStates = new Map([
  ['video_cleanup_ready', 'ready'],
  ['video_cleanup_failed', 'failed'],
  ['video_cleanup_cancelled', 'cancelled']
])
const generationPoll = z.object({
  attempt: z.number().int().min(0).max(32),
  nextAt: z.number().int().min(0).max(8_640_000_000_000_000)
})
const stagingDescriptor = z.object({
  objectKey: z.string(),
  offset: z.number().int(),
  bytes: z.number().int(),
  sha256: z.string(),
  receivedAt: z.string().datetime()
})
async function clock(tx: Transaction) {
  const rows = await tx.$queryRaw<
    Array<{ now: Date }>
  >`SELECT clock_timestamp() AS now`
  return rows[0].now
}
function denied(): never {
  throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
}

export function createMediaJobs(
  config: JobConfig,
  media: PrismaClient,
  journeys: JourneysDatabase,
  storage: UploadStorage,
  provider: ImageUploadProvider,
  hooks: {
    afterPrepare?: (action: Action) => Promise<void>
    beforeAccept?: (action: Action) => Promise<void>
    beforeSend?: () => Promise<void>
    afterSend?: () => Promise<void>
    beforeStagingWrite?: () => Promise<void>
  } = {},
  videoProvider?: VideoUploadProvider,
  generation?: ImageGenerationProvider
) {
  const authority = (action: string, body: unknown) =>
    postJson(
      new URL(`/internal/reads/media-jobs/${action}`, config.authorityUrl).href,
      body,
      `Bearer ${config.authoritySecret}`
    )
  const signTicket = (job: McpMediaJob) => {
    const payload = Buffer.from(
      JSON.stringify({
        audience: 'media-ingress',
        jobId: job.id,
        userId: job.userId,
        connectionId: job.connectionId,
        expiresAt: job.transferDeadline.getTime()
      })
    ).toString('base64url')
    return `${payload}.${createHmac('sha256', config.ticketSecret).update(payload).digest('hex')}`
  }
  function ticketContext(ticket: string, job: McpMediaJob): JobContext {
    const [payload, signature, extra] = ticket.split('.')
    if (
      !payload ||
      !signature ||
      extra ||
      !sameSecret(
        signature,
        createHmac('sha256', config.ticketSecret).update(payload).digest('hex')
      )
    )
      denied()
    const value = z
      .object({
        audience: z.literal('media-ingress'),
        jobId: z.literal(job.id),
        userId: z.literal(job.userId),
        connectionId: z.literal(job.connectionId),
        expiresAt: z.number().gt(Date.now())
      })
      .strict()
      .parse(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')))
    return {
      userId: value.userId,
      connectionId: value.connectionId,
      journeyId: job.journeyId
    }
  }
  async function own(jobId: string, context: JobContext) {
    const job = await media.mcpMediaJob.findUnique({ where: { id: jobId } })
    if (
      !job ||
      job.userId !== context.userId ||
      job.connectionId !== context.connectionId ||
      job.journeyId !== context.journeyId
    )
      denied()
    return job
  }
  async function settle(id: string) {
    await authority('settle', { permitId: id })
    await media.mcpMediaExecution.update({
      where: { id },
      data: { reportedAt: new Date() }
    })
  }
  /** Capture generations before rights reads. Hold the owning journey against
   * publication and the receipt against recovery during final acceptance. Each
   * stage acquires its owning locks and validates state before calling accept.
   */
  async function authorized<T>(
    context: JobContext,
    action: Action,
    operation: (
      tx: Transaction,
      stage: {
        permitId: string
        clientId: string
        grantVersion: number
        permissionHash: string
        accept: () => Promise<void>
      }
    ) => Promise<T>,
    deferred: boolean | 'output' = false
  ): Promise<T> {
    const resource = await journeys.journey.findUnique({
      where: { id: context.journeyId },
      select: { teamId: true }
    })
    if (!resource) denied()
    const executorId = randomUUID()
    const prepared = z
      .object({
        permitId: z.string().uuid(),
        clientId: z.string(),
        grantVersion: z.number(),
        permissionHash: z.string().regex(/^[a-f0-9]{64}$/)
      })
      .parse(
        await authority('prepare', {
          ...context,
          grantVersion: undefined,
          teamId: resource.teamId,
          executorId,
          action,
          requestHash: fingerprint([context, action, executorId])
        })
      )
    if (context.grantVersion && context.grantVersion !== prepared.grantVersion)
      denied()
    await media.mcpMediaExecution.create({
      data: {
        id: prepared.permitId,
        ...(deferred === 'output'
          ? { executor: await mediaExecutorIdentity() }
          : {})
      }
    })
    try {
      await hooks.afterPrepare?.(action)
      const result = await journeys.$transaction(
        async (jtx) => {
          await jtx.$queryRaw`SELECT id FROM "Journey" WHERE id = ${context.journeyId} FOR SHARE`
          const profile = await jtx.journeyProfile.findUnique({
            where: { userId: context.userId }
          })
          const journey = await jtx.journey.findFirst({
            where: {
              id: context.journeyId,
              teamId: resource.teamId,
              deletedAt: null,
              archivedAt: null,
              trashedAt: null,
              AND: [
                { OR: [{ template: false }, { template: null }] },
                { OR: [{ templateSite: false }, { templateSite: null }] },
                {
                  OR: [
                    {
                      userJourneys: {
                        some: {
                          userId: context.userId,
                          role: { in: ['owner', 'editor'] }
                        }
                      }
                    },
                    {
                      team: {
                        userTeams: {
                          some: {
                            userId: context.userId,
                            role: { in: ['member', 'manager'] }
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          })
          if (
            !profile?.acceptedTermsAt ||
            !journey ||
            (action !== 'release' && journey.status !== 'draft') ||
            !['draft', 'published'].includes(journey.status)
          ) {
            await authority('deny', { permitId: prepared.permitId })
            denied()
          }
          return media.$transaction(
            async (tx) => {
              await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${prepared.permitId} FOR UPDATE`
              const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
                where: { id: prepared.permitId }
              })
              if (receipt.status !== 'prepared') denied()
              let accepted = false
              const accept = async () => {
                if (accepted) throw new Error('Permit already accepted')
                await hooks.beforeAccept?.(action)
                await authority('accept', { permitId: prepared.permitId })
                accepted = true
              }
              const value = await operation(tx, {
                permitId: prepared.permitId,
                clientId: prepared.clientId,
                grantVersion: prepared.grantVersion,
                permissionHash: prepared.permissionHash,
                accept
              })
              if (!accepted) throw new Error('Permit was not accepted')
              await tx.mcpMediaExecution.update({
                where: { id: prepared.permitId },
                data: {
                  status:
                    deferred === 'output'
                      ? 'output'
                      : action === 'dispatch' || deferred
                        ? 'accepted'
                        : 'settled',
                  completedAt: await clock(tx)
                }
              })
              return value
            },
            { maxWait: 10000, timeout: 60000 }
          )
        },
        { maxWait: 10000, timeout: 65000 }
      )
      if (action !== 'dispatch' && !deferred) await settle(prepared.permitId)
      return result
    } catch (error) {
      await recoverExecution(prepared.permitId).catch(() => undefined)
      throw error
    }
  }
  async function lockJob(tx: Transaction, id: string) {
    // Serialize job writers while allowing status reads of committed progress.
    await tx.$queryRaw`SELECT id FROM "McpMediaJob" WHERE id = ${id} FOR NO KEY UPDATE`
    return tx.mcpMediaJob.findUniqueOrThrow({ where: { id } })
  }
  // Caller holds the user's capacity row. Future timestamps do not belong to
  // the current rolling window; exactly 24 hours old is no longer usage.
  async function checkGenerationUsage(tx: Transaction, userId: string) {
    const now = await clock(tx)
    const count = await tx.mcpMediaJob.count({
      where: {
        userId,
        kind: 'image_generation',
        dispatchedAt: {
          gt: new Date(now.getTime() - generationWindowMs),
          lte: now
        }
      }
    })
    if (count >= generationDispatchLimit) throw new Error('LIMIT_EXCEEDED')
    return now
  }
  async function terminalJob(tx: Transaction, job: McpMediaJob, state: string) {
    if (
      await tx.mcpMediaChunk.count({ where: { jobId: job.id, stored: false } })
    )
      return false
    if (job.kind === 'video_upload') {
      // Unsent work is stopped under the job lock. Commit its cleanup
      // obligation before touching storage, retaining the capacity slot.
      await tx.mcpMediaJob.update({
        where: { id: job.id },
        data: { state }
      })
      return true
    }
    // Only call while every transfer/dispatch is stopped under the job lock.
    await storage.removeJob(job.id)
    await completeJob(tx, job, state)
    return true
  }
  async function completeJob(tx: Transaction, job: McpMediaJob, state: string) {
    const now = await clock(tx)
    await tx.mcpMediaJob.update({
      where: { id: job.id },
      data: {
        state,
        generationPrompt: null,
        active: false,
        completedAt: now,
        resultExpiresAt: new Date(now.getTime() + resultLifetime)
      }
    })
  }
  async function recordVideoCleanup(
    tx: Transaction,
    job: McpMediaJob,
    state: 'ready' | 'failed' | 'cancelled'
  ) {
    if (
      await tx.mcpMediaChunk.count({ where: { jobId: job.id, stored: false } })
    )
      return
    // Positive provider evidence and the library asset commit before S3 I/O.
    // Keep the job active and the receipt recoverable until cleanup succeeds.
    await tx.mcpMediaExecution.update({
      where: { id: job.dispatchReceiptId! },
      data: {
        status: `video_cleanup_${state}`,
        completedAt: await clock(tx),
        reportedAt: null
      }
    })
  }
  function needsUnsentVideoCleanup(job: McpMediaJob) {
    return (
      job.kind === 'video_upload' &&
      job.active &&
      ['failed', 'cancelled', 'transfer_expired'].includes(job.state) &&
      !job.dispatchReceiptId
    )
  }
  async function finishVideoCleanup(jobId: string, receiptId?: string) {
    const pending = await media.$transaction(async (tx) => {
      if (!receiptId) {
        const job = await lockJob(tx, jobId)
        if (needsUnsentVideoCleanup(job))
          return { state: job.state, status: undefined }
        return
      }
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${receiptId} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
      const state = videoCleanupStates.get(receipt.status)
      if (!state || receipt.jobId !== jobId) return
      const job = await lockJob(tx, jobId)
      if (
        job.kind !== 'video_upload' ||
        !job.active ||
        job.dispatchReceiptId !== receiptId
      )
        return
      return { state, status: receipt.status }
    })
    if (!pending) return
    // A committed terminal state or cleanup receipt fences new writes.
    // Repeated prefix deletion is safe if another worker or a restart joins us.
    await storage.removeJob(jobId)
    const completed = await media.$transaction(async (tx) => {
      if (!receiptId) {
        const job = await lockJob(tx, jobId)
        if (!needsUnsentVideoCleanup(job) || job.state !== pending.state)
          return false
        await completeJob(tx, job, pending.state)
        return true
      }
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${receiptId} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
      if (receipt.status !== pending.status || receipt.jobId !== jobId)
        return false
      const job = await lockJob(tx, jobId)
      if (!job.active || job.dispatchReceiptId !== receiptId) return false
      await completeJob(tx, job, pending.state)
      await tx.mcpMediaExecution.update({
        where: { id: receiptId },
        data: { status: 'settled', completedAt: await clock(tx) }
      })
      return true
    })
    if (completed && receiptId) await settle(receiptId)
  }
  async function recoverExecution(
    id: string,
    mode: 'explicit' | 'background' = 'explicit'
  ) {
    const status = await media.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${id} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id }
      })
      if (
        [
          'prepared',
          'accepted',
          'staging_prepared',
          'staging_rejected'
        ].includes(receipt.status) ||
        (receipt.status === 'output' &&
          (await mediaExecutorStopped(receipt.executor)))
      ) {
        const now = await clock(tx)
        const lastTransition = receipt.completedAt ?? receipt.createdAt
        if (
          mode === 'background' &&
          !['output', 'staging_rejected'].includes(receipt.status) &&
          now.getTime() - lastTransition.getTime() < backgroundFenceDelayMs
        )
          return receipt.status
        await tx.mcpMediaExecution.update({
          where: { id },
          data: { status: 'fenced', completedAt: now }
        })
        if (receipt.jobId) {
          await tx.mcpMediaChunk.deleteMany({
            where: {
              jobId: receipt.jobId,
              executionId: receipt.id,
              stored: false
            }
          })
          await tx.mcpMediaJob.updateMany({
            where: {
              id: receipt.jobId,
              dispatchReceiptId: receipt.id,
              state: { in: ['dispatch_pending', 'cancel_requested'] }
            },
            data: { dispatchReceiptId: null }
          })
        }
        return 'fenced'
      }
      return receipt.status
    })
    if (status === 'settled' || status === 'fenced') await settle(id)
    else if (['staging', 'writing'].includes(status)) await reconcileStaging(id)
    else if (videoCleanupStates.has(status)) {
      const receipt = await media.mcpMediaExecution.findUniqueOrThrow({
        where: { id }
      })
      if (receipt.jobId) await finishVideoCleanup(receipt.jobId, id)
    }
  }
  async function acknowledgeStaging(tx: Transaction, id: string) {
    const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
      where: { id }
    })
    if (!['staging', 'writing'].includes(receipt.status) || !receipt.jobId)
      denied()
    const input = stagingDescriptor.parse(receipt.staging)
    const job = await lockJob(tx, receipt.jobId)
    const file = mediaFile.parse(job.file)
    if (job.receivedBytes !== input.offset) throw new Error('VALIDATION_FAILED')
    await tx.mcpMediaChunk.update({
      where: { jobId_offset: { jobId: job.id, offset: input.offset } },
      data: { stored: true }
    })
    const completed = input.offset + input.bytes === file.size
    await tx.mcpMediaJob.update({
      where: { id: job.id },
      data: {
        receivedBytes: input.offset + input.bytes,
        state:
          job.state === 'cancel_requested'
            ? job.state
            : completed
              ? 'validating'
              : 'transferring',
        ...(completed
          ? { transferCompletedAt: new Date(input.receivedAt) }
          : {})
      }
    })
    await tx.mcpMediaExecution.update({
      where: { id },
      data: { status: 'settled', completedAt: await clock(tx) }
    })
  }
  async function reconcileStaging(id: string) {
    const resolved = await media.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${id} FOR UPDATE`
        const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
          where: { id }
        })
        if (!['staging', 'writing'].includes(receipt.status)) return false
        const input = stagingDescriptor.parse(receipt.staging)
        const bytes = await storage.get(input.objectKey).catch(() => undefined)
        if (
          !bytes ||
          bytes.length !== input.bytes ||
          imageHash(bytes) !== input.sha256
        )
          return false
        await acknowledgeStaging(tx, id)
        return true
      },
      { timeout: 60000 }
    )
    if (resolved) await settle(id)
  }
  async function admit(
    context: JobContext,
    input:
      | Omit<
          Extract<MediaStart, { kind: 'image_upload' | 'video_upload' }>,
          'journeyId'
        >
      | Omit<Extract<MediaStart, { kind: 'image_generation' }>, 'journeyId'>
  ) {
    if (input.kind === 'image_generation' && !generation) denied()
    if (input.kind === 'video_upload' && !videoProvider)
      throw new Error('VALIDATION_FAILED')
    if (
      input.kind !== 'image_generation' &&
      input.file &&
      !fileMatchesKind(mediaFile.parse(input.file), input.kind)
    )
      throw new Error('VALIDATION_FAILED')
    return authorized(
      context,
      'admit',
      async (tx, { clientId, grantVersion, permissionHash, accept }) => {
        await tx.mcpMediaUser.upsert({
          where: { userId: context.userId },
          create: { userId: context.userId },
          update: {}
        })
        await tx.$queryRaw`SELECT "userId" FROM "McpMediaUser" WHERE "userId" = ${context.userId} FOR UPDATE`
        if (
          await tx.mcpMediaCancellation.findUnique({
            where: {
              connectionId_key: {
                connectionId: context.connectionId,
                key: input.idempotencyKey
              }
            }
          })
        )
          throw new Error('IDEMPOTENCY_KEY_REUSED')
        const prior = await tx.mcpMediaJob.findUnique({
          where: {
            connectionId_key: {
              connectionId: context.connectionId,
              key: input.idempotencyKey
            }
          }
        })
        const payloadHash = fingerprint([context.journeyId, input])
        if (prior) {
          if (prior.payloadHash !== payloadHash)
            throw new Error('IDEMPOTENCY_KEY_REUSED')
          await accept()
          return prior.id
        }
        const generating = input.kind === 'image_generation'
        if (generating) await checkGenerationUsage(tx, context.userId)
        const active = await tx.mcpMediaJob.count({
          where: {
            userId: context.userId,
            active: true,
            kind: {
              in: generating
                ? ['image_generation']
                : ['image_upload', 'video_upload']
            }
          }
        })
        if (active >= (generating ? 1 : config.uploadLimit))
          throw new Error('LIMIT_EXCEEDED')
        await accept()
        const now = await clock(tx)
        const team = await journeys.journey.findUniqueOrThrow({
          where: { id: context.journeyId },
          select: { teamId: true }
        })
        const job = await tx.mcpMediaJob.create({
          data: {
            connectionId: context.connectionId,
            userId: context.userId,
            journeyId: context.journeyId,
            clientId,
            teamId: team.teamId,
            key: input.idempotencyKey,
            payloadHash,
            kind: input.kind,
            progressionGrantVersion: grantVersion,
            progressionPermissionHash: permissionHash,
            file: input.kind !== 'image_generation' ? input.file : undefined,
            ...(input.kind === 'image_generation'
              ? {
                  generationPrompt: input.prompt,
                  state: 'dispatch_pending',
                  transferCompletedAt: now
                }
              : {}),
            providerId: randomUUID(),
            admittedAt: now,
            transferDeadline: new Date(now.getTime() + transferLifetimeMs)
          }
        })
        return job.id
      }
    )
  }
  function describeJob(job: McpMediaJob, now: Date) {
    const jobId = job.id
    const poll = generationPoll.safeParse(job.metadata)
    if (
      job.privatePurgedAt ||
      (job.resultExpiresAt && job.resultExpiresAt <= now)
    )
      return {
        contractVersion: '1',
        kind: 'media_job',
        jobId,
        code: 'RESULT_EXPIRED'
      }
    return {
      contractVersion: '1',
      kind: 'media_job',
      mediaKind: job.kind,
      jobId,
      state: job.state,
      transferCompletedAt: job.transferCompletedAt?.toISOString() ?? null,
      clientId: job.clientId,
      journeyId: job.journeyId,
      admittedAt: job.admittedAt.toISOString(),
      ...(job.kind !== 'image_generation'
        ? {
            transferDeadline: job.transferDeadline.toISOString(),
            receivedBytes: job.receivedBytes,
            file: job.file
          }
        : {}),
      active: job.active,
      ...(job.state === 'ready'
        ? {
            asset:
              job.kind === 'video_upload'
                ? { source: 'mux', videoId: job.providerId }
                : { source: 'upload', jobId: job.id, id: job.providerId },
            attachment:
              'Separate current-revision journey_edit required. Successful library assets survive cancellation and content undo.'
          }
        : {}),
      ...(job.kind === 'image_generation'
        ? {
            ...(job.active && poll.success
              ? { nextObservationAt: new Date(poll.data.nextAt).toISOString() }
              : {}),
            recovery:
              job.state === 'reconciling' || job.state === 'cancel_requested'
                ? 'Poll this same job. The provider may not be able to retrieve an ambiguous generation. Keep uncertainty and capacity; ask operations to investigate the recorded job/provider identity. Never repeat generation or use a new key as recovery.'
                : 'Poll this same job. Generation never attaches automatically.',
            observationAfter: new Date(
              (job.dispatchedAt ?? job.admittedAt).getTime() +
                (config.generationObservationMs ?? 15 * 60 * 1000)
            ).toISOString(),
            escalateAfter: new Date(
              (job.dispatchedAt ?? job.admittedAt).getTime() +
                generationWindowMs
            ).toISOString(),
            operationsRequired:
              job.active &&
              !!job.dispatchedAt &&
              job.dispatchedAt.getTime() + generationWindowMs <= now.getTime()
          }
        : {
            adminLink: new URL(`/mcp/uploads/${job.id}`, config.adminOrigin)
              .href,
            ingressUrl: new URL(`/mcp/uploads/${job.id}`, config.ingressOrigin)
              .href
          }),
      ...(!terminal.includes(job.state) &&
      job.kind !== 'image_generation' &&
      !job.transferCompletedAt &&
      job.transferDeadline > now
        ? { ingressTicket: signTicket(job) }
        : {})
    }
  }
  async function readResult(
    context: JobContext,
    jobId: string,
    output: boolean
  ) {
    await own(jobId, context)
    return authorized(
      context,
      'release',
      async (tx, { permitId, accept }) => {
        // Protect the job's identity through final output admission. A key
        // share still waits for deletion or a key change, while a worker
        // holding a non-key write lock can finish independently.
        await tx.$queryRaw`SELECT id FROM "McpMediaJob" WHERE id = ${jobId} FOR KEY SHARE`
        await accept()
        const job = await tx.mcpMediaJob.findUniqueOrThrow({
          where: { id: jobId }
        })
        return { data: describeJob(job, await clock(tx)), permitId }
      },
      output ? 'output' : false
    )
  }
  async function result(context: JobContext, jobId: string) {
    return (await readResult(context, jobId, false)).data
  }
  function resultForOutput(context: JobContext, jobId: string) {
    return readResult(context, jobId, true)
  }
  async function bind(context: JobContext, jobId: string, input: MediaFile) {
    if ((await own(jobId, context)).kind === 'image_generation') denied()
    const file = mediaFile.parse(input)
    await authorized(context, 'transfer', async (tx, { accept }) => {
      const job = await lockJob(tx, jobId)
      if (!fileMatchesKind(file, job.kind)) throw new Error('VALIDATION_FAILED')
      if (job.file) {
        if (fingerprint(mediaFile.parse(job.file)) !== fingerprint(file))
          throw new Error('IDEMPOTENCY_KEY_REUSED')
        await accept()
        return
      }
      if (
        job.state !== 'waiting_for_file' ||
        job.transferDeadline <= (await clock(tx))
      )
        throw new Error('VALIDATION_FAILED')
      await accept()
      await tx.mcpMediaJob.update({ where: { id: job.id }, data: { file } })
    })
  }
  async function chunk(
    context: JobContext,
    jobId: string,
    offset: number,
    checksum: string,
    body: ReadableStream<Uint8Array>
  ) {
    if ((await own(jobId, context)).kind === 'image_generation') denied()
    const plan = await authorized(
      context,
      'transfer',
      async (tx, { permitId, accept }) => {
        const job = await lockJob(tx, jobId)
        const file = mediaFile.parse(job.file)
        const now = await clock(tx)
        if (
          !['waiting_for_file', 'transferring'].includes(job.state) ||
          job.transferDeadline <= now ||
          !Number.isInteger(offset) ||
          offset < 0 ||
          !/^[a-f0-9]{64}$/.test(checksum)
        )
          throw new Error('VALIDATION_FAILED')
        const expectedBytes = Math.min(uploadChunkBytes, file.size - offset)
        if (expectedBytes <= 0 || offset % uploadChunkBytes !== 0)
          throw new Error('VALIDATION_FAILED')
        const reader = body.getReader()
        const parts: Uint8Array[] = []
        let bytes = 0
        const deadline = Math.min(
          job.transferDeadline.getTime(),
          Date.now() + 30000
        )
        let timer: ReturnType<typeof setTimeout> | undefined
        const expired = new Promise<never>((_resolve, reject) => {
          timer = setTimeout(
            () => reject(new Error('VALIDATION_FAILED')),
            Math.max(0, deadline - Date.now())
          )
        })
        try {
          while (true) {
            const next = await Promise.race([reader.read(), expired])
            if (Date.now() >= deadline) throw new Error('VALIDATION_FAILED')
            if (next.done) break
            bytes += next.value.length
            if (
              bytes > expectedBytes ||
              offset + bytes >
                (job.kind === 'video_upload' ? videoByteLimit : imageByteLimit)
            )
              throw new Error('LIMIT_EXCEEDED')
            parts.push(next.value)
          }
        } finally {
          clearTimeout(timer)
          await reader.cancel().catch(() => undefined)
        }
        const data = Buffer.concat(parts)
        if (
          bytes !== expectedBytes ||
          imageHash(data) !== checksum ||
          job.transferDeadline <= (await clock(tx))
        )
          throw new Error('VALIDATION_FAILED')
        const prior = await tx.mcpMediaChunk.findUnique({
          where: { jobId_offset: { jobId, offset } }
        })
        if (prior) {
          if (prior.sha256 !== checksum || prior.bytes !== bytes)
            throw new Error('IDEMPOTENCY_KEY_REUSED')
          await accept()
          return {
            permitId,
            data,
            objectKey: prior.objectKey,
            prior: prior.executionId,
            duplicate: true
          }
        }
        // A safely fenced reservation may have been removed for retry. Its
        // durable receipt still binds the original immutable chunk identity.
        const original = await tx.mcpMediaExecution.findFirst({
          where: { jobId, staging: { path: ['offset'], equals: offset } },
          orderBy: { createdAt: 'asc' },
          select: { staging: true }
        })
        if (original) {
          const recorded = stagingDescriptor.parse(original.staging)
          if (recorded.sha256 !== checksum || recorded.bytes !== bytes)
            throw new Error('IDEMPOTENCY_KEY_REUSED')
        }
        if (offset !== job.receivedBytes) throw new Error('VALIDATION_FAILED')
        await accept()
        const transferReceivedAt = await clock(tx)
        const objectKey = `${job.id}/${offset}-${checksum}`
        await tx.mcpMediaChunk.create({
          data: {
            jobId,
            offset,
            bytes,
            sha256: checksum,
            objectKey,
            executionId: permitId
          }
        })
        await tx.mcpMediaExecution.update({
          where: { id: permitId },
          data: {
            jobId,
            staging: {
              objectKey,
              offset,
              bytes,
              sha256: checksum,
              receivedAt: transferReceivedAt.toISOString()
            }
          }
        })
        await tx.mcpMediaJob.update({
          where: { id: jobId },
          data: { state: 'transferring' }
        })
        return { permitId, data, objectKey, prior: null, duplicate: false }
      },
      true
    )
    if (plan.duplicate) {
      await recoverExecution(plan.permitId)
      if (plan.prior) await recoverExecution(plan.prior)
      return
    }
    await media.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${plan.permitId} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id: plan.permitId }
      })
      if (receipt.status !== 'accepted') denied()
      await tx.mcpMediaExecution.update({
        where: { id: plan.permitId },
        data: { status: 'staging_prepared' }
      })
    })
    await hooks.beforeStagingWrite?.()
    // Recovery can fence staging intents. A writing marker means an external
    // send may have happened and requires storage evidence to settle.
    await media.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${plan.permitId} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id: plan.permitId }
      })
      if (receipt.status !== 'staging_prepared') denied()
      await tx.mcpMediaExecution.update({
        where: { id: plan.permitId },
        data: { status: 'writing' }
      })
    })
    try {
      await media.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${plan.permitId} FOR UPDATE`
          const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
            where: { id: plan.permitId }
          })
          if (receipt.status !== 'writing') denied()
          if ((await storage.put(plan.objectKey, plan.data)) === 'rejected') {
            await tx.mcpMediaExecution.update({
              where: { id: plan.permitId },
              data: { status: 'staging_rejected', completedAt: await clock(tx) }
            })
            return
          }
          await acknowledgeStaging(tx, plan.permitId)
        },
        { timeout: 60000 }
      )
      await recoverExecution(plan.permitId)
    } catch {
      // A lost PUT response can leave an input write running. Confirm the exact
      // immutable object through strong storage reads before settlement/cleanup.
      await reconcileStaging(plan.permitId)
    }
  }
  async function assembled(tx: Transaction, job: McpMediaJob) {
    const chunks = await tx.mcpMediaChunk.findMany({
      where: { jobId: job.id, stored: true },
      orderBy: { offset: 'asc' }
    })
    const parts: Buffer[] = []
    for (const chunk of chunks) {
      const bytes = await storage.get(chunk.objectKey)
      if (bytes.length !== chunk.bytes || imageHash(bytes) !== chunk.sha256)
        throw new Error('VALIDATION_FAILED')
      parts.push(bytes)
    }
    return Buffer.concat(parts)
  }
  async function* stagedInput(
    chunks: Array<{ objectKey: string; bytes: number; sha256: string }>
  ) {
    for (const chunk of chunks) {
      const bytes = await storage.get(chunk.objectKey)
      if (bytes.length !== chunk.bytes || imageHash(bytes) !== chunk.sha256)
        throw new Error('VALIDATION_FAILED')
      yield bytes
    }
  }
  async function videoChunks(tx: Transaction, job: McpMediaJob) {
    const chunks = await tx.mcpMediaChunk.findMany({
      where: { jobId: job.id, stored: true },
      orderBy: { offset: 'asc' }
    })
    let offset = 0
    for (const chunk of chunks) {
      if (chunk.offset !== offset) throw new Error('VALIDATION_FAILED')
      offset += chunk.bytes
    }
    if (offset !== mediaFile.parse(job.file).size)
      throw new Error('VALIDATION_FAILED')
    return chunks
  }
  async function videoSnapshot(tx: Transaction, job: McpMediaJob) {
    const chunks = await videoChunks(tx, job)
    return {
      file: mediaFile.parse(job.file),
      chunks,
      signature: fingerprint([
        job.kind,
        job.file,
        job.providerId,
        job.state,
        job.active,
        job.receivedBytes,
        job.transferCompletedAt,
        job.dispatchReceiptId,
        job.progressionGrantVersion,
        job.progressionPermissionHash,
        chunks
      ])
    }
  }
  async function verifiedVideo(
    context: JobContext,
    jobId: string,
    state: 'validating' | 'dispatch_pending'
  ) {
    const snapshot = await authorized(
      context,
      'transfer',
      async (tx, { accept, grantVersion, permissionHash }) => {
        const job = await lockJob(tx, jobId)
        if (
          job.kind !== 'video_upload' ||
          job.state !== state ||
          !job.active ||
          job.dispatchReceiptId
        )
          throw new Error('VALIDATION_FAILED')
        if (
          job.progressionGrantVersion !== grantVersion ||
          job.progressionPermissionHash !== permissionHash
        )
          denied()
        const snapshot = await videoSnapshot(tx, job)
        await accept()
        return snapshot
      }
    )
    // Storage reads and hashing hold no database transaction or accepted permit.
    // The caller must reauthorize and compare this manifest under the job lock.
    let valid = true
    try {
      await validateVideoInput(stagedInput(snapshot.chunks), snapshot.file)
    } catch (error) {
      if (!(error instanceof InvalidVideoInput)) throw error
      valid = false
    }
    return { ...snapshot, valid }
  }
  async function recheckVideo(
    tx: Transaction,
    job: McpMediaJob,
    verified: Awaited<ReturnType<typeof verifiedVideo>>
  ) {
    if ((await videoSnapshot(tx, job)).signature !== verified.signature)
      throw new Error('VALIDATION_FAILED')
  }
  async function validate(context: JobContext, jobId: string) {
    const known = await own(jobId, context)
    const verified =
      known.kind === 'video_upload' && known.state === 'validating'
        ? await verifiedVideo(context, jobId, 'validating')
        : undefined
    await authorized(
      context,
      'transfer',
      async (tx, { accept, grantVersion, permissionHash }) => {
        const job = await lockJob(tx, jobId)
        if (
          job.progressionGrantVersion !== grantVersion ||
          job.progressionPermissionHash !== permissionHash
        )
          denied()
        if (job.kind === 'video_upload' && job.state === 'validating') {
          if (!verified) throw new Error('VALIDATION_FAILED')
          await recheckVideo(tx, job, verified)
        }
        await accept()
        if (job.state !== 'validating') return
        const file = mediaFile.parse(job.file)
        const bytes =
          job.kind === 'video_upload' ? undefined : await assembled(tx, job)
        try {
          if (job.kind === 'video_upload' && !verified?.valid)
            throw new InvalidVideoInput('VALIDATION_FAILED')
          const metadata =
            job.kind === 'video_upload'
              ? { kind: 'video' }
              : await validateImageInput(bytes!, file)
          await tx.mcpMediaJob.update({
            where: { id: job.id },
            data: { state: 'dispatch_pending', metadata }
          })
        } catch (error) {
          if (
            job.kind === 'video_upload' &&
            !(error instanceof InvalidVideoInput)
          )
            throw error
          if (job.kind === 'video_upload') {
            // Reject under lock to fence writes and progression. Keep capacity
            // until staging is removed outside the transaction.
            await tx.mcpMediaJob.update({
              where: { id: job.id },
              data: { state: 'failed' }
            })
          } else await terminalJob(tx, job, 'failed')
        }
      }
    )
    if (known.kind === 'video_upload') await finishVideoCleanup(jobId)
  }
  async function dispatch(context: JobContext, jobId: string) {
    const known = await own(jobId, context)
    const verified =
      known.kind === 'video_upload'
        ? await verifiedVideo(context, jobId, 'dispatch_pending')
        : undefined
    if (verified && !verified.valid)
      throw new InvalidVideoInput('VALIDATION_FAILED')
    const {
      permitId: receiptId,
      bytes,
      mime,
      chunks,
      size,
      kind,
      providerId,
      prompt
    } = await authorized(
      context,
      'dispatch',
      async (tx, { permitId, accept, grantVersion, permissionHash }) => {
        await tx.$queryRaw`SELECT "userId" FROM "McpMediaUser" WHERE "userId" = ${context.userId} FOR UPDATE`
        const job = await lockJob(tx, jobId)
        if (job.state !== 'dispatch_pending' || job.dispatchReceiptId)
          throw new Error('VALIDATION_FAILED')
        if (
          job.progressionGrantVersion !== grantVersion ||
          job.progressionPermissionHash !== permissionHash
        )
          denied()
        const generating = job.kind === 'image_generation'
        if (generating && (!generation || !job.generationPrompt)) denied()
        const file = generating ? undefined : mediaFile.parse(job.file)
        const video = job.kind === 'video_upload'
        if (verified) await recheckVideo(tx, job, verified)
        const chunks = verified?.chunks ?? []
        const bytes = generating || video ? undefined : await assembled(tx, job)
        await accept()
        if (video)
          await tx.muxVideo.upsert({
            where: { id: job.providerId },
            create: {
              id: job.providerId,
              userId: job.userId,
              teamId: job.teamId
            },
            update: {}
          })
        await tx.mcpMediaExecution.update({
          where: { id: permitId },
          data: { jobId }
        })
        await tx.mcpMediaJob.update({
          where: { id: jobId },
          data: { dispatchReceiptId: permitId }
        })
        return {
          permitId,
          bytes,
          mime: file?.mime ?? 'image/jpeg',
          chunks,
          size: file?.size ?? 0,
          kind: job.kind,
          providerId: job.providerId,
          prompt: job.generationPrompt
        }
      }
    )
    try {
      await hooks.beforeSend?.()
      // Durable sending marker precedes the only POST. Every delayed executor
      // takes this receipt lock and checks its state again before touching HTTP.
      const sending = await media.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${receiptId} FOR UPDATE`
        const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
          where: { id: receiptId }
        })
        if (receipt.status !== 'accepted') denied()
        await tx.$queryRaw`SELECT "userId" FROM "McpMediaUser" WHERE "userId" = ${context.userId} FOR UPDATE`
        const job = await lockJob(tx, jobId)
        if (job.dispatchReceiptId !== receiptId || !job.active) denied()
        if (job.state === 'cancel_requested') {
          await tx.mcpMediaExecution.update({
            where: { id: receiptId },
            data: { status: 'fenced', completedAt: await clock(tx) }
          })
          await tx.mcpMediaJob.update({
            where: { id: jobId },
            data: { dispatchReceiptId: null }
          })
          await terminalJob(tx, job, 'cancelled')
          return false
        }
        if (job.state !== 'dispatch_pending') denied()
        if (job.kind === 'image_generation') {
          // Admission already owns the user's sole active generation slot.
          // Count only the durable send boundary, including uncertain sends.
          const now = await checkGenerationUsage(tx, context.userId)
          await tx.mcpMediaJob.update({
            where: { id: jobId },
            data: { dispatchedAt: now, generationPrompt: null }
          })
        }
        await tx.mcpMediaExecution.update({
          where: { id: receiptId },
          data: { status: 'sending' }
        })
        await tx.mcpMediaJob.update({
          where: { id: jobId },
          data: {
            state: kind === 'video_upload' ? 'reconciling' : 'processing'
          }
        })
        return true
      })
      if (!sending) {
        if (kind === 'video_upload') await finishVideoCleanup(jobId)
        await settle(receiptId)
        return
      }
    } catch (error) {
      await recoverExecution(receiptId)
      throw error
    }
    // Only the executor that committed accepted -> sending may contact the
    // provider. Recovery observes this same identity while the request is open.
    let outcome: 'rejected' | 'processing' | 'ready' | void | 'unknown'
    try {
      if (kind === 'video_upload')
        outcome = await videoProvider!.dispatch(
          providerId,
          stagedInput(chunks),
          size
        )
      else if (kind === 'image_generation')
        outcome = await generation!.dispatch(providerId, prompt!)
      else outcome = await provider.dispatch(providerId, bytes!, mime)
      await hooks.afterSend?.()
    } catch {
      outcome = 'unknown'
    }
    const acknowledged = await media.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${receiptId} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
      const job = await lockJob(tx, jobId)
      if (
        receipt.status !== 'sending' ||
        job.dispatchReceiptId !== receiptId ||
        !job.active
      )
        return false
      // A callback or cancellation can advance the job during the send.
      if (
        (outcome === 'unknown' || outcome === 'rejected') &&
        job.state === 'processing'
      )
        await tx.mcpMediaJob.update({
          where: { id: jobId },
          data: { state: 'reconciling' }
        })
      if (outcome === 'unknown') return false
      await tx.mcpMediaExecution.update({
        where: { id: receiptId },
        data: {
          status: outcome === 'rejected' ? 'rejected' : 'settled',
          completedAt: await clock(tx)
        }
      })
      return outcome !== 'rejected'
    })
    if (acknowledged) await settle(receiptId)
    await reconcileJob(jobId, true)
  }
  async function reserveGenerationObservation(
    jobId: string,
    immediate: boolean
  ) {
    return media.$transaction(async (tx) => {
      const job = await lockJob(tx, jobId)
      if (!job.active) return false
      const now = await clock(tx)
      if (
        job.state === 'processing' &&
        job.dispatchedAt &&
        job.dispatchedAt.getTime() +
          (config.generationObservationMs ?? 15 * 60 * 1000) <=
          now.getTime()
      )
        await tx.mcpMediaJob.update({
          where: { id: jobId },
          data: { state: 'reconciling' }
        })
      const prior = generationPoll.safeParse(job.metadata)
      if (!immediate && prior.success && prior.data.nextAt > now.getTime())
        return false
      const attempt = prior.success ? prior.data.attempt : 0
      const delay = Math.min(
        300000,
        (config.generationPollIntervalMs ?? 10000) * 2 ** Math.min(attempt, 8)
      )
      await tx.mcpMediaJob.update({
        where: { id: jobId },
        data: {
          metadata: {
            attempt: Math.min(32, attempt + 1),
            nextAt: now.getTime() + delay
          }
        }
      })
      return true
    })
  }
  async function reconcileJob(
    jobId: string,
    immediate = false,
    cancel = false
  ) {
    const known = await media.mcpMediaJob.findUniqueOrThrow({
      where: { id: jobId }
    })
    if (!known.dispatchReceiptId || !known.active) return
    const execution = await media.mcpMediaExecution.findUniqueOrThrow({
      where: { id: known.dispatchReceiptId }
    })
    if (
      known.kind === 'video_upload' &&
      videoCleanupStates.has(execution.status)
    ) {
      await finishVideoCleanup(jobId, execution.id)
      return
    }
    if (
      known.kind === 'image_generation' &&
      execution.status !== 'rejected' &&
      !(await reserveGenerationObservation(jobId, immediate))
    )
      return
    const videoStatus: VideoUploadStatus | undefined =
      known.kind === 'video_upload' && execution.status !== 'rejected'
        ? await videoProvider
            ?.status(
              known.providerId,
              cancel || known.state === 'cancel_requested'
            )
            .catch(() => ({ state: 'unknown' as const }))
        : undefined
    const status =
      execution.status === 'rejected'
        ? 'rejected'
        : known.kind === 'video_upload'
          ? (videoStatus?.state ?? 'unknown')
          : known.kind === 'image_generation'
            ? ((await generation
                ?.status(known.providerId)
                .catch(() => 'unknown' as const)) ?? 'unknown')
            : await provider
                .status(known.providerId)
                .catch(() => 'unknown' as const)
    if (status === 'unknown') {
      if (
        known.kind === 'video_upload' &&
        execution.createdAt.getTime() + 6 * 3600000 <= Date.now()
      )
        await media.mcpMediaJob.updateMany({
          where: {
            id: jobId,
            active: true,
            state: { in: ['processing', 'provider_allocated'] }
          },
          data: { state: 'reconciling' }
        })
      if (known.kind === 'image_generation') {
        await media.mcpMediaJob.updateMany({
          where: {
            id: jobId,
            active: true,
            state: 'processing',
            dispatchedAt: {
              lte: new Date(
                Date.now() - (config.generationObservationMs ?? 15 * 60 * 1000)
              )
            }
          },
          data: { state: 'reconciling' }
        })
      }
      return
    }
    const settled = await media.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${known.dispatchReceiptId} FOR UPDATE`
        const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
          where: { id: known.dispatchReceiptId! }
        })
        if (!['sending', 'settled', 'rejected'].includes(receipt.status))
          return false
        const job = await lockJob(tx, jobId)
        if (!job.active) return false
        if (status === 'rejected') {
          if (receipt.status !== 'rejected') return false
          // The durable rejection survives failed cleanup and worker restarts.
          // Capacity and withdrawal stay pending until private input is removed.
          if (job.kind === 'video_upload') {
            await recordVideoCleanup(tx, job, 'failed')
            return false
          }
          if (!(await terminalJob(tx, job, 'failed'))) return false
          await tx.mcpMediaExecution.update({
            where: { id: receipt.id },
            data: { status: 'settled', completedAt: await clock(tx) }
          })
          return true
        }
        if (status === 'allocated') {
          if (
            job.state === 'provider_allocated' ||
            (job.state === 'reconciling' &&
              receipt.createdAt.getTime() + 6 * 3600000 > Date.now())
          )
            await tx.mcpMediaJob.update({
              where: { id: jobId },
              data: { state: 'provider_allocated' }
            })
          return false
        }
        if (status === 'failed' || status === 'cancelled') {
          if (job.kind === 'video_upload') {
            await recordVideoCleanup(tx, job, status)
            return false
          }
          if (!(await terminalJob(tx, job, status))) return false
          await tx.mcpMediaExecution.update({
            where: { id: receipt.id },
            data: { status: 'settled', completedAt: await clock(tx) }
          })
          return true
        }
        await tx.mcpMediaExecution.update({
          where: { id: receipt.id },
          data: { status: 'settled', completedAt: await clock(tx) }
        })
        if (status === 'processing') {
          if (job.state !== 'cancel_requested')
            await tx.mcpMediaJob.update({
              where: { id: jobId },
              data: {
                state:
                  (job.kind === 'video_upload' &&
                    execution.createdAt.getTime() + 6 * 3600000 <=
                      Date.now()) ||
                  (job.kind === 'image_generation' &&
                    job.dispatchedAt &&
                    job.dispatchedAt.getTime() +
                      (config.generationObservationMs ?? 15 * 60 * 1000) <=
                      Date.now())
                    ? 'reconciling'
                    : 'processing'
              }
            })
          return true
        }
        if (videoStatus?.state === 'ready') {
          await tx.muxVideo.update({
            where: { id: job.providerId },
            data: {
              assetId: videoStatus.assetId,
              playbackId: videoStatus.playbackId,
              duration: videoStatus.duration,
              readyToStream: true
            }
          })
          await recordVideoCleanup(tx, job, 'ready')
          return false
        }
        const metadata =
          known.kind === 'image_generation'
            ? generatedImageMetadata.parse(
                typeof status === 'object' ? status.metadata : undefined
              )
            : z
                .object({
                  width: z.number(),
                  height: z.number(),
                  blurhash: z.string()
                })
                .parse(job.metadata)
        await tx.cloudflareImage.upsert({
          where: { id: job.providerId },
          create: {
            id: job.providerId,
            userId: job.userId,
            teamId: job.teamId,
            uploaded: true,
            blurhash: metadata.blurhash,
            isAi: job.kind === 'image_generation'
          },
          update: { uploaded: true, blurhash: metadata.blurhash }
        })
        await terminalJob(tx, job, 'ready')
        return true
      },
      { timeout: 60000 }
    )
    if (known.kind === 'video_upload')
      await finishVideoCleanup(jobId, known.dispatchReceiptId)
    if (settled) await settle(known.dispatchReceiptId)
  }
  async function cancel(context: JobContext, jobId: string, key: string) {
    await own(jobId, context)
    let cleanupVideo = false
    const outcome = await authorized(
      context,
      'cancel',
      async (tx, { accept }) => {
        await tx.mcpMediaUser.upsert({
          where: { userId: context.userId },
          create: { userId: context.userId },
          update: {}
        })
        await tx.$queryRaw`SELECT "userId" FROM "McpMediaUser" WHERE "userId" = ${context.userId} FOR UPDATE`
        const prior = await tx.mcpMediaCancellation.findUnique({
          where: {
            connectionId_key: { connectionId: context.connectionId, key }
          }
        })
        if (prior) {
          if (prior.jobId !== jobId) throw new Error('IDEMPOTENCY_KEY_REUSED')
          const job = await lockJob(tx, jobId)
          await accept()
          cleanupVideo =
            needsUnsentVideoCleanup(job) && job.state === 'cancelled'
          if (!prior.outcome || prior.resultExpiresAt <= (await clock(tx)))
            return { code: 'RESULT_EXPIRED' }
          return prior.outcome
        }
        if (
          await tx.mcpMediaJob.findUnique({
            where: {
              connectionId_key: { connectionId: context.connectionId, key }
            }
          })
        )
          throw new Error('IDEMPOTENCY_KEY_REUSED')
        const job = await lockJob(tx, jobId)
        await accept()
        if (
          !terminal.includes(job.state) &&
          (job.dispatchReceiptId ||
            (await tx.mcpMediaChunk.count({ where: { jobId, stored: false } })))
        ) {
          await tx.mcpMediaJob.update({
            where: { id: jobId },
            data: { state: 'cancel_requested' }
          })
        } else if (!terminal.includes(job.state))
          await terminalJob(tx, job, 'cancelled')
        const current = await tx.mcpMediaJob.findUniqueOrThrow({
          where: { id: jobId }
        })
        cleanupVideo =
          needsUnsentVideoCleanup(current) && current.state === 'cancelled'
        const now = await clock(tx)
        const outcome = { state: current.state, completedAt: now.toISOString() }
        await tx.mcpMediaCancellation.create({
          data: {
            connectionId: context.connectionId,
            key,
            jobId,
            outcome,
            completedAt: now,
            resultExpiresAt: new Date(now.getTime() + resultLifetime)
          }
        })
        return outcome
      }
    )
    if (cleanupVideo) await finishVideoCleanup(jobId)
    return outcome
  }
  async function recover() {
    let after: string | undefined
    while (true) {
      const executions = await media.mcpMediaExecution.findMany({
        where: { reportedAt: null, ...(after ? { id: { gt: after } } : {}) },
        take: 100,
        orderBy: { id: 'asc' }
      })
      if (!executions.length) break
      after = executions[executions.length - 1].id
      for (const receipt of executions)
        await recoverExecution(receipt.id, 'background').catch(() => undefined)
    }
    after = undefined
    while (true) {
      const jobs: McpMediaJob[] = await media.mcpMediaJob.findMany({
        where: {
          privatePurgedAt: null,
          ...(after ? { id: { gt: after } } : {})
        },
        take: 100,
        orderBy: { id: 'asc' }
      })
      if (!jobs.length) break
      after = jobs[jobs.length - 1].id
      const lifecycle = z
        .object({
          connections: z.array(
            z.object({
              id: z.string(),
              accountRetired: z.boolean(),
              revoked: z.boolean().default(false)
            })
          )
        })
        .parse(
          await authority('lifecycle', {
            connectionIds: [...new Set(jobs.map((job) => job.connectionId))]
          })
        )
      for (const job of jobs) {
        const connection = lifecycle.connections.find(
          (connection) => connection.id === job.connectionId
        )
        const retired = connection?.accountRetired === true
        const revoked = connection?.revoked === true
        // Revocation cancels only unsent work. Uncertain writes and dispatch
        // receipts still prevent cleanup until positively reconciled or fenced.
        if (needsUnsentVideoCleanup(job))
          await finishVideoCleanup(job.id).catch(() => undefined)
        else if (job.dispatchReceiptId)
          await reconcileJob(job.id, false, retired || revoked).catch(
            () => undefined
          )
        else if (
          job.active &&
          (retired ||
            revoked ||
            job.state === 'cancel_requested' ||
            (!job.transferCompletedAt && job.transferDeadline <= new Date()))
        ) {
          const stopped = await media
            .$transaction(async (tx) => {
              const current = await lockJob(tx, job.id)
              if (
                !current.active ||
                current.dispatchReceiptId ||
                needsUnsentVideoCleanup(current)
              )
                return
              const transferExpired =
                !current.transferCompletedAt &&
                current.transferDeadline <= (await clock(tx))
              const cancelUnsent =
                retired ||
                current.state === 'cancel_requested' ||
                (revoked && !transferExpired)
              if (!cancelUnsent && !transferExpired) return
              return terminalJob(
                tx,
                current,
                cancelUnsent ? 'cancelled' : 'transfer_expired'
              )
            })
            .catch(() => undefined)
          if (stopped && job.kind === 'video_upload')
            await finishVideoCleanup(job.id).catch(() => undefined)
        }
        if (retired)
          await media.mcpMediaCancellation.updateMany({
            where: { connectionId: job.connectionId },
            data: { outcome: Prisma.DbNull }
          })
        if (retired)
          await media.mcpMediaJob.updateMany({
            where: { id: job.id, active: false },
            data: {
              file: Prisma.DbNull,
              metadata: Prisma.DbNull,
              privatePurgedAt: new Date()
            }
          })
      }
    }
    await media.mcpMediaJob.updateMany({
      where: {
        active: false,
        privatePurgedAt: null,
        resultExpiresAt: { lte: new Date() }
      },
      data: {
        file: Prisma.DbNull,
        metadata: Prisma.DbNull,
        privatePurgedAt: new Date()
      }
    })
    await media.mcpMediaCancellation.updateMany({
      where: { resultExpiresAt: { lte: new Date() } },
      data: { outcome: Prisma.DbNull }
    })
  }
  async function processCompletedTransfers() {
    // Recover only within the authorized grant and permission generations.
    // An interruption requires explicit same-job resume, even if no worker ran.
    let after: string | undefined
    while (true) {
      const jobs: McpMediaJob[] = await media.mcpMediaJob.findMany({
        where: {
          active: true,
          dispatchReceiptId: null,
          state: { in: ['validating', 'dispatch_pending'] },
          ...(after ? { id: { gt: after } } : {})
        },
        take: 100,
        orderBy: { id: 'asc' }
      })
      if (!jobs.length) return
      after = jobs[jobs.length - 1].id
      for (const job of jobs) {
        const context = {
          userId: job.userId,
          connectionId: job.connectionId,
          journeyId: job.journeyId
        }
        await progress(context, job).catch(() => undefined)
      }
    }
  }
  async function resume(
    context: JobContext,
    jobId: string,
    options: { deferProcessing?: boolean } = {}
  ) {
    if (!options.deferProcessing) await result(context, jobId)
    const current = await own(jobId, context)
    if (
      (['validating', 'dispatch_pending'].includes(current.state) &&
        !current.dispatchReceiptId) ||
      (options.deferProcessing &&
        current.kind === 'image_generation' &&
        current.active &&
        current.dispatchReceiptId)
    )
      await authorized(
        context,
        'transfer',
        async (tx, { accept, grantVersion, permissionHash }) => {
          const job = await lockJob(tx, jobId)
          await accept()
          if (
            options.deferProcessing &&
            job.kind === 'image_generation' &&
            job.active &&
            job.dispatchReceiptId
          ) {
            const poll = generationPoll.safeParse(job.metadata)
            await tx.mcpMediaJob.update({
              where: { id: jobId },
              data: {
                metadata: {
                  attempt: poll.success ? poll.data.attempt : 0,
                  nextAt: (await clock(tx)).getTime()
                }
              }
            })
            return
          }
          if (
            !['validating', 'dispatch_pending'].includes(job.state) ||
            job.dispatchReceiptId
          )
            return
          await tx.mcpMediaJob.update({
            where: { id: jobId },
            data: {
              progressionGrantVersion: grantVersion,
              progressionPermissionHash: permissionHash
            }
          })
        }
      )
    if (!options.deferProcessing)
      await progress(context, await own(jobId, context))
  }
  async function progress(context: JobContext, job: McpMediaJob) {
    const jobId = job.id
    if (job.state === 'validating') await validate(context, jobId)
    const current = await own(jobId, context)
    if (current.state === 'dispatch_pending' && !current.dispatchReceiptId)
      await dispatch(context, jobId)
    else if (current.dispatchReceiptId) await reconcileJob(jobId, true)
  }
  function fromClaims(claims: ReadCredential, journeyId: string): JobContext {
    if (
      claims.mode !== 'edit' ||
      claims.scope !== 'journeys:edit' ||
      !claims.journeyIds.includes(journeyId)
    )
      denied()
    return {
      userId: claims.subject,
      connectionId: claims.connectionId,
      journeyId,
      grantVersion: claims.grantVersion
    }
  }
  async function holdOutput(context: JobContext, jobId: string) {
    return (await resultForOutput(context, jobId)).permitId
  }
  async function closeOutput(id: string) {
    await media.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${id} FOR UPDATE`
      await tx.mcpMediaExecution.updateMany({
        where: { id, status: 'output' },
        data: { status: 'settled', completedAt: await clock(tx) }
      })
    })
    await recoverExecution(id)
  }
  return {
    async callback(providerId: string) {
      const job = await media.mcpMediaJob.findUnique({ where: { providerId } })
      if (job?.kind === 'video_upload' && job.dispatchReceiptId)
        await reconcileJob(job.id)
    },
    holdOutput,
    closeOutput,
    admit,
    result,
    resultForOutput,
    bind,
    chunk,
    validate,
    dispatch,
    cancel,
    recover,
    processCompletedTransfers,
    recoverExecution,
    reconcileJob,
    resume,
    own,
    ticketContext,
    fromClaims
  }
}
export type MediaJobs = ReturnType<typeof createMediaJobs>
