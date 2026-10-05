import { builder } from '../../../builder'
import { CampaignRegionHeaderBlock } from '../campaignRegionHeaderBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'
import { validateSectionText } from '../validateSectionText'

export const CampaignRegionHeaderBlockCreateInput = builder.inputType(
  'CampaignRegionHeaderBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({
        required: true,
        description: 'The Region Page; refused on the landing page.'
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      intro: t.string({
        required: false,
        description: 'At most 500 characters.'
      })
    })
  }
)

builder.mutationField('campaignRegionHeaderBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionHeaderBlock,
    nullable: false,
    description: `Add a region header section to the Region Page, last among its sections or at \`parentOrder\` with the later sections renumbered. It renders the region being viewed, so the landing page refuses it.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`pageId\`): the landing page.\n- BAD_USER_INPUT (field: \`intro\`): over 500 characters.`,
    args: {
      input: t.arg({
        type: CampaignRegionHeaderBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignRegionHeaderBlock',
        context.user,
        () => validateSectionText(input, ['intro'])
      )
  })
)
