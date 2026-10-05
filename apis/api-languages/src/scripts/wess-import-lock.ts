import { prisma } from '@core/prisma/languages/client'

/**
 * Cross-process guard so concurrent WESS import requests (GraphQL mutation,
 * separate API replicas, or overlapping CLI processes) do not run in parallel.
 *
 * Uses a PostgreSQL session advisory lock held on one pinned transaction
 * connection while the import body runs on the normal Prisma pool.
 */
const WESS_IMPORT_LOCK_TRANSACTION_TIMEOUT_MS = 60 * 60 * 1000

/** Advisory-lock key namespace (`0x57455353` ≈ ASCII "WESS"). */
const WESS_IMPORT_LOCK_CLASS = 0x57455353
const WESS_IMPORT_LOCK_OBJECT = 1

type AdvisoryLockRow = { pg_try_advisory_lock: boolean }

export class WessImportInProgressError extends Error {
  constructor() {
    super('A WESS import is already in progress')
    this.name = 'WessImportInProgressError'
  }
}

export async function withWessImportLock<T>(fn: () => Promise<T>): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      const rows = await tx.$queryRaw<AdvisoryLockRow[]>`
        SELECT pg_try_advisory_lock(${WESS_IMPORT_LOCK_CLASS}, ${WESS_IMPORT_LOCK_OBJECT})
      `
      if (rows[0]?.pg_try_advisory_lock !== true) {
        throw new WessImportInProgressError()
      }

      try {
        return await fn()
      } finally {
        await tx.$executeRaw`
          SELECT pg_advisory_unlock(${WESS_IMPORT_LOCK_CLASS}, ${WESS_IMPORT_LOCK_OBJECT})
        `
      }
    },
    { timeout: WESS_IMPORT_LOCK_TRANSACTION_TIMEOUT_MS }
  )
}
