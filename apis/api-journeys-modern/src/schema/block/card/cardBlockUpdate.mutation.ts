import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { CardBlock } from './card'
import { CardBlockUpdateInput } from './inputs'

builder.mutationField('cardBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CardBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CardBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('card block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update card block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.coverBlockId !== undefined)
          updateData.coverBlockId = input.coverBlockId
        if (input.backgroundColor !== undefined)
          updateData.backgroundColor = input.backgroundColor
        if (input.backdropBlur !== undefined)
          updateData.backdropBlur = input.backdropBlur
        if (input.fullscreen !== undefined)
          updateData.fullscreen = input.fullscreen
        if (input.themeMode !== undefined)
          updateData.themeMode = input.themeMode
        if (input.themeName !== undefined)
          updateData.themeName = input.themeName

        const updatedBlock = await tx.block.update({
          where: { id },
          data: updateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return updatedBlock
      })
    }
  })
)
