import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { JourneyCollectionRef } from './journeyCollection'
import { canAccessJourneyCollection } from './journeyCollection.acl'

builder.queryField('journeyCollection', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyCollectionRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyCollection = await prisma.journeyCollection.findUnique({
          where: { id: String(args.id) },
          include: { team: { include: { userTeams: true } } }
        })

        if (journeyCollection == null)
          throw new GraphQLError('journey collection not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !canAccessJourneyCollection(
            Action.Read,
            journeyCollection,
            context.user
          )
        )
          throw new GraphQLError(
            'user is not allowed to read journey collection',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.journeyCollection.findUniqueOrThrow({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
