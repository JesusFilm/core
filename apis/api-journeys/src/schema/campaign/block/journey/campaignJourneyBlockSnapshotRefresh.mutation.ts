import { builder } from '../../../builder'
import { resolveJourneyId } from '../../journeyLink'
import { CampaignJourneyBlock } from '../campaignJourneyBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'

import { snapshotOf } from './snapshot'

builder.mutationField('campaignJourneyBlockSnapshotRefresh', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyBlock,
    nullable: false,
    description:
      'Re-read the journey’s title and description and replace the card’s default-language values with them, including any edit the author made. Translations are kept. The refresh is manual; nothing re-reads a snapshot on its own.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignJourneyBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): "Journey not found or not published" — the journey is gone or no longer published.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignJourneyBlock'
      )
      const journey = await resolveJourneyId(block.journeyId ?? '', 'id')
      return await updateBlock(block, snapshotOf(journey))
    }
  })
)
