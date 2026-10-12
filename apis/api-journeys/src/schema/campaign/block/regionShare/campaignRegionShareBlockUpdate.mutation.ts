import { builder } from '../../../builder'
import { CampaignRegionShareBlock } from '../campaignRegionShareBlock'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateSectionStyle
} from '../service'
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
      }),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignRegionShareBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionShareBlock,
    nullable: false,
    description: `Update the region share panel’s default-language title or intro, or its Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignRegionShareBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`title\` / \`intro\`): over 150 / 500 characters.\n${SECTION_STYLE_ERRORS}`,
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
      return await updateBlock(block, {
        ...validateSectionText(input, ['title', 'intro']),
        ...(await validateSectionStyle(input, block))
      })
    }
  })
)
