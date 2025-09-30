import { GraphQLError } from 'graphql'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'
import { update } from '../service'

import { MultiselectOptionBlockUpdateInput } from './inputs'
import { MultiselectOptionBlock } from './multiselectOption'

builder.mutationField('multiselectOptionBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: MultiselectOptionBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: MultiselectOptionBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

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

      return await update(id, {
        ...input
      })
    }
  })
)
