import { builder } from '../../../builder'
import { CampaignImageBlock } from '../campaignImageBlock'
import { SECTION_STYLE_ERRORS } from '../sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  updateBlock,
  validateSectionStyle
} from '../service'

import { CampaignImageBlockUpdateInput } from './inputs'
import { validateImageInput } from './validateImageInput'

builder.mutationField('campaignImageBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignImageBlock,
    nullable: false,
    description: `Update an image’s address or default-language alt text, and for an Image section its Section Background and colour overrides. Only the given fields change; alt translations are untouched. A new \`src\` is re-measured by the server; null clears the image and its size.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignImageBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`src\`): not an https imagedelivery.net address, or the image could not be read.\n- BAD_USER_INPUT (field: \`alt\`): over 500 characters.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignImageBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignImageBlock'
      )
      const style = await validateSectionStyle(input, block)
      const data = await validateImageInput(input)
      return await updateBlock(block, { ...style, ...data })
    }
  })
)
