import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { IconBlock } from './icon'
import { IconBlockUpdateInput } from './inputs'

builder.mutationField('iconBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: IconBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: IconBlockUpdateInput, required: true }),
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
