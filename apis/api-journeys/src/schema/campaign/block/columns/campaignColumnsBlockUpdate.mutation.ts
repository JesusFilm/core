import { builder } from '../../../builder'
import { CampaignColumnsRatio } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignColumnsBlock } from '../campaignColumnsBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'

import { CAMPAIGN_COLUMNS_RATIOS } from './validateColumnsRatio'

export const CampaignColumnsBlockUpdateInput = builder.inputType(
  'CampaignColumnsBlockUpdateInput',
  {
    fields: (t) => ({
      ratio: t.field({ type: CampaignColumnsRatio, required: false })
    })
  }
)

builder.mutationField('campaignColumnsBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignColumnsBlock,
    nullable: false,
    description:
      'Update the Columns section’s width ratio. Only the given fields change; the slots and what they hold are untouched.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignColumnsBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `ratio`): not equal, wideLeft or wideRight.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignColumnsBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignColumnsBlock'
      )
      return await updateBlock(block, {
        ...(input.ratio != null
          ? {
              ratio: assertEnum(input.ratio, 'ratio', CAMPAIGN_COLUMNS_RATIOS)
            }
          : {})
      })
    }
  })
)
