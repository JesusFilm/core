import { prismaMock } from '../../../../../test/prismaMock'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

import { getJourneysResponses } from './getJourneyResponses'

describe('getJourneysResponses', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array when journeys is empty', async () => {
    const journeys: JourneyWithAcl[] = []

    const result = await getJourneysResponses(journeys)

    expect(result).toEqual([])
    expect(prismaMock.journeyVisitor.groupBy).not.toHaveBeenCalled()
  })

  it('should return response counts for journeys', async () => {
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
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-3',
        slug: 'journey-slug-3',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl
    ]

    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: {
          journeyId: 10
        }
      },
      {
        journeyId: 'journey-2',
        _count: {
          journeyId: 3
        }
      },
      {
        journeyId: 'journey-3',
        _count: {
          journeyId: 7
        }
      }
    ] as any)

    const result = await getJourneysResponses(journeys)

    expect(prismaMock.journeyVisitor.groupBy).toHaveBeenCalledWith({
      by: ['journeyId'],
      where: {
        journeyId: { in: ['journey-1', 'journey-2', 'journey-3'] },
        lastTextResponse: { not: null }
      },
      _count: {
        journeyId: true
      }
    })
    expect(result).toEqual([
      { journeyId: 'journey-1', visitors: 10 },
      { journeyId: 'journey-2', visitors: 3 },
      { journeyId: 'journey-3', visitors: 7 }
    ])
  })

  it('should return empty array when no journeys have responses', async () => {
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

    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    const result = await getJourneysResponses(journeys)

    expect(result).toEqual([])
  })

  it('should only return journeys that have responses', async () => {
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
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-3',
        slug: 'journey-slug-3',
        userJourneys: [],
        team: { userTeams: [] }
      } as unknown as JourneyWithAcl
    ]

    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: {
          journeyId: 5
        }
      },
      {
        journeyId: 'journey-3',
        _count: {
          journeyId: 2
        }
      }
    ] as any)

    const result = await getJourneysResponses(journeys)

    expect(result).toEqual([
      { journeyId: 'journey-1', visitors: 5 },
      { journeyId: 'journey-3', visitors: 2 }
    ])
  })
})
