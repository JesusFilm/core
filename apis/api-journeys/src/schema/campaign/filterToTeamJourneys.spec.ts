import { vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import {
  CAMPAIGN_MAX_JOURNEYS_PER_ROLE,
  assertJourneyListSize,
  filterToTeamJourneys
} from './filterToTeamJourneys'

describe('filterToTeamJourneys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty result for empty input without querying', async () => {
    await expect(
      filterToTeamJourneys(prismaMock, 'team-1', [], 'share')
    ).resolves.toEqual({ validIds: [] })
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
  })

  it('drops ids the query did not return and preserves input order', async () => {
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'j1' },
      { id: 'j3' }
    ] as any)
    await expect(
      filterToTeamJourneys(
        prismaMock,
        'team-1',
        ['j3', 'j2-cross-team', 'j1', 'j1'],
        'share'
      )
    ).resolves.toEqual({ validIds: ['j3', 'j1'] })
  })

  it('queries non-template journeys (false or null) for the share role', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])
    await filterToTeamJourneys(prismaMock, 'team-X', ['j1', 'j1'], 'share')
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['j1'] },
        teamId: 'team-X',
        deletedAt: null,
        OR: [{ template: false }, { template: null }]
      },
      select: { id: true }
    })
  })

  it('queries template-flagged journeys for the template role', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])
    await filterToTeamJourneys(prismaMock, 'team-X', ['j1'], 'template')
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['j1'] },
        teamId: 'team-X',
        deletedAt: null,
        template: true
      },
      select: { id: true }
    })
  })
})

describe('assertJourneyListSize', () => {
  it('accepts null, undefined and lists at the cap', () => {
    expect(() => assertJourneyListSize(null, 'shareJourneyIds')).not.toThrow()
    expect(() =>
      assertJourneyListSize(undefined, 'shareJourneyIds')
    ).not.toThrow()
    expect(() =>
      assertJourneyListSize(
        Array.from({ length: CAMPAIGN_MAX_JOURNEYS_PER_ROLE }, (_, i) =>
          String(i)
        ),
        'templateJourneyIds'
      )
    ).not.toThrow()
  })

  it('rejects lists over the cap with a field-scoped BAD_USER_INPUT', () => {
    expect(() =>
      assertJourneyListSize(
        Array.from({ length: CAMPAIGN_MAX_JOURNEYS_PER_ROLE + 1 }, (_, i) =>
          String(i)
        ),
        'shareJourneyIds'
      )
    ).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'shareJourneyIds' }
      })
    )
  })
})
