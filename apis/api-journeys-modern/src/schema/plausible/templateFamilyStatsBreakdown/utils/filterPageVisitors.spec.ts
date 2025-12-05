import { PlausibleStatsResponse } from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

import { filterPageVisitors } from './filterPageVisitors'

describe('filterPageVisitors', () => {
  it('should return pages only on the first level', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-slug',
        visitors: 10
      },
      {
        property: '/journey-slug/step-id',
        visitors: 5
      },
      {
        property: '/journey-slug/step-id/block-id',
        visitors: 3
      },
      {
        property: 'journey-slug',
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

    expect(result).toEqual([{ journeyId: 'journey-1', visitors: 10 }])
  })

  it('should trim the leading slash from the page', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-slug-1',
        visitors: 10
      },
      {
        property: '/journey-slug-2',
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

  it('should return only when matched with slug from a journey', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/matching-slug',
        visitors: 10
      },
      {
        property: '/non-matching-slug',
        visitors: 20
      },
      {
        property: '/another-matching-slug',
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

  it('should sum up visitors for the same journey', () => {
    const pageVisitors: PlausibleStatsResponse[] = [
      {
        property: '/journey-slug',
        visitors: 10
      },
      {
        property: '/journey-slug',
        visitors: 20
      },
      {
        property: '/journey-slug',
        visitors: 5
      },
      {
        property: '/another-slug',
        visitors: 15
      },
      {
        property: '/another-slug',
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

    expect(result).toEqual([
      { journeyId: 'journey-1', visitors: 35 },
      { journeyId: 'journey-2', visitors: 40 }
    ])
  })
})
