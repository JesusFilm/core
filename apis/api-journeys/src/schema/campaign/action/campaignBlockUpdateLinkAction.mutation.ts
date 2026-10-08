import { builder } from '../../builder'
import { assertEnumOrNull, assertLinkUrl } from '../validation'

import { CampaignLinkActionRef } from './campaignAction'
import { CampaignLinkActionInput } from './inputs'
import { authorizeActionUpdate, upsertAction } from './service'

builder.mutationField('campaignBlockUpdateLinkAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignLinkActionRef,
    nullable: false,
    description:
      'Point a button at a web address (a journey, a video or any https page). The button’s one action becomes this link; any scroll or region target it had is cleared.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.\n- BAD_USER_INPUT (field: `url`): not an https address, or over 2048 characters.\n- BAD_USER_INPUT (field: `target`): not `_blank` or null.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignLinkActionInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeActionUpdate(String(id), context.user)
      const url = assertLinkUrl(input.url)
      const target = assertEnumOrNull(input.target, 'target', ['_blank'])
      return await upsertAction(block, { url, target: target ?? null })
    }
  })
)
