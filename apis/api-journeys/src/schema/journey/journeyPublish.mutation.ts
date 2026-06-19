import { GraphQLError } from 'graphql'

import { JourneyStatus, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

builder.mutationField('journeyPublish', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyRef,
      nullable: true,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.id)

        const journey = await prisma.journey.findUnique({
          where: { id: journeyId },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })
        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        if (!journeyAcl(Action.Manage, journey, context.user))
          throw new GraphQLError('user is not allowed to publish journey', {
            extensions: { code: 'FORBIDDEN' }
          })

        return await prisma.journey.update({
          ...query,
          where: { id: journeyId },
          data: {
            status: JourneyStatus.published,
            publishedAt: new Date()
          }
        })
      }
    })
)
