import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

// no-op
import { builder } from '../builder'

import { IntegrationRef } from './integration'

export const IntegrationDelete = builder.mutationField(
  'integrationDelete',
  (t) =>
    t.withAuth({ isAuthenticated: true }).prismaField({
      // integration & team auth not handled here to reduce queries
      type: IntegrationRef,
      nullable: false,
      args: { id: t.arg.id({ required: true }) },
      resolve: async (query, _parent, args, context) => {
        const { id } = args
        const integration = await prisma.integration.findUnique({
          where: { id },
          include: { team: { include: { userTeams: true } } }
        })
        if (integration == null)
          throw new GraphQLError('integration not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const isOwner = integration.userId === context.user?.id
        const isTeamManager =
          integration.team?.userTeams?.some(
            (ut) => ut.userId === context.user?.id && ut.role === 'manager'
          ) ?? false
        if (!isOwner && !isTeamManager) {
          throw new GraphQLError('user is not allowed to delete integration', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        return await prisma.$transaction(async (tx) => {
          await tx.googleSheetsSync.updateMany({
            where: { integrationId: id },
            data: {
              deletedAt: new Date(),
              integrationId: null
            }
          })

          return await tx.integration.delete({
            ...query,
            where: { id }
          })
        })
      }
    })
)
