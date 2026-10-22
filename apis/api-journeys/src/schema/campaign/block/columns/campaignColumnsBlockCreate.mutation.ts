import { builder } from '../../../builder'
import { CAMPAIGN_COLUMNS_RATIOS } from '../../enums/campaignColumnsRatio'
import { assertEnum } from '../../validation'
import { CampaignColumnsBlock } from '../campaignColumnsBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'

import { CampaignColumnsBlockCreateInput } from './inputs'

builder.mutationField('campaignColumnsBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignColumnsBlock,
    nullable: false,
    description: `Add a two-column section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. The two empty CampaignColumnBlock slots are created with it, in the same transaction, at parentOrder 0 and 1.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`ratio\`): not equal, wideLeft or wideRight.\n- BAD_USER_INPUT (field: \`slotIds\`): given with other than two ids, an id that is not a UUID, the same id twice or the section's \`id\`, or an id that is already a block's (live or deleted).`,
    args: {
      input: t.arg({ type: CampaignColumnsBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(input, 'CampaignColumnsBlock', context.user, () => ({
        ...(input.ratio != null && {
          ratio: assertEnum(input.ratio, 'ratio', CAMPAIGN_COLUMNS_RATIOS)
        })
      }))
  })
)
