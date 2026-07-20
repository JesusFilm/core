import { PlausibleStatsResponse } from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

import { filterPageVisitors } from './filterPageVisitors'

describe('filterPageVisitors', () => {
  it('should extract journeyId from properties in format /journeyId/stepId', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-1/step-1',
        visitors: 10
      },
      {
        property: '/journey-1/step-2',
        visitors: 5
      },
      {
        property: '/journey-1/step-3/block-id',
        visitors: 3
      },
      {
        property: 'journey-1/step-1',
        visitors: 2
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        slug: 'journey-slug',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl
    ]

    const result = filterPageVisitors(pageVisitors, journeys)

    // Should use Math.max, so max of 10, 5, 3 = 10
    expect(result).toEqual([{ journeyId: 'journey-1', visitors: 10 }])
  })

  it('should handle multiple journeys', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-1/step-1',
        visitors: 10
      },
      {
        property: '/journey-2/step-1',
        visitors: 20
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        slug: 'journey-slug-1',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        slug: 'journey-slug-2',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl
    ]

    const result = filterPageVisitors(pageVisitors, journeys)

    expect(result).toEqual([
      { journeyId: 'journey-1', visitors: 10 },
      { journeyId: 'journey-2', visitors: 20 }
    ])
  })

  it('should return only when matched with journey ID', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-1/step-1',
        visitors: 10
      },
      {
        property: '/non-matching-journey/step-1',
        visitors: 20
      },
      {
        property: '/journey-2/step-1',
        visitors: 30
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        slug: 'matching-slug',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        slug: 'another-matching-slug',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl
    ]

    const result = filterPageVisitors(pageVisitors, journeys)

    expect(result).toEqual([
      { journeyId: 'journey-1', visitors: 10 },
      { journeyId: 'journey-2', visitors: 30 }
    ])
  })

  it('should use Math.max for visitors from multiple step pages', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-1/step-1',
        visitors: 10
      },
      {
        property: '/journey-1/step-2',
        visitors: 20
      },
      {
        property: '/journey-1/step-3',
        visitors: 5
      },
      {
        property: '/journey-2/step-1',
        visitors: 15
      },
      {
        property: '/journey-2/step-2',
        visitors: 25
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        slug: 'journey-slug',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        slug: 'another-slug',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl
    ]

    const result = filterPageVisitors(pageVisitors, journeys)

    // Should use Math.max: journey-1 max(10, 20, 5) = 20, journey-2 max(15, 25) = 25
    expect(result).toEqual([
      { journeyId: 'journey-1', visitors: 20 },
      { journeyId: 'journey-2', visitors: 25 }
    ])
  })
})
