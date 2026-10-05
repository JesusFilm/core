import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { badUserInput } from '../../validation'
import { CampaignImageBlock } from '../campaignImageBlock'
import { SECTION_CREATE_ERRORS } from '../createSection'
import {
  assertImageSlot,
  authorizeBlockCreate,
  createOwnedImageBlock,
  createSectionBlock,
  validateImageOwner,
  validateSectionPage
} from '../service'

import { CampaignImageBlockCreateInput } from './inputs'
import { validateImageInput } from './validateImageInput'

builder.mutationField('campaignImageBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignImageBlock,
    nullable: false,
    description: `Add an image in one of two roles. With \`pageId\`: an Image section, last among the page’s sections or at \`parentOrder\`. With \`parentBlockId\` and \`slot\`: an owned image with \`parentOrder: null\` that becomes the parent’s background cover (any section or chrome block) or the header logo, replacing (soft-deleting) the image that slot held. \`width\` and \`height\` are measured by the server from \`src\`; the editor never supplies them.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`pageId\`): neither or both of pageId and parentBlockId given.\n- BAD_USER_INPUT (field: \`parentBlockId\`): not a live section or chrome block of this campaign.\n- BAD_USER_INPUT (field: \`logoBlockId\`): the logo slot on a block that is not the header.\n- BAD_USER_INPUT (field: \`src\`): not an https imagedelivery.net address, or the image could not be read.\n- BAD_USER_INPUT (field: \`alt\`): over 500 characters.`,
    args: {
      input: t.arg({ type: CampaignImageBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      if ((input.pageId == null) === (input.parentBlockId == null))
        throw badUserInput(
          'an image is a section on a page (pageId) or owned by a block (parentBlockId), not both or neither',
          'pageId'
        )
      await authorizeBlockCreate(campaignId, context.user)
      const id = input.id != null ? String(input.id) : undefined

      if (input.pageId != null) {
        const page = await validateSectionPage(
          campaignId,
          String(input.pageId),
          'CampaignImageBlock'
        )
        const data = await validateImageInput(input)
        return await prisma.$transaction(
          async (tx) =>
            await createSectionBlock(
              tx,
              page,
              { id, typename: 'CampaignImageBlock', ...data },
              input.parentOrder
            )
        )
      }

      const owner = await validateImageOwner(
        String(input.parentBlockId),
        campaignId
      )
      const slot = assertImageSlot(owner, input.slot)
      const data = await validateImageInput(input)
      return await prisma.$transaction(
        async (tx) => await createOwnedImageBlock(tx, owner, slot, { id, ...data })
      )
    }
  })
)
