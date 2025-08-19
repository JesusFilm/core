import { Prisma } from '@core/prisma/journeys/client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

type Journey = Prisma.JourneyGetPayload<{}>

describe('journeyEventsExportLog', () => {
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

        expect(prismaMock.journeyEventsExportLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'testUserId',
            journeyId: 'journey.id',
            dateRangeStart: currentTimeSubMonth,
            dateRangeEnd: currentTime,
            eventsFilter: ['StepViewEvent']
          }
        })
      })

      it('should throw error if journey not found', async () => {
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
            expect.objectContaining({
              message: 'Journey not found'
            })
          ]
        })
      })
    })
  })
})
