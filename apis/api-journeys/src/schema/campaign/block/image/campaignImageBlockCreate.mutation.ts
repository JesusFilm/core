import { builder } from '../../../builder'
import { TEXT_CAPS, assertClientId, badUserInput } from '../../validation'
import { CampaignImageBlock } from '../campaignImageBlock'
import { createSection } from '../createSection'
import { sectionCreateErrors } from '../inputs/sectionCreateInput'
import {
  CAMPAIGN_IMAGE_TYPENAME,
  assertImageSlot,
  authorizeBlockCreate,
  createOwnedImageBlock,
  createWithClientIds,
  validateSlotOwner
} from '../service'

import { CampaignImageBlockCreateInput } from './inputs'
import { validateImageInput } from './validateImageInput'

builder.mutationField('campaignImageBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignImageBlock,
    nullable: false,
    description: `Add an image in one of two roles. With \`pageId\`: an Image section, last among the page’s sections or at \`parentOrder\`. With \`parentBlockId\` and \`slot\`: an owned image with \`parentOrder: null\` that becomes the parent’s background cover (any section or chrome block), the header logo, or the Media Slot of a hero or Featured Media section, replacing (soft-deleting) the block that slot held. \`width\` and \`height\` are measured by the server from \`src\`; the editor never supplies them.\n\n${sectionCreateErrors('not a live section or chrome block of this campaign (the owned role; an Image section takes none).')}\n- BAD_USER_INPUT (field: \`pageId\`): neither or both of pageId and parentBlockId given.\n- BAD_USER_INPUT (field: \`logoBlockId\`): the logo slot on a block that is not the header.\n- BAD_USER_INPUT (field: \`mediaBlockId\`): the media slot on a block that is not a hero or Featured Media section.\n- BAD_USER_INPUT (field: \`src\`): not an https imagedelivery.net address, or the image could not be read.\n- BAD_USER_INPUT (field: \`alt\`): over ${TEXT_CAPS.imageAlt} characters.`,
    args: {
      input: t.arg({ type: CampaignImageBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      if ((input.pageId == null) === (input.parentBlockId == null))
        throw badUserInput(
          'an image is a section on a page (pageId) or owned by a block (parentBlockId), not both or neither',
          'pageId'
        )
      if (input.pageId != null)
        return await createSection(
          { ...input, pageId: input.pageId },
          CAMPAIGN_IMAGE_TYPENAME,
          context.user,
          async () => await validateImageInput(input)
        )

      const campaignId = String(input.campaignId)
      await authorizeBlockCreate(campaignId, context.user)
      const id = assertClientId(input.id)
      const owner = await validateSlotOwner(
        String(input.parentBlockId),
        campaignId
      )
      const slot = assertImageSlot(owner, input.slot)
      const data = await validateImageInput(input)
      return await createWithClientIds(
        { id: [id] },
        async (tx) =>
          await createOwnedImageBlock(tx, owner, slot, { id, ...data })
      )
    }
  })
)
