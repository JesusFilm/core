import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyProfileUpdateInput } from './inputs'
import { JourneyProfileRef } from './journeyProfile'

builder.mutationField('journeyProfileUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyProfileRef,
      override: {
        from: 'api-journeys'
      },
      nullable: false,
      args: {
        input: t.arg({ type: JourneyProfileUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const profile = await prisma.journeyProfile.findUnique({
          where: { userId: context.user.id }
        })

        if (profile == null) {
          throw new Error(`JourneyProfile not found for user.`)
        }

        return await prisma.journeyProfile.update({
          ...query,
          where: { id: profile.id },
          data: args.input
        })
      }
    })
)
