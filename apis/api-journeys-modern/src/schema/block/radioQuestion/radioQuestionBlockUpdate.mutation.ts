import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { RadioQuestionBlock } from './radioQuestion'

builder.mutationField('radioQuestionBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: RadioQuestionBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentBlockId: t.arg({ type: 'ID', required: true }),
      gridView: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentBlockId, gridView } = args
      await authorizeBlockUpdate(id, context.user)
      return await update(id, { parentBlockId, gridView })
    }
  })
)
