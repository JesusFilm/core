import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { RadioOptionBlockUpdateInput } from './inputs'
import { RadioOptionBlock } from './radioOption'

builder.mutationField('radioOptionBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: RadioOptionBlock,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: RadioOptionBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      await authorizeBlockUpdate(id, context.user)
      return await update(id, { ...input })
    }
  })
)
