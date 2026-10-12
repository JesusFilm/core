import { builder } from '../../builder'
import { CampaignButtonBlock } from '../block/campaignButtonBlock'

import { authorizeActionUpdate, deleteAction } from './service'

builder.mutationField('campaignBlockDeleteAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignButtonBlock,
    nullable: false,
    description:
      'Remove a button’s action so it renders static. Returns the button with `action` null; a button that had no action is returned unchanged.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const block = await authorizeActionUpdate(String(id), context.user)
      await deleteAction(block)
      return { ...block, action: null }
    }
  })
)
