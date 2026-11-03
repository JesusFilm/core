import { builder } from '../../../builder'
import { CAMPAIGN_COLUMNS_RATIOS } from '../../enums'
import { assertEnum, assertNotNull } from '../../validation'
import { CampaignColumnsBlock } from '../campaignColumnsBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'

import { CampaignColumnsBlockUpdateInput } from './inputs'

builder.mutationField('campaignColumnsBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignColumnsBlock,
    nullable: false,
    description: `Update the Columns section’s width ratio, or its Section Background and colour overrides. Only the given fields change; the slots and what they hold are untouched.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignColumnsBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`ratio\`): not equal, wideLeft or wideRight.\n${SECTION_STYLE_ERRORS}`,
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
      const ratio = assertNotNull(input.ratio, 'ratio')
      return await updateBlock(block, {
        ...(ratio !== undefined
          ? { ratio: assertEnum(ratio, 'ratio', CAMPAIGN_COLUMNS_RATIOS) }
          : {}),
        ...sectionStyleColumns(input)
      })
    }
  })
)
