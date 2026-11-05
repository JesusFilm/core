import { builder } from '../../../builder'
import { TEXT_CAPS } from '../../validation'
import { CampaignVideoCarouselBlock } from '../campaignVideoCarouselBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'
import { validateSectionText } from '../validateSectionText'

import { CampaignVideoCarouselBlockUpdateInput } from './inputs'
import { validateCarouselVideo } from './validateCarouselVideo'

builder.mutationField('campaignVideoCarouselBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoCarouselBlock,
    nullable: false,
    description: `Update the video carousel’s default-language eyebrow, title or description, its Watch expansion, or its Section Background and colour overrides. Only the given fields change. The nullable \`videoId\` is the mode: set ⇒ the Video’s children are the cards (any label; the gateway joins them through \`video\`), null ⇒ the explicit CampaignVideoBlock children are.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`description\`): over ${TEXT_CAPS.eyebrow} / ${TEXT_CAPS.title} / ${TEXT_CAPS.description} characters.\n- BAD_USER_INPUT (field: \`url\`): "That link isn't a Watch video", or given together with \`videoId\`.\n- BAD_USER_INPUT (field: \`videoId\`): not a published Watch video.\n- BAD_USER_INPUT (field: \`videoVariantLanguageId\`): given without \`url\` or \`videoId\`, or not an api-languages language.\n${SECTION_STYLE_ERRORS}`,
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
      const text = validateSectionText('CampaignVideoCarouselBlock', input)
      const style = sectionStyleColumns(input)
      const video = await validateCarouselVideo(
        input,
        block.campaign.defaultLanguageId
      )
      return await updateBlock(block, { ...text, ...style, ...video })
    }
  })
)
