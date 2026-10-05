import { builder } from '../../../builder'
import { CampaignMediaSide } from '../../enums'
import { CampaignFeaturedMediaBlock } from '../campaignFeaturedMediaBlock'
import {
  MEDIA_SLOT_ERRORS,
  mediaSlotInputField,
  mediaSlotUpdate
} from '../mediaSlotInput'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateSectionStyle
} from '../service'

import { validateFeaturedMediaInput } from './validateFeaturedMediaInput'

export const CampaignFeaturedMediaBlockUpdateInput = builder.inputType(
  'CampaignFeaturedMediaBlockUpdateInput',
  {
    fields: (t) => ({
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
      mediaSide: t.field({ type: CampaignMediaSide, required: false }),
      mediaBlockId: mediaSlotInputField(t),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignFeaturedMediaBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignFeaturedMediaBlock,
    nullable: false,
    description: `Update a Featured Media section’s default-language eyebrow, title, lede or bullets, its media side, its Media Slot, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignFeaturedMediaBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`lede\` / \`bullets\`): over 80 / 150 / 500 / 1000 characters.\n- BAD_USER_INPUT (field: \`mediaSide\`): not left or right.\n${MEDIA_SLOT_ERRORS}\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignFeaturedMediaBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignFeaturedMediaBlock'
      )
      const body = validateFeaturedMediaInput(input)
      const style = await validateSectionStyle(input, block)
      const media = await mediaSlotUpdate(input.mediaBlockId, block)
      return await updateBlock(
        block,
        { ...body, ...style, ...media.data },
        media.before
      )
    }
  })
)
