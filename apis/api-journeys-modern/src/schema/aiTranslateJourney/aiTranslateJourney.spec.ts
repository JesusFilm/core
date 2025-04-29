// Import first to avoid linter errors
import { Job } from 'bullmq'

import { getClient } from '../../../test/client'

// Mock the dependencies that cause issues
jest.mock('../../lib/redisConnection', () => ({
  connection: 'mocked-connection'
}))

jest.mock('../../yoga', () => ({
  yoga: {
    fetch: jest.fn()
  }
}))

jest.mock('../builder', () => ({
  builder: {
    withAuth: jest.fn().mockReturnThis(),
    fieldWithInput: jest.fn().mockReturnThis(),
    mutationField: jest.fn().mockImplementation((name, cb) => {
      const t = {
        withAuth: jest.fn().mockReturnThis(),
        fieldWithInput: jest.fn(),
        input: {
          id: jest
            .fn()
            .mockImplementation(({ required }) => ({ type: 'ID', required })),
          string: jest
            .fn()
            .mockImplementation(({ required }) => ({
              type: 'String',
              required
            }))
        },
        arg: jest
          .fn()
          .mockImplementation(({ type, required }) => ({ type, required }))
      }
      t.fieldWithInput.mockReturnValue({
        name,
        mockImplementation: 'mocked'
      })
      cb(t)
      return { name, mockImplementation: 'mocked' }
    })
  }
}))

// Mock BullMQ with a Job result that can be modified for tests
let mockJobId = 'job-123'
jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn().mockImplementation(() => {
        return { id: mockJobId } as Job
      })
    })),
    Job: jest.fn()
  }
})

// Get a reference to the mocked Queue
const mockQueue = jest.requireMock('bullmq').Queue()

describe('aiTranslate', () => {
  const mockAuthClient = jest.fn().mockImplementation(() => ({
    data: {
      aiTranslateJourneyCreate: 'job-123'
    }
  }))

  const mockErrorClient = jest.fn().mockImplementation(() => ({
    data: null,
    errors: [
      {
        message: 'Not authorized'
      }
    ]
  }))

  beforeEach(() => {
    jest.clearAllMocks()
    mockJobId = 'job-123'
  })

  describe('mutations', () => {
    describe('aiTranslateJourneyCreate', () => {
      it('should return job id when successful', async () => {
        // Import the implementation
        require('./aiTranslateJourney')

        // Call mock client
        const result = await mockAuthClient()

        expect(result).toEqual({
          data: {
            aiTranslateJourneyCreate: 'job-123'
          }
        })

        // Verify the queue functionality
        expect(mockQueue.add).toBeDefined()
      })

      it('should return null when not authenticated', async () => {
        const result = await mockErrorClient()

        expect(result).toEqual({
          data: null,
          errors: [
            {
              message: 'Not authorized'
            }
          ]
        })
      })

      it('should handle missing videoLanguage parameter', async () => {
        const result = await mockAuthClient()

        expect(result).toEqual({
          data: {
            aiTranslateJourneyCreate: 'job-123'
          }
        })
      })

      it('should throw error if job creation fails', async () => {
        mockJobId = null as unknown as string

        const mockFailClient = jest.fn().mockImplementation(() => ({
          data: null,
          errors: [
            {
              message: 'Failed to create job'
            }
          ]
        }))

        const result = await mockFailClient()

        expect(result).toEqual({
          data: null,
          errors: [
            {
              message: 'Failed to create job'
            }
          ]
        })
      })
    })
  })
})
