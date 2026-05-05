import { prisma } from '@core/prisma/journeys/client'

import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { builder } from '../builder'

import { ChatButtonRef } from './chatButton'

builder.mutationField('chatButtonRemove', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: ChatButtonRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, _context) => {
        const { id } = args

        const result = await prisma.chatButton.delete({
          ...query,
          where: { id }
        })

        await recalculateJourneyCustomizable(result.journeyId)

        return result
      }
    })
)
