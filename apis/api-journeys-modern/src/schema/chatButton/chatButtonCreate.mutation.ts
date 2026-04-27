import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { ChatButtonRef } from './chatButton'
import { ChatButtonCreateInput } from './inputs'

builder.mutationField('chatButtonCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: ChatButtonRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        journeyId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: ChatButtonCreateInput, required: false })
      },
      resolve: async (query, _parent, args, _context) => {
        const { journeyId, input } = args

        const chatButtons = await prisma.chatButton.findMany({
          where: { journeyId }
        })

        if (chatButtons.length >= 2) {
          throw new GraphQLError(
            'There are already 2 chat buttons associated with the given journey',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }

        return await prisma.chatButton.create({
          ...query,
          data: {
            journeyId,
            ...input
          }
        })
      }
    })
)
