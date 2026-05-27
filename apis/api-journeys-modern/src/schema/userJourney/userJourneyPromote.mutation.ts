import { GraphQLError } from 'graphql'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserJourneyRef } from './userJourney'
import {
  INCLUDE_USER_JOURNEY_ACL,
  UserJourneyAction,
  userJourneyAcl
} from './userJourney.acl'

builder.mutationField('userJourneyPromote', (t) =>
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
            UserJourneyAction.UpdateRole,
            userJourney,
            context.user
          )
        )
          throw new GraphQLError('user is not allowed to update userJourney', {
            extensions: { code: 'FORBIDDEN' }
          })

        return prisma.$transaction(async (tx) => {
          await tx.userJourney.updateMany({
            where: {
              journeyId: userJourney.journeyId,
              role: UserJourneyRole.owner
            },
            data: { role: UserJourneyRole.editor }
          })
          return tx.userJourney.update({
            ...query,
            where: { id: String(args.id) },
            data: { role: UserJourneyRole.owner }
          })
        })
      }
    })
)
