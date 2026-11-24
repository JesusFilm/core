import { JourneyStatus } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyRef } from './journey'
import { archiveOrTrashJourneys } from './journeyLifecycle'

builder.mutationField('journeysTrash', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [JourneyRef],
      nullable: { list: false, items: true },
      args: {
        ids: t.arg({ type: ['ID'], required: true })
      },
      resolve: async (query, _parent, args, context) =>
        await archiveOrTrashJourneys({
          ids: args.ids.map(String),
          user: context.user,
          status: JourneyStatus.trashed,
          query
        })
    })
)
