import {
  createExecutionContext,
  env,
  waitOnExecutionContext
} from 'cloudflare:test'
import { vi } from 'vitest'

import worker from '../src'
import type { Env } from '../src/env'
import type { RedirectEvent } from '../src/event'

export const graphQlEndpoint = 'http://graphql.example.com'

export const bindings = env as unknown as Env

export interface WorkerRequestResult {
  response: Response
  /** Every message the Worker sent to `SHORT_LINKS_EVENTS`. */
  sent: RedirectEvent[]
}

/** Runs one request through the default export and flushes `waitUntil`. */
export async function workerRequest(
  url: string,
  init: RequestInit = {},
  envOverrides: Partial<Env> = {}
): Promise<WorkerRequestResult> {
  const sent: RedirectEvent[] = []
  const send = vi.fn(async (message: RedirectEvent) => {
    sent.push(message)
  })
  const testEnv: Env = {
    ...bindings,
    CORE_GRAPHQL_ENDPOINT: graphQlEndpoint,
    SHORT_LINKS_EVENTS: { send, sendBatch: vi.fn() },
    ...envOverrides
  }
  const ctx = createExecutionContext()
  const response = await worker.fetch(new Request(url, init), testEnv, ctx)
  await waitOnExecutionContext(ctx)
  return { response, sent }
}

/** Puts routing records into a domain namespace, keyed by bare slug. */
export async function seedDomainLinks(
  binding: string,
  records: Record<string, unknown>
): Promise<void> {
  const namespace = bindings[binding] as KVNamespace
  for (const [slug, record] of Object.entries(records)) {
    await namespace.put(slug, JSON.stringify(record))
  }
}

/** Puts records into the global namespace under the given keys. */
export async function seedRecords(
  records: Record<string, unknown>
): Promise<void> {
  for (const [key, record] of Object.entries(records)) {
    await bindings.SHORT_LINKS_KV.put(key, JSON.stringify(record))
  }
}
