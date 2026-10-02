import { prisma } from '@core/prisma/media/client'

// Arbitrary, fixed: every api-media task uses the same advisory lock key.
const WORKER_BINDINGS_LOCK_KEY = 4820193377
const LOCK_TIMEOUT_MS = 60_000

/**
 * Changing the Worker's bindings is read-modify-write over the whole binding
 * list, and several api-media tasks run at once: two concurrent setups would
 * each write the list without the other's binding. A Postgres advisory lock,
 * held for the transaction, serialises them across tasks.
 */
export async function withWorkerBindingsLock<Result>(
  operation: () => Promise<Result>
): Promise<Result> {
  return await prisma.$transaction(
    async (tx) => {
      // cast to text: the driver cannot deserialise the function's void result
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(${WORKER_BINDINGS_LOCK_KEY}::bigint)::text`
      return await operation()
    },
    { maxWait: LOCK_TIMEOUT_MS, timeout: LOCK_TIMEOUT_MS }
  )
}
