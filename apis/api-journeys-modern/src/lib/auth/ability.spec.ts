import { journeyAcl } from '../../schema/journey/journey.acl'

import { Action, Subject, ability, subject } from './ability'

// Mock journeyAcl
jest.mock('../../schema/journey/journey.acl', () => ({
  journeyAcl: jest.fn()
}))

describe('ability', () => {
  const mockUser = { id: 'user1' } as any
  const mockJourney = { id: 'journey1' } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if journeyAcl returns true', () => {
    ;(journeyAcl as jest.Mock).mockReturnValue(true)
    const result = ability(
      Action.Update,
      subject(Subject.Journey, mockJourney),
      mockUser
    )
    expect(result).toBe(true)
    expect(journeyAcl).toHaveBeenCalledWith(
      Action.Update,
      mockJourney,
      mockUser
    )
  })

  it('should return false if journeyAcl returns false', () => {
    ;(journeyAcl as jest.Mock).mockReturnValue(false)
    const result = ability(
      Action.Update,
      subject(Subject.Journey, mockJourney),
      mockUser
    )
    expect(result).toBe(false)
    expect(journeyAcl).toHaveBeenCalledWith(
      Action.Update,
      mockJourney,
      mockUser
    )
  })

  it('should return false for unknown subject', () => {
    const minimalMockJourney = {
      userJourneys: [],
      team: { userTeams: [] }
    } as any
    const result = ability(
      Action.Update,
      { subject: 'Unknown' as any, object: minimalMockJourney },
      mockUser
    )
    expect(result).toBe(false)
    expect(journeyAcl).not.toHaveBeenCalled()
  })

  it('should handle missing subjectObject gracefully', () => {
    // @ts-expect-error Testing undefined subjectObject handling
    const result = ability(Action.Update, undefined, mockUser)
    expect(result).toBe(false)
    expect(journeyAcl).not.toHaveBeenCalled()
  })
})
