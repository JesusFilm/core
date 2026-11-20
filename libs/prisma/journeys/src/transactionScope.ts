import { AsyncLocalStorage } from 'node:async_hooks'

import type { Prisma } from './__generated__/client/client'

export const journeyTransactionScope =
  new AsyncLocalStorage<Prisma.TransactionClient>()

export const journeyAfterCommitScope = new AsyncLocalStorage<
  Array<() => Promise<void>>
>()

/** Existing after-commit effects must wait for the outer permission receipt. */
export function deferJourneyTransactionEffect(
  effect: () => Promise<void>
): boolean {
  const pending = journeyAfterCommitScope.getStore()
  if (!pending) return false
  pending.push(effect)
  return true
}
