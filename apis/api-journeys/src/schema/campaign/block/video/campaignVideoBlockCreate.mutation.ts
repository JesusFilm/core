import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  CAMPAIGN_VIDEO_TYPENAME,
  assertMediaOwner,
  authorizeBlockCreate,
  createOwnedBlock,
  validateImageOwner
} from '../service'

import { CampaignVideoBlockCreateInput } from './inputs'
import { pickVideo, validateVideoText } from './validateVideoInput'

builder.mutationField('campaignVideoBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoBlock,
    nullable: false,
    description:
      'Fill the Media Slot of a hero or Featured Media section with a Campaign Video, replacing (soft-deleting) the block the slot held. YouTube and Mux ids are validated by the VideoBlock zod schemas and their title, description, poster and duration fetched once; a Watch `url` is stripped of its `.html` parts to a variant slug and resolved through the gateway, and only its ids are stored (the variant language is the campaign language). Title and description overrides win over the source text.\n\nAuth: campaign Update — any member or manager of the campaign\'s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve; a YouTube or Mux id unknown to its service.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a live section of this campaign.\n- BAD_USER_INPUT (field: `mediaBlockId`): the section has no Media Slot (only hero and Featured Media do).\n- BAD_USER_INPUT (field: `source`): not internal, youTube or mux.\n- BAD_USER_INPUT (field: `videoId`): not a valid YouTube or Mux id.\n- BAD_USER_INPUT (field: `url`): "That link isn\'t a Watch video", or a url on a YouTube or Mux video.\n- BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.',
    args: {
      input: t.arg({ type: CampaignVideoBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      const campaign = await authorizeBlockCreate(campaignId, context.user)
      const owner = await validateImageOwner(
        String(input.parentBlockId),
        campaignId
      )
      assertMediaOwner(owner)
      const overrides = validateVideoText(input)
      const video = await pickVideo(input, campaign.defaultLanguageId)
      return await prisma.$transaction(
        async (tx) =>
          await createOwnedBlock(tx, owner, 'mediaBlockId', {
            id: input.id != null ? String(input.id) : undefined,
            typename: CAMPAIGN_VIDEO_TYPENAME,
            ...video,
            title: overrides.title ?? video.title,
            description: overrides.description ?? video.description
          })
      )
    }
  })
)
