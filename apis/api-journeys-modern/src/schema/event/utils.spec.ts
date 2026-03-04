import { prismaMock } from '../../../test/prismaMock'

import {
  __setEmailQueueForTests,
  __setGoogleSheetsSyncQueueForTests,
  appendEventToGoogleSheets,
  getByUserIdAndJourneyId,
  getEventContext,
  getOrCreateVisitor,
  resetEventsEmailDelay,
  sendEventsEmail,
  validateBlock,
  validateBlockEvent
} from './utils'

const mockEmailQueue = {
  getJob: jest.fn(),
  remove: jest.fn(),
  add: jest.fn()
}

const mockGoogleSheetsSyncQueue = {
  add: jest.fn()
}

jest.mock('../../workers/emailEvents/queue', () => ({
  queue: mockEmailQueue
}))

jest.mock('../../workers/googleSheetsSync/queue', () => ({
  queue: mockGoogleSheetsSyncQueue
}))

const mockLogger = {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}

jest.mock('../logger', () => ({
  get logger() {
    return mockLogger
  }
}))

describe('event utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up queue mocks before tests run
    __setEmailQueueForTests(mockEmailQueue)
    __setGoogleSheetsSyncQueueForTests(mockGoogleSheetsSyncQueue)
    // Clear NODE_ENV to allow queue to work
    delete process.env.NODE_ENV
  })

  afterEach(() => {
    // Restore test environment
    process.env.NODE_ENV = 'test'
  })

  describe('validateBlockEvent', () => {
    it('should return visitor, journeyVisitor, journeyId, teamId, and block when valid', async () => {
      const mockBlock = {
        id: 'block-id',
        journeyId: 'journey-id'
      }
      const mockVisitor = {
        id: 'visitor-id'
      }
      const mockJourneyVisitor = {
        id: 'jv-id',
        journeyId: 'journey-id',
        visitorId: 'visitor-id'
      }
      const mockJourney = {
        teamId: 'team-id'
      }

      prismaMock.block.findUnique.mockResolvedValue(mockBlock as any)
      prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
      prismaMock.visitor.findFirst.mockResolvedValue(mockVisitor as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(
        mockJourneyVisitor as any
      )
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'step-id',
        journeyId: 'journey-id',
        deletedAt: null
      } as any)

      const result = await validateBlockEvent('user-id', 'block-id', 'step-id')

      expect(result).toEqual({
        visitor: mockVisitor,
        journeyVisitor: mockJourneyVisitor,
        journeyId: 'journey-id',
        teamId: 'team-id',
        block: mockBlock
      })
    })

    it('should create journeyVisitor if it does not exist', async () => {
      const mockBlock = {
        id: 'block-id',
        journeyId: 'journey-id'
      }
      const mockVisitor = {
        id: 'visitor-id'
      }
      const mockJourneyVisitor = {
        id: 'jv-id',
        journeyId: 'journey-id',
        visitorId: 'visitor-id'
      }
      const mockJourney = {
        teamId: 'team-id'
      }

      prismaMock.block.findUnique.mockResolvedValue(mockBlock as any)
      prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
      prismaMock.visitor.findFirst.mockResolvedValue(mockVisitor as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)
      prismaMock.journeyVisitor.create.mockResolvedValue(
        mockJourneyVisitor as any
      )
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'step-id',
        journeyId: 'journey-id',
        deletedAt: null
      } as any)

      const result = await validateBlockEvent('user-id', 'block-id', 'step-id')

      expect(prismaMock.journeyVisitor.create).toHaveBeenCalledWith({
        data: {
          journeyId: 'journey-id',
          visitorId: 'visitor-id'
        }
      })

      expect(result.journeyVisitor).toEqual(mockJourneyVisitor)
      expect(result.teamId).toEqual('team-id')
    })

    it('should throw error when block does not exist', async () => {
      prismaMock.block.findUnique.mockResolvedValue(null)

      await expect(validateBlockEvent('user-id', 'block-id')).rejects.toThrow(
        'Block does not exist'
      )
    })

    it('should throw error when journey does not exist', async () => {
      prismaMock.block.findUnique.mockResolvedValue({
        id: 'block-id',
        journeyId: 'journey-id'
      } as any)
      prismaMock.journey.findUnique.mockResolvedValue(null)

      await expect(validateBlockEvent('user-id', 'block-id')).rejects.toThrow(
        'Journey does not exist'
      )
    })

    it('should throw error when visitor does not exist', async () => {
      prismaMock.block.findUnique.mockResolvedValue({
        id: 'block-id',
        journeyId: 'journey-id'
      } as any)
      prismaMock.journey.findUnique.mockResolvedValue({
        teamId: 'team-id'
      } as any)
      prismaMock.visitor.findFirst.mockResolvedValue(null)

      await expect(validateBlockEvent('user-id', 'block-id')).rejects.toThrow(
        'Visitor does not exist'
      )
    })

    it('should throw error when stepId is invalid', async () => {
      prismaMock.block.findUnique.mockResolvedValue({
        id: 'block-id',
        journeyId: 'journey-id'
      } as any)
      prismaMock.journey.findUnique.mockResolvedValue({
        teamId: 'team-id'
      } as any)
      prismaMock.visitor.findFirst.mockResolvedValue({
        id: 'visitor-id'
      } as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue({
        id: 'jv-id',
        journeyId: 'journey-id',
        visitorId: 'visitor-id'
      } as any)
      prismaMock.block.findFirst.mockResolvedValue(null)

      await expect(
        validateBlockEvent('user-id', 'block-id', 'invalid-step-id')
      ).rejects.toThrow('Step ID invalid-step-id does not exist on Journey')
    })
  })

  describe('validateBlock', () => {
    it('should return true when block exists and matches journeyId', async () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'block-id',
        journeyId: 'journey-id',
        deletedAt: null
      } as any)

      const result = await validateBlock('block-id', 'journey-id', 'journeyId')

      expect(result).toBe(true)
    })

    it('should return true when block exists and matches parentBlockId', async () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'block-id',
        parentBlockId: 'parent-id',
        deletedAt: null
      } as any)

      const result = await validateBlock(
        'block-id',
        'parent-id',
        'parentBlockId'
      )

      expect(result).toBe(true)
    })

    it('should return false when block does not exist', async () => {
      prismaMock.block.findFirst.mockResolvedValue(null)

      const result = await validateBlock('block-id', 'journey-id', 'journeyId')

      expect(result).toBe(false)
    })

    it('should return false when block does not match', async () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'block-id',
        journeyId: 'other-journey-id',
        deletedAt: null
      } as any)

      const result = await validateBlock('block-id', 'journey-id', 'journeyId')

      expect(result).toBe(false)
    })

    it('should handle null id', async () => {
      const result = await validateBlock(null, 'journey-id', 'journeyId')

      expect(result).toBe(false)
      expect(prismaMock.block.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('getByUserIdAndJourneyId', () => {
    it('should return visitor and journeyVisitor when both exist', async () => {
      const mockVisitor = {
        id: 'visitor-id'
      }
      const mockJourneyVisitor = {
        id: 'jv-id',
        journeyId: 'journey-id',
        visitorId: 'visitor-id'
      }

      prismaMock.visitor.findFirst.mockResolvedValue(mockVisitor as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(
        mockJourneyVisitor as any
      )

      const result = await getByUserIdAndJourneyId('user-id', 'journey-id')

      expect(result).toEqual({
        visitor: mockVisitor,
        journeyVisitor: mockJourneyVisitor
      })
    })

    it('should return null when visitor does not exist', async () => {
      prismaMock.visitor.findFirst.mockResolvedValue(null)

      const result = await getByUserIdAndJourneyId('user-id', 'journey-id')

      expect(result).toBeNull()
    })

    it('should return null when journeyVisitor does not exist', async () => {
      prismaMock.visitor.findFirst.mockResolvedValue({
        id: 'visitor-id'
      } as any)
      prismaMock.journeyVisitor.findUnique.mockResolvedValue(null)

      const result = await getByUserIdAndJourneyId('user-id', 'journey-id')

      expect(result).toBeNull()
    })
  })

  describe('getEventContext', () => {
    it('should return journeyId from block', async () => {
      prismaMock.block.findUnique.mockResolvedValue({
        id: 'block-id',
        journey: {
          id: 'journey-id'
        }
      } as any)

      const result = await getEventContext('block-id')

      expect(result).toEqual({
        journeyId: 'journey-id'
      })
    })

    it('should use provided journeyId when available', async () => {
      prismaMock.block.findUnique.mockResolvedValue({
        id: 'block-id',
        journey: {
          id: 'journey-id'
        }
      } as any)

      const result = await getEventContext('block-id', 'provided-journey-id')

      expect(result).toEqual({
        journeyId: 'provided-journey-id'
      })
    })

    it('should throw error when block or journey not found', async () => {
      prismaMock.block.findUnique.mockResolvedValue(null)

      await expect(getEventContext('block-id')).rejects.toThrow(
        'Block or Journey not found'
      )
    })
  })

  describe('getOrCreateVisitor', () => {
    it('should return placeholder visitor ID', async () => {
      const result = await getOrCreateVisitor({} as any)

      expect(result).toBe('visitor-placeholder-id')
    })
  })

  describe('sendEventsEmail', () => {
    beforeEach(() => {
      __setEmailQueueForTests(mockEmailQueue)
      delete process.env.NODE_ENV
    })

    it('should add email job to queue', async () => {
      mockEmailQueue.getJob.mockResolvedValue(null)

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'visitor-event',
        { journeyId: 'journey-id', visitorId: 'visitor-id' },
        expect.objectContaining({
          jobId: 'visitor-event-journey-id-visitor-id',
          delay: 2 * 60 * 1000,
          removeOnComplete: true,
          removeOnFail: { age: 24 * 60 * 60, count: 50 }
        })
      )
    })

    it('should remove existing job before adding new one', async () => {
      const existingJob = { id: 'existing-job' }
      mockEmailQueue.getJob.mockResolvedValue(existingJob as any)

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(mockEmailQueue.remove).toHaveBeenCalledWith(
        'visitor-event-journey-id-visitor-id'
      )
      expect(mockEmailQueue.add).toHaveBeenCalled()
    })

    it('should not send email in test environment', async () => {
      __setEmailQueueForTests(null)

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(mockEmailQueue.add).not.toHaveBeenCalled()

      // Restore for other tests
      __setEmailQueueForTests(mockEmailQueue)
    })
  })

  describe('resetEventsEmailDelay', () => {
    beforeEach(() => {
      __setEmailQueueForTests(mockEmailQueue)
      delete process.env.NODE_ENV
    })

    it('should change delay of existing job', async () => {
      const existingJob = {
        changeDelay: jest.fn().mockResolvedValue(undefined)
      }
      mockEmailQueue.getJob.mockResolvedValue(existingJob as any)

      await resetEventsEmailDelay('journey-id', 'visitor-id', 300)

      expect(existingJob.changeDelay).toHaveBeenCalledWith(300000)
    })

    it('should use minimum delay of 2 minutes', async () => {
      const existingJob = {
        changeDelay: jest.fn().mockResolvedValue(undefined)
      }
      mockEmailQueue.getJob.mockResolvedValue(existingJob as any)

      await resetEventsEmailDelay('journey-id', 'visitor-id', 60)

      expect(existingJob.changeDelay).toHaveBeenCalledWith(2 * 60 * 1000)
    })

    it('should return early if job does not exist', async () => {
      mockEmailQueue.getJob.mockResolvedValue(null)

      await resetEventsEmailDelay('journey-id', 'visitor-id')

      expect(mockEmailQueue.getJob).toHaveBeenCalledWith(
        'visitor-event-journey-id-visitor-id'
      )
    })

    it('should not reset delay in test environment', async () => {
      __setEmailQueueForTests(null)

      await resetEventsEmailDelay('journey-id', 'visitor-id')

      expect(mockEmailQueue.getJob).not.toHaveBeenCalled()

      // Restore for other tests
      __setEmailQueueForTests(mockEmailQueue)
    })
  })

  describe('appendEventToGoogleSheets', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      __setGoogleSheetsSyncQueueForTests(mockGoogleSheetsSyncQueue)
      delete process.env.NODE_ENV
      mockLogger.warn.mockClear()
    })

    it('should return early when no sync config exists', async () => {
      prismaMock.googleSheetsSync.findMany.mockResolvedValue([])

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', 'Name', 'email@test.com', '', '', '']
      })

      expect(mockGoogleSheetsSyncQueue.add).not.toHaveBeenCalled()
    })

    it('should add backfill job to queue with correct data when syncs exist', async () => {
      const mockSync = {
        id: 'sync-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: 'Sheet1',
        timezone: 'UTC',
        integrationId: 'integration-id'
      }

      prismaMock.googleSheetsSync.findMany.mockResolvedValue([mockSync] as any)

      const row = [
        'visitor-id',
        '2024-01-01T00:00:00.000Z',
        'John Doe',
        'john@example.com',
        '+1234567890',
        'block-id-label',
        'dynamic-value'
      ]

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row
      })

      expect(mockGoogleSheetsSyncQueue.add).toHaveBeenCalledWith(
        'google-sheets-sync-backfill',
        {
          type: 'backfill',
          journeyId: 'journey-id',
          teamId: 'team-id',
          syncId: 'sync-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1',
          timezone: 'UTC',
          integrationId: 'integration-id'
        },
        expect.objectContaining({
          jobId: 'backfill-sync-id',
          delay: expect.any(Number),
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: { age: 3600 }
        })
      )

      // Verify delay is between 1-60 seconds (1000-60000ms)
      const callArgs = mockGoogleSheetsSyncQueue.add.mock.calls[0]
      const delay = callArgs[2]?.delay
      expect(delay).toBeGreaterThanOrEqual(1000)
      expect(delay).toBeLessThanOrEqual(60000)
    })

    it('should skip syncs without integrationId', async () => {
      const mockSync = {
        id: 'sync-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: 'Sheet1',
        timezone: 'UTC',
        integrationId: null
      }

      prismaMock.googleSheetsSync.findMany.mockResolvedValue([mockSync] as any)

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', '', '', '', '', '']
      })

      expect(mockGoogleSheetsSyncQueue.add).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { syncId: 'sync-id', journeyId: 'journey-id', teamId: 'team-id' },
        'Skipping Google Sheets sync: missing integrationId'
      )
    })

    it('should skip syncs without sheetName', async () => {
      const mockSync = {
        id: 'sync-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: null,
        timezone: 'UTC',
        integrationId: 'integration-id'
      }

      prismaMock.googleSheetsSync.findMany.mockResolvedValue([mockSync] as any)

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', '', '', '', '', '']
      })

      expect(mockGoogleSheetsSyncQueue.add).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { syncId: 'sync-id', journeyId: 'journey-id', teamId: 'team-id' },
        'Skipping Google Sheets sync: missing sheetName'
      )
    })

    it('should queue separate backfill jobs for multiple syncs', async () => {
      const mockSync1 = {
        id: 'sync-id-1',
        spreadsheetId: 'spreadsheet-id-1',
        sheetName: 'Sheet1',
        timezone: 'UTC',
        integrationId: 'integration-id-1'
      }
      const mockSync2 = {
        id: 'sync-id-2',
        spreadsheetId: 'spreadsheet-id-2',
        sheetName: 'Sheet2',
        timezone: 'Pacific/Auckland',
        integrationId: 'integration-id-2'
      }

      prismaMock.googleSheetsSync.findMany.mockResolvedValue([
        mockSync1,
        mockSync2
      ] as any)

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', '', '', '', '', '']
      })

      expect(mockGoogleSheetsSyncQueue.add).toHaveBeenCalledTimes(2)
      expect(mockGoogleSheetsSyncQueue.add).toHaveBeenNthCalledWith(
        1,
        'google-sheets-sync-backfill',
        {
          type: 'backfill',
          journeyId: 'journey-id',
          teamId: 'team-id',
          syncId: 'sync-id-1',
          spreadsheetId: 'spreadsheet-id-1',
          sheetName: 'Sheet1',
          timezone: 'UTC',
          integrationId: 'integration-id-1'
        },
        expect.objectContaining({
          jobId: 'backfill-sync-id-1',
          delay: expect.any(Number)
        })
      )
      expect(mockGoogleSheetsSyncQueue.add).toHaveBeenNthCalledWith(
        2,
        'google-sheets-sync-backfill',
        {
          type: 'backfill',
          journeyId: 'journey-id',
          teamId: 'team-id',
          syncId: 'sync-id-2',
          spreadsheetId: 'spreadsheet-id-2',
          sheetName: 'Sheet2',
          timezone: 'Pacific/Auckland',
          integrationId: 'integration-id-2'
        },
        expect.objectContaining({
          jobId: 'backfill-sync-id-2',
          delay: expect.any(Number)
        })
      )
    })

    it('should not add job when queue is null', async () => {
      __setGoogleSheetsSyncQueueForTests(null)

      const mockSync = {
        id: 'sync-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: 'Sheet1',
        timezone: 'UTC'
      }

      prismaMock.googleSheetsSync.findMany.mockResolvedValue([mockSync] as any)

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', '', '', '', '', '']
      })

      // Queue was set to null, so findMany should not even be called
      expect(prismaMock.googleSheetsSync.findMany).not.toHaveBeenCalled()

      // Restore for other tests
      __setGoogleSheetsSyncQueueForTests(mockGoogleSheetsSyncQueue)
    })
  })
})
