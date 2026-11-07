import { builder } from '../../../builder'
import {
  NULL_FIELD_ERROR,
  TEXT_CAPS,
  assertLengthOrNull,
  assertNotNull
} from '../../validation'
import { CampaignJourneyBlock } from '../campaignJourneyBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'

import { CampaignJourneyBlockUpdateInput } from './inputs'

builder.mutationField('campaignJourneyBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyBlock,
    nullable: false,
    description:
      `Edit a journey card’s snapshot: its default-language title and description. Only the given fields change; translations are untouched. Editing the title or description marks the snapshot edited (\`snapshotEdited\`, which an undo can set back outright).\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignJourneyBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`title\` / \`description\`): over ${TEXT_CAPS.journeyTitle} / ${TEXT_CAPS.journeyDescription} characters.\n` +
      NULL_FIELD_ERROR +
      '',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignJourneyBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignJourneyBlock'
      )
      const textEdited =
        input.title !== undefined || input.description !== undefined
      const snapshotEdited =
        assertNotNull(input.snapshotEdited, 'snapshotEdited') ??
        (textEdited ? true : undefined)
      return await updateBlock(block, {
        ...(input.title !== undefined
          ? {
              title: assertLengthOrNull(
                input.title,
                'title',
                TEXT_CAPS.journeyTitle
              )
            }
          : {}),
        ...(input.description !== undefined
          ? {
              description: assertLengthOrNull(
                input.description,
                'description',
                TEXT_CAPS.journeyDescription
              )
            }
          : {}),
        snapshotEdited
      })
    }
  })
)
