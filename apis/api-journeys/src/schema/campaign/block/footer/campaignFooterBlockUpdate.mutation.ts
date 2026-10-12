import { builder } from '../../../builder'
import { CampaignFooterBlock } from '../campaignFooterBlock'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateSectionStyle
} from '../service'

export const CampaignFooterBlockUpdateInput = builder.inputType(
  'CampaignFooterBlockUpdateInput',
  {
    description:
      'The footer’s Section Background and colour overrides: the shared section fields and nothing else.',
    fields: (t) => ({
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignFooterBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignFooterBlock,
    nullable: false,
    description: `Update the footer’s Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to the live CampaignFooterBlock.\n- FORBIDDEN: caller is not in the team.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignFooterBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignFooterBlock'
      )
      return await updateBlock(block, await validateSectionStyle(input, block))
    }
  })
)
