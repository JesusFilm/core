import { builder } from '../../../builder'
import { CampaignHeaderBlock } from '../campaignHeaderBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'

import { CampaignHeaderBlockUpdateInput } from './inputs'

builder.mutationField('campaignHeaderBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignHeaderBlock,
    nullable: false,
    description: `Update the header’s Section Background, colour overrides or logo. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to the live CampaignHeaderBlock.\n- FORBIDDEN: caller is not in the team.\n${SECTION_STYLE_ERRORS}\n- BAD_USER_INPUT (field: \`logoBlockId\`): not a CampaignImageBlock the header owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignHeaderBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignHeaderBlock'
      )
      const style = sectionStyleColumns(input)
      const logo =
        input.logoBlockId === undefined
          ? {}
          : {
              logoBlockId:
                input.logoBlockId == null ? null : String(input.logoBlockId)
            }
      return await updateBlock(block, { ...style, ...logo })
    }
  })
)
