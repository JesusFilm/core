import {
  clearPendingGuestJourney,
  getPendingGuestJourney,
  setPendingGuestJourney
} from './pendingGuestJourney'

describe('pendingGuestJourney', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('setPendingGuestJourney', () => {
    it('should store journey data in sessionStorage', () => {
      setPendingGuestJourney('journey-123', 'template-456')

      const stored = JSON.parse(
        sessionStorage.getItem('pendingGuestJourney') ?? '{}'
      )
      expect(stored).toEqual({
        journeyId: 'journey-123',
        originalTemplateId: 'template-456'
      })
    })

    it('should store null originalTemplateId', () => {
      setPendingGuestJourney('journey-123', null)

      const stored = JSON.parse(
        sessionStorage.getItem('pendingGuestJourney') ?? '{}'
      )
      expect(stored).toEqual({
        journeyId: 'journey-123',
        originalTemplateId: null
      })
    })
  })

  describe('getPendingGuestJourney', () => {
    it('should return null when no data is stored', () => {
      expect(getPendingGuestJourney()).toBeNull()
    })

    it('should return stored journey data', () => {
      sessionStorage.setItem(
        'pendingGuestJourney',
        JSON.stringify({
          journeyId: 'journey-123',
          originalTemplateId: 'template-456'
        })
      )

      expect(getPendingGuestJourney()).toEqual({
        journeyId: 'journey-123',
        originalTemplateId: 'template-456'
      })
    })
  })

  describe('clearPendingGuestJourney', () => {
    it('should remove stored journey data', () => {
      sessionStorage.setItem(
        'pendingGuestJourney',
        JSON.stringify({ journeyId: 'journey-123', originalTemplateId: null })
      )

      clearPendingGuestJourney()

      expect(sessionStorage.getItem('pendingGuestJourney')).toBeNull()
    })

    it('should not throw when no data is stored', () => {
      expect(() => clearPendingGuestJourney()).not.toThrow()
    })
  })
})
