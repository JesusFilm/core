import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyProfileRef } from './journeyProfile'

builder.queryField('getJourneyProfile', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: JourneyProfileRef,
    nullable: true,
    resolve: async (query, _parent, _args, context) => {
      return await prisma.journeyProfile.findUnique({
        ...query,
        where: { userId: context.user.id }
      })
    }
  })
)
