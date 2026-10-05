import { builder } from '../../../builder'
import { CampaignRegionHeaderBlock } from '../campaignRegionHeaderBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'
import { validateSectionText } from '../validateSectionText'

export const CampaignRegionHeaderBlockUpdateInput = builder.inputType(
  'CampaignRegionHeaderBlockUpdateInput',
  {
    fields: (t) => ({
      intro: t.string({
        required: false,
        description: 'At most 500 characters.'
      })
    })
  }
)

builder.mutationField('campaignRegionHeaderBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionHeaderBlock,
    nullable: false,
    description:
      'Update the region header’s default-language intro.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignRegionHeaderBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `intro`): over 500 characters.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignRegionHeaderBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignRegionHeaderBlock'
      )
      return await updateBlock(block, validateSectionText(input, ['intro']))
    }
  })
)
