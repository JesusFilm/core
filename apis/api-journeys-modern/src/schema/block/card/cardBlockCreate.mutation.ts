import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchJourneyWithAclIncludes } from '../../../lib/auth/fetchJourneyWithAclIncludes'
import { builder } from '../../builder'
import { getNextParentOrder } from '../getNextParentOrder'

import { CardBlock } from './card'
import { CardBlockCreateInput } from './inputs'

builder.mutationField('cardBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: CardBlock,
    nullable: false,
    args: {
      input: t.arg({ type: CardBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args

      const journey = await fetchJourneyWithAclIncludes(input.journeyId)
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to create card block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId
        )

        const blockData = {
          id: input.id ?? uuidv4(),
          journeyId: input.journeyId,
          typename: 'CardBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          backgroundColor: input.backgroundColor,
          backdropBlur: input.backdropBlur,
          fullscreen: input.fullscreen ?? false,
          themeMode: input.themeMode,
          themeName: input.themeName
        }

        const cardBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return cardBlock
      })
    }
  })
)
