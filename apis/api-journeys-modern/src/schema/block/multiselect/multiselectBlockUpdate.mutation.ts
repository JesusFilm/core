import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'
import { update } from '../service'

import { MultiselectBlockUpdateInput } from './inputs'
import { MultiselectBlock } from './multiselect'

builder.mutationField('multiselectBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: MultiselectBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: MultiselectBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input: initialInput } = args
      const input = { ...initialInput }

      // (moved validation post-ACL below)

      const block = await fetchBlockWithJourneyAcl(id)

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Now that authorization has passed, perform validation with option count
      const { min, max } = input as { min?: number | null; max?: number | null }
      if (min != null && min < 0) {
        throw new GraphQLError('min must be greater than or equal to 0', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      if (max != null && max < 0) {
        throw new GraphQLError('max must be greater than or equal to 0', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      if (min != null && max != null && min > max) {
        throw new GraphQLError('min must be less than or equal to max', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      if (min != null || max != null) {
        const optionCount = await prisma.block.count({
          where: {
            parentBlockId: id,
            typename: 'MultiselectOptionBlock',
            deletedAt: null
          }
        })
        if (min != null && min > optionCount) {
          throw new GraphQLError(
            'min must be less than or equal to the number of options',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
        // Normalize values relative to optionCount
        if (optionCount > 0) {
          if (min != null && min === optionCount) input.min = null
          if (max != null && max >= optionCount) input.max = null
        }
      }

      return await update(id, {
        ...input
      })
    }
  })
)
