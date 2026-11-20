import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { readJourneyRevision } from '../../lib/journeyRevision/journeyRevision'
import { builder } from '../builder'

import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

builder.queryField('journeyPreview', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      expectedRevision: t.arg.string()
    },
    resolve: async (query, _parent, args, context) =>
      prisma.$transaction(
        async (tx) => {
          const id = String(args.id)
          await tx.$queryRaw`SELECT id FROM "Journey" WHERE id = ${id} FOR SHARE`
          const journey = await tx.journey.findUnique({
            where: { id, deletedAt: null, archivedAt: null, trashedAt: null },
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          })
          if (!journey || !journeyAcl(Action.Read, journey, context.user))
            throw new GraphQLError('preview unavailable', {
              extensions: { code: 'FORBIDDEN' }
            })
          if (
            args.expectedRevision != null &&
            (await readJourneyRevision(tx, id)) !== args.expectedRevision
          )
            throw new GraphQLError(
              'saved draft changed; request a new preview',
              { extensions: { code: 'REVISION_CONFLICT' } }
            )
          return tx.journey.findUniqueOrThrow({ ...query, where: { id } })
        },
        { isolationLevel: 'RepeatableRead' }
      )
  })
)

builder.queryField('journeyPublishPermission', (t) =>
  t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_parent, args, context) => {
      const journey = await prisma.journey.findUnique({
        where: {
          id: String(args.id),
          deletedAt: null,
          archivedAt: null,
          trashedAt: null
        },
        include: { userJourneys: true, team: { include: { userTeams: true } } }
      })
      return (
        journey != null &&
        journey.status === 'draft' &&
        journey.template !== true &&
        journey.templateSite !== true &&
        journeyAcl(Action.Manage, journey, context.user)
      )
    }
  })
)
