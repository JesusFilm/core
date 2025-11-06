import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  getIntegrationGoogleAccessToken,
  getTeamGoogleAccessToken
} from '../../../lib/google/googleAuth'
import { builder } from '../../builder'

builder.queryField('integrationGooglePickerToken', (t) =>
  t.withAuth({ isAuthenticated: true }).string({
    args: {
      teamId: t.arg.id({ required: true }),
      integrationId: t.arg.id()
    },
    nullable: false,
    resolve: async (_parent, { teamId, integrationId }, context) => {
      const userId = context.user?.id
      if (userId == null)
        throw new GraphQLError('unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })

      // Ensure user is part of the team
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { userTeams: true, integrations: true }
      })
      if (team == null)
        throw new GraphQLError('Team not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const isMember = team.userTeams.some((ut) => ut.userId === userId)
      if (!isMember)
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })

      const hasGoogle = team.integrations.some((i) => i.type === 'google')
      if (!hasGoogle)
        throw new GraphQLError('Google integration not configured', {
          extensions: { code: 'BAD_REQUEST' }
        })

      // If a specific integrationId is provided, use that; else any team integration
      if (integrationId != null) {
        const token = await getIntegrationGoogleAccessToken(integrationId)
        return token.accessToken
      }
      const { accessToken } = await getTeamGoogleAccessToken(teamId)
      return accessToken
    }
  })
)
