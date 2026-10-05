import { builder } from '../../../builder'
import { CampaignRegionShareBlock } from '../campaignRegionShareBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'
import { validateSectionText } from '../validateSectionText'

export const CampaignRegionShareBlockUpdateInput = builder.inputType(
  'CampaignRegionShareBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      intro: t.string({
        required: false,
        description: 'At most 500 characters.'
      })
    })
  }
)

builder.mutationField('campaignRegionShareBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionShareBlock,
    nullable: false,
    description:
      'Update the region share panel’s default-language title or intro. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignRegionShareBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `title` / `intro`): over 150 / 500 characters.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignRegionShareBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignRegionShareBlock'
      )
      return await updateBlock(
        block,
        validateSectionText(input, ['title', 'intro'])
      )
    }
  })
)
