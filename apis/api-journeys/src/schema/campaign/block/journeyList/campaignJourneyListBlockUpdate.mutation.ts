import { builder } from '../../../builder'
import { CAMPAIGN_JOURNEY_LIST_DISPLAYS } from '../../enums'
import { TEXT_CAPS, assertEnum, assertNotNull } from '../../validation'
import { CampaignJourneyListBlock } from '../campaignJourneyListBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'
import { validateSectionText } from '../validateSectionText'

import { CampaignJourneyListBlockUpdateInput } from './inputs'

builder.mutationField('campaignJourneyListBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyListBlock,
    nullable: false,
    description: `Update the journey list’s default-language eyebrow, title or description, its display (grid, list), or its Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignJourneyListBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`description\`): over ${TEXT_CAPS.eyebrow} / ${TEXT_CAPS.title} / ${TEXT_CAPS.description} characters.\n- BAD_USER_INPUT (field: \`display\`): not grid or list.\n${SECTION_STYLE_ERRORS}`,
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
      const display = assertNotNull(input.display, 'display')
      return await updateBlock(block, {
        ...validateSectionText(input, ['eyebrow', 'title', 'description']),
        ...(display !== undefined
          ? {
              display: assertEnum(
                display,
                'display',
                CAMPAIGN_JOURNEY_LIST_DISPLAYS
              )
            }
          : {}),
        ...sectionStyleColumns(input)
      })
    }
  })
)
