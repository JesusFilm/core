import { parse } from 'graphql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { INTERACTION_EVENT_FILTER } from '../capture/captureTypes'

describe('journey interaction event lists and counts', () => {
  const client = getClient({
    headers: { authorization: 'token' },
    context: {
      currentUser: { id: 'userId', email: 'owner@example.com' }
    }
  })

  const document = parse(`
    query InteractionEvents($filter: JourneyEventsFilter) {
      journeyEventsConnection(journeyId: "journeyId", filter: $filter) {
        edges { cursor }
      }
      journeyEventsCount(journeyId: "journeyId", filter: $filter)
    }
  `)

  it.each([null, { typenames: ['Custom1CaptureEvent', 'ButtonClickEvent'] }])(
    'excludes capture rows from both reads with filter %j',
    async (filter) => {
      prismaMock.event.findMany.mockResolvedValue([])
      prismaMock.event.count.mockResolvedValue(0)

      const result = await client({ document, variables: { filter } })

      expect(result).toEqual({
        data: {
          journeyEventsConnection: { edges: [] },
          journeyEventsCount: 0
        }
      })

      const listWhere = prismaMock.event.findMany.mock.calls[0]?.[0]?.where
      const countWhere = prismaMock.event.count.mock.calls[0]?.[0]?.where
      expect(listWhere).toEqual(countWhere)
      expect(listWhere).toMatchObject({
        journeyId: 'journeyId',
        AND: expect.arrayContaining([INTERACTION_EVENT_FILTER])
      })
      if (filter != null) {
        expect(listWhere?.AND).toContainEqual({
          typename: { in: filter.typenames }
        })
      }
    }
  )
})
