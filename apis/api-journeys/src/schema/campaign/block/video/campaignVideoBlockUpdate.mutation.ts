import { GraphQLError } from 'graphql'

import { logger } from '../../../../logger'
import { builder } from '../../../builder'
import { NULL_FIELD_ERROR, TEXT_CAPS } from '../../validation'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  CAMPAIGN_VIDEO_TYPENAME,
  authorizeTypedBlockUpdate,
  updateBlock
} from '../service'

import { CampaignVideoBlockUpdateInput } from './inputs'
import {
  VideoSourceText,
  fetchVideoSourceText,
  validateVideoText
} from './validateVideoInput'

/**
 * The source text to fall back to. A YouTube request failure (quota, key) is
 * logged and answered with a message the author can act on, not YouTube's;
 * any other error, such as a video gone from YouTube, passes through.
 */
async function sourceTextOf(block: {
  source: string | null
  videoId: string | null
}): Promise<VideoSourceText> {
  try {
    return await fetchVideoSourceText(block)
  } catch (error) {
    if (
      block.source !== 'youTube' ||
      !(error instanceof GraphQLError) ||
      error.extensions.code !== 'INTERNAL_SERVER_ERROR'
    )
      throw error
    logger.error(
      { error, videoId: block.videoId },
      'YouTube source text re-fetch failed'
    )
    throw new GraphQLError(
      "YouTube is unavailable right now, so the video's original text can't be restored. Try again later.",
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } }
    )
  }
}

builder.mutationField('campaignVideoBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoBlock,
    nullable: false,
    description:
      `Set or clear a Campaign Video's default-language title and description overrides. Only the given fields change; translations are untouched. Null (or empty) falls back to the source text: a Watch video's is read live, so the column is cleared; a YouTube or Mux video's is fetched again, cut to the override caps, and stored.\n\nAuth: campaign Update — any member or manager of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`title\` / \`description\`): over ${TEXT_CAPS.videoTitle} / ${TEXT_CAPS.videoDescription} characters.\n- INTERNAL_SERVER_ERROR: YouTube is unavailable, so a YouTube video's source text cannot be fetched again; nothing is written.\n` +
      NULL_FIELD_ERROR,
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
        const source = await sourceTextOf(block)
        if (data.title === null) data.title = source.title
        if (data.description === null) data.description = source.description
      }
      return await updateBlock(block, data)
    }
  })
)
