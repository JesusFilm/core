import { CampaignJourneyListDisplay as PrismaCampaignJourneyListDisplay } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignJourneyListDisplay } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignJourneyListBlock } from '../campaignJourneyListBlock'
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

const DISPLAYS = Object.values(PrismaCampaignJourneyListDisplay)

export const CampaignJourneyListBlockUpdateInput = builder.inputType(
  'CampaignJourneyListBlockUpdateInput',
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
      lede: t.string({
        required: false,
        description: 'At most 500 characters.'
      }),
      display: t.field({ type: CampaignJourneyListDisplay, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignJourneyListBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyListBlock,
    nullable: false,
    description: `Update the journey list’s default-language eyebrow, title or lede, its display (grid, list), or its Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignJourneyListBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`lede\`): over 80 / 150 / 500 characters.\n- BAD_USER_INPUT (field: \`display\`): not grid or list.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignJourneyListBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignJourneyListBlock'
      )
      return await updateBlock(block, {
        ...validateSectionText(input, ['eyebrow', 'title', 'lede']),
        ...(input.display != null
          ? { display: assertEnum(input.display, 'display', DISPLAYS) }
          : {}),
        ...(await validateSectionStyle(input, block))
      })
    }
  })
)
