import { builder } from '../../../builder'
import { CampaignAnalyticsBlock } from '../campaignAnalyticsBlock'
import {
  SECTION_CREATE_ERRORS,
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  createSection
} from '../createSection'
import { validateSectionText } from '../validateSectionText'

export const CampaignAnalyticsBlockCreateInput = builder.inputType(
  'CampaignAnalyticsBlockCreateInput',
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
      showMap: t.boolean({ required: false, description: 'Defaults to false.' })
    })
  }
)

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
          showMap: input.showMap ?? false
        })
      )
  })
)
