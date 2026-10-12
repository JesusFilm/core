import { builder } from '../../../builder'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  CAMPAIGN_VIDEO_TYPENAME,
  authorizeTypedBlockUpdate,
  updateBlock
} from '../service'

import { CampaignVideoBlockUpdateInput } from './inputs'
import { fetchVideoSourceText, validateVideoText } from './validateVideoInput'

builder.mutationField('campaignVideoBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoBlock,
    nullable: false,
    description:
      "Set or clear a Campaign Video's default-language title and description overrides. Only the given fields change; translations are untouched. Null (or empty) falls back to the source text: a Watch video's is read live, so the column is cleared; a YouTube or Mux video's is fetched again and stored.\n\nAuth: campaign Update — any member or manager of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.",
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignVideoBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        CAMPAIGN_VIDEO_TYPENAME
      )
      const data = validateVideoText(input)
      if (data.title === null || data.description === null) {
        const source = await fetchVideoSourceText(block)
        if (data.title === null) data.title = source.title
        if (data.description === null) data.description = source.description
      }
      return await updateBlock(block, data)
    }
  })
)
