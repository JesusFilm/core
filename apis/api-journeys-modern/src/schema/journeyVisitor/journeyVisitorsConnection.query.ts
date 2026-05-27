import {
  JourneyVisitor,
  Prisma,
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { JourneyVisitorFilter } from '../visitor/inputs/journeyVisitorFilter'
import { JourneyVisitorSort } from '../visitor/enums/journeyVisitorSort'

import { PageInfoRef } from '../visitor/visitorsConnection.query'

import { JourneyVisitorRef } from './journeyVisitor'

interface PageInfoShape {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}

interface JourneyVisitorEdgeShape {
  cursor: string
  node: JourneyVisitor
}

interface JourneyVisitorsConnectionShape {
  edges: JourneyVisitorEdgeShape[]
  pageInfo: PageInfoShape
}

const JourneyVisitorEdgeRef = builder
  .objectRef<JourneyVisitorEdgeShape>('JourneyVisitorEdge')
  .implement({
    shareable: true,
    fields: (t) => ({
      cursor: t.exposeString('cursor', { nullable: false }),
      node: t.field({
        type: JourneyVisitorRef,
        nullable: false,
        resolve: (edge) => edge.node as never
      })
    })
  })

const JourneyVisitorsConnectionRef = builder
  .objectRef<JourneyVisitorsConnectionShape>('JourneyVisitorsConnection')
  .implement({
    shareable: true,
    fields: (t) => ({
      edges: t.field({
        type: [JourneyVisitorEdgeRef],
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

function generateJourneyVisitorWhere(
  filter: {
    journeyId: string
    hasChatStarted?: boolean | null
    hasPollAnswers?: boolean | null
    hasMultiselectSubmission?: boolean | null
    hasTextResponse?: boolean | null
    hasIcon?: boolean | null
    hideInactive?: boolean | null
    countryCode?: string | null
  }
): Prisma.JourneyVisitorWhereInput {
  const where: Prisma.JourneyVisitorWhereInput = {
    journeyId: filter.journeyId
  }

  if (filter.hasChatStarted === true)
    where.lastChatStartedAt = { not: null }
  if (filter.hasPollAnswers === true)
    where.lastRadioQuestion = { not: null }
  if (filter.hasMultiselectSubmission === true)
    where.lastMultiselectSubmission = { not: null }
  if (filter.hasTextResponse === true)
    where.lastTextResponse = { not: null }
  if (filter.hideInactive === true) where.activityCount = { gt: 0 }

  if (filter.hasIcon === true || filter.countryCode != null) {
    const visitorWhere: Prisma.VisitorWhereInput = {}
    if (filter.hasIcon === true) visitorWhere.status = { not: null }
    if (filter.countryCode != null)
      visitorWhere.countryCode = { contains: filter.countryCode }
    where.visitor = visitorWhere
  }

  return where
}

builder.queryField('journeyVisitorsConnection', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .field({
      type: JourneyVisitorsConnectionRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        filter: t.arg({
          type: JourneyVisitorFilter,
          required: true
        }),
        first: t.arg.int({ required: false }),
        after: t.arg.string({ required: false }),
        sort: t.arg({
          type: JourneyVisitorSort,
          required: false
        })
      },
      resolve: async (_parent, args, context) => {
        const userId = context.user.id
        const first = args.first ?? 50
        const after = args.after ?? null
        const sort = args.sort ?? 'date'

        const accessibleWhere: Prisma.JourneyVisitorWhereInput = {
          OR: [
            {
              visitor: {
                userId
              }
            },
            {
              visitor: {
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
              }
            },
            {
              journey: {
                userJourneys: {
                  some: {
                    userId,
                    role: {
                      in: [UserJourneyRole.owner, UserJourneyRole.editor]
                    }
                  }
                }
              }
            }
          ]
        }

        const filterWhere = generateJourneyVisitorWhere(args.filter)

        const where: Prisma.JourneyVisitorWhereInput = {
          AND: [accessibleWhere, filterWhere]
        }

        const orderBy: Prisma.JourneyVisitorOrderByWithRelationInput =
          sort === 'activity'
            ? { activityCount: 'desc' }
            : sort === 'duration'
              ? { duration: 'desc' }
              : { createdAt: 'desc' }

        const result = await prisma.journeyVisitor.findMany({
          where,
          cursor: after != null ? { id: after } : undefined,
          orderBy,
          skip: after == null ? 0 : 1,
          take: first + 1
        })

        const sendResult =
          result.length > first ? result.slice(0, -1) : result

        return {
          edges: sendResult.map((visitor) => ({
            node: visitor,
            cursor: visitor.id
          })),
          pageInfo: {
            hasNextPage: result.length > first,
            hasPreviousPage: false,
            startCursor: result.length > 0 ? result[0].id : null,
            endCursor:
              result.length > 0
                ? sendResult[sendResult.length - 1].id
                : null
          }
        }
      }
    })
)

builder.queryField('journeyVisitorCount', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .field({
      type: 'Int',
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        filter: t.arg({
          type: JourneyVisitorFilter,
          required: true
        })
      },
      resolve: async (_parent, args, context) => {
        const userId = context.user.id

        const accessibleWhere: Prisma.JourneyVisitorWhereInput = {
          OR: [
            {
              visitor: {
                userId
              }
            },
            {
              visitor: {
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
              }
            },
            {
              journey: {
                userJourneys: {
                  some: {
                    userId,
                    role: {
                      in: [UserJourneyRole.owner, UserJourneyRole.editor]
                    }
                  }
                }
              }
            }
          ]
        }

        const filterWhere = generateJourneyVisitorWhere(args.filter)

        return prisma.journeyVisitor.count({
          where: { AND: [accessibleWhere, filterWhere] }
        })
      }
    })
)
