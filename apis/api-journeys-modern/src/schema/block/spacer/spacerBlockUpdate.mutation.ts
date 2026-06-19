import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { SpacerBlockUpdateInput } from './inputs'
import { SpacerBlock } from './spacer'

builder.mutationField('spacerBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: SpacerBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: SpacerBlockUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      await authorizeBlockUpdate(id, context.user)
      return await update(id, { ...input })
    }
  })
)
