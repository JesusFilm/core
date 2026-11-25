import { mockDeep } from 'vitest-mock-extended'

import type { Prisma } from '@core/prisma/journeys/client'

import {
  type DestinationRoutes,
  selectedFormDestinations
} from './mcpFormDestinations'

const journey = { teamId: 'team' }
const inaccessible = 'ACCESS_DENIED_OR_NOT_FOUND'
const integrationIds = ['first', 'second', 'third', 'unavailable'] as const

function responseBlock(
  id: string,
  integrationId: string | null,
  routeId: string | null
) {
  return {
    id,
    typename: 'TextResponseBlock',
    type: 'email',
    integrationId,
    routeId
  }
}

function database() {
  const tx = mockDeep<Prisma.TransactionClient>()
  tx.userTeam.findUnique.mockResolvedValue({
    id: 'membership',
    userId: 'editor',
    teamId: 'team',
    role: 'member'
  } as NonNullable<Awaited<ReturnType<typeof tx.userTeam.findUnique>>>)
  const integrations = integrationIds.map((id) => ({
    id,
    accessId: id,
    oauthStale: false
  })) as Awaited<ReturnType<typeof tx.integration.findMany>>
  tx.integration.findMany.mockImplementation(({ where } = {}) => {
    const filtered = integrations.filter(({ id }) => {
      const filter = where?.id
      if (typeof filter === 'string') return id === filter
      return !Array.isArray(filter?.in) || filter.in.includes(id)
    })
    return Promise.resolve(filtered) as Prisma.PrismaPromise<
      typeof integrations
    >
  })
  return tx
}

describe('selected Form destinations', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns three healthy selections that would exceed the shared deadline serially', async () => {
    vi.useFakeTimers()
    vi.spyOn(AbortSignal, 'timeout').mockImplementation((delay) => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), delay)
      return controller.signal
    })
    const provider = vi.fn<DestinationRoutes>(
      (integration, signal) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(
            () => resolve([{ id: 'saved', name: integration.id }]),
            800
          )
          signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timer)
              reject(new Error(inaccessible))
            },
            { once: true }
          )
        })
    )
    const selected = selectedFormDestinations(
      database(),
      journey,
      integrationIds.slice(0, 3).map((id) => responseBlock(id, id, 'saved')),
      { userId: 'editor', routes: provider }
    )

    await vi.advanceTimersByTimeAsync(2400)
    expect(await selected).toEqual(
      new Map(
        integrationIds
          .slice(0, 3)
          .map((id) => [id, { integrationId: id, routeId: 'saved' }])
      )
    )
    expect(provider).toHaveBeenCalledTimes(3)
  })

  it('deduplicates provider reads and omits only inaccessible or removed selections', async () => {
    const tx = database()
    const provider = vi.fn<DestinationRoutes>(async ({ id }) => {
      if (id === 'unavailable') throw new Error(inaccessible)
      return [{ id: 'saved', name: 'Saved route' }]
    })
    const selections = await selectedFormDestinations(
      tx,
      journey,
      [
        responseBlock('healthy', 'first', 'saved'),
        responseBlock('same-integration', 'first', null),
        responseBlock('provider-down', 'unavailable', 'saved'),
        responseBlock('removed-route', 'second', 'old'),
        responseBlock('no-destination', null, null),
        responseBlock('unknown', 'unknown', 'saved')
      ],
      { userId: 'editor', routes: provider }
    )

    expect(selections).toEqual(
      new Map([
        ['healthy', { integrationId: 'first', routeId: 'saved' }],
        ['same-integration', { integrationId: 'first', routeId: null }],
        ['no-destination', { integrationId: null, routeId: null }]
      ])
    )
    expect(provider).toHaveBeenCalledTimes(3)
    expect(tx.integration.findMany).toHaveBeenCalledTimes(1)
  })
})
