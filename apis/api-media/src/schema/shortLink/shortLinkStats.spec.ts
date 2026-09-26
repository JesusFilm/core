import { type MockedFunction, vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { getShortLinkStats } from './analytics'

vi.mock('./analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./analytics')>()),
  getShortLinkStats: vi.fn()
}))

const getShortLinkStatsMock = getShortLinkStats as MockedFunction<
  typeof getShortLinkStats
>

const SHORT_LINK_STATS_QUERY = graphql(`
  query ShortLinkStatsQuery($filter: ShortLinkStatsFilter!) {
    shortLinkStats(filter: $filter) {
      total
      qr
      direct
      byDay {
        key
        count
        qrCount
      }
      byCampaign {
        key
        count
        qrCount
      }
    }
  }
`)

describe('shortLinkStats', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'userId' } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles: ['shortLinkEditor'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  it('returns the analytics shape for an editor', async () => {
    getShortLinkStatsMock.mockResolvedValue({
      total: 10,
      qr: 4,
      direct: 6,
      byDay: [{ key: '2026-09-01', count: 10, qrCount: 4 }],
      byLink: [],
      byCampaign: [{ key: 'c1', count: 10, qrCount: 4 }],
      byCountry: [],
      byDeviceClass: [],
      byPlacement: [],
      byReferrerHost: [],
      byAttribution: []
    })
    const result = await authClient({
      document: SHORT_LINK_STATS_QUERY,
      variables: {
        filter: {
          campaignId: 'c1',
          from: '2026-09-01T00:00:00.000Z',
          to: '2026-10-01T00:00:00.000Z'
        }
      }
    })
    expect(result).toEqual({
      data: {
        shortLinkStats: {
          total: 10,
          qr: 4,
          direct: 6,
          byDay: [{ key: '2026-09-01', count: 10, qrCount: 4 }],
          byCampaign: [{ key: 'c1', count: 10, qrCount: 4 }]
        }
      }
    })
    expect(getShortLinkStatsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: 'c1',
        from: new Date('2026-09-01T00:00:00.000Z'),
        to: new Date('2026-10-01T00:00:00.000Z')
      })
    )
  })

  it('refuses an anonymous caller', async () => {
    const result = await getClient()({
      document: SHORT_LINK_STATS_QUERY,
      variables: {
        filter: {
          from: '2026-09-01T00:00:00.000Z',
          to: '2026-10-01T00:00:00.000Z'
        }
      }
    })
    expect(result).toMatchObject({ errors: [expect.anything()] })
    expect(getShortLinkStatsMock).not.toHaveBeenCalled()
  })
})
