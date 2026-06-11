import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyThemeRef } from './journeyTheme'

builder.queryField('journeyTheme', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyThemeRef,
      nullable: true,
      override: { from: 'api-journeys' },
      args: {
        journeyId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args) => {
        const journeyTheme = await prisma.journeyTheme.findUnique({
          ...query,
          where: { journeyId: String(args.journeyId) }
        })

        if (journeyTheme == null)
          throw new GraphQLError('journey theme not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        return journeyTheme
      }
    })
)
