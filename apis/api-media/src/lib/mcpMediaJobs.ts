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
  imageByteLimit,
  mediaFile,
  transferLifetimeMs,
  uploadChunkBytes
} from '@core/yoga/mcp/mediaJobContract'
import {
  type ReadCredential,
  fingerprint,
  postJson,
  sameSecret
} from '@core/yoga/mcp/readContract'

import { imageHash, validateImageInput } from './mcpImageInput'
import type { ImageUploadProvider } from './mcpImageProvider'
import type { UploadStorage } from './mcpUploadStorage'

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
}
type Action = 'admit' | 'transfer' | 'dispatch' | 'cancel' | 'release'
type Transaction = Prisma.TransactionClient
const resultLifetime = 30 * 86400000
// Allow the bounded execution (up to 65s plus lock acquisition) to start.
const backgroundFenceDelayMs = 120_000
const terminal = ['ready', 'failed', 'cancelled', 'transfer_expired']
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
  } = {}
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
        grantVersion: z.number()
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
    await media.mcpMediaExecution.create({ data: { id: prepared.permitId } })
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
          )
            denied()
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
    await tx.$queryRaw`SELECT id FROM "McpMediaJob" WHERE id = ${id} FOR UPDATE`
    return tx.mcpMediaJob.findUniqueOrThrow({ where: { id } })
  }
  async function terminalJob(tx: Transaction, job: McpMediaJob, state: string) {
    if (
      await tx.mcpMediaChunk.count({ where: { jobId: job.id, stored: false } })
    )
      return false
    // Only call while every transfer/dispatch is stopped under the job lock.
    await storage.removeJob(job.id)
    const now = await clock(tx)
    await tx.mcpMediaJob.update({
      where: { id: job.id },
      data: {
        state,
        active: false,
        completedAt: now,
        resultExpiresAt: new Date(now.getTime() + resultLifetime)
      }
    })
    return true
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
      if (receipt.status === 'prepared' || receipt.status === 'accepted') {
        const now = await clock(tx)
        const lastTransition = receipt.completedAt ?? receipt.createdAt
        if (
          mode === 'background' &&
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
    else if (status === 'staging') await reconcileStaging(id)
  }
  async function acknowledgeStaging(tx: Transaction, id: string) {
    const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
      where: { id }
    })
    if (receipt.status !== 'staging' || !receipt.jobId) denied()
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
        if (receipt.status !== 'staging') return false
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
    input: { idempotencyKey: string; kind: 'image_upload'; file?: MediaFile }
  ) {
    return authorized(context, 'admit', async (tx, { clientId, accept }) => {
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
      const active = await tx.mcpMediaJob.count({
        where: {
          userId: context.userId,
          active: true,
          kind: { in: ['image_upload', 'video_upload'] }
        }
      })
      if (active >= config.uploadLimit) throw new Error('LIMIT_EXCEEDED')
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
          file: input.file,
          providerId: randomUUID(),
          admittedAt: now,
          transferDeadline: new Date(now.getTime() + transferLifetimeMs)
        }
      })
      return job.id
    })
  }
  async function result(context: JobContext, jobId: string) {
    await own(jobId, context)
    return authorized(context, 'release', async (tx, { accept }) => {
      const job = await lockJob(tx, jobId)
      await accept()
      const now = await clock(tx)
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
        jobId,
        state: job.state,
        clientId: job.clientId,
        journeyId: job.journeyId,
        admittedAt: job.admittedAt.toISOString(),
        transferDeadline: job.transferDeadline.toISOString(),
        receivedBytes: job.receivedBytes,
        file: job.file,
        active: job.active,
        ...(job.state === 'ready'
          ? {
              asset: { source: 'upload', jobId: job.id, id: job.providerId },
              attachment:
                'Separate current-revision journey_edit required. Successful library assets survive cancellation and content undo.'
            }
          : {}),
        adminLink: new URL(`/mcp/uploads/${job.id}`, config.adminOrigin).href,
        ingressUrl: new URL(`/mcp/uploads/${job.id}`, config.ingressOrigin)
          .href,
        ...(!terminal.includes(job.state) &&
        !job.transferCompletedAt &&
        job.transferDeadline > now
          ? { ingressTicket: signTicket(job) }
          : {})
      }
    })
  }
  async function bind(context: JobContext, jobId: string, input: MediaFile) {
    await own(jobId, context)
    const file = mediaFile.parse(input)
    await authorized(context, 'transfer', async (tx, { accept }) => {
      const job = await lockJob(tx, jobId)
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
    await own(jobId, context)
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
            if (bytes > expectedBytes || offset + bytes > imageByteLimit)
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
        data: { status: 'staging' }
      })
    })
    try {
      await media.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${plan.permitId} FOR UPDATE`
          const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
            where: { id: plan.permitId }
          })
          if (receipt.status !== 'staging') denied()
          await storage.put(plan.objectKey, plan.data)
          await acknowledgeStaging(tx, plan.permitId)
        },
        { timeout: 60000 }
      )
      await settle(plan.permitId)
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
  async function validate(context: JobContext, jobId: string) {
    await own(jobId, context)
    await authorized(context, 'transfer', async (tx, { accept }) => {
      const job = await lockJob(tx, jobId)
      await accept()
      if (job.state !== 'validating') return
      const file = mediaFile.parse(job.file)
      const bytes = await assembled(tx, job)
      try {
        const metadata = await validateImageInput(bytes, file)
        await tx.mcpMediaJob.update({
          where: { id: job.id },
          data: { state: 'dispatch_pending', metadata }
        })
      } catch {
        await terminalJob(tx, job, 'failed')
      }
    })
  }
  async function dispatch(context: JobContext, jobId: string) {
    await own(jobId, context)
    const receiptId = await authorized(
      context,
      'dispatch',
      async (tx, { permitId, accept }) => {
        const job = await lockJob(tx, jobId)
        if (job.state !== 'dispatch_pending' || job.dispatchReceiptId)
          throw new Error('VALIDATION_FAILED')
        await accept()
        await tx.mcpMediaExecution.update({
          where: { id: permitId },
          data: { jobId }
        })
        await tx.mcpMediaJob.update({
          where: { id: jobId },
          data: { dispatchReceiptId: permitId }
        })
        return permitId
      }
    )
    await hooks.beforeSend?.()
    // Durable sending marker precedes the only POST. Every delayed executor
    // takes this receipt lock and checks its state again before touching HTTP.
    await media.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${receiptId} FOR UPDATE`
      const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
      if (receipt.status !== 'accepted') denied()
      await tx.mcpMediaExecution.update({
        where: { id: receiptId },
        data: { status: 'sending' }
      })
      await tx.mcpMediaJob.update({
        where: { id: jobId },
        data: { state: 'processing' }
      })
    })
    try {
      await media.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpMediaExecution" WHERE id = ${receiptId} FOR UPDATE`
          const receipt = await tx.mcpMediaExecution.findUniqueOrThrow({
            where: { id: receiptId }
          })
          if (receipt.status !== 'sending') denied()
          const job = await lockJob(tx, jobId)
          const file = mediaFile.parse(job.file)
          const outcome = await provider.dispatch(
            job.providerId,
            await assembled(tx, job),
            file.mime
          )
          await hooks.afterSend?.()
          await tx.mcpMediaJob.update({
            where: { id: jobId },
            data: {
              state: outcome === 'rejected' ? 'reconciling' : 'processing'
            }
          })
          await tx.mcpMediaExecution.update({
            where: { id: receiptId },
            data: {
              status: outcome === 'rejected' ? 'rejected' : 'settled',
              completedAt: await clock(tx)
            }
          })
        },
        { timeout: 60000 }
      )
      const receipt = await media.mcpMediaExecution.findUniqueOrThrow({
        where: { id: receiptId }
      })
      if (receipt.status === 'settled') await settle(receiptId)
    } catch {
      await media.mcpMediaJob.updateMany({
        where: { id: jobId, active: true },
        data: { state: 'reconciling' }
      })
    }
    await reconcileJob(jobId)
  }
  async function reconcileJob(jobId: string) {
    const known = await media.mcpMediaJob.findUniqueOrThrow({
      where: { id: jobId }
    })
    if (!known.dispatchReceiptId || !known.active) return
    const execution = await media.mcpMediaExecution.findUniqueOrThrow({
      where: { id: known.dispatchReceiptId }
    })
    const status =
      execution.status === 'rejected'
        ? 'rejected'
        : await provider
            .status(known.providerId)
            .catch(() => 'unknown' as const)
    if (status === 'unknown') return
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
          if (!(await terminalJob(tx, job, 'failed'))) return false
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
              data: { state: 'processing' }
            })
          return true
        }
        const metadata = z
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
            isAi: false
          },
          update: { uploaded: true, blurhash: metadata.blurhash }
        })
        await terminalJob(tx, job, 'ready')
        return true
      },
      { timeout: 60000 }
    )
    if (settled) await settle(known.dispatchReceiptId)
  }
  async function cancel(context: JobContext, jobId: string, key: string) {
    await own(jobId, context)
    return authorized(context, 'cancel', async (tx, { accept }) => {
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
        await lockJob(tx, jobId)
        await accept()
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
    })
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
            z.object({ id: z.string(), accountRetired: z.boolean() })
          )
        })
        .parse(
          await authority('lifecycle', {
            connectionIds: [...new Set(jobs.map((job) => job.connectionId))]
          })
        )
      for (const job of jobs) {
        const retired = lifecycle.connections.some(
          (connection) =>
            connection.id === job.connectionId && connection.accountRetired
        )
        if (job.dispatchReceiptId)
          await reconcileJob(job.id).catch(() => undefined)
        else if (
          job.active &&
          (retired ||
            job.state === 'cancel_requested' ||
            (!job.transferCompletedAt && job.transferDeadline <= new Date()))
        )
          await media
            .$transaction(async (tx) => {
              const current = await lockJob(tx, job.id)
              if (
                current.active &&
                !current.dispatchReceiptId &&
                (retired ||
                  current.state === 'cancel_requested' ||
                  (!current.transferCompletedAt &&
                    current.transferDeadline <= (await clock(tx))))
              )
                await terminalJob(
                  tx,
                  current,
                  retired || current.state === 'cancel_requested'
                    ? 'cancelled'
                    : 'transfer_expired'
                )
            })
            .catch(() => undefined)
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
  async function resume(context: JobContext, jobId: string) {
    await result(context, jobId)
    const job = await own(jobId, context)
    if (job.state === 'validating') await validate(context, jobId)
    const current = await own(jobId, context)
    if (current.state === 'dispatch_pending' && !current.dispatchReceiptId)
      await dispatch(context, jobId)
    else if (current.dispatchReceiptId) await reconcileJob(jobId)
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
    await own(jobId, context)
    return authorized(
      context,
      'release',
      async (tx, { permitId, accept }) => {
        await lockJob(tx, jobId)
        await accept()
        return permitId
      },
      'output'
    )
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
    holdOutput,
    closeOutput,
    admit,
    result,
    bind,
    chunk,
    validate,
    dispatch,
    cancel,
    recover,
    recoverExecution,
    reconcileJob,
    resume,
    own,
    ticketContext,
    fromClaims
  }
}
export type MediaJobs = ReturnType<typeof createMediaJobs>
