import { builder } from '../../../builder'
import { CampaignVideoCarouselBlock } from '../campaignVideoCarouselBlock'
import {
  SECTION_CREATE_ERRORS,
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  createSection
} from '../createSection'
import { validateSectionText } from '../validateSectionText'

export const CampaignVideoCarouselBlockCreateInput = builder.inputType(
  'CampaignVideoCarouselBlockCreateInput',
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
      })
    })
  }
)

builder.mutationField('campaignVideoCarouselBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoCarouselBlock,
    nullable: false,
    description: `Add a video carousel section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. It starts with no video and no items.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over 80 / 150 characters.`,
    args: {
      input: t.arg({
        type: CampaignVideoCarouselBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignVideoCarouselBlock',
        context.user,
        () => validateSectionText(input, ['eyebrow', 'title'])
      )
  })
)
