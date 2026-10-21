import { builder } from '../../../builder'
import { CampaignAnalyticsBlock } from '../campaignAnalyticsBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'
import { validateSectionText } from '../validateSectionText'

import { CampaignAnalyticsBlockCreateInput } from './inputs'

builder.mutationField('campaignAnalyticsBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignAnalyticsBlock,
    nullable: false,
    description: `Add an analytics section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. Its scope follows the page it sits on.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over 80 / 150 characters.`,
    args: {
      input: t.arg({ type: CampaignAnalyticsBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignAnalyticsBlock',
        context.user,
        () => ({
          ...validateSectionText(input, ['eyebrow', 'title']),
          showMap: input.showMap ?? undefined
        })
      )
  })
)
