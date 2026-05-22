import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../builder'

import { Block } from './block'

builder.queryField('block', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: Block,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const block = await fetchBlockWithJourneyAcl(String(id))
      if (
        !ability(
          Action.Read,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to read block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return block
    }
  })
)
