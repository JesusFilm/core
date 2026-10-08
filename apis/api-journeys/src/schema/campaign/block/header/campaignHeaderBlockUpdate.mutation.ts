import { builder } from '../../../builder'
import { CampaignHeaderBlock } from '../campaignHeaderBlock'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateSectionStyle
} from '../service'

export const CampaignHeaderBlockUpdateInput = builder.inputType(
  'CampaignHeaderBlockUpdateInput',
  {
    description:
      'The header’s Section Background and colour overrides: the shared section fields and nothing else. The brand mark is set by the images ticket’s mutations.',
    fields: (t) => ({
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignHeaderBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignHeaderBlock,
    nullable: false,
    description: `Update the header’s Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to the live CampaignHeaderBlock.\n- FORBIDDEN: caller is not in the team.\n${SECTION_STYLE_ERRORS}`,
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
      return await updateBlock(block, await validateSectionStyle(input, block))
    }
  })
)
