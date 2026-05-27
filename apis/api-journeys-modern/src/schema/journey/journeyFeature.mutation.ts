import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyRef } from './journey'

builder.mutationField('journeyFeature', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyRef,
      nullable: true,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true }),
        feature: t.arg.boolean({ required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.id)

        const user = context.user as typeof context.user & { roles?: string[] }
        if (user.roles?.includes('publisher') !== true)
          throw new GraphQLError(
            'user is not allowed to update featured date',
            { extensions: { code: 'FORBIDDEN' } }
          )

        const journey = await prisma.journey.findUnique({
          where: { id: journeyId }
        })
        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        return await prisma.journey.update({
          ...query,
          where: { id: journeyId },
          data: {
            featuredAt: args.feature ? new Date() : null
          }
        })
      }
    })
)
