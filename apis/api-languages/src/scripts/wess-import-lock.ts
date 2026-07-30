/**
 * In-process guard so concurrent WESS import requests (GraphQL mutation or
 * overlapping script invocations in the same Node process) do not run in parallel.
 */
let activeImport: Promise<unknown> | null = null

export class WessImportInProgressError extends Error {
  constructor() {
    super('A WESS import is already in progress')
    this.name = 'WessImportInProgressError'
  }
}

export async function withWessImportLock<T>(fn: () => Promise<T>): Promise<T> {
  if (activeImport != null) {
    throw new WessImportInProgressError()
  }

  const run = fn()
  activeImport = run

  try {
    return await run
  } finally {
    if (activeImport === run) {
      activeImport = null
    }
  }
}
