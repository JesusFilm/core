import { AsyncLocalStorage } from 'node:async_hooks'

import {
  GraphQLError,
  type GraphQLResolveInfo,
  defaultFieldResolver
} from 'graphql'
import type { Plugin } from 'graphql-yoga'
import { z } from 'zod'

import {
  type MediaTransactionOptions,
  type PrismaClient,
  mediaTransactionScope
} from '@core/prisma/media/client'
import { fingerprint, postJson } from '@core/yoga/mcp/readContract'

interface MutationConfig {
  authorityUrl: string
  authoritySecret: string
}
const active = new AsyncLocalStorage<boolean>()
const terminalMutationStatus = z.enum(['committed', 'fenced'])
const executorLock = 'media:sources:executor'

/** Cooperative source writes use one conservative gate, including worker
 * updates. The owning SQL receipt positively fences a delayed executor. An
 * uncertain external deletion keeps admission closed until its explicit retry.
 */
export function createMediaMutationGuard(
  config: MutationConfig,
  db: PrismaClient
) {
  const authority = async (action: string, body: unknown) =>
    z
      .object({ status: z.string() })
      .parse(
        await postJson(
          new URL(`/internal/permissions/${action}`, config.authorityUrl).href,
          body,
          `Bearer ${config.authoritySecret}`
        )
      )
  const report = async (
    id: string,
    status: z.infer<typeof terminalMutationStatus>
  ) => {
    const result = await authority('complete', {
      changeId: id,
      outcome: status === 'committed' ? 'committed' : 'cancelled'
    })
    if (result.status === 'complete')
      await db.mcpMediaMutation.update({
        where: { id },
        data: { reportedAt: new Date() }
      })
  }
  async function run<T>(
    intent: unknown,
    operation: () => Promise<T>,
    external = false,
    transactionOptions?: MediaTransactionOptions,
    validateSource?: () => Promise<void>
  ): Promise<T> {
    if (active.getStore()) return operation()
    const intentHash = fingerprint(intent)
    // Own the source gate before publishing its receipt. Recovery in any worker must
    // acquire the same lock before it can fence a prepared executor. SQL work
    // still locks and checks the receipt, even if this transaction is lost.
    return db.$transaction(
      async (owner) => {
        const [ownership] = await owner.$queryRaw<{ acquired: boolean }[]>`
          SELECT pg_try_advisory_xact_lock(hashtextextended(${executorLock}, 0)) AS acquired
        `
        if (!ownership.acquired)
          throw new GraphQLError(
            'media source change is pending accepted work',
            {
              extensions: { code: 'PERMISSION_CHANGE_PENDING' }
            }
          )
        await validateSource?.()
        return runOwned(intentHash, operation, external, transactionOptions)
      },
      {
        maxWait: 10000,
        timeout: (transactionOptions?.timeout ?? 120000) + 60000
      }
    )
  }
  async function runOwned<T>(
    intentHash: string,
    operation: () => Promise<T>,
    external: boolean,
    transactionOptions?: MediaTransactionOptions
  ): Promise<T> {
    const prior = await db.mcpMediaMutation.findFirst({
      where: {
        intentHash,
        status: { in: ['prepared', 'prepared_external', 'external'] }
      },
      orderBy: { createdAt: 'asc' }
    })
    const receipt =
      prior ??
      (await db.mcpMediaMutation.create({
        data: {
          intentHash,
          status: external ? 'prepared_external' : 'prepared'
        }
      }))
    const result = await authority('begin', {
      changeId: receipt.id,
      gateIds: ['media:sources'],
      intentHash
    })
    if (result.status !== 'ready')
      throw new GraphQLError('media source change is pending accepted work', {
        extensions: { code: 'PERMISSION_CHANGE_PENDING', changeId: receipt.id }
      })
    if (external) {
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "McpMediaMutation" WHERE id = ${receipt.id} FOR UPDATE`
        const current = await tx.mcpMediaMutation.findUniqueOrThrow({
          where: { id: receipt.id }
        })
        if (!['prepared_external', 'external'].includes(current.status))
          throw new Error('Media mutation fenced')
        await tx.mcpMediaMutation.update({
          where: { id: receipt.id },
          data: { status: 'external' }
        })
      })
    }
    try {
      const value = await db.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpMediaMutation" WHERE id = ${receipt.id} FOR UPDATE`
          const current = await tx.mcpMediaMutation.findUniqueOrThrow({
            where: { id: receipt.id }
          })
          if (current.status !== (external ? 'external' : 'prepared'))
            throw new Error('Media mutation fenced')
          const value = await active.run(true, () =>
            mediaTransactionScope.run(tx, operation)
          )
          await tx.mcpMediaMutation.update({
            where: { id: receipt.id },
            data: { status: 'committed', completedAt: new Date() }
          })
          return value
        },
        { maxWait: 10000, timeout: 120000, ...transactionOptions }
      )
      await report(receipt.id, 'committed')
      return value
    } catch (error) {
      if (!external) {
        await db.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpMediaMutation" WHERE id = ${receipt.id} FOR UPDATE`
          await tx.mcpMediaMutation.updateMany({
            where: { id: receipt.id, status: 'prepared' },
            data: { status: 'fenced', completedAt: new Date() }
          })
        })
        const current = await db.mcpMediaMutation.findUniqueOrThrow({
          where: { id: receipt.id }
        })
        await report(
          receipt.id,
          terminalMutationStatus.parse(current.status)
        ).catch(() => undefined)
      }
      throw error
    }
  }
  async function recover(): Promise<void> {
    const pending = await db.mcpMediaMutation.findMany({
      where: { reportedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 100
    })
    for (const receipt of pending) {
      await db.$transaction(
        async (owner) => {
          const [ownership] = await owner.$queryRaw<{ acquired: boolean }[]>`
            SELECT pg_try_advisory_xact_lock(hashtextextended(${executorLock}, 0)) AS acquired
          `
          if (!ownership.acquired) return
          await db.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "McpMediaMutation" WHERE id = ${receipt.id} FOR UPDATE`
            await tx.mcpMediaMutation.updateMany({
              where: {
                id: receipt.id,
                status: { in: ['prepared', 'prepared_external'] }
              },
              data: { status: 'fenced', completedAt: new Date() }
            })
          })
          const current = await db.mcpMediaMutation.findUniqueOrThrow({
            where: { id: receipt.id }
          })
          if (current.status !== 'external') {
            await authority('begin', {
              changeId: current.id,
              gateIds: ['media:sources'],
              intentHash: current.intentHash
            })
            await report(
              current.id,
              terminalMutationStatus.parse(current.status)
            )
          }
        },
        { maxWait: 10000, timeout: 180000 }
      )
    }
  }
  const wrapped = new WeakSet<object>()
  const plugin: Plugin = {
    onSchemaChange({ schema }) {
      for (const name of [
        'deleteCloudflareImage',
        'deleteMuxVideo',
        'videoDelete',
        'videoVariantDelete'
      ]) {
        const field = schema.getMutationType()?.getFields()[name]
        if (!field || wrapped.has(field)) continue
        wrapped.add(field)
        const original = field.resolve ?? defaultFieldResolver
        field.resolve = async (
          parent: unknown,
          args: Record<string, unknown>,
          context: { user?: { id: string }; currentRoles?: string[] },
          info: GraphQLResolveInfo
        ) => {
          if (!context.user) throw new GraphQLError('Access denied')
          if (
            (name === 'videoDelete' || name === 'videoVariantDelete') &&
            !context.currentRoles?.includes('publisher')
          )
            throw new GraphQLError('Access denied')
          const owner = context.currentRoles?.includes('publisher')
            ? {}
            : { userId: context.user.id }
          const validateSource = async () => {
            const source =
              name === 'deleteCloudflareImage'
                ? await db.cloudflareImage.findFirst({
                    where: { id: String(args.id), ...owner },
                    select: { id: true }
                  })
                : name === 'videoDelete'
                  ? await db.video.findUnique({
                      where: { id: String(args.id) },
                      select: { id: true, publishedAt: true }
                    })
                  : name === 'videoVariantDelete'
                    ? await db.videoVariant.findUnique({
                        where: { id: String(args.id) },
                        select: { id: true }
                      })
                    : await db.muxVideo.findFirst({
                        where: { id: String(args.id), ...owner },
                        select: { id: true }
                      })
            if (!source) throw new GraphQLError('Access denied')
            if (
              name === 'videoDelete' &&
              'publishedAt' in source &&
              source.publishedAt !== null
            )
              throw new GraphQLError('Published video deletion is unavailable')
          }
          await validateSource()
          return run(
            { name, args, actorId: context.user.id },
            async () => original(parent, args, context, info),
            true,
            undefined,
            validateSource
          )
        }
      }
    }
  }
  return { run, recover, plugin }
}
