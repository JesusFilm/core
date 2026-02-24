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
            min: null,
            max: null,
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
          }
        })
        await setJourneyUpdatedAt(tx, block)

        return block
      })
    }
  })
)
