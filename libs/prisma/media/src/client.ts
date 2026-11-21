import { randomUUID } from 'node:crypto'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './__generated__/client/client'
import {
  type MediaTransactionOptions,
  getMediaWriteGuard,
  mediaTransactionScope
} from './transactionScope'
import type { Prisma } from './__generated__/client/client'

const globalForPrisma = global as unknown as { prismaMedia: PrismaClient }

const adapter = new PrismaPg({
  connectionString: process.env['PG_DATABASE_URL_MEDIA']!,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000
})

export * from './__generated__/client/client'
const root =
  globalForPrisma.prismaMedia ??
  (globalForPrisma.prismaMedia = new PrismaClient({ adapter }))
export const mediaRootClient = root

const writes = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
  'delete',
  'deleteMany'
])
export function transactionScopedMediaClient(
  client: PrismaClient
): PrismaClient {
  return new Proxy(client, {
    get(target, property) {
      const tx = mediaTransactionScope.getStore()
      if (tx && property === '$transaction')
        return (operation: unknown) =>
          typeof operation === 'function'
            ? operation(tx)
            : Promise.all(operation as Promise<unknown>[])
      const current = tx ?? target,
        value: unknown = Reflect.get(current, property)
      if (
        typeof property === 'string' &&
        [
          'cloudflareImage',
          'muxVideo',
          'muxSubtitleTrack',
          'video',
          'videoVariant',
          'videoEdition'
        ].includes(property) &&
        value &&
        typeof value === 'object'
      ) {
        return new Proxy(value, {
          get(model, method) {
            const member: unknown = Reflect.get(model, method)
            if (typeof member !== 'function') return member
            return (...args: unknown[]) => {
              if (
                typeof method === 'string' &&
                writes.has(method) &&
                !mediaTransactionScope.getStore()
              ) {
                const guard = getMediaWriteGuard()
                if (guard)
                  return guard(
                    { model: property, operation: method, args },
                    async () => {
                      const scoped = mediaTransactionScope.getStore()!
                      const delegate = Reflect.get(scoped, property) as object
                      return Reflect.apply(
                        Reflect.get(delegate, method) as (
                          ...values: unknown[]
                        ) => unknown,
                        delegate,
                        args
                      )
                    }
                  )
                if (process.env.MCP_MEDIA_ENABLED === 'true')
                  throw new Error('Media mutation coordinator unavailable')
              }
              return Reflect.apply(member, model, args)
            }
          }
        })
      }
      return typeof value === 'function' ? value.bind(current) : value
    }
  })
}
/** Source-changing transactions opt in; unrelated media transactions retain
 * their existing behavior and do not acquire the source gate.
 */
export async function sourceTransaction<T>(
  client: PrismaClient,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  options?: MediaTransactionOptions
): Promise<T> {
  const scoped = mediaTransactionScope.getStore()
  if (scoped) return operation(scoped)
  const guard = getMediaWriteGuard()
  if (guard)
    return guard(
      { transaction: randomUUID() },
      async () => operation(mediaTransactionScope.getStore()!),
      options
    )
  if (process.env.MCP_MEDIA_ENABLED === 'true')
    throw new Error('Media mutation coordinator unavailable')
  return client.$transaction(operation, options)
}
export const prisma = transactionScopedMediaClient(root)
export {
  type MediaTransactionOptions,
  mediaTransactionScope,
  configureMediaWriteGuard
} from './transactionScope'
