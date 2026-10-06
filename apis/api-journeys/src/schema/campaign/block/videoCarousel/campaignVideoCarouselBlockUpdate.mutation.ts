import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

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
import { resolveWatchUrl } from '../video/watchUrl'
import { validateSectionText } from '../validateSectionText'

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
          'A Watch address the carousel expands; resolved by the server through its variant slug. Given instead of `videoId`.'
      }),
      videoId: t.id({
        required: false,
        description:
          'A known Watch Video id the carousel expands. Null switches the carousel to explicit items; the nullable id is the mode. Omitted leaves it alone.'
      }),
      videoVariantLanguageId: t.id({
        required: false,
        description:
          'Set only with a known `videoId`: the variant language. Cleared when the carousel returns to explicit items.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)

builder.mutationField('campaignVideoCarouselBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoCarouselBlock,
    nullable: false,
    description: `Update the video carousel’s default-language eyebrow or title, its Section Background and colour overrides, or the Watch Video it expands. A Watch \`url\` is stripped of its \`.html\` parts to a variant slug and resolved through the gateway, and only its ids are stored — the variant language is the campaign default at link time. \`videoId\` null switches the carousel to its explicit items; the nullable id is the mode, so there is no \`mode\` column.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock; a Watch url that resolves to no published Video.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over 80 / 150 characters.\n- BAD_USER_INPUT (field: \`url\`): not a Watch address.\n- BAD_USER_INPUT (field: \`videoId\`): given with a \`url\`.\n${SECTION_STYLE_ERRORS}`,
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
      const video = await carouselVideoColumns(input, block.campaignId)
      return await updateBlock(block, {
        ...validateSectionText(input, ['eyebrow', 'title']),
        ...(await validateSectionStyle(input, block)),
        ...video
      })
    }
  })
)

/**
 * The carousel's Watch expansion columns. An omitted `videoId` and `url`
 * leaves the mode alone. A given `url` resolves through the gateway and
 * stores the ids, the variant language being the campaign default at link
 * time. A known `videoId` stores as given with its variant language. Null
 * returns the carousel to explicit items and clears the variant language.
 */
async function carouselVideoColumns(
  input: {
    url?: string | null
    videoId?: string | null
    videoVariantLanguageId?: string | null
  },
  campaignId: string
): Promise<{
  url?: string
  videoId?: string | null
  videoVariantLanguageId?: string | null
}> {
  if (
    input.url === undefined &&
    input.videoId === undefined &&
    input.videoVariantLanguageId === undefined
  )
    return {}
  if (input.url != null) {
    if (input.videoId != null)
      throw new GraphQLError('videoId is for a known Watch Video id', {
        extensions: { code: 'BAD_USER_INPUT', field: 'videoId' }
      })
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { defaultLanguageId: true }
    })
    const videoId = await resolveWatchUrl(input.url)
    return {
      videoId,
      videoVariantLanguageId: campaign?.defaultLanguageId
    }
  }
  if (input.videoId == null && input.videoVariantLanguageId !== undefined)
    return { videoId: null, videoVariantLanguageId: null }
  if (input.videoId === undefined) return {}
  return {
    videoId: input.videoId,
    videoVariantLanguageId: input.videoVariantLanguageId ?? null
  }
}
