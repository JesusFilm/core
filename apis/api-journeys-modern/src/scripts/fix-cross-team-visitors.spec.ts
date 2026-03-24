import { prismaMock } from '../../test/prismaMock'

import {
  findMismatchedRecords,
  fixCrossTeamVisitors,
  fixMismatchedRecord
} from './fix-cross-team-visitors'

describe('fix-cross-team-visitors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const makeMismatchedRecord = (overrides = {}) => ({
    journeyVisitorId: 'jv-wrong',
    journeyId: 'journey-1',
    wrongVisitorId: 'visitor-wrong-team',
    wrongVisitorTeamId: 'team-wrong',
    userId: 'user-1',
    journeyTeamId: 'team-correct',
    journeyVisitorCreatedAt: new Date('2025-09-25'),
    ...overrides
  })

  describe('findMismatchedRecords', () => {
    it('should execute raw query to find mismatched records', async () => {
      const mockRecords = [makeMismatchedRecord()]
      prismaMock.$queryRaw.mockResolvedValue(mockRecords)

      const result = await findMismatchedRecords(prismaMock)

      expect(result).toEqual(mockRecords)
      expect(prismaMock.$queryRaw).toHaveBeenCalled()
    })

    it('should return empty array when no mismatches exist', async () => {
      prismaMock.$queryRaw.mockResolvedValue([])

      const result = await findMismatchedRecords(prismaMock)

      expect(result).toEqual([])
    })
  })

  describe('fixMismatchedRecord', () => {
    describe('when correct visitor exists and correct JourneyVisitor exists (merge)', () => {
      it('should merge events and delete wrong JourneyVisitor', async () => {
        const record = makeMismatchedRecord()
        const correctVisitor = {
          id: 'visitor-correct',
          teamId: 'team-correct',
          userId: 'user-1'
        }
        const correctJV = {
          id: 'jv-correct',
          journeyId: 'journey-1',
          visitorId: 'visitor-correct',
          activityCount: 5,
          duration: 100,
          lastStepViewedAt: new Date('2025-09-20'),
          lastChatStartedAt: null,
          lastChatPlatform: null,
          lastTextResponse: 'existing',
          lastRadioQuestion: null,
          lastRadioOptionSubmission: null,
          lastLinkAction: null,
          lastMultiselectSubmission: null
        }
        const wrongJV = {
          id: 'jv-wrong',
          journeyId: 'journey-1',
          visitorId: 'visitor-wrong-team',
          activityCount: 3,
          duration: 50,
          lastStepViewedAt: new Date('2025-09-26'),
          lastChatStartedAt: new Date('2025-09-26'),
          lastChatPlatform: 'facebook',
          lastTextResponse: null,
          lastRadioQuestion: 'What?',
          lastRadioOptionSubmission: null,
          lastLinkAction: 'https://link.com',
          lastMultiselectSubmission: null
        }

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique
          .mockResolvedValueOnce(correctJV as any)
          .mockResolvedValueOnce(wrongJV as any)
        prismaMock.event.count.mockResolvedValue(7)
        prismaMock.$transaction.mockResolvedValue([])

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('merged')
        expect(result.eventsUpdated).toBe(7)
        expect(result.correctVisitorId).toBe('visitor-correct')
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
        expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
          where: { journeyId: 'journey-1', visitorId: 'visitor-wrong-team' },
          data: { visitorId: 'visitor-correct' }
        })
        expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith({
          where: { id: 'jv-correct' },
          data: expect.objectContaining({
            activityCount: { increment: 3 },
            duration: { increment: 50 },
            lastStepViewedAt: new Date('2025-09-26'),
            lastChatStartedAt: new Date('2025-09-26'),
            lastChatPlatform: 'facebook',
            lastRadioQuestion: 'What?',
            lastLinkAction: 'https://link.com'
          })
        })
        expect(prismaMock.journeyVisitor.delete).toHaveBeenCalledWith({
          where: { id: 'jv-wrong' }
        })
      })

      it('should report merge in dry run without modifying data', async () => {
        const record = makeMismatchedRecord()
        const correctVisitor = {
          id: 'visitor-correct',
          teamId: 'team-correct',
          userId: 'user-1'
        }
        const correctJV = {
          id: 'jv-correct',
          journeyId: 'journey-1',
          visitorId: 'visitor-correct',
          activityCount: 0,
          duration: 0,
          lastStepViewedAt: null,
          lastChatStartedAt: null,
          lastChatPlatform: null,
          lastTextResponse: null,
          lastRadioQuestion: null,
          lastRadioOptionSubmission: null,
          lastLinkAction: null,
          lastMultiselectSubmission: null
        }

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique.mockResolvedValue(correctJV as any)
        prismaMock.event.count.mockResolvedValue(3)

        const result = await fixMismatchedRecord(prismaMock, record, true)

        expect(result.action).toBe('merged')
        expect(result.eventsUpdated).toBe(3)
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })
    })

    describe('when correct visitor exists but no correct JourneyVisitor (reassign)', () => {
      it('should move events and recreate JourneyVisitor with correct visitor', async () => {
        const record = makeMismatchedRecord()
        const correctVisitor = {
          id: 'visitor-correct',
          teamId: 'team-correct',
          userId: 'user-1'
        }

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)
        prismaMock.event.count.mockResolvedValue(2)
        prismaMock.$transaction.mockResolvedValue([])

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('reassigned')
        expect(result.eventsUpdated).toBe(2)
        expect(result.correctVisitorId).toBe('visitor-correct')
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
        expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
          where: { journeyId: 'journey-1', visitorId: 'visitor-wrong-team' },
          data: { visitorId: 'visitor-correct' }
        })
        expect(prismaMock.journeyVisitor.delete).toHaveBeenCalledWith({
          where: { id: 'jv-wrong' }
        })
        expect(prismaMock.journeyVisitor.create).toHaveBeenCalledWith({
          data: { journeyId: 'journey-1', visitorId: 'visitor-correct' }
        })
      })

      it('should report reassign in dry run without modifying data', async () => {
        const record = makeMismatchedRecord()
        const correctVisitor = {
          id: 'visitor-correct',
          teamId: 'team-correct',
          userId: 'user-1'
        }

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)
        prismaMock.event.count.mockResolvedValue(2)

        const result = await fixMismatchedRecord(prismaMock, record, true)

        expect(result.action).toBe('reassigned')
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })
    })

    describe('when no correct visitor exists (create + reassign)', () => {
      it('should create visitor and reassign JourneyVisitor', async () => {
        const record = makeMismatchedRecord()
        const wrongVisitor = {
          id: 'visitor-wrong-team',
          teamId: 'team-wrong',
          userId: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+123',
          countryCode: 'US',
          referrer: null,
          status: null,
          messagePlatform: null,
          messagePlatformId: null,
          userAgent: null
        }
        const createdVisitor = {
          id: 'visitor-new',
          teamId: 'team-correct',
          userId: 'user-1'
        }

        prismaMock.visitor.findFirst.mockResolvedValue(null)
        prismaMock.visitor.findUnique.mockResolvedValue(wrongVisitor as any)
        prismaMock.visitor.create.mockResolvedValue(createdVisitor as any)
        prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)
        prismaMock.event.count.mockResolvedValue(1)
        prismaMock.$transaction.mockResolvedValue([])

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('created_visitor_and_reassigned')
        expect(result.correctVisitorId).toBe('visitor-new')
        expect(prismaMock.visitor.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            teamId: 'team-correct',
            userId: 'user-1',
            name: 'Test User',
            email: 'test@example.com'
          })
        })
      })

      it('should report creation in dry run and return early', async () => {
        const record = makeMismatchedRecord()

        prismaMock.visitor.findFirst.mockResolvedValue(null)

        const result = await fixMismatchedRecord(prismaMock, record, true)

        expect(result.action).toBe('created_visitor_and_reassigned')
        expect(result.correctVisitorId).toBe('<would-be-created>')
        expect(prismaMock.visitor.create).not.toHaveBeenCalled()
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })
    })

    describe('edge cases', () => {
      it('should skip when wrong visitor cannot be found for creation', async () => {
        const record = makeMismatchedRecord()

        prismaMock.visitor.findFirst.mockResolvedValue(null)
        prismaMock.visitor.findUnique.mockResolvedValue(null)

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('skipped')
        expect(prismaMock.visitor.create).not.toHaveBeenCalled()
      })

      it('should skip merge when wrong JourneyVisitor disappeared', async () => {
        const record = makeMismatchedRecord()
        const correctVisitor = {
          id: 'visitor-correct',
          teamId: 'team-correct',
          userId: 'user-1'
        }
        const correctJV = {
          id: 'jv-correct',
          journeyId: 'journey-1',
          visitorId: 'visitor-correct',
          activityCount: 0,
          duration: 0,
          lastStepViewedAt: null,
          lastChatStartedAt: null,
          lastChatPlatform: null,
          lastTextResponse: null,
          lastRadioQuestion: null,
          lastRadioOptionSubmission: null,
          lastLinkAction: null,
          lastMultiselectSubmission: null
        }

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique
          .mockResolvedValueOnce(correctJV as any)
          .mockResolvedValueOnce(null)
        prismaMock.event.count.mockResolvedValue(0)

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('skipped')
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })
    })
  })

  describe('fixCrossTeamVisitors', () => {
    it('should process all mismatched records', async () => {
      const records = [
        makeMismatchedRecord({ journeyVisitorId: 'jv-1' }),
        makeMismatchedRecord({ journeyVisitorId: 'jv-2' })
      ]

      prismaMock.$queryRaw.mockResolvedValue(records)
      prismaMock.visitor.findFirst.mockResolvedValue({
        id: 'visitor-correct'
      } as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)
      prismaMock.event.count.mockResolvedValue(0)

      const results = await fixCrossTeamVisitors(prismaMock, true)

      expect(results).toHaveLength(2)
      expect(results[0].action).toBe('reassigned')
      expect(results[1].action).toBe('reassigned')
    })

    it('should return empty array when no mismatches found', async () => {
      prismaMock.$queryRaw.mockResolvedValue([])

      const results = await fixCrossTeamVisitors(prismaMock, true)

      expect(results).toEqual([])
    })

    it('should continue processing on individual record errors', async () => {
      const records = [
        makeMismatchedRecord({ journeyVisitorId: 'jv-1' }),
        makeMismatchedRecord({ journeyVisitorId: 'jv-2' })
      ]

      prismaMock.$queryRaw.mockResolvedValue(records)
      prismaMock.visitor.findFirst
        .mockRejectedValueOnce(new Error('DB connection lost'))
        .mockResolvedValueOnce({ id: 'visitor-correct' } as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)
      prismaMock.event.count.mockResolvedValue(1)

      const results = await fixCrossTeamVisitors(prismaMock, true)

      expect(results).toHaveLength(2)
      expect(results[0].action).toBe('skipped')
      expect(results[1].action).toBe('reassigned')
    })
  })
})
