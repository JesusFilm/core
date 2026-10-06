import { builder } from '../../../builder'
import { CampaignVideoCarouselBlock } from '../campaignVideoCarouselBlock'
import {
  SECTION_STYLE_ERRORS,
  sectionStyleInputFields
} from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateSectionStyle
} from '../service'
import { validateSectionText } from '../validateSectionText'

import { validateCarouselVideo } from './validateCarouselVideo'

export const CampaignVideoCarouselBlockUpdateInput = builder.inputType(
  'CampaignVideoCarouselBlockUpdateInput',
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
      url: t.string({
        required: false,
        description:
          'A pasted Watch address: resolved by the server through its variant slug to a Video of any label, which becomes `videoId` (Watch expansion). Not together with `videoId`.'
      }),
      videoId: t.id({
        required: false,
        description:
          'A published Watch Video id (Watch expansion), or null for explicit mode (the ordered CampaignVideoBlock children). Omitted leaves the mode alone.'
      }),
      videoVariantLanguageId: t.id({
        required: false,
        description:
          'With `url` or `videoId`: the language the expansion resolves in; defaults to the campaign language.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignVideoCarouselBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoCarouselBlock,
    nullable: false,
    description: `Update the video carousel’s default-language eyebrow or title, its Watch expansion, or its Section Background and colour overrides. Only the given fields change. The nullable \`videoId\` is the mode: set ⇒ the Video’s children are the cards (any label; the gateway joins them through \`video\`), null ⇒ the explicit CampaignVideoBlock children are.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over 80 / 150 characters.\n- BAD_USER_INPUT (field: \`url\`): "That link isn't a Watch video", or given together with \`videoId\`.\n- BAD_USER_INPUT (field: \`videoId\`): not a published Watch video.\n- BAD_USER_INPUT (field: \`videoVariantLanguageId\`): given without \`url\` or \`videoId\`.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignVideoCarouselBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignVideoCarouselBlock'
      )
      const text = validateSectionText(input, ['eyebrow', 'title'])
      const style = await validateSectionStyle(input, block)
      const video = await validateCarouselVideo(
        input,
        block.campaign.defaultLanguageId
      )
      return await updateBlock(block, { ...text, ...style, ...video })
    }
  })
)
