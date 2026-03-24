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

    describe('merge (correct visitor + correct JV exist)', () => {
      it('should move events, merge stats, and delete wrong JV', async () => {
        const record = makeMismatchedRecord()

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

      it('should not overwrite existing fields on correct JV', async () => {
        const record = makeMismatchedRecord()
        const wrongJVWithText = {
          ...wrongJV,
          lastTextResponse: 'from-wrong'
        }

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique
          .mockResolvedValueOnce(correctJV as any)
          .mockResolvedValueOnce(wrongJVWithText as any)
        prismaMock.event.count.mockResolvedValue(0)
        prismaMock.$transaction.mockResolvedValue([])

        await fixMismatchedRecord(prismaMock, record, false)

        const updateCall = prismaMock.journeyVisitor.update.mock.calls[0][0]
        expect(updateCall.data).not.toHaveProperty('lastTextResponse')
      })

      it('should report merge in dry run without modifying data', async () => {
        const record = makeMismatchedRecord()

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique.mockResolvedValue(
          correctJV as any
        )
        prismaMock.event.count.mockResolvedValue(3)

        const result = await fixMismatchedRecord(prismaMock, record, true)

        expect(result.action).toBe('merged')
        expect(result.eventsUpdated).toBe(3)
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })
    })

    describe('skip cases', () => {
      it('should skip when no correct visitor exists', async () => {
        const record = makeMismatchedRecord()

        prismaMock.visitor.findFirst.mockResolvedValue(null)

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('skipped')
        expect(result.skipReason).toContain('no correct visitor')
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })

      it('should skip when correct visitor exists but no correct JV', async () => {
        const record = makeMismatchedRecord()

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('skipped')
        expect(result.skipReason).toContain('no correct JourneyVisitor')
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })

      it('should skip when wrong JV disappeared before fix', async () => {
        const record = makeMismatchedRecord()

        prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
        prismaMock.journeyVisitor.findUnique
          .mockResolvedValueOnce(correctJV as any)
          .mockResolvedValueOnce(null)
        prismaMock.event.count.mockResolvedValue(0)

        const result = await fixMismatchedRecord(prismaMock, record, false)

        expect(result.action).toBe('skipped')
        expect(result.skipReason).toContain('disappeared')
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
      const correctVisitor = { id: 'visitor-correct' }
      const correctJV = {
        id: 'jv-correct',
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

      prismaMock.$queryRaw.mockResolvedValue(records)
      prismaMock.visitor.findFirst.mockResolvedValue(correctVisitor as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(correctJV as any)
      prismaMock.event.count.mockResolvedValue(0)

      const results = await fixCrossTeamVisitors(prismaMock, true)

      expect(results).toHaveLength(2)
      expect(results[0].action).toBe('merged')
      expect(results[1].action).toBe('merged')
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
      const correctVisitor = { id: 'visitor-correct' }
      const correctJV = {
        id: 'jv-correct',
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

      prismaMock.$queryRaw.mockResolvedValue(records)
      prismaMock.visitor.findFirst
        .mockRejectedValueOnce(new Error('DB connection lost'))
        .mockResolvedValueOnce(correctVisitor as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(correctJV as any)
      prismaMock.event.count.mockResolvedValue(1)

      const results = await fixCrossTeamVisitors(prismaMock, true)

      expect(results).toHaveLength(2)
      expect(results[0].action).toBe('skipped')
      expect(results[1].action).toBe('merged')
    })

    it('should log skipped records with reasons in summary', async () => {
      const records = [makeMismatchedRecord()]

      prismaMock.$queryRaw.mockResolvedValue(records)
      prismaMock.visitor.findFirst.mockResolvedValue(null)

      const consoleSpy = jest.spyOn(console, 'log')

      const results = await fixCrossTeamVisitors(prismaMock, true)

      expect(results[0].action).toBe('skipped')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipped Records')
      )

      consoleSpy.mockRestore()
    })
  })
})
