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

import { ButtonBlock } from './button'
import { ButtonBlockCreateInput } from './inputs'

builder.mutationField('buttonBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ButtonBlock,
    nullable: false,
    args: {
      input: t.arg({ type: ButtonBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create button block', {
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
          typename: 'ButtonBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          label: input.label,
          variant: input.variant,
          color: input.color,
          size: input.size,
          submitEnabled: input.submitEnabled ?? false,
          settings: input.settings
        }

        const buttonBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return buttonBlock
      })
    }
  })
)
