import { CampaignJourneyListDisplay as PrismaCampaignJourneyListDisplay } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignJourneyListDisplay } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignJourneyListBlock } from '../campaignJourneyListBlock'
import {
  SECTION_CREATE_ERRORS,
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  createSection
} from '../createSection'
import { validateSectionText } from '../validateSectionText'

const DISPLAYS = Object.values(PrismaCampaignJourneyListDisplay)

export const CampaignJourneyListBlockCreateInput = builder.inputType(
  'CampaignJourneyListBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
      parentBlockId: t.id({
        required: false,
        description: SECTION_PARENT_BLOCK_ID_DESCRIPTION
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
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
      display: t.field({
        type: CampaignJourneyListDisplay,
        required: false,
        description: 'Defaults to grid.'
      })
    })
  }
)

builder.mutationField('campaignJourneyListBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyListBlock,
    nullable: false,
    description: `Add a journey list section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. It starts with no items.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`lede\` / \`display\`): the value fails its rule.`,
    args: {
      input: t.arg({
        type: CampaignJourneyListBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignJourneyListBlock',
        context.user,
        () => ({
          ...validateSectionText(input, ['eyebrow', 'title', 'lede']),
          display: assertEnum(input.display ?? 'grid', 'display', DISPLAYS)
        })
      )
  })
)
