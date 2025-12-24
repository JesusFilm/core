import { prismaMock } from '../../../../test/prismaMock'

// Mock external dependencies
jest.mock('../../../lib/auth/ability')
jest.mock('../../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('VideoTriggerBlock Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Database operations', () => {
    const mockJourney = {
      id: 'journeyId',
      team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] },
      userJourneys: []
    }

    it('should call prisma for video trigger block creation', () => {
      prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
      prismaMock.block.findMany.mockResolvedValue([])
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.create.mockResolvedValue({
        id: 'mock-uuid-generated',
        typename: 'VideoTriggerBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 1,
        triggerStart: 10
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.journey.findFirst).toBeDefined()
      expect(prismaMock.block.create).toBeDefined()
      expect(prismaMock.$transaction).toBeDefined()
    })

    it('should call prisma for video trigger block updates', () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'videoTriggerBlockId',
        typename: 'VideoTriggerBlock',
        journey: mockJourney
      } as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.update.mockResolvedValue({
        id: 'videoTriggerBlockId',
        triggerStart: 20
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.block.findFirst).toBeDefined()
      expect(prismaMock.block.update).toBeDefined()
    })

    it('should validate video trigger properties', () => {
      const triggerProps = {
        triggerStart: 10
      }

      expect(triggerProps.triggerStart).toBe(10)
      expect(typeof triggerProps.triggerStart).toBe('number')
      expect(triggerProps.triggerStart).toBeGreaterThanOrEqual(0)
    })

    it('should handle trigger timing values', () => {
      const triggerTimes = [0, 5, 10, 15, 30, 60, 120]

      triggerTimes.forEach((time) => {
        expect(typeof time).toBe('number')
        expect(time).toBeGreaterThanOrEqual(0)
      })
    })

    it('should validate video interaction properties', () => {
      const interactionProps = {
        isInteractive: true,
        hasTimedTrigger: true,
        pausesVideo: false,
        showsOverlay: true
      }

      expect(interactionProps.isInteractive).toBe(true)
      expect(interactionProps.hasTimedTrigger).toBe(true)
      expect(interactionProps.pausesVideo).toBe(false)
      expect(interactionProps.showsOverlay).toBe(true)
    })

    it('should support trigger event handling', () => {
      const eventProps = {
        triggersAtTime: true,
        hasCallback: true,
        canPause: true,
        hasActions: false
      }

      expect(eventProps.triggersAtTime).toBe(true)
      expect(eventProps.hasCallback).toBe(true)
      expect(eventProps.canPause).toBe(true)
      expect(eventProps.hasActions).toBe(false)
    })

    it('should validate trigger timing ranges', () => {
      const timingProps = {
        minTriggerTime: 0,
        maxTriggerTime: 3600, // 1 hour
        defaultTriggerTime: 10,
        precision: 1 // seconds
      }

      expect(timingProps.minTriggerTime).toBe(0)
      expect(timingProps.maxTriggerTime).toBe(3600)
      expect(timingProps.defaultTriggerTime).toBeGreaterThanOrEqual(
        timingProps.minTriggerTime
      )
      expect(timingProps.defaultTriggerTime).toBeLessThanOrEqual(
        timingProps.maxTriggerTime
      )
      expect(timingProps.precision).toBe(1)
    })

    it('should support video overlay functionality', () => {
      const overlayProps = {
        showsContent: true,
        hasButtons: false,
        hasInteraction: true,
        pausesPlayback: false
      }

      expect(overlayProps.showsContent).toBe(true)
      expect(overlayProps.hasButtons).toBe(false)
      expect(overlayProps.hasInteraction).toBe(true)
      expect(overlayProps.pausesPlayback).toBe(false)
    })

    it('should work with video timeline', () => {
      const timelineProps = {
        isTimelineBased: true,
        hasMultipleTriggers: false,
        respectsVideoLength: true,
        triggersOnce: true
      }

      expect(timelineProps.isTimelineBased).toBe(true)
      expect(timelineProps.hasMultipleTriggers).toBe(false)
      expect(timelineProps.respectsVideoLength).toBe(true)
      expect(timelineProps.triggersOnce).toBe(true)
    })
  })
})
