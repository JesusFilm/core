import { builder } from '../../../builder'
import { NULL_FIELD_ERROR } from '../../validation'
import { CampaignButtonBlock } from '../campaignButtonBlock'
import {
  authorizeTypedBlockUpdate,
  placementUpdate,
  updateBlock
} from '../service'

import { CampaignButtonBlockUpdateInput } from './inputs'
import { validateButtonInput } from './validateButtonInput'

builder.mutationField('campaignButtonBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignButtonBlock,
    nullable: false,
    description:
      'Update a button’s default-language label, variant, size, alignment, colours or placement. Only the given fields change; the action and translations are untouched.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignButtonBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `label`): over 60 characters.\n- BAD_USER_INPUT (field: `variant`, `size`, `align`, `color`, `labelColor`, `placement`): the value fails its rule.\n' +
      NULL_FIELD_ERROR +
      '',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignButtonBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignButtonBlock'
      )
      const data = validateButtonInput(input)
      return await updateBlock(block, {
        ...data,
        ...placementUpdate(block, input.placement)
      })
    }
  })
)
