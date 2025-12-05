import { ability } from '../../../../lib/auth/ability'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

import { addPermissionsAndNames } from './addPermissionsWithNames'
import { TransformedResult } from './transformBreakdownResults'

jest.mock('../../../../lib/auth/ability', () => ({
  Action: { Read: 'read' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

const mockAbility = ability as jest.MockedFunction<typeof ability>

describe('addPermissionsAndNames', () => {
  const mockUser = { id: 'user-1' } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return journey and team names for journeys the current user has access to', () => {
    const transformedResults: TransformedResult[] = [
      {
        journeyId: 'journey-1',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        stats: [{ event: 'pageview', visitors: 5 }]
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        title: 'Journey One',
        teamId: 'team-1',
        status: 'published',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        title: 'Journey Two',
        teamId: 'team-2',
        status: 'published',
        team: { title: 'Team Two', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl
    ]

    mockAbility.mockReturnValue(true)

    const result = addPermissionsAndNames(
      transformedResults,
      journeys,
      mockUser
    )

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        journeyName: 'Journey One',
        teamName: 'Team One',
        status: 'published',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        journeyName: 'Journey Two',
        teamName: 'Team Two',
        status: 'published',
        stats: [{ event: 'pageview', visitors: 5 }]
      }
    ])
  })

  it('should return unknown names for journeys and team the current user does not have access to', () => {
    const transformedResults: TransformedResult[] = [
      {
        journeyId: 'journey-1',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        stats: [{ event: 'pageview', visitors: 5 }]
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        title: 'Journey One',
        teamId: 'team-1',
        status: 'draft',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        title: 'Journey Two',
        teamId: 'team-1',
        status: 'draft',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl
    ]

    mockAbility.mockReturnValue(false)

    const result = addPermissionsAndNames(
      transformedResults,
      journeys,
      mockUser
    )

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        journeyName: 'unknown journey 1',
        teamName: 'unknown team 1',
        status: 'draft',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        journeyName: 'unknown journey 2',
        teamName: 'unknown team 1',
        status: 'draft',
        stats: [{ event: 'pageview', visitors: 5 }]
      }
    ])
  })

  it('should group unknown teams together', () => {
    const transformedResults: TransformedResult[] = [
      {
        journeyId: 'journey-1',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        stats: [{ event: 'pageview', visitors: 5 }]
      },
      {
        journeyId: 'journey-3',
        stats: [{ event: 'videoPlay', visitors: 3 }]
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        title: 'Journey One',
        teamId: 'team-1',
        status: 'published',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        title: 'Journey Two',
        teamId: 'team-1',
        status: 'published',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-3',
        title: 'Journey Three',
        teamId: 'team-2',
        status: 'published',
        team: { title: 'Team Two', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl
    ]

    mockAbility.mockReturnValue(false)

    const result = addPermissionsAndNames(
      transformedResults,
      journeys,
      mockUser
    )

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        journeyName: 'unknown journey 1',
        teamName: 'unknown team 1',
        status: 'published',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        journeyName: 'unknown journey 2',
        teamName: 'unknown team 1',
        status: 'published',
        stats: [{ event: 'pageview', visitors: 5 }]
      },
      {
        journeyId: 'journey-3',
        journeyName: 'unknown journey 3',
        teamName: 'unknown team 2',
        status: 'published',
        stats: [{ event: 'videoPlay', visitors: 3 }]
      }
    ])
  })

  it('should return a mix of known and unknown names', () => {
    const transformedResults: TransformedResult[] = [
      {
        journeyId: 'journey-1',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        stats: [{ event: 'pageview', visitors: 5 }]
      },
      {
        journeyId: 'journey-3',
        stats: [{ event: 'videoPlay', visitors: 3 }]
      },
      {
        journeyId: 'journey-4',
        stats: [{ event: 'signUpSubmit', visitors: 2 }]
      }
    ]

    const journeys: JourneyWithAcl[] = [
      {
        id: 'journey-1',
        title: 'Journey One',
        teamId: 'team-1',
        status: 'published',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-2',
        title: 'Journey Two',
        teamId: 'team-1',
        status: 'draft',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-3',
        title: 'Journey Three',
        teamId: 'team-2',
        status: 'published',
        team: { title: 'Team Two', userTeams: [] },
        userJourneys: []
      } as unknown as JourneyWithAcl,
      {
        id: 'journey-4',
        title: 'Journey Four',
        teamId: null,
        status: 'archived',
        team: null,
        userJourneys: []
      } as unknown as JourneyWithAcl
    ]

    mockAbility.mockImplementation((action, subj, user) => {
      const journey = (subj as any).object
      return journey.id === 'journey-1' || journey.id === 'journey-3'
    })

    const result = addPermissionsAndNames(
      transformedResults,
      journeys,
      mockUser
    )

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        journeyName: 'Journey One',
        teamName: 'Team One',
        status: 'published',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      },
      {
        journeyId: 'journey-2',
        journeyName: 'unknown journey 1',
        teamName: 'Team One',
        status: 'draft',
        stats: [{ event: 'pageview', visitors: 5 }]
      },
      {
        journeyId: 'journey-3',
        journeyName: 'Journey Three',
        teamName: 'Team Two',
        status: 'published',
        stats: [{ event: 'videoPlay', visitors: 3 }]
      },
      {
        journeyId: 'journey-4',
        journeyName: 'unknown journey 2',
        teamName: 'No Team',
        status: 'archived',
        stats: [{ event: 'signUpSubmit', visitors: 2 }]
      }
    ])
  })
})
