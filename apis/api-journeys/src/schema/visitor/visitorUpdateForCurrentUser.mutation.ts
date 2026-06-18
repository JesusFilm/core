import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { VisitorUpdateInput } from './inputs'
import { VisitorRef } from './visitor'

builder.mutationField('visitorUpdateForCurrentUser', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: VisitorRef,
      nullable: false,
      args: {
        input: t.arg({ type: VisitorUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const visitor = await prisma.visitor.findFirst({
          where: { userId: context.user.id }
        })

        if (visitor == null)
          throw new GraphQLError(
            `visitor with userId "${context.user.id}" not found`,
            { extensions: { code: 'NOT_FOUND' } }
          )

        return prisma.visitor.update({
          ...query,
          where: { id: visitor.id },
          data: {
            countryCode: args.input.countryCode,
            referrer: args.input.referrer
          }
        })
      }
    })
)
