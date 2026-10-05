import { builder } from '../../../builder'
import { CampaignTypographyBlock } from '../campaignTypographyBlock'
import {
  assertPlacement,
  authorizeTypedBlockUpdate,
  updateBlock
} from '../service'

import { CampaignTypographyBlockUpdateInput } from './inputs'
import { validateTypographyInput } from './validateTypographyInput'

builder.mutationField('campaignTypographyBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignTypographyBlock,
    nullable: false,
    description:
      'Update a text block’s default-language content, variant, alignment, colour or placement. Only the given fields change; translations are untouched.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignTypographyBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `content`): over 2000 characters.\n- BAD_USER_INPUT (field: `variant`, `align`, `color`, `placement`): the value fails its rule.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignTypographyBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignTypographyBlock'
      )
      const data = validateTypographyInput(input)
      return await updateBlock(block, {
        ...data,
        ...(input.placement !== undefined && block.parentBlockId != null
          ? { placement: assertPlacement(input.placement) }
          : {})
      })
    }
  })
)
