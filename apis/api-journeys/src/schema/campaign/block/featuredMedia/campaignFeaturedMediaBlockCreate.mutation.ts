import { builder } from '../../../builder'
import { CampaignMediaSide } from '../../enums'
import { CampaignFeaturedMediaBlock } from '../campaignFeaturedMediaBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'

import { validateFeaturedMediaInput } from './validateFeaturedMediaInput'

export const CampaignFeaturedMediaBlockCreateInput = builder.inputType(
  'CampaignFeaturedMediaBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
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
      bullets: t.string({
        required: false,
        description: 'One bullet per line; at most 1000 characters.'
      }),
      mediaSide: t.field({
        type: CampaignMediaSide,
        required: false,
        description: 'Defaults to `right`.'
      })
    })
  }
)

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
          mediaSide: 'right',
          ...validateFeaturedMediaInput(input)
        })
      )
  })
)
