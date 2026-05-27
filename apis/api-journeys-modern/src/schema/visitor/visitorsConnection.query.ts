import {
  Prisma,
  UserTeamRole,
  Visitor,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { VisitorRef } from './visitor'

interface PageInfoShape {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}

interface VisitorEdgeShape {
  cursor: string
  node: Visitor
}

interface VisitorsConnectionShape {
  edges: VisitorEdgeShape[]
  pageInfo: PageInfoShape
}

export const PageInfoRef = builder.objectRef<PageInfoShape>('PageInfo').implement({
  shareable: true,
  fields: (t) => ({
    hasNextPage: t.exposeBoolean('hasNextPage', { nullable: false }),
    hasPreviousPage: t.exposeBoolean('hasPreviousPage', { nullable: false }),
    startCursor: t.exposeString('startCursor', { nullable: true }),
    endCursor: t.exposeString('endCursor', { nullable: true })
  })
})

const VisitorEdgeRef = builder
  .objectRef<VisitorEdgeShape>('VisitorEdge')
  .implement({
    shareable: true,
    fields: (t) => ({
      cursor: t.exposeString('cursor', { nullable: false }),
      node: t.field({
        type: VisitorRef,
        nullable: false,
        resolve: (edge) => edge.node as never
      })
    })
  })

const VisitorsConnectionRef = builder
  .objectRef<VisitorsConnectionShape>('VisitorsConnection')
  .implement({
    shareable: true,
    fields: (t) => ({
      edges: t.field({
        type: [VisitorEdgeRef],
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

builder.queryField('visitorsConnection', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VisitorsConnectionRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      teamId: t.arg.string({ required: false }),
      first: t.arg.int({ required: false }),
      after: t.arg.string({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const userId = context.user.id
      const first = args.first ?? 50
      const after = args.after ?? null

      const where: Prisma.VisitorWhereInput = {
        team: {
          userTeams: {
            some: {
              userId,
              role: { in: [UserTeamRole.manager, UserTeamRole.member] }
            }
          }
        }
      }
      if (args.teamId != null) {
        where.teamId = args.teamId
      }

      const result = await prisma.visitor.findMany({
        where,
        cursor: after != null ? { id: after } : undefined,
        orderBy: { createdAt: 'desc' },
        skip: after == null ? 0 : 1,
        take: first + 1
      })

      const sendResult = result.length > first ? result.slice(0, -1) : result

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
            result.length > 0 ? sendResult[sendResult.length - 1].id : null
        }
      }
    }
  })
)
