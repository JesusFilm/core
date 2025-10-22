import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyEventsExportLogInput } from './inputs'

builder.prismaObject('JourneyEventsExportLog', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTimeISO', nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    eventsFilter: t.exposeStringList('eventsFilter', { nullable: false }),
    dateRangeStart: t.expose('dateRangeStart', {
      type: 'DateTimeISO',
      nullable: true
    }),
    dateRangeEnd: t.expose('dateRangeEnd', {
      type: 'DateTimeISO',
      nullable: true
    })
  })
})

builder.mutationField('createJourneyEventsExportLog', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    override: {
      from: 'api-journeys'
    },
    type: 'JourneyEventsExportLog',
    nullable: false,
    args: {
      input: t.arg({ type: JourneyEventsExportLogInput, required: true })
    },
    resolve: async (query, _root, { input }, { user }) => {
      const journey = await prisma.journey.findUnique({
        where: { id: input.journeyId }
      })

      if (journey == null) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const res = await prisma.journeyEventsExportLog.create({
        ...query,
        data: {
          userId: user.id,
          journeyId: input.journeyId,
          eventsFilter: input.eventsFilter,
          dateRangeStart: input.dateRangeStart,
          dateRangeEnd: input.dateRangeEnd
        }
      })

      return res
    }
  })
)
