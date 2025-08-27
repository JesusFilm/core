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

import { RadioOptionBlockCreateInput } from './inputs'
import { RadioOptionBlock } from './radioOption'

builder.mutationField('radioOptionBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: RadioOptionBlock,
    nullable: false,
    args: {
      input: t.arg({ type: RadioOptionBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { id, journeyId, parentBlockId, label } = input

      const journey = await fetchJourneyWithAclIncludes(journeyId)
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
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(journeyId, parentBlockId)

        const block = await tx.block.create({
          data: {
            id: id ?? uuidv4(),
            typename: 'RadioOptionBlock',
            journeyId,
            parentBlockId,
            parentOrder,
            label
          }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: journeyId },
          data: { updatedAt: new Date() }
        })

        return block
      })
    }
  })
)
