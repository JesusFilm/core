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

import { SpacerBlockCreateInput } from './inputs'
import { SpacerBlock } from './spacer'

builder.mutationField('spacerBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: SpacerBlock,
    nullable: false,
    args: {
      input: t.arg({ type: SpacerBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create spacer block', {
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
          typename: 'SpacerBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          spacing: input.spacing
        }

        const spacerBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return spacerBlock
      })
    }
  })
)
