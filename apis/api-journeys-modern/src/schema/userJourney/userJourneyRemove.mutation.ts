import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserJourneyRef } from './userJourney'
import {
  INCLUDE_USER_JOURNEY_ACL,
  UserJourneyAction,
  userJourneyAcl
} from './userJourney.acl'

builder.mutationField('userJourneyRemove', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserJourneyRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userJourney = await prisma.userJourney.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_USER_JOURNEY_ACL
        })

        if (userJourney == null)
          throw new GraphQLError('userJourney not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !userJourneyAcl(
            UserJourneyAction.Delete,
            userJourney,
            context.user
          )
        )
          throw new GraphQLError(
            'user is not allowed to delete userJourney',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.userJourney.delete({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
