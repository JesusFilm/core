import { builder } from '../../../builder'
import { CampaignVideoCarouselBlock } from '../campaignVideoCarouselBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'
import { validateSectionText } from '../validateSectionText'

export const CampaignVideoCarouselBlockUpdateInput = builder.inputType(
  'CampaignVideoCarouselBlockUpdateInput',
  {
    fields: (t) => ({
      eyebrow: t.string({
        required: false,
        description: 'At most 80 characters.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      })
    })
  }
)

builder.mutationField('campaignVideoCarouselBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoCarouselBlock,
    nullable: false,
    description:
      'Update the video carousel’s default-language eyebrow or title. Only the given fields change; the Watch expansion and items are set by the media ticket’s mutations.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignVideoCarouselBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignVideoCarouselBlock'
      )
      return await updateBlock(
        block,
        validateSectionText(input, ['eyebrow', 'title'])
      )
    }
  })
)
