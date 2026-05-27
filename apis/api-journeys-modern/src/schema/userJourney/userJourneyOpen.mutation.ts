import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserJourneyRef } from './userJourney'

builder.mutationField('userJourneyOpen', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserJourneyRef,
      nullable: true,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.id)

        const userJourney = await prisma.userJourney.findUnique({
          where: {
            journeyId_userId: { journeyId, userId: context.user.id }
          }
        })

        if (userJourney == null) return null

        if (userJourney.userId !== context.user.id)
          throw new GraphQLError('user is not allowed to update userJourney', {
            extensions: { code: 'FORBIDDEN' }
          })

        return prisma.userJourney.update({
          ...query,
          where: { id: userJourney.id },
          data: { openedAt: new Date() }
        })
      }
    })
)
