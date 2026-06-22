import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { VisitorRef } from './visitor'
import { INCLUDE_VISITOR_ACL, visitorAcl } from './visitor.acl'

builder.queryField('visitor', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: VisitorRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_VISITOR_ACL
        })

        if (visitor == null)
          throw new GraphQLError(`visitor with id "${args.id}" not found`, {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!visitorAcl(visitor, context.user))
          throw new GraphQLError('user is not allowed to view visitor', {
            extensions: { code: 'FORBIDDEN' }
          })

        return prisma.visitor.findUniqueOrThrow({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
