import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import { buildShortLinkDomain } from '../../../../test/shortLinkFixtures'
import { getEdgeConfig, publishDomain, publishDomainWithLinks } from '../edge'

import {
  Attachment,
  createAttachment,
  deleteAttachment,
  listAttachments
} from './attachments'
import { InfrastructureConfig, requireInfrastructureConfig } from './config'
import {
  createNamespace,
  findNamespaceByTitle,
  getNamespace,
  pruneNamespace
} from './namespaces'
import {
  attachDomain,
  detachDomain,
  removeDomainKv,
  setupDomainKv
} from './operations'
import {
  WorkerBinding,
  removeWorkerKvBindings,
  setWorkerKvBinding
} from './workerBindings'
import { findZone } from './zones'

vi.mock('../edge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../edge')>()),
  getEdgeConfig: vi.fn(),
  publishDomain: vi.fn(),
  publishDomainWithLinks: vi.fn()
}))
vi.mock('./config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./config')>()),
  requireInfrastructureConfig: vi.fn()
}))
vi.mock('./lock', () => ({
  withWorkerBindingsLock: vi.fn(
    async (operation: () => Promise<unknown>) => await operation()
  )
}))
vi.mock('./namespaces')
vi.mock('./workerBindings')
vi.mock('./attachments', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./attachments')>()),
  listAttachments: vi.fn(),
  createAttachment: vi.fn(),
  deleteAttachment: vi.fn()
}))
vi.mock('./zones')

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  error: vi.fn()
} as unknown as import('pino').Logger

const WORKER = 'short-links-redirect-stage'
const config = {
  accountId: 'account',
  workerName: WORKER,
  allowedHostnames: ['stage.jesus.film'],
  client: {}
} as unknown as InfrastructureConfig

const zone = { id: 'zone-1', name: 'jesus.film' }
const domain = buildShortLinkDomain({
  id: 'domainId',
  hostname: 'stage.jesus.film',
  pathPrefix: 's'
})
const setUp = {
  ...domain,
  kvNamespaceId: 'ns-1',
  kvBinding: 'KV_STAGE_JESUS_FILM'
}

function route(pattern: string, script: string): Attachment {
  return { kind: 'route', id: `id-${script}`, pattern, script }
}

/** The order the side effects happened in, by name. */
function callOrder(
  ...mocks: Array<[string, { mock: { invocationCallOrder: number[] } }]>
): string[] {
  return mocks
    .flatMap(([name, { mock }]) =>
      mock.invocationCallOrder.map((order) => ({ name, order }))
    )
    .sort((a, b) => a.order - b.order)
    .map(({ name }) => name)
}

describe('infrastructure operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireInfrastructureConfig).mockReturnValue(config)
    vi.mocked(getEdgeConfig).mockReturnValue(
      {} as ReturnType<typeof getEdgeConfig>
    )
    vi.mocked(findZone).mockResolvedValue(zone)
    vi.mocked(listAttachments).mockResolvedValue([])
    vi.mocked(removeWorkerKvBindings).mockResolvedValue([])
    prismaMock.shortLinkDomain.findFirst.mockResolvedValue(null)
    prismaMock.shortLink.findMany.mockResolvedValue([])
  })

  describe('setupDomainKv', () => {
    it('creates the namespace, fills it, binds it and only then announces the binding', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(domain)
      vi.mocked(findNamespaceByTitle).mockResolvedValue(null)
      vi.mocked(createNamespace).mockResolvedValue({
        id: 'ns-new',
        title: `${WORKER}:stage.jesus.film`
      })

      await setupDomainKv('domainId', logger)

      expect(createNamespace).toHaveBeenCalledWith(
        config,
        'short-links-redirect-stage:stage.jesus.film'
      )
      expect(prismaMock.shortLinkDomain.update.mock.calls).toEqual([
        [{ where: { id: 'domainId' }, data: { kvNamespaceId: 'ns-new' } }],
        [
          {
            where: { id: 'domainId' },
            data: { kvBinding: 'KV_STAGE_JESUS_FILM' }
          }
        ]
      ])
      expect(setWorkerKvBinding).toHaveBeenCalledWith(
        config,
        'KV_STAGE_JESUS_FILM',
        'ns-new',
        logger
      )
      // a brand new namespace has nothing stale in it
      expect(pruneNamespace).not.toHaveBeenCalled()
      expect(
        callOrder(
          ['createNamespace', vi.mocked(createNamespace)],
          ['publishDomainWithLinks', vi.mocked(publishDomainWithLinks)],
          ['setWorkerKvBinding', vi.mocked(setWorkerKvBinding)],
          ['publishDomain', vi.mocked(publishDomain)]
        )
      ).toEqual([
        'createNamespace',
        'publishDomainWithLinks',
        'setWorkerKvBinding',
        'publishDomain'
      ])
    })

    it('adopts a namespace with the expected title and prunes what is no longer live', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(domain)
      vi.mocked(findNamespaceByTitle).mockResolvedValue({
        id: 'ns-old',
        title: `${WORKER}:stage.jesus.film`
      })
      vi.mocked(pruneNamespace).mockResolvedValue(2)
      prismaMock.shortLink.findMany.mockResolvedValue([
        { pathname: 'easter' },
        { pathname: 'Advent' }
      ] as Awaited<ReturnType<typeof prismaMock.shortLink.findMany>>)

      await setupDomainKv('domainId', logger)

      expect(createNamespace).not.toHaveBeenCalled()
      expect(pruneNamespace).toHaveBeenCalledWith(
        config,
        'ns-old',
        new Set(['easter', 'Advent'])
      )
      expect(setWorkerKvBinding).toHaveBeenCalledWith(
        config,
        'KV_STAGE_JESUS_FILM',
        'ns-old',
        logger
      )
    })

    it('repairs a binding the Worker lost without touching the row', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(getNamespace).mockResolvedValue({ id: 'ns-1', title: 'title' })

      await setupDomainKv('domainId', logger)

      expect(findNamespaceByTitle).not.toHaveBeenCalled()
      expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
      expect(setWorkerKvBinding).toHaveBeenCalledWith(
        config,
        'KV_STAGE_JESUS_FILM',
        'ns-1',
        logger
      )
    })

    it('leaves the Worker alone when publishing into the namespace fails', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(domain)
      vi.mocked(findNamespaceByTitle).mockResolvedValue(null)
      vi.mocked(createNamespace).mockResolvedValue({ id: 'ns-new', title: 't' })
      vi.mocked(publishDomainWithLinks).mockRejectedValueOnce(
        new Error('kv down')
      )

      await expect(setupDomainKv('domainId', logger)).rejects.toThrow('kv down')

      expect(setWorkerKvBinding).not.toHaveBeenCalled()
      expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledTimes(1)
    })

    it('refuses a hostname this environment may not set up', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue({
        ...domain,
        hostname: 'jesus.film'
      })

      await expect(setupDomainKv('domainId', logger)).rejects.toThrow(
        'jesus.film is not in the hostnames this environment may set up on Cloudflare'
      )
      expect(createNamespace).not.toHaveBeenCalled()
      expect(setWorkerKvBinding).not.toHaveBeenCalled()
    })

    it('refuses a binding another domain already uses', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
        hostname: 'other.example'
      } as Awaited<ReturnType<typeof prismaMock.shortLinkDomain.findFirst>>)

      await expect(setupDomainKv('domainId', logger)).rejects.toThrow(
        'Worker binding KV_STAGE_JESUS_FILM is already used by other.example'
      )
    })

    it('needs edge publishing to be configured', async () => {
      vi.mocked(getEdgeConfig).mockReturnValue(null)

      await expect(setupDomainKv('domainId', logger)).rejects.toThrow(
        'edge publishing is not configured in this environment'
      )
    })

    it('throws NotFoundError for an unknown domain', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(null)

      await expect(setupDomainKv('missing', logger)).rejects.toThrow(
        'short link domain not found'
      )
    })
  })

  describe('removeDomainKv', () => {
    it('stops the Worker reading the namespace before removing the binding', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(removeWorkerKvBindings).mockResolvedValue([
        'KV_STAGE_JESUS_FILM'
      ])

      await removeDomainKv('domainId', logger)

      expect(prismaMock.shortLinkDomain.update.mock.calls).toEqual([
        [{ where: { id: 'domainId' }, data: { kvBinding: null } }],
        [{ where: { id: 'domainId' }, data: { kvNamespaceId: null } }]
      ])
      expect(
        callOrder(
          ['publishDomain', vi.mocked(publishDomain)],
          ['removeWorkerKvBindings', vi.mocked(removeWorkerKvBindings)]
        )
      ).toEqual(['publishDomain', 'removeWorkerKvBindings'])

      const selects = vi.mocked(removeWorkerKvBindings).mock.calls[0][1]
      const binding = (overrides: Partial<WorkerBinding>): WorkerBinding => ({
        name: 'KV_OTHER',
        type: 'kv_namespace',
        namespace_id: 'ns-other',
        ...overrides
      })
      expect(selects(binding({ name: 'KV_STAGE_JESUS_FILM' }))).toBe(true)
      expect(selects(binding({ namespace_id: 'ns-1' }))).toBe(true)
      expect(selects(binding({}))).toBe(false)
    })

    it('can be run again after a partial failure cleared the binding name', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue({
        ...setUp,
        kvBinding: null
      })

      await removeDomainKv('domainId', logger)

      expect(publishDomain).not.toHaveBeenCalled()
      expect(removeWorkerKvBindings).toHaveBeenCalled()
      expect(prismaMock.shortLinkDomain.update.mock.calls).toEqual([
        [{ where: { id: 'domainId' }, data: { kvNamespaceId: null } }]
      ])
    })

    it('is refused while the hostname is attached to the Worker', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(listAttachments).mockResolvedValue([
        route('stage.jesus.film/s/*', WORKER)
      ])

      await expect(removeDomainKv('domainId', logger)).rejects.toThrow(
        'detach stage.jesus.film from short-links-redirect-stage before removing its KV setup'
      )
      expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
      expect(removeWorkerKvBindings).not.toHaveBeenCalled()
    })

    it('keeps the namespace id when removing the binding fails, so it can be retried', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(removeWorkerKvBindings).mockRejectedValueOnce(
        new Error('cloudflare down')
      )

      await expect(removeDomainKv('domainId', logger)).rejects.toThrow(
        'cloudflare down'
      )

      expect(prismaMock.shortLinkDomain.update.mock.calls).toEqual([
        [{ where: { id: 'domainId' }, data: { kvBinding: null } }]
      ])
    })
  })

  describe('attachDomain', () => {
    it('creates the route of a prefixed domain', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)

      await attachDomain('domainId', logger)

      expect(createAttachment).toHaveBeenCalledWith(config, zone, {
        kind: 'route',
        hostname: 'stage.jesus.film',
        pattern: 'stage.jesus.film/s/*'
      })
    })

    it('does nothing when it is already attached to this Worker', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(listAttachments).mockResolvedValue([
        route('stage.jesus.film/s/*', WORKER)
      ])

      await attachDomain('domainId', logger)

      expect(createAttachment).not.toHaveBeenCalled()
    })

    it('never takes a route over from another Worker', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(listAttachments).mockResolvedValue([
        route('stage.jesus.film/s/*', 'short-links-redirect-prod')
      ])

      await expect(attachDomain('domainId', logger)).rejects.toThrow(
        'stage.jesus.film/s/* is already attached to short-links-redirect-prod; detach it there first'
      )
      expect(createAttachment).not.toHaveBeenCalled()
    })

    it('needs the KV setup first', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(domain)

      await expect(attachDomain('domainId', logger)).rejects.toThrow(
        'set up KV for stage.jesus.film before attaching it to the Worker'
      )
    })

    it('refuses a hostname this environment may not set up', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue({
        ...setUp,
        hostname: 'jesus.film'
      })

      await expect(attachDomain('domainId', logger)).rejects.toThrow(
        'jesus.film is not in the hostnames this environment may set up on Cloudflare'
      )
      expect(createAttachment).not.toHaveBeenCalled()
    })

    it('never creates a zone', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      vi.mocked(findZone).mockResolvedValue(null)

      await expect(attachDomain('domainId', logger)).rejects.toThrow(
        'no zone for stage.jesus.film in this Cloudflare account; add the zone in Cloudflare first'
      )
      expect(createAttachment).not.toHaveBeenCalled()
    })
  })

  describe('detachDomain', () => {
    it('deletes only what points at this Worker', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)
      const ours = route('stage.jesus.film/s/*', WORKER)
      vi.mocked(listAttachments).mockResolvedValue([
        route('stage.jesus.film/other/*', 'someone-else'),
        ours
      ])

      await detachDomain('domainId', logger)

      expect(deleteAttachment).toHaveBeenCalledTimes(1)
      expect(deleteAttachment).toHaveBeenCalledWith(config, zone, ours)
    })

    it('does nothing when nothing is attached', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(setUp)

      await detachDomain('domainId', logger)

      expect(deleteAttachment).not.toHaveBeenCalled()
    })
  })
})
