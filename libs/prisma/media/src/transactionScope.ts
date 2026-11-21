import { AsyncLocalStorage } from 'node:async_hooks'

import type { Prisma } from './__generated__/client/client'

export const mediaTransactionScope =
  new AsyncLocalStorage<Prisma.TransactionClient>()
export type MediaWriteGuard = <T>(
  intent: unknown,
  operation: () => Promise<T>,
  options?: MediaTransactionOptions
) => Promise<T>
export interface MediaTransactionOptions {
  maxWait?: number
  timeout?: number
  isolationLevel?: Prisma.TransactionIsolationLevel
}
let writeGuard: MediaWriteGuard | undefined
export function configureMediaWriteGuard(guard: MediaWriteGuard): void {
  writeGuard = guard
}
export function getMediaWriteGuard(): MediaWriteGuard | undefined {
  return writeGuard
}
/** A coordinated deletion cannot commit while a provider outcome is unknown. */
export function rethrowCoordinatedMediaFailure(error: unknown): void {
  if (mediaTransactionScope.getStore()) throw error
}
