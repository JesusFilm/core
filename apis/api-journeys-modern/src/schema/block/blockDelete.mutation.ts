import { GraphQLError } from 'graphql'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { builder } from '../builder'

import { Block } from './block'
import { removeBlockAndChildren } from './service'

builder.mutationField('blockDelete', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [Block],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      }),
      parentBlockId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const block = await fetchBlockWithJourneyAcl(id)
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to delete block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const result = await removeBlockAndChildren(block)
      await recalculateJourneyCustomizable(block.journeyId)
      return result
    }
  })
)
