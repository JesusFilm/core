import { format } from 'date-fns'

import { prismaMock } from '../../../test/prismaMock'
import { getTeamGoogleAccessToken } from '../../lib/google/googleAuth'
import {
  ensureSheet,
  readValues,
  updateRangeValues,
  writeValues
} from '../../lib/google/sheets'

import {
  __setEmailQueueForTests,
  appendEventToGoogleSheets,
  getByUserIdAndJourneyId,
  getEventContext,
  getOrCreateVisitor,
  resetEventsEmailDelay,
  sendEventsEmail,
  validateBlock,
  validateBlockEvent
} from './utils'

jest.mock('../../lib/google/googleAuth', () => ({
  getTeamGoogleAccessToken: jest.fn()
}))

jest.mock('../../lib/google/sheets', () => ({
  ensureSheet: jest.fn(),
  readValues: jest.fn(),
  updateRangeValues: jest.fn(),
  writeValues: jest.fn(),
  columnIndexToA1: jest.fn((n) => String.fromCharCode(65 + n))
}))

const mockQueue = {
  getJob: jest.fn(),
  remove: jest.fn(),
  add: jest.fn()
}

jest.mock('../../workers/emailEvents/queue', () => ({
  queue: mockQueue
}))

const mockGetTeamGoogleAccessToken =
  getTeamGoogleAccessToken as jest.MockedFunction<
    typeof getTeamGoogleAccessToken
  >
const mockEnsureSheet = ensureSheet as jest.MockedFunction<typeof ensureSheet>
const mockReadValues = readValues as jest.MockedFunction<typeof readValues>
const mockUpdateRangeValues = updateRangeValues as jest.MockedFunction<
  typeof updateRangeValues
>
const mockWriteValues = writeValues as jest.MockedFunction<typeof writeValues>

describe('event utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up email queue mock before tests run
    __setEmailQueueForTests(mockQueue)
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
      __setEmailQueueForTests(mockQueue)
      delete process.env.NODE_ENV
    })

    it('should add email job to queue', async () => {
      mockQueue.getJob.mockResolvedValue(null)

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(mockQueue.add).toHaveBeenCalledWith(
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
      mockQueue.getJob.mockResolvedValue(existingJob as any)

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(mockQueue.remove).toHaveBeenCalledWith(
        'visitor-event-journey-id-visitor-id'
      )
      expect(mockQueue.add).toHaveBeenCalled()
    })

    it('should not send email in test environment', async () => {
      __setEmailQueueForTests(null)

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(mockQueue.add).not.toHaveBeenCalled()

      // Restore for other tests
      __setEmailQueueForTests(mockQueue)
    })
  })

  describe('resetEventsEmailDelay', () => {
    beforeEach(() => {
      __setEmailQueueForTests(mockQueue)
      delete process.env.NODE_ENV
    })

    it('should change delay of existing job', async () => {
      const existingJob = {
        changeDelay: jest.fn().mockResolvedValue(undefined)
      }
      mockQueue.getJob.mockResolvedValue(existingJob as any)

      await resetEventsEmailDelay('journey-id', 'visitor-id', 300)

      expect(existingJob.changeDelay).toHaveBeenCalledWith(300000)
    })

    it('should use minimum delay of 2 minutes', async () => {
      const existingJob = {
        changeDelay: jest.fn().mockResolvedValue(undefined)
      }
      mockQueue.getJob.mockResolvedValue(existingJob as any)

      await resetEventsEmailDelay('journey-id', 'visitor-id', 60)

      expect(existingJob.changeDelay).toHaveBeenCalledWith(2 * 60 * 1000)
    })

    it('should return early if job does not exist', async () => {
      mockQueue.getJob.mockResolvedValue(null)

      await resetEventsEmailDelay('journey-id', 'visitor-id')

      expect(mockQueue.getJob).toHaveBeenCalledWith(
        'visitor-event-journey-id-visitor-id'
      )
    })

    it('should not reset delay in test environment', async () => {
      __setEmailQueueForTests(null)

      await resetEventsEmailDelay('journey-id', 'visitor-id')

      expect(mockQueue.getJob).not.toHaveBeenCalled()

      // Restore for other tests
      __setEmailQueueForTests(mockQueue)
    })
  })

  describe('appendEventToGoogleSheets', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return early when no sync config exists', async () => {
      prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', 'Name', 'email@test.com', '', '', '']
      })

      expect(mockGetTeamGoogleAccessToken).not.toHaveBeenCalled()
    })

    it('should append new row when visitor does not exist in sheet', async () => {
      const mockSync = {
        id: 'sync-id',
        journeyId: 'journey-id',
        teamId: 'team-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: 'Sheet1',
        deletedAt: null
      }

      prismaMock.googleSheetsSync.findFirst.mockResolvedValue(mockSync as any)
      mockGetTeamGoogleAccessToken.mockResolvedValue({
        accessToken: 'access-token'
      })
      mockEnsureSheet.mockResolvedValue(undefined)
      mockReadValues
        .mockResolvedValueOnce([
          ['visitorId', 'createdAt', 'name', 'email', 'phone']
        ])
        .mockResolvedValueOnce([])

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: [
          'visitor-id',
          '2024-01-01T00:00:00.000Z',
          'John Doe',
          'john@example.com',
          '+1234567890',
          'dynamic-key',
          'dynamic-value'
        ]
      })

      expect(mockWriteValues).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'access-token',
          spreadsheetId: 'spreadsheet-id',
          sheetTitle: 'Sheet1',
          values: expect.arrayContaining([expect.any(Array)]),
          append: true
        })
      )
      expect(mockUpdateRangeValues).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'access-token',
          spreadsheetId: 'spreadsheet-id',
          range: 'Sheet1!A1:F1',
          values: [
            expect.arrayContaining([
              'visitorId',
              'createdAt',
              'name',
              'email',
              'phone',
              'dynamic-key'
            ])
          ]
        })
      )
    })

    it('should update existing row when visitor exists in sheet', async () => {
      const mockSync = {
        id: 'sync-id',
        journeyId: 'journey-id',
        teamId: 'team-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: 'Sheet1',
        deletedAt: null
      }

      prismaMock.googleSheetsSync.findFirst.mockResolvedValue(mockSync as any)
      mockGetTeamGoogleAccessToken.mockResolvedValue({
        accessToken: 'access-token'
      })
      mockEnsureSheet.mockResolvedValue(undefined)
      mockReadValues
        .mockResolvedValueOnce([
          ['visitorId', 'createdAt', 'name', 'email', 'phone']
        ])
        .mockResolvedValueOnce([['visitor-id']])
        .mockResolvedValueOnce([
          ['visitor-id', '2024-01-01', 'John Doe', 'john@example.com', '']
        ])

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: [
          'visitor-id',
          '2024-01-01T00:00:00.000Z',
          'John Doe',
          'john@example.com',
          '',
          '',
          ''
        ]
      })

      expect(mockReadValues).toHaveBeenCalledTimes(3)
      expect(mockUpdateRangeValues).toHaveBeenCalled()
      expect(mockWriteValues).not.toHaveBeenCalled()
    })

    it('should use date-based sheet name when not provided', async () => {
      const mockSync = {
        id: 'sync-id',
        journeyId: 'journey-id',
        teamId: 'team-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: null,
        deletedAt: null
      }

      const today = format(new Date(), 'yyyy-MM-dd')

      prismaMock.googleSheetsSync.findFirst.mockResolvedValue(mockSync as any)
      mockGetTeamGoogleAccessToken.mockResolvedValue({
        accessToken: 'access-token'
      })
      mockEnsureSheet.mockResolvedValue(undefined)
      mockReadValues
        .mockResolvedValueOnce([
          ['visitorId', 'createdAt', 'name', 'email', 'phone']
        ])
        .mockResolvedValueOnce([])

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: ['visitor-id', '2024-01-01', '', '', '', '', '']
      })

      expect(mockEnsureSheet).toHaveBeenCalledWith(
        expect.objectContaining({
          sheetTitle: today
        })
      )
    })

    it('should merge headers when dynamic keys are present', async () => {
      const mockSync = {
        id: 'sync-id',
        journeyId: 'journey-id',
        teamId: 'team-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: 'Sheet1',
        deletedAt: null
      }

      prismaMock.googleSheetsSync.findFirst.mockResolvedValue(mockSync as any)
      mockGetTeamGoogleAccessToken.mockResolvedValue({
        accessToken: 'access-token'
      })
      mockEnsureSheet.mockResolvedValue(undefined)
      // First call: read headers (existing headers without custom-field)
      // Second call: check for existing visitor (empty = new visitor)
      mockReadValues
        .mockResolvedValueOnce([
          ['visitorId', 'createdAt', 'name', 'email', 'phone']
        ])
        .mockResolvedValueOnce([])
      mockUpdateRangeValues.mockResolvedValue(undefined)

      await appendEventToGoogleSheets({
        journeyId: 'journey-id',
        teamId: 'team-id',
        row: [
          'visitor-id',
          '2024-01-01',
          '',
          '',
          '',
          'custom-field',
          'custom-value'
        ]
      })

      // Headers should be updated first when dynamic key is added (headers changed)
      expect(mockUpdateRangeValues).toHaveBeenCalledWith(
        expect.objectContaining({
          values: [
            expect.arrayContaining([
              'visitorId',
              'createdAt',
              'name',
              'email',
              'phone',
              'custom-field'
            ])
          ]
        })
      )
      // Then row should be appended
      expect(mockWriteValues).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.arrayContaining([expect.any(Array)]),
          append: true
        })
      )
    })
  })
})
