import { builder } from '../../builder'
import { authorizeBlockUpdate, update, validateParentBlock } from '../service'

import { CardBlock } from './card'
import { CardBlockUpdateInput } from './inputs'

builder.mutationField('cardBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: CardBlock,
    nullable: false,
    override: {
      from: 'api-journeys'
    },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CardBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input: initialInput } = args
      const input = { ...initialInput }

      const block = await authorizeBlockUpdate(id, context.user)

      if (input.parentBlockId != null) {
        await validateParentBlock(input.parentBlockId, block.journeyId)
      }

      return await update(id, {
        ...input
      })
    }
  })
)
