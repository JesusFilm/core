import { builder } from '../../../builder'
import { CampaignColumnsRatio } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignColumnsBlock } from '../campaignColumnsBlock'
import {
  SECTION_CREATE_ERRORS,
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  createSection
} from '../createSection'

import { CAMPAIGN_COLUMNS_RATIOS } from './validateColumnsRatio'

export const CampaignColumnsBlockCreateInput = builder.inputType(
  'CampaignColumnsBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
      parentBlockId: t.id({
        required: false,
        description: `${SECTION_PARENT_BLOCK_ID_DESCRIPTION} A Columns section never sits in a slot, so a value here is always refused.`
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      ratio: t.field({
        type: CampaignColumnsRatio,
        required: false,
        description: 'Defaults to equal.'
      }),
      slotIds: t.idList({
        required: false,
        description:
          'Client-chosen ids for the two Column Slots, in order, so the editor can show them before the response arrives; exactly two when given.'
      })
    })
  }
)

builder.mutationField('campaignColumnsBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignColumnsBlock,
    nullable: false,
    description: `Add a two-column section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. The two empty CampaignColumnBlock slots are created with it, in the same transaction, at parentOrder 0 and 1.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`ratio\`): not equal, wideLeft or wideRight.\n- BAD_USER_INPUT (field: \`slotIds\`): given with other than two ids.`,
    args: {
      input: t.arg({ type: CampaignColumnsBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(input, 'CampaignColumnsBlock', context.user, () => ({
        ratio: assertEnum(
          input.ratio ?? 'equal',
          'ratio',
          CAMPAIGN_COLUMNS_RATIOS
        )
      }))
  })
)
