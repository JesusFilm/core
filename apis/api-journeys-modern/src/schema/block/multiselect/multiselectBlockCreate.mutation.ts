import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchJourneyWithAclIncludes } from '../../../lib/auth/fetchJourneyWithAclIncludes'
import { builder } from '../../builder'
import { getSiblingsInternal, setJourneyUpdatedAt } from '../service'

import { MultiselectBlockCreateInput } from './inputs'
import { MultiselectBlock } from './multiselect'

builder.mutationField('multiselectBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: MultiselectBlock,
    nullable: false,
    args: {
      input: t.arg({ type: MultiselectBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input: initialInput } = args
      const input = { ...initialInput }

      // Validation: min/max non-negative and min <= max when both provided
      const { min, max } = input
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

      // Check permissions using ACL
      const journey = await fetchJourneyWithAclIncludes(input.journeyId)
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
        const block = await tx.block.create({
          data: {
            ...omit(
              input,
              'parentBlockId',
              'journeyId',
              'posterBlockId',
              'isCover'
            ),
            id: input.id ?? undefined,
            typename: 'MultiselectBlock',
            journey: { connect: { id: input.journeyId } },
            parentBlock: { connect: { id: input.parentBlockId } },
            parentOrder: (
              await getSiblingsInternal(
                input.journeyId,
                input.parentBlockId,
                tx
              )
            ).length
          },
          include: {
            action: true
          }
        })
        await setJourneyUpdatedAt(tx, block)

        return block
      })
    }
  })
)
