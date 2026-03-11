import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchJourneyWithAclIncludes } from '../../../lib/auth/fetchJourneyWithAclIncludes'
import { builder } from '../../builder'
import { getSiblingsInternal, setJourneyUpdatedAt } from '../service'

import { ButtonBlock } from './button'
import { ButtonBlockCreateInput } from './inputs'

builder.mutationField('buttonBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: ButtonBlock,
    nullable: false,
    override: {
      from: 'api-journeys'
    },
    args: {
      input: t.arg({ type: ButtonBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input: initialInput } = args
      const input = { ...initialInput }

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
            ...omit(input, 'parentBlockId', 'journeyId'),
            id: input.id ?? undefined,
            typename: 'ButtonBlock',
            journey: { connect: { id: input.journeyId } },
            parentBlock: { connect: { id: input.parentBlockId } },
            parentOrder: (
              await getSiblingsInternal(
                input.journeyId,
                input.parentBlockId,
                tx
              )
            ).length,
            settings: (input.settings ?? {}) as Prisma.JsonObject
          }
        })
        await setJourneyUpdatedAt(tx, block)
        return block
      })
    }
  })
)
