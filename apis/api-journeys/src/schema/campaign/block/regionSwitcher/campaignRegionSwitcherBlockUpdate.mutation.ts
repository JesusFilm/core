import { builder } from '../../../builder'
import {
  CAMPAIGN_SWITCHER_VARIANTS,
  CampaignSwitcherVariant
} from '../../enums'
import { assertEnum, assertNotNull } from '../../validation'
import { CampaignRegionSwitcherBlock } from '../campaignRegionSwitcherBlock'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'
import { validateSectionText } from '../validateSectionText'

export const CampaignRegionSwitcherBlockUpdateInput = builder.inputType(
  'CampaignRegionSwitcherBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      variant: t.field({ type: CampaignSwitcherVariant, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignRegionSwitcherBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionSwitcherBlock,
    nullable: false,
    description: `Update the region switcher’s default-language title or its variant (cards, list, pills), or its Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignRegionSwitcherBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`title\`): over 150 characters.\n- BAD_USER_INPUT (field: \`variant\`): not cards, list or pills.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignRegionSwitcherBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignRegionSwitcherBlock'
      )
      const variant = assertNotNull(input.variant, 'variant')
      return await updateBlock(block, {
        ...validateSectionText(input, ['title']),
        ...(variant !== undefined
          ? {
              switcherVariant: assertEnum(
                variant,
                'variant',
                CAMPAIGN_SWITCHER_VARIANTS
              )
            }
          : {}),
        ...sectionStyleColumns(input)
      })
    }
  })
)
