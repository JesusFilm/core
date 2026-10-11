import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'
import { authorizeStructuralBlock, removeBlock } from './service'

builder.mutationField('campaignBlockDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignBlock],
    nullable: false,
    description:
      'Soft-delete a campaign block: stamp `deletedAt` and renumber the remaining siblings contiguously. Returns those siblings with their new `parentOrder`. Its live descendants and owned blocks are stamped with the same `deletedAt`, so `campaignBlockRestore` brings back exactly what was deleted with it.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT (field: `id`): the header, the footer, a column slot or a page; protected rows are never deleted.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const block = await authorizeStructuralBlock(
        String(id),
        context.user,
        'deleted'
      )
      return await removeBlock(block)
    }
  })
)
