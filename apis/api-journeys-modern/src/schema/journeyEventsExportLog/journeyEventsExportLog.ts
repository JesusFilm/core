import { GraphQLError } from 'graphql'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { JourneyEventsExportLogInput } from './inputs'

builder.prismaObject('JourneyEventsExportLog', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
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

      const data = {
        userId: user.id,
        journeyId: input.journeyId,
        eventsFilter: input.eventsFilter ?? [],
        dateRangeStart:
          input.dateRangeStart != null
            ? new Date(input.dateRangeStart).toISOString()
            : undefined,
        dateRangeEnd:
          input.dateRangeEnd != null
            ? new Date(input.dateRangeEnd).toISOString()
            : undefined
      }

      const res = await prisma.journeyEventsExportLog.create({
        ...query,
        data
      })

      return res
    }
  })
)
