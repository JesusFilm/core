import { builder } from '../../../builder'
import { CAMPAIGN_JOURNEY_LIST_DISPLAYS } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignJourneyListBlock } from '../campaignJourneyListBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignJourneyListBlockCreateInput } from './inputs'

builder.mutationField('campaignJourneyListBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyListBlock,
    nullable: false,
    description: `Add a journey list section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. It starts with no items.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`description\` / \`display\`): the value fails its rule.`,
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
          ...validateSectionText('CampaignJourneyListBlock', input),
          ...(input.display != null && {
            display: assertEnum(
              input.display,
              'display',
              CAMPAIGN_JOURNEY_LIST_DISPLAYS
            )
          })
        })
      )
  })
)
