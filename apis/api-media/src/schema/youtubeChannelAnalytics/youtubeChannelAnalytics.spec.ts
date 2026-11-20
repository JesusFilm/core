import { type Mock } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

const CHANNEL = 'UC1234567890abcdefghij-_'
const NOW = new Date('2026-11-19T12:00:00Z')

function clientWithRoles(roles: string[]): ReturnType<typeof getClient> {
  ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
    id: 'role-id',
    userId: 'user-id',
    roles
  } as any)
  return getClient({
    headers: { authorization: 'token' },
    context: { currentRoles: roles, currentUser: { id: 'user-id' } }
  })
}

function buildRow(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'row-id',
    channelId: CHANNEL,
    day: new Date('2026-11-16T00:00:00Z'),
    views: 40,
    estimatedMinutesWatched: 110,
    averageViewDuration: 165,
    subscribersGained: 5,
    subscribersLost: null,
    fetchedAt: new Date('2026-11-18T09:00:00Z'),
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides
  }
}

const DAYS = graphql(`
  query YoutubeChannelAnalyticsDays(
    $channelId: ID!
    $startDate: Date!
    $endDate: Date!
  ) {
    youtubeChannelAnalyticsDays(
      channelId: $channelId
      startDate: $startDate
      endDate: $endDate
    ) {
      channelId
      day
      views
      subscribersLost
      fetchedAt
    }
  }
`)

const UPSERT = graphql(`
  mutation YoutubeChannelAnalyticsDaysUpsert(
    $input: YoutubeChannelAnalyticsDaysUpsertInput!
  ) {
    youtubeChannelAnalyticsDaysUpsert(input: $input)
  }
`)

const DELETE = graphql(`
  mutation YoutubeChannelAnalyticsDelete($channelId: ID!) {
    youtubeChannelAnalyticsDelete(channelId: $channelId)
  }
`)

describe('youtubeChannelAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
    prismaMock.$transaction.mockImplementation(
      async (writes: unknown) => writes
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('youtubeChannelAnalyticsDays', () => {
    const variables = {
      channelId: CHANNEL,
      startDate: '2026-10-20',
      endDate: '2026-11-16'
    }

    it('reads only days fetched within the last 28 days, oldest first', async () => {
      prismaMock.youtubeChannelAnalyticsDay.findMany.mockResolvedValue([
        buildRow()
      ])

      const result = await clientWithRoles(['youtubeAnalyticsReader'])({
        document: DAYS,
        variables
      })

      expect(result).toHaveProperty('data.youtubeChannelAnalyticsDays', [
        {
          channelId: CHANNEL,
          day: '2026-11-16',
          views: 40,
          subscribersLost: null,
          fetchedAt: '2026-11-18T09:00:00.000Z'
        }
      ])
      expect(
        prismaMock.youtubeChannelAnalyticsDay.findMany
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            channelId: CHANNEL,
            day: {
              gte: new Date('2026-10-20T00:00:00Z'),
              lte: new Date('2026-11-16T00:00:00Z')
            },
            fetchedAt: { gt: new Date('2026-10-22T12:00:00Z') }
          },
          orderBy: { day: 'asc' }
        })
      )
    })

    it('lets youtubeAdmin read too', async () => {
      prismaMock.youtubeChannelAnalyticsDay.findMany.mockResolvedValue([])

      const result = await clientWithRoles(['youtubeAdmin'])({
        document: DAYS,
        variables
      })

      expect(result).toHaveProperty('data.youtubeChannelAnalyticsDays', [])
    })

    it('refuses a caller without a YouTube Analytics role', async () => {
      const publisher = await clientWithRoles(['publisher'])({
        document: DAYS,
        variables
      })
      const anonymous = await getClient()({ document: DAYS, variables })

      expect((publisher as any).errors).toBeDefined()
      expect((anonymous as any).errors).toBeDefined()
      expect(
        prismaMock.youtubeChannelAnalyticsDay.findMany
      ).not.toHaveBeenCalled()
    })

    it.each([
      ['a range longer than a year', { startDate: '2025-11-01' }],
      ['a start after the end', { startDate: '2026-11-17' }],
      ['an ID that is not a channel', { channelId: 'channel-1' }]
    ])('refuses %s', async (_name, override) => {
      const result = await clientWithRoles(['youtubeAnalyticsReader'])({
        document: DAYS,
        variables: { ...variables, ...override }
      })

      expect((result as any).errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT'
      )
      expect(
        prismaMock.youtubeChannelAnalyticsDay.findMany
      ).not.toHaveBeenCalled()
    })
  })

  describe('youtubeChannelAnalyticsDaysUpsert', () => {
    const input = {
      channelId: CHANNEL,
      fetchedAt: '2026-11-18T09:00:00.000Z',
      days: [
        { day: '2026-11-15', views: 40, subscribersGained: 5 },
        { day: '2026-11-16', views: null }
      ]
    }

    it('writes each day under the fetch time, keeping a withheld figure null', async () => {
      const result = await clientWithRoles(['youtubeAdmin'])({
        document: UPSERT,
        variables: { input }
      })

      expect(result).toHaveProperty('data.youtubeChannelAnalyticsDaysUpsert', 2)
      const fetchedAt = new Date('2026-11-18T09:00:00Z')
      expect(prismaMock.youtubeChannelAnalyticsDay.upsert).toHaveBeenCalledWith(
        {
          where: {
            channelId_day: {
              channelId: CHANNEL,
              day: new Date('2026-11-15T00:00:00Z')
            }
          },
          create: {
            channelId: CHANNEL,
            day: new Date('2026-11-15T00:00:00Z'),
            views: 40,
            estimatedMinutesWatched: null,
            averageViewDuration: null,
            subscribersGained: 5,
            subscribersLost: null,
            fetchedAt
          },
          update: {
            views: 40,
            estimatedMinutesWatched: null,
            averageViewDuration: null,
            subscribersGained: 5,
            subscribersLost: null,
            fetchedAt
          }
        }
      )
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    })

    it('refuses a reader: only youtubeAdmin writes', async () => {
      const result = await clientWithRoles(['youtubeAnalyticsReader'])({
        document: UPSERT,
        variables: { input }
      })

      expect((result as any).errors).toBeDefined()
      expect(
        prismaMock.youtubeChannelAnalyticsDay.upsert
      ).not.toHaveBeenCalled()
    })

    it.each([
      [
        'figures fetched more than 28 days ago',
        { fetchedAt: '2026-10-22T11:59:00.000Z' }
      ],
      ['a fetch time in the future', { fetchedAt: '2026-11-19T13:00:00.000Z' }],
      ['no days', { days: [] }],
      [
        'the same day twice',
        { days: [{ day: '2026-11-15' }, { day: '2026-11-15' }] }
      ],
      ['a negative figure', { days: [{ day: '2026-11-15', views: -1 }] }]
    ])('refuses %s', async (_name, override) => {
      const result = await clientWithRoles(['youtubeAdmin'])({
        document: UPSERT,
        variables: { input: { ...input, ...override } }
      })

      expect((result as any).errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT'
      )
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('youtubeChannelAnalyticsDelete', () => {
    it('deletes every stored day for the channel and says how many', async () => {
      prismaMock.youtubeChannelAnalyticsDay.deleteMany.mockResolvedValue({
        count: 28
      })

      const result = await clientWithRoles(['youtubeAdmin'])({
        document: DELETE,
        variables: { channelId: CHANNEL }
      })

      expect(result).toHaveProperty('data.youtubeChannelAnalyticsDelete', 28)
      expect(
        prismaMock.youtubeChannelAnalyticsDay.deleteMany
      ).toHaveBeenCalledWith({ where: { channelId: CHANNEL } })
    })

    it('refuses a reader', async () => {
      const result = await clientWithRoles(['youtubeAnalyticsReader'])({
        document: DELETE,
        variables: { channelId: CHANNEL }
      })

      expect((result as any).errors).toBeDefined()
      expect(
        prismaMock.youtubeChannelAnalyticsDay.deleteMany
      ).not.toHaveBeenCalled()
    })
  })
})
