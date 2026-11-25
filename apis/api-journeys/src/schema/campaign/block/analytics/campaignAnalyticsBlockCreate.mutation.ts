import { builder } from '../../../builder'
import { TEXT_CAPS } from '../../validation'
import { CampaignAnalyticsBlock } from '../campaignAnalyticsBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignAnalyticsBlockCreateInput } from './inputs'

builder.mutationField('campaignAnalyticsBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignAnalyticsBlock,
    nullable: false,
    description: `Add an analytics section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. Its scope follows the page it sits on.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over ${TEXT_CAPS.eyebrow} / ${TEXT_CAPS.title} characters.`,
    args: {
      input: t.arg({ type: CampaignAnalyticsBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignAnalyticsBlock',
        context.user,
        () => ({
          ...validateSectionText('CampaignAnalyticsBlock', input),
          showMap: input.showMap ?? undefined
        })
      )
  })
)
