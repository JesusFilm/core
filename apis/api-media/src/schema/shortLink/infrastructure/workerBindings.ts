// Must run before anything else from `cloudflare` (same reason as config.ts):
// without it the SDK picks its Node runtime and sends a stream, not a form.
import 'cloudflare/shims/web'

import { multipartFormRequestOptions } from 'cloudflare/uploads'
import { Logger } from 'pino'

import { logger as defaultLogger } from '../../../logger'
import { failedPrecondition } from '../lib/errors'

import { InfrastructureConfig } from './config'
import { isOwnedBindingName } from './names'

export interface WorkerBinding {
  name: string
  type: string
  /** set on `kv_namespace` bindings */
  namespace_id?: string
}

interface Envelope<Result> {
  result: Result
}

interface WorkerSettings {
  bindings?: WorkerBinding[]
}

function settingsPath(config: InfrastructureConfig): string {
  return `/accounts/${config.accountId}/workers/scripts/${encodeURIComponent(config.workerName)}/settings`
}

/**
 * The bindings of the deployed Worker. The SDK (4.2.0) has no method for
 * `/settings` (its `workers.scripts.settings` is the unrelated
 * `/script-settings`), so this goes through the client's low-level request.
 * Secret values are never returned, only their names.
 */
export async function getWorkerBindings(
  config: InfrastructureConfig
): Promise<WorkerBinding[]> {
  const settings = await config.client
    .get<unknown, Envelope<WorkerSettings>>(settingsPath(config))
    ._thenUnwrap((envelope) => envelope.result)
  return settings.bindings ?? []
}

/**
 * PATCH replaces the Worker's whole binding list and deploys the result, so
 * every binding that should survive is sent back as `{ type: 'inherit' }`
 * (which keeps secrets without knowing their values). The body is one
 * multipart part named `settings` holding JSON, the same request wrangler's
 * `secret bulk` sends.
 */
async function replaceWorkerBindings(
  config: InfrastructureConfig,
  bindings: Array<WorkerBinding | { type: 'inherit'; name: string }>
): Promise<void> {
  await config.client.patch(
    settingsPath(config),
    await multipartFormRequestOptions({
      body: { settings: JSON.stringify({ bindings }) },
      // a retried PATCH could race the read it was computed from
      maxRetries: 0
    })
  )
}

function inherit(binding: WorkerBinding): { type: 'inherit'; name: string } {
  return { type: 'inherit', name: binding.name }
}

/**
 * Re-reads the bindings after a change and fails loudly when anything that
 * should have been kept is gone: the replace semantics of the endpoint are the
 * one thing that cannot be proven without the real API, and a silent loss here
 * would take the Worker's secrets or its D1 / queue bindings with it.
 */
async function assertBindingsKept(
  config: InfrastructureConfig,
  before: WorkerBinding[],
  changedNames: string[],
  logger: Logger
): Promise<WorkerBinding[]> {
  const after = await getWorkerBindings(config)
  const lost = before.filter(
    ({ name, type }) =>
      !changedNames.includes(name) &&
      !after.some((binding) => binding.name === name && binding.type === type)
  )
  if (lost.length > 0) {
    logger.error(
      { workerName: config.workerName, before, after, lost },
      'short link infrastructure: Worker bindings were lost'
    )
    throw new Error(
      `Cloudflare dropped the Worker bindings ${lost.map(({ name }) => name).join(', ')} while changing ${changedNames.join(', ')}. Redeploy ${config.workerName} to restore them.`
    )
  }
  return after
}

/** Adds (or repoints) the `kv_namespace` binding `name`. Call inside `withWorkerBindingsLock`. */
export async function setWorkerKvBinding(
  config: InfrastructureConfig,
  name: string,
  namespaceId: string,
  logger: Logger = defaultLogger
): Promise<void> {
  if (!isOwnedBindingName(name))
    throw failedPrecondition(`${name} is not a KV_* binding name`)

  const before = await getWorkerBindings(config)
  const current = before.find((binding) => binding.name === name)
  if (current != null && current.type !== 'kv_namespace')
    throw failedPrecondition(
      `${config.workerName} already has a ${current.type} binding named ${name}`
    )
  if (current?.namespace_id === namespaceId) return

  await replaceWorkerBindings(config, [
    ...before.filter((binding) => binding.name !== name).map(inherit),
    { type: 'kv_namespace', name, namespace_id: namespaceId }
  ])

  const after = await assertBindingsKept(config, before, [name], logger)
  const added = after.find((binding) => binding.name === name)
  if (added?.namespace_id !== namespaceId)
    throw new Error(
      `Cloudflare accepted the change but ${config.workerName} has no ${name} binding for namespace ${namespaceId}`
    )
  logger.info(
    { workerName: config.workerName, binding: name, namespaceId },
    'short link infrastructure: Worker KV binding set'
  )
}

/** Removes the named `KV_*` bindings that exist. Call inside `withWorkerBindingsLock`. */
export async function removeWorkerKvBindings(
  config: InfrastructureConfig,
  selects: (binding: WorkerBinding) => boolean,
  logger: Logger = defaultLogger
): Promise<string[]> {
  const before = await getWorkerBindings(config)
  const removed = before
    .filter(
      (binding) =>
        binding.type === 'kv_namespace' &&
        isOwnedBindingName(binding.name) &&
        selects(binding)
    )
    .map(({ name }) => name)
  if (removed.length === 0) return []

  await replaceWorkerBindings(
    config,
    before.filter(({ name }) => !removed.includes(name)).map(inherit)
  )

  const after = await assertBindingsKept(config, before, removed, logger)
  const remaining = after.filter(({ name }) => removed.includes(name))
  if (remaining.length > 0)
    throw new Error(
      `Cloudflare accepted the change but ${config.workerName} still has ${remaining.map(({ name }) => name).join(', ')}`
    )
  logger.info(
    { workerName: config.workerName, removed },
    'short link infrastructure: Worker KV bindings removed'
  )
  return removed
}
