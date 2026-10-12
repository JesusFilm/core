import { TypographyAlign } from '../../../block/typography/enums/typographyAlign'
import { builder } from '../../../builder'
import { assertEnumOrNull } from '../../validation'
import { CampaignHeroBlock } from '../campaignHeroBlock'
import {
  SECTION_CREATE_ERRORS,
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  createSection
} from '../createSection'
import { CAMPAIGN_ALIGNS } from '../typography/validateTypographyInput'
import { validateSectionText } from '../validateSectionText'

export const CampaignHeroBlockCreateInput = builder.inputType(
  'CampaignHeroBlockCreateInput',
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
      align: t.field({ type: TypographyAlign, required: false })
    })
  }
)

builder.mutationField('campaignHeroBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignHeroBlock,
    nullable: false,
    description: `Add a hero section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. Text is empty when omitted.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`lede\` / \`align\`): the value fails its rule.`,
    args: {
      input: t.arg({ type: CampaignHeroBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(input, 'CampaignHeroBlock', context.user, () => ({
        ...validateSectionText(input, ['eyebrow', 'title', 'lede']),
        align: assertEnumOrNull(input.align, 'align', CAMPAIGN_ALIGNS)
      }))
  })
)
