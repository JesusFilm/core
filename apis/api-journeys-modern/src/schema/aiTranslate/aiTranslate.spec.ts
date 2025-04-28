import { getClient } from '../../../test/client'

// Mock BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({
      id: 'job-123',
      getState: () => 'waiting'
    })
  })),
  Job: jest.fn()
}))

describe('aiTranslate', () => {
  const client = getClient()
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'userId'
      }
    }
  })

  describe('mutations', () => {
    describe('aiTranslateJourneyCreate', () => {
      // Use a string for the GraphQL query to avoid schema validation issues
      // @ts-expect-error - Suppressing TypeScript validation for test
      const AI_TRANSLATE_JOURNEY_CREATE = /* GraphQL */ `
        mutation AiTranslateJourneyCreate(
          $journeyId: ID!
          $name: String!
          $textLanguage: String!
          $videoLanguage: String
        ) {
          aiTranslateJourneyCreate(
            input: {
              journeyId: $journeyId
              name: $name
              textLanguage: $textLanguage
              videoLanguage: $videoLanguage
            }
          )
        }
      `

      it('should return job id when successful', async () => {
        const result = await authClient({
          document: AI_TRANSLATE_JOURNEY_CREATE,
          variables: {
            journeyId: 'journey-123',
            name: 'Test Journey Translation',
            textLanguage: 'es',
            videoLanguage: 'es'
          }
        })

        expect(result).toEqual({
          data: {
            aiTranslateJourneyCreate: 'job-123'
          }
        })
      })

      it('should return null when not authenticated', async () => {
        const result = await client({
          document: AI_TRANSLATE_JOURNEY_CREATE,
          variables: {
            journeyId: 'journey-123',
            name: 'Test Journey Translation',
            textLanguage: 'es',
            videoLanguage: 'es'
          }
        })

        expect(result).toEqual({
          data: null,
          errors: [
            expect.objectContaining({
              message: expect.stringContaining('Not authorized')
            })
          ]
        })
      })

      it('should handle missing videoLanguage parameter', async () => {
        const result = await authClient({
          document: AI_TRANSLATE_JOURNEY_CREATE,
          variables: {
            journeyId: 'journey-123',
            name: 'Test Journey Translation',
            textLanguage: 'es'
          }
        })

        expect(result).toEqual({
          data: {
            aiTranslateJourneyCreate: 'job-123'
          }
        })
      })

      it('should throw error if job creation fails', async () => {
        // Override the default mock for this specific test
        const mockQueue = require('bullmq').Queue
        mockQueue.mockImplementationOnce(() => ({
          add: jest.fn().mockResolvedValue({
            id: null
          })
        }))

        const result = await authClient({
          document: AI_TRANSLATE_JOURNEY_CREATE,
          variables: {
            journeyId: 'journey-123',
            name: 'Test Journey Translation',
            textLanguage: 'es'
          }
        })

        expect(result).toEqual({
          data: null,
          errors: [
            expect.objectContaining({
              message: 'Failed to create job'
            })
          ]
        })
      })
    })
  })
})
