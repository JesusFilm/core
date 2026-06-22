import { GraphQLError } from 'graphql'

import {
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyThemeRef } from './journeyTheme'

builder.mutationField('journeyThemeDelete', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyThemeRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyTheme = await prisma.journeyTheme.findUnique({
          where: { id: String(args.id) },
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
            'user is not allowed to delete journey theme',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.journeyTheme.delete({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
