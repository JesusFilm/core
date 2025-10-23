import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import { IntegrationRef } from './integration'

export const IntegrationDelete = builder.mutationField(
  'integrationDelete',
  (t) =>
    t.withAuth({ isAuthenticated: true }).prismaField({
      type: IntegrationRef,
      nullable: false,
      args: { id: t.arg.id({ required: true }) },
      resolve: async (_query, _parent, args, context) => {
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
        const canManageJourney = ability(
          Action.Manage,
          subject('Journey', integration.team as any),
          context.user
        )
        const isTeamManager = integration.team.userTeams.some(
          (ut) => ut.userId === context.user?.id && ut.role === 'manager'
        )
        if (!isOwner && !canManageJourney && !isTeamManager) {
          throw new GraphQLError('user is not allowed to delete integration', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        return await prisma.integration.delete({ where: { id } })
      }
    })
)
