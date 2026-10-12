import { builder } from '../../../builder'
import { CampaignHeaderBlock } from '../campaignHeaderBlock'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateImageSlotTarget,
  validateSectionStyle
} from '../service'

export const CampaignHeaderBlockUpdateInput = builder.inputType(
  'CampaignHeaderBlockUpdateInput',
  {
    description:
      'The header’s Section Background and colour overrides (the shared section fields) and its logo slot.',
    fields: (t) => ({
      ...sectionStyleInputFields(t),
      logoBlockId: t.id({
        required: false,
        description:
          'The owned CampaignImageBlock shown as the Brand Mark; null clears the logo so the campaign title shows instead. Usually set by campaignImageBlockCreate with slot logo.'
      })
    })
  }
)

builder.mutationField('campaignHeaderBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignHeaderBlock,
    nullable: false,
    description: `Update the header’s Section Background, colour overrides or logo. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to the live CampaignHeaderBlock.\n- FORBIDDEN: caller is not in the team.\n${SECTION_STYLE_ERRORS}\n- BAD_USER_INPUT (field: \`logoBlockId\`): not a live CampaignImageBlock owned by the header.`,
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
      const style = await validateSectionStyle(input, block)
      const logo =
        input.logoBlockId === undefined
          ? {}
          : {
              logoBlockId: await validateImageSlotTarget(
                input.logoBlockId,
                block.campaignId,
                'logoBlockId',
                block.id
              )
            }
      return await updateBlock(block, { ...style, ...logo })
    }
  })
)
