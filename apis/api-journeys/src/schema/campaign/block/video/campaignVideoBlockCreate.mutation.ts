import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  CAMPAIGN_VIDEO_ITEM_OWNER_TYPENAMES,
  CAMPAIGN_VIDEO_TYPENAME,
  assertMediaOwner,
  authorizeBlockCreate,
  createChildBlock,
  createOwnedBlock,
  validateImageOwner,
  validateVideoItemOwner
} from '../service'

import { CampaignVideoBlockCreateInput } from './inputs'
import { pickVideo, validateVideoText } from './validateVideoInput'

builder.mutationField('campaignVideoBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoBlock,
    nullable: false,
    description:
      'Create a Campaign Video as a child of a section: either filling the Media Slot of a hero or Featured Media section (replacing, soft-deleting, the block the slot held) or adding an explicit item to a video carousel (appended as the next ordered child). YouTube and Mux ids are validated by the VideoBlock zod schemas and their title, description, poster and duration fetched once; a Watch `url` is stripped of its `.html` parts to a variant slug and resolved through the gateway, and only its ids are stored (the variant language is the campaign language). Title and description overrides win over the source text.\n\nAuth: campaign Update — any member or manager of the campaign\'s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve; a YouTube or Mux id unknown to its service.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign.\n- BAD_USER_INPUT (field: `mediaBlockId`): the section has no Media Slot (only hero and Featured Media do; a carousel takes explicit items instead).\n- BAD_USER_INPUT (field: `source`): not internal, youTube or mux.\n- BAD_USER_INPUT (field: `videoId`): not a valid YouTube or Mux id.\n- BAD_USER_INPUT (field: `url`): "That link isn\'t a Watch video", or a url on a YouTube or Mux video.\n- BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.',
    args: {
      input: t.arg({ type: CampaignVideoBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      const campaign = await authorizeBlockCreate(campaignId, context.user)
      const parentBlockId = String(input.parentBlockId)
      const parent = await validateVideoItemOwner(
        parentBlockId,
        campaignId,
        CAMPAIGN_VIDEO_TYPENAME
      )
      const isCarousel = (
        CAMPAIGN_VIDEO_ITEM_OWNER_TYPENAMES as readonly string[]
      ).includes(parent.typename)
      if (!isCarousel) assertMediaOwner(parent)
      const overrides = validateVideoText(input)
      const video = await pickVideo(input, campaign.defaultLanguageId)
      const columns = {
        id: input.id != null ? String(input.id) : undefined,
        typename: CAMPAIGN_VIDEO_TYPENAME,
        ...video,
        title: overrides.title ?? video.title,
        description: overrides.description ?? video.description
      }
      return await prisma.$transaction(async (tx) => {
        if (isCarousel)
          return await createChildBlock(tx, parent, columns)
        return await createOwnedBlock(tx, parent, 'mediaBlockId', columns)
      })
    }
  })
)
