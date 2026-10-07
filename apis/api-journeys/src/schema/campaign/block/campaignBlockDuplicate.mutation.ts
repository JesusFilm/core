import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'
import { authorizeStructuralBlock, duplicateBlock } from './service'

export const CampaignBlockDuplicateIdMapInput = builder.inputType(
  'CampaignBlockDuplicateIdMapInput',
  {
    description:
      'A client-chosen id for one block of the copy, so the editor can show the duplicate before the response arrives.',
    fields: (t) => ({
      oldId: t.id({ required: true }),
      newId: t.id({ required: true })
    })
  }
)

builder.mutationField('campaignBlockDuplicate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignBlock],
    nullable: false,
    description:
      'Deep-copy a campaign block with its children, owned blocks and actions under new ids (`idMap` fixes any of them; the rest are fresh), remapping slot columns and action targets that point inside the copy, and insert the copy directly after the original. Returns the renumbered siblings with the copy among them, followed by the copied descendants.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT (field: `id`): the header, the footer, a column slot, a page, or an owned block.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      idMap: t.arg({
        type: [CampaignBlockDuplicateIdMapInput],
        required: false
      })
    },
    resolve: async (_parent, { id, idMap }, context) => {
      const block = await authorizeStructuralBlock(
        String(id),
        context.user,
        'duplicated'
      )
      return await duplicateBlock(
        block,
        (idMap ?? []).map((entry) => ({
          oldId: String(entry.oldId),
          newId: String(entry.newId)
        }))
      )
    }
  })
)
