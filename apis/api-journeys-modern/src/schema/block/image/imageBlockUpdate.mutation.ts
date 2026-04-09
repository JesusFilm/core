import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { ImageBlock } from './image'
import { ImageBlockUpdateInput } from './inputs'
import { transformInput } from './transformInput'

builder.mutationField('imageBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: ImageBlock,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ImageBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      await authorizeBlockUpdate(id, context.user)
      const input = await transformInput({ ...args.input })
      return await update(id, { ...input })
    }
  })
)
