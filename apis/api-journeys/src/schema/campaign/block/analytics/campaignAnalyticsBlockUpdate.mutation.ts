import { builder } from '../../../builder'
import { CampaignAnalyticsBlock } from '../campaignAnalyticsBlock'
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

export const CampaignAnalyticsBlockUpdateInput = builder.inputType(
  'CampaignAnalyticsBlockUpdateInput',
  {
    fields: (t) => ({
      eyebrow: t.string({
        required: false,
        description: 'At most 80 characters.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      showMap: t.boolean({ required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignAnalyticsBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignAnalyticsBlock,
    nullable: false,
    description: `Update the analytics section’s default-language eyebrow or title, whether the world map shows, or its Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignAnalyticsBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over 80 / 150 characters.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignAnalyticsBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignAnalyticsBlock'
      )
      return await updateBlock(block, {
        ...validateSectionText(input, ['eyebrow', 'title']),
        ...(input.showMap != null ? { showMap: input.showMap } : {}),
        ...(await validateSectionStyle(input, block))
      })
    }
  })
)
