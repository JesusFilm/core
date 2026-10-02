import { vi } from 'vitest'

import { InfrastructureConfig } from './config'
import {
  WorkerBinding,
  getWorkerBindings,
  removeWorkerKvBindings,
  setWorkerKvBinding
} from './workerBindings'

const logger = {
  info: vi.fn(),
  error: vi.fn()
} as unknown as import('pino').Logger

const SETTINGS_PATH =
  '/accounts/account/workers/scripts/short-links-redirect-stage/settings'

type SentBinding = WorkerBinding | { type: 'inherit'; name: string }

/**
 * A stand-in for the Cloudflare settings endpoint with the semantics the
 * module assumes: PATCH replaces the list and `inherit` keeps a binding.
 * `dropInherited` simulates those semantics being wrong.
 */
function fakeWorker(
  initial: WorkerBinding[],
  { dropInherited = false }: { dropInherited?: boolean } = {}
) {
  let bindings = [...initial]
  const patches: SentBinding[][] = []

  const get = vi.fn(() => ({
    _thenUnwrap: async <Result>(
      unwrap: (envelope: { result: { bindings: WorkerBinding[] } }) => Result
    ) => unwrap({ result: { bindings } })
  }))
  // the SDK wraps the form in its MultipartBody: `{ body: FormData }`
  const patch = vi.fn(
    async (_path: string, options: { body: { body: FormData } }) => {
      const part = options.body.body.get('settings')
      if (typeof part !== 'string') throw new Error('no settings part')
      const settings = JSON.parse(part) as { bindings: SentBinding[] }
      patches.push(settings.bindings)
      bindings = settings.bindings.flatMap((binding) => {
        if (binding.type !== 'inherit') return [binding]
        const kept = bindings.find(({ name }) => name === binding.name)
        return kept == null || dropInherited ? [] : [kept]
      })
    }
  )

  const config = {
    accountId: 'account',
    workerName: 'short-links-redirect-stage',
    allowedHostnames: [],
    client: { get, patch }
  } as unknown as InfrastructureConfig

  return { config, get, patch, patches, bindings: () => bindings }
}

const deployed: WorkerBinding[] = [
  { name: 'SHORT_LINKS_KV', type: 'kv_namespace', namespace_id: 'global' },
  { name: 'SHORT_LINKS_EVENTS', type: 'queue' },
  { name: 'CLICKHOUSE_PASSWORD', type: 'secret_text' }
]

describe('worker bindings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads the bindings of the deployed Worker', async () => {
    const worker = fakeWorker(deployed)

    expect(await getWorkerBindings(worker.config)).toEqual(deployed)
    expect(worker.get).toHaveBeenCalledWith(SETTINGS_PATH)
  })

  describe('setWorkerKvBinding', () => {
    it('adds the binding and sends every existing one back as inherit', async () => {
      const worker = fakeWorker(deployed)

      await setWorkerKvBinding(worker.config, 'KV_JESUS_FILM', 'ns-1', logger)

      expect(worker.patch).toHaveBeenCalledWith(
        SETTINGS_PATH,
        expect.objectContaining({ maxRetries: 0 })
      )
      expect(worker.patches).toEqual([
        [
          { type: 'inherit', name: 'SHORT_LINKS_KV' },
          { type: 'inherit', name: 'SHORT_LINKS_EVENTS' },
          { type: 'inherit', name: 'CLICKHOUSE_PASSWORD' },
          { type: 'kv_namespace', name: 'KV_JESUS_FILM', namespace_id: 'ns-1' }
        ]
      ])
      expect(worker.bindings()).toEqual([
        ...deployed,
        { type: 'kv_namespace', name: 'KV_JESUS_FILM', namespace_id: 'ns-1' }
      ])
    })

    it('does nothing when the binding already points at the namespace', async () => {
      const worker = fakeWorker([
        ...deployed,
        { name: 'KV_JESUS_FILM', type: 'kv_namespace', namespace_id: 'ns-1' }
      ])

      await setWorkerKvBinding(worker.config, 'KV_JESUS_FILM', 'ns-1', logger)

      expect(worker.patch).not.toHaveBeenCalled()
    })

    it('repoints a binding that names another namespace', async () => {
      const worker = fakeWorker([
        ...deployed,
        { name: 'KV_JESUS_FILM', type: 'kv_namespace', namespace_id: 'old' }
      ])

      await setWorkerKvBinding(worker.config, 'KV_JESUS_FILM', 'ns-1', logger)

      expect(worker.patches[0]).toEqual([
        { type: 'inherit', name: 'SHORT_LINKS_KV' },
        { type: 'inherit', name: 'SHORT_LINKS_EVENTS' },
        { type: 'inherit', name: 'CLICKHOUSE_PASSWORD' },
        { type: 'kv_namespace', name: 'KV_JESUS_FILM', namespace_id: 'ns-1' }
      ])
    })

    it('fails loudly when Cloudflare drops a binding it should have kept', async () => {
      const worker = fakeWorker(deployed, { dropInherited: true })

      await expect(
        setWorkerKvBinding(worker.config, 'KV_JESUS_FILM', 'ns-1', logger)
      ).rejects.toThrow(
        'Cloudflare dropped the Worker bindings SHORT_LINKS_KV, SHORT_LINKS_EVENTS, CLICKHOUSE_PASSWORD while changing KV_JESUS_FILM. Redeploy short-links-redirect-stage to restore them.'
      )
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ before: deployed }),
        'short link infrastructure: Worker bindings were lost'
      )
    })

    it('never writes a binding outside the KV_ names', async () => {
      const worker = fakeWorker(deployed)

      await expect(
        setWorkerKvBinding(worker.config, 'SHORT_LINKS_KV', 'ns-1', logger)
      ).rejects.toThrow('SHORT_LINKS_KV is not a KV_* binding name')
      expect(worker.patch).not.toHaveBeenCalled()
    })

    it('refuses a name already used by a binding of another type', async () => {
      const worker = fakeWorker([
        ...deployed,
        { name: 'KV_SECRET', type: 'secret_text' }
      ])

      await expect(
        setWorkerKvBinding(worker.config, 'KV_SECRET', 'ns-1', logger)
      ).rejects.toThrow(
        'short-links-redirect-stage already has a secret_text binding named KV_SECRET'
      )
    })
  })

  describe('removeWorkerKvBindings', () => {
    it('removes the selected KV_ bindings and keeps everything else', async () => {
      const worker = fakeWorker([
        ...deployed,
        { name: 'KV_JESUS_FILM', type: 'kv_namespace', namespace_id: 'ns-1' },
        { name: 'KV_JESUS_MOVIE', type: 'kv_namespace', namespace_id: 'ns-2' }
      ])

      const removed = await removeWorkerKvBindings(
        worker.config,
        ({ namespace_id: namespaceId }) => namespaceId === 'ns-1',
        logger
      )

      expect(removed).toEqual(['KV_JESUS_FILM'])
      expect(worker.patches).toEqual([
        [
          { type: 'inherit', name: 'SHORT_LINKS_KV' },
          { type: 'inherit', name: 'SHORT_LINKS_EVENTS' },
          { type: 'inherit', name: 'CLICKHOUSE_PASSWORD' },
          { type: 'inherit', name: 'KV_JESUS_MOVIE' }
        ]
      ])
    })

    it('never removes a binding wrangler.toml owns, even when selected', async () => {
      const worker = fakeWorker(deployed)

      expect(
        await removeWorkerKvBindings(worker.config, () => true, logger)
      ).toEqual([])
      expect(worker.patch).not.toHaveBeenCalled()
    })
  })
})
