import { builder } from '../../../builder'
import { CampaignFeaturedMediaBlock } from '../campaignFeaturedMediaBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'

import { CampaignFeaturedMediaBlockCreateInput } from './inputs'
import { validateFeaturedMediaInput } from './validateFeaturedMediaInput'

builder.mutationField('campaignFeaturedMediaBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignFeaturedMediaBlock,
    nullable: false,
    description: `Add a Featured Media section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. It starts with an empty Media Slot; text is empty when omitted and the media sits on the right unless \`mediaSide\` says otherwise.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`lede\` / \`bullets\`): over 80 / 150 / 500 / 1000 characters.\n- BAD_USER_INPUT (field: \`mediaSide\`): not left or right.`,
    args: {
      input: t.arg({
        type: CampaignFeaturedMediaBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignFeaturedMediaBlock',
        context.user,
        () => ({
          ...validateFeaturedMediaInput(input)
        })
      )
  })
)
