import { GraphQLError } from 'graphql'

import {
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyThemeUpdateInput } from './inputs'
import { JourneyThemeRef } from './journeyTheme'

builder.mutationField('journeyThemeUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyThemeRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: JourneyThemeUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { id, input } = args

        const journeyTheme = await prisma.journeyTheme.findUnique({
          where: { id: String(id) },
          include: {
            journey: {
              include: {
                userJourneys: true,
                team: { include: { userTeams: true } }
              }
            }
          }
        })

        if (journeyTheme == null)
          throw new GraphQLError('journey theme not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const journey = journeyTheme.journey
        const userId = context.user.id

        const userJourney = journey.userJourneys.find(
          (uj) => uj.userId === userId
        )
        const userTeam = journey.team?.userTeams.find(
          (ut) => ut.userId === userId
        )

        const isOwnerOrEditor =
          userJourney?.role === UserJourneyRole.owner ||
          userJourney?.role === UserJourneyRole.editor
        const isTeamManager = userTeam?.role === UserTeamRole.manager

        if (!isOwnerOrEditor && !isTeamManager)
          throw new GraphQLError(
            'user is not allowed to update journey theme',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.journeyTheme.update({
          ...query,
          where: { id: String(id) },
          data: {
            headerFont: input.headerFont ?? undefined,
            bodyFont: input.bodyFont ?? undefined,
            labelFont: input.labelFont ?? undefined
          }
        })
      }
    })
)
