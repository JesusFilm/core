import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneysEmailPreferenceRef } from './journeysEmailPreference'
import { JourneysEmailPreferenceUpdateInput } from './inputs'

builder.mutationField('updateJourneysEmailPreference', (t) =>
  t.prismaField({
    type: JourneysEmailPreferenceRef,
    nullable: true,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: JourneysEmailPreferenceUpdateInput, required: true })
    },
    resolve: async (query, _parent, args) => {
      const { email, preference, value } = args.input

      return await prisma.journeysEmailPreference.upsert({
        ...query,
        where: { email },
        update: {
          [preference]: value
        },
        create: {
          email,
          [preference]: value
        }
      })
    }
  })
)
