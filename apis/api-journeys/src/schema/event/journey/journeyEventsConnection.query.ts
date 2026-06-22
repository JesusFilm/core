import {
  Prisma,
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { PageInfoRef } from '../../visitor/visitorsConnection.query'

import { JourneyEventsFilter } from './inputs'
import { JourneyEventRef } from './journeyEvent'

interface PageInfoShape {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}

interface JourneyEventEdgeShape {
  cursor: string
  node: { id: string }
}

interface JourneyEventsConnectionShape {
  edges: JourneyEventEdgeShape[]
  pageInfo: PageInfoShape
}

const JourneyEventEdgeRef = builder
  .objectRef<JourneyEventEdgeShape>('JourneyEventEdge')
  .implement({
    shareable: true,
    fields: (t) => ({
      cursor: t.exposeString('cursor', { nullable: false }),
      node: t.field({
        type: JourneyEventRef,
        nullable: false,
        resolve: (edge) => edge.node as never
      })
    })
  })

const JourneyEventsConnectionRef = builder
  .objectRef<JourneyEventsConnectionShape>('JourneyEventsConnection')
  .implement({
    shareable: true,
    fields: (t) => ({
      edges: t.field({
        type: [JourneyEventEdgeRef],
        nullable: false,
        resolve: (connection) => connection.edges
      }),
      pageInfo: t.field({
        type: PageInfoRef,
        nullable: false,
        resolve: (connection) => connection.pageInfo
      })
    })
  })

function generateEventsWhere(
  journeyId: string,
  filter: {
    typenames?: string[] | null
    periodRangeStart?: Date | null
    periodRangeEnd?: Date | null
  } | null,
  accessibleEvent: Prisma.EventWhereInput
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    journeyId
  }

  const andClauses: Prisma.EventWhereInput[] = [accessibleEvent]

  if (filter?.typenames != null && filter.typenames.length > 0) {
    andClauses.push({ typename: { in: filter.typenames } })
  }

  if (filter?.periodRangeStart != null || filter?.periodRangeEnd != null) {
    const createdAt: Prisma.DateTimeFilter = {}
    if (filter.periodRangeStart != null) createdAt.gte = filter.periodRangeStart
    if (filter?.periodRangeEnd != null) createdAt.lte = filter.periodRangeEnd
    where.createdAt = createdAt
  }

  where.AND = andClauses

  return where
}

builder.queryField('journeyEventsConnection', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: JourneyEventsConnectionRef,
    nullable: false,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false }),
      first: t.arg.int({ required: false }),
      after: t.arg.string({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const userId = context.user.id
      const first = args.first ?? 50
      const after = args.after ?? null

      const accessibleEvent: Prisma.EventWhereInput = {
        journey: {
          OR: [
            {
              team: {
                userTeams: {
                  some: {
                    userId,
                    role: {
                      in: [UserTeamRole.manager, UserTeamRole.member]
                    }
                  }
                }
              }
            },
            {
              userJourneys: {
                some: {
                  userId,
                  role: UserJourneyRole.owner
                }
              }
            }
          ]
        }
      }

      const where = generateEventsWhere(
        String(args.journeyId),
        args.filter ?? null,
        accessibleEvent
      )

      const result = await prisma.event.findMany({
        where,
        include: {
          journey: { select: { id: true, slug: true } },
          visitor: {
            select: { id: true, name: true, email: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        cursor: after != null ? { id: after } : undefined,
        skip: after == null ? 0 : 1,
        take: first + 1
      })

      const sendResult = result.length > first ? result.slice(0, -1) : result

      return {
        edges: sendResult.map((event) => ({
          node: event,
          cursor: event.id
        })),
        pageInfo: {
          hasNextPage: result.length > first,
          hasPreviousPage: false,
          startCursor: sendResult.length > 0 ? sendResult[0].id : null,
          endCursor:
            sendResult.length > 0 ? sendResult[sendResult.length - 1].id : null
        }
      }
    }
  })
)

builder.queryField('journeyEventsCount', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: 'Int',
    nullable: false,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false })
    },
    resolve: async (_parent, args, context) => {
      const userId = context.user.id

      const accessibleEvent: Prisma.EventWhereInput = {
        journey: {
          OR: [
            {
              team: {
                userTeams: {
                  some: {
                    userId,
                    role: {
                      in: [UserTeamRole.manager, UserTeamRole.member]
                    }
                  }
                }
              }
            },
            {
              userJourneys: {
                some: {
                  userId,
                  role: UserJourneyRole.owner
                }
              }
            }
          ]
        }
      }

      const where = generateEventsWhere(
        String(args.journeyId),
        args.filter ?? null,
        accessibleEvent
      )

      return prisma.event.count({ where })
    }
  })
)
