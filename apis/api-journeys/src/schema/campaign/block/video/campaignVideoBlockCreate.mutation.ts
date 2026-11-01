import { builder } from '../../../builder'
import { CLIENT_ID_ERROR, TEXT_CAPS, assertClientId } from '../../validation'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  assertMediaOwner,
  authorizeBlockCreate,
  createChildBlock,
  createOwnedBlock,
  createWithClientIds,
  validateHostBlock
} from '../service'

import { CampaignVideoBlockCreateInput } from './inputs'
import { pickVideo, validateVideoText } from './validateVideoInput'

builder.mutationField('campaignVideoBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoBlock,
    nullable: false,
    description:
      `Add a Campaign Video. Under a hero or Featured Media section it fills the Media Slot, replacing (soft-deleting) the block the slot held (\`parentOrder: null\`); under a Video Carousel it is the last explicit item (\`parentOrder\` = the number of the carousel's children). YouTube and Mux ids are validated by the VideoBlock zod schemas and their title, description, poster and duration fetched once, the text cut to the override caps (${TEXT_CAPS.videoTitle} / ${TEXT_CAPS.videoDescription} characters); a Watch \`url\` is stripped of its \`.html\` parts to a variant slug and resolved through the gateway, a Watch \`videoId\` must be a published Watch Video; only its ids are stored (the variant language is the one the address named, else the campaign language). Title and description overrides win over the source text.\n\nAuth: campaign Update — any member or manager of the campaign's team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`parentBlockId\`): not a live section of this campaign.\n- BAD_USER_INPUT (field: \`mediaBlockId\`): the section has no Media Slot (only hero and Featured Media do) and is not a video carousel.\n- BAD_USER_INPUT (field: \`source\`): not internal, youTube or mux.\n- BAD_USER_INPUT (field: \`videoId\`): not a valid YouTube or Mux id, "videoId must be a valid YouTube videoId" / "videoId must be a valid Mux videoId" for an id unknown to its service, or "videoId is not a published Watch video" for a Watch video picked by id.\n- BAD_USER_INPUT (field: \`url\`): "That link isn't a Watch video", or a url on a YouTube or Mux video.\n- BAD_USER_INPUT (field: \`title\` / \`description\`): over ${TEXT_CAPS.videoTitle} / ${TEXT_CAPS.videoDescription} characters.\n` +
      CLIENT_ID_ERROR,
    args: {
      input: t.arg({ type: CampaignVideoBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      const parentBlockId = String(input.parentBlockId)
      const campaign = await authorizeBlockCreate(campaignId, context.user)
      const id = assertClientId(input.id)
      const owner = await validateHostBlock(parentBlockId, campaignId)
      const isCarouselItem = owner.typename === 'CampaignVideoCarouselBlock'
      if (!isCarouselItem) assertMediaOwner(owner)
      const overrides = validateVideoText(input)
      const video = await pickVideo(input, campaign.defaultLanguageId)
      const data = {
        id,
        typename: 'CampaignVideoBlock' as const,
        ...video,
        title: overrides.title ?? video.title,
        description: overrides.description ?? video.description
      }
      return await createWithClientIds({ id: [id] }, async (tx) =>
        isCarouselItem
          ? await createChildBlock(tx, owner, data)
          : await createOwnedBlock(tx, owner, 'mediaBlockId', data)
      )
    }
  })
)
