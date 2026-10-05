import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneysEmailPreferenceRef } from './journeysEmailPreference'

builder.queryField('journeysEmailPreference', (t) =>
  t.prismaField({
    type: JourneysEmailPreferenceRef,
    nullable: true,
    args: {
      email: t.arg.string({ required: true })
    },
    resolve: async (query, _parent, args) => {
      return await prisma.journeysEmailPreference.findUnique({
        ...query,
        where: { email: args.email }
      })
    }
  })
)
