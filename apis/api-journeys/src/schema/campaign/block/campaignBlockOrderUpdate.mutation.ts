import { builder } from '../../builder'
import { CampaignChildPlacement } from '../enums'

import { CampaignBlock } from './campaignBlock'
import { authorizeStructuralBlock, reorderBlock } from './service'

builder.mutationField('campaignBlockOrderUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignBlock],
    nullable: false,
    description:
      'Move a campaign block among its siblings to `parentOrder` (a position past the end moves it last) and renumber them contiguously. An Extra may change `placement` in the same move: crossing the Section Body updates the column, moving among neighbours is an order update only. Returns the renumbered siblings.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT (field: `id`): the header, the footer, a column slot, a page, or an owned block with no order.\n- BAD_USER_INPUT (field: `parentOrder`): negative.\n- BAD_USER_INPUT (field: `placement`): not above or below, or given for a block that is not a section child.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({ type: 'Int', required: true }),
      placement: t.arg({
        type: CampaignChildPlacement,
        required: false,
        description:
          'For an Extra moving across the Section Body; omitted keeps its side.'
      })
    },
    resolve: async (_parent, { id, parentOrder, placement }, context) => {
      const block = await authorizeStructuralBlock(
        String(id),
        context.user,
        'moved'
      )
      return await reorderBlock(block, parentOrder, placement)
    }
  })
)
