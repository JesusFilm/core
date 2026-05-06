import { prisma } from '@core/prisma/journeys/client'

import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { builder } from '../builder'

import { ChatButtonRef } from './chatButton'
import { ChatButtonUpdateInput } from './inputs'

builder.mutationField('chatButtonUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: ChatButtonRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true }),
        journeyId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: ChatButtonUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, _context) => {
        const { id, journeyId, input } = args

        const result = await prisma.chatButton.update({
          ...query,
          where: { id },
          data: {
            journeyId,
            ...input
          }
        })

        await recalculateJourneyCustomizable(journeyId)

        return result
      }
    })
)
