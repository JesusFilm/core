import { stringify } from 'csv-stringify'
import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { JourneyVisitorExportSelect } from './inputs'

export const JourneyVisitorRef = builder.prismaObject('JourneyVisitor', {
  shareable: true,
  fields: (t) => ({
    journeyId: t.exposeID('journeyId', { nullable: false }),
    visitorId: t.exposeID('visitorId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    duration: t.exposeInt('duration'),
    lastChatStartedAt: t.expose('lastChatStartedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastChatPlatform: t.expose('lastChatPlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    lastStepViewedAt: t.expose('lastStepViewedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastLinkAction: t.exposeString('lastLinkAction', { nullable: true }),
    lastTextResponse: t.exposeString('lastTextResponse', { nullable: true }),
    lastRadioQuestion: t.exposeString('lastRadioQuestion', { nullable: true }),
    lastRadioOptionSubmission: t.exposeString('lastRadioOptionSubmission', {
      nullable: true
    }),
    lastMultiselectSubmission: t.exposeString('lastMultiselectSubmission', {
      nullable: true
    }),
    countryCode: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            countryCode: true
          }
        }
      },
      resolve: ({ visitor }) => {
        return visitor.countryCode ?? null
      }
    }),
    messagePlatform: t.field({
      type: MessagePlatform,
      nullable: true,
      select: {
        visitor: {
          select: {
            messagePlatform: true
          }
        }
      },
      resolve: ({ visitor }) => {
        return visitor.messagePlatform ?? null
      }
    }),
    notes: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            notes: true
          }
        }
      },
      resolve: ({ visitor }) => {
        return visitor.notes ?? null
      }
    }),
    visitor: t.relation('visitor', { nullable: false }),
    events: t.relation('events', { nullable: false })
  })
})

builder.asEntity(JourneyVisitorRef, {
  key: builder.selection<{ visitorId: string; journeyId: string }>(
    'visitorId journeyId'
  ),
  resolveReference: async (journeyVisitor) => {
    return await prisma.journeyVisitor.findUnique({
      include: {
        visitor: true
      },
      where: {
        journeyId_visitorId: {
          visitorId: journeyVisitor.visitorId,
          journeyId: journeyVisitor.journeyId
        }
      }
    })
  }
})

interface JourneyVisitorExportRow {
  id: string
  createdAt: string
  name: string
  email: string
  phone: string
  [key: string]: string
}

async function* getJourneyVisitors(
  journeyId: string,
  eventWhere: Prisma.EventWhereInput,
  batchSize: number = 1000
): AsyncGenerator<JourneyVisitorExportRow> {
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const journeyVisitors = await prisma.journeyVisitor.findMany({
      where: {
        journeyId,
        events: {
          some: eventWhere
        }
      },
      take: batchSize,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        events: {
          where: eventWhere,
          select: {
            blockId: true,
            label: true,
            value: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (journeyVisitors.length === 0) {
      hasMore = false
      break
    }

    for (const journeyVisitor of journeyVisitors) {
      const row: JourneyVisitorExportRow = {
        id: journeyVisitor.visitor.id,
        createdAt: journeyVisitor.createdAt.toISOString(),
        name: journeyVisitor.visitor.name || '',
        email: journeyVisitor.visitor.email || '',
        phone: journeyVisitor.visitor.phone || ''
      }

      journeyVisitor.events.forEach((event) => {
        if (event.blockId && event.label) {
          const key = `${event.blockId}-${event.label}`
          if (row[key]) {
            row[key] += `; ${event.value!}`
          } else {
            row[key] = event.value!
          }
        }
      })

      yield row
    }

    offset += batchSize
    hasMore = journeyVisitors.length === batchSize
  }
}

builder.queryField('journeyVisitorExport', (t) => {
  return t
    .withAuth({
      isAuthenticated: true
    })
    .field({
      type: 'String',
      description:
        'Returns a CSV formatted string with journey visitor export data including headers and visitor data with event information',
      args: {
        journeyId: t.arg.id({ required: true }),
        filter: t.arg({ type: JourneyEventsFilter, required: false }),
        select: t.arg({ type: JourneyVisitorExportSelect, required: false })
      },
      resolve: async (_, { journeyId, filter, select }, context) => {
        // authorize user to manage journey
        const journey = await prisma.journey.findUnique({
          where: {
            id: journeyId
          },
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        })

        if (!journey) {
          throw new GraphQLError('Journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        if (
          !ability(Action.Manage, subject('Journey', journey), context.user)
        ) {
          throw new GraphQLError('User is not allowed to manage journey', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        const eventWhere: Prisma.EventWhereInput = {
          journeyId: journeyId,
          blockId: { not: null },
          label: { not: null }
        }

        if (filter?.typenames && filter.typenames.length > 0) {
          eventWhere.typename = { in: filter.typenames }
        }

        if (filter?.periodRangeStart || filter?.periodRangeEnd) {
          eventWhere.createdAt = {}
          if (filter.periodRangeStart) {
            eventWhere.createdAt.gte = filter.periodRangeStart
          }
          if (filter.periodRangeEnd) {
            eventWhere.createdAt.lte = filter.periodRangeEnd
          }
        }

        // Get unique blockId_label combinations for headers using Prisma
        const blockHeadersResult = await prisma.event.findMany({
          where: eventWhere,
          include: {
            block: {
              select: {
                updatedAt: true
              }
            }
          },
          orderBy: {
            block: {
              updatedAt: 'asc'
            }
          },
          distinct: ['blockId', 'label']
        })

        // Build headers: visitor info + dynamic block columns
        const blockHeaders = blockHeadersResult.map((item) => ({
          key: `${item.blockId!}-${item.label!}`,
          header: item.label!
        }))

        const columns = [
          { key: 'id' },
          select?.createdAt !== false ? { key: 'createdAt' } : null,
          select?.name !== false ? { key: 'name' } : null,
          select?.email !== false ? { key: 'email' } : null,
          select?.phone !== false ? { key: 'phone' } : null,
          ...(filter?.typenames == null || filter.typenames.length > 0
            ? blockHeaders
            : [])
        ].filter((value) => value != null)

        // Stream rows directly to CSV without collecting in memory
        const stringifier = stringify({
          header: true,
          columns
        })

        const onEndPromise = new Promise((resolve) => {
          stringifier.on('end', resolve)
        })

        let csvContent: string = ''
        stringifier.on('data', (chunk) => {
          csvContent += chunk
        })

        for await (const row of getJourneyVisitors(journeyId, eventWhere)) {
          stringifier.write(row)
        }
        stringifier.end()

        await onEndPromise

        return csvContent
      }
    })
})
