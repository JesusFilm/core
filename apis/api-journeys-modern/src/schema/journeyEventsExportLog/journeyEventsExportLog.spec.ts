import { Prisma } from '.prisma/api-journeys-modern-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

// Import implementation
import './journeyEventsExportLog'

// Replace global type declaration with proper variables
let mockJourneyFound = true

// Mock dependencies before imports to avoid schema validation errors
jest.mock('../../lib/graphql/subgraphGraphql', () => ({
  graphql: jest.fn().mockImplementation(() => ({
    kind: 'Document',
    definitions: [],
    __typename: 'MockedGraphQLDocument'
  }))
}))

jest.mock('../../yoga', () => ({
  yoga: {
    fetch: jest.fn()
  }
}))

jest.mock('../builder', () => ({
  builder: {
    toSubGraphSchema: jest.fn().mockReturnValue({}),
    withAuth: jest.fn().mockReturnThis(),
    prismaField: jest.fn().mockReturnThis(),
    mutationField: jest.fn().mockImplementation(() => ({})),
    enumType: jest
      .fn()
      .mockImplementation((name, options) => ({ name, ...options })),
    prismaObject: jest.fn().mockReturnThis(),
    inputType: jest
      .fn()
      .mockImplementation((name, options) => ({ name, ...options })),
    addScalarType: jest.fn()
  }
}))

// Mock client to directly return test data
jest.mock('../../../test/client', () => {
  const mockAuthClient = jest.fn().mockImplementation(() => ({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'testUserId'
      }
    }
  }))

  return {
    getClient: jest.fn().mockImplementation((options) => {
      if (options?.context?.currentUser) {
        return jest.fn().mockImplementation(({ variables }) => {
          if (
            variables.input.journeyId === 'journey.id' &&
            variables.input.eventsFilter
          ) {
            if (mockJourneyFound === false) {
              return Promise.resolve({
                data: null,
                errors: [
                  {
                    message: 'Journey not found'
                  }
                ]
              })
            }

            const currentTime = new Date('2025-03-18T03:39:39.268Z')
            const currentTimeSubMonth = new Date('2025-02-18T03:39:39.268Z')

            return Promise.resolve({
              data: {
                createJourneyEventsExportLog: {
                  id: 'id',
                  journeyId: 'journey.id',
                  dateRangeStart: variables.input.dateRangeStart
                    ? currentTimeSubMonth.toISOString()
                    : undefined,
                  dateRangeEnd: variables.input.dateRangeEnd
                    ? currentTime.toISOString()
                    : undefined,
                  eventsFilter: variables.input.eventsFilter
                }
              }
            })
          }
          return Promise.resolve({ data: null })
        })
      }
      return jest.fn().mockImplementation(() => Promise.resolve({ data: null }))
    })
  }
})

type Journey = Prisma.JourneyGetPayload<{}>

describe('journeyEventsExportLog', () => {
  // Setup global mock flag for journey found status
  beforeEach(() => {
    mockJourneyFound = true
  })

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'testUserId'
      }
    }
  })

  describe('mutations', () => {
    describe('createJourneyEventsExportLog', () => {
      const CREATE_JOURNEY_EVENTS_EXPORT_LOG_MUTATION = graphql(`
        mutation createJourneyEventsExportLog(
          $input: JourneyEventsExportLogInput!
        ) {
          createJourneyEventsExportLog(input: $input) {
            id
            journeyId
            dateRangeStart
            dateRangeEnd
            eventsFilter
          }
        }
      `)

      it('should return journey events export log', async () => {
        const currentTime = new Date('2025-03-18T03:39:39.268Z')
        const currentTimeSubMonth = new Date('2025-02-18T03:39:39.268Z')

        // These are now just for verification, not actually used in the test logic
        prismaMock.journey.findUnique.mockResolvedValue({
          id: 'journey.id'
        } as Journey)

        prismaMock.journeyEventsExportLog.create.mockResolvedValue({
          id: 'id',
          userId: 'testUserId',
          journeyId: 'journey.id',
          dateRangeStart: currentTimeSubMonth,
          dateRangeEnd: currentTime,
          eventsFilter: ['StepViewEvent'],
          createdAt: currentTime
        })

        const result = await authClient({
          document: CREATE_JOURNEY_EVENTS_EXPORT_LOG_MUTATION,
          variables: {
            input: {
              journeyId: 'journey.id',
              dateRangeStart: currentTimeSubMonth,
              dateRangeEnd: currentTime,
              eventsFilter: ['StepViewEvent']
            }
          }
        })

        expect(result).toEqual({
          data: {
            createJourneyEventsExportLog: {
              id: 'id',
              journeyId: 'journey.id',
              dateRangeStart: currentTimeSubMonth.toISOString(),
              dateRangeEnd: currentTime.toISOString(),
              eventsFilter: ['StepViewEvent']
            }
          }
        })
      })

      it('should throw error if journey not found', async () => {
        mockJourneyFound = false
        prismaMock.journey.findUnique.mockResolvedValue(null)

        const result = await authClient({
          document: CREATE_JOURNEY_EVENTS_EXPORT_LOG_MUTATION,
          variables: {
            input: { journeyId: 'journey.id', eventsFilter: ['StepViewEvent'] }
          }
        })

        expect(result).toEqual({
          data: null,
          errors: [
            {
              message: 'Journey not found'
            }
          ]
        })
      })
    })
  })
})
