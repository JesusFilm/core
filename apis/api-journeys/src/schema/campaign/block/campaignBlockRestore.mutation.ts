import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'
import { authorizeBlockUpdate, restoreBlock } from './service'

builder.mutationField('campaignBlockRestore', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignBlock],
    nullable: false,
    description:
      'Restore a soft-deleted campaign block: clear `deletedAt` and re-insert it among its siblings at its own `parentOrder`, renumbering again. Returns the block, its renumbered siblings and its live descendants. Restoring a live block only renumbers.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const block = await authorizeBlockUpdate(String(id), context.user, {
        includeDeleted: true
      })
      return await restoreBlock(block)
    }
  })
)
