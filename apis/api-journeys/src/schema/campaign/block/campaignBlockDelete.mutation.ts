import { GraphQLError } from 'graphql'

import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'
import {
  authorizeBlockUpdate,
  isCampaignChromeTypename,
  removeBlock
} from './service'

builder.mutationField('campaignBlockDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignBlock],
    nullable: false,
    description:
      'Soft-delete a campaign block: stamp `deletedAt` and renumber the remaining siblings contiguously. Returns those siblings with their new `parentOrder`. The row keeps everything, so `campaignBlockRestore` is how undo of a delete works.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT (field: `id`): the header or footer; chrome is never deleted.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const block = await authorizeBlockUpdate(String(id), context.user)
      if (isCampaignChromeTypename(block.typename))
        throw new GraphQLError('the header and footer cannot be deleted', {
          extensions: { code: 'CONFLICT', field: 'id' }
        })
      return await removeBlock(block)
    }
  })
)
