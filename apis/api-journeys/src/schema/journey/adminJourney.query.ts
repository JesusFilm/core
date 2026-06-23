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
    args: {
      id: t.arg({ type: 'ID', required: true }),
      idType: t.arg({ type: IdType, required: false, defaultValue: 'slug' })
    },
    resolve: async (query, _parent, args, context) => {
      const where: Prisma.JourneyWhereUniqueInput =
        args.idType === 'slug'
          ? { slug: String(args.id) }
          : { id: String(args.id) }

      // Fetch with ACL-required includes for authorization check.
      // This is intentionally a separate query from the data fetch below
      // because Pothos query may contain select directives that would
      // strip the relations needed for journeyAcl().
      const journeyForAcl = await prisma.journey.findUnique({
        where,
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journeyForAcl == null)
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      if (!journeyAcl(Action.Read, journeyForAcl, context.user))
        throw new GraphQLError('user is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })

      // Fetch with Pothos query for correct nested field resolution
      // (select directives like UserTeam.journeyNotification require this)
      return prisma.journey.findUniqueOrThrow({ ...query, where })
    }
  })
)
