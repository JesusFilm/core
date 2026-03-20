import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { IdType } from './enums/idType'
import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

builder.queryField('adminJourney', (t) =>
  t.withAuth({ isAuthenticated: true, isAnonymous: true }).prismaField({
    type: JourneyRef,
    nullable: false,
    override: {
      from: 'api-journeys'
    },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      idType: t.arg({ type: IdType, required: false, defaultValue: 'slug' })
    },
    resolve: async (_query, _parent, args, context) => {
      const where: Prisma.JourneyWhereUniqueInput =
        args.idType === 'slug'
          ? { slug: String(args.id) }
          : { id: String(args.id) }

      const journey = await prisma.journey.findUnique({
        where,
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null)
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      if (!journeyAcl(Action.Read, journey, context.user))
        throw new GraphQLError('user is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })

      return journey
    }
  })
)
