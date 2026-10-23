import { builder } from '../../../builder'
import { badUserInput } from '../../errors'
import { CARD_JOURNEY_STATUSES, resolveJourneyLink } from '../../journeyLink'
import { CLIENT_ID_ERROR, assertClientId } from '../../validation'
import { CampaignJourneyBlock } from '../campaignJourneyBlock'
import {
  authorizeBlockUpdate,
  createChildBlock,
  createWithClientIds
} from '../service'

import { CampaignJourneyBlockCreateInput } from './inputs'
import { snapshotOf } from './snapshot'

builder.mutationField('campaignJourneyBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyBlock,
    nullable: false,
    description:
      'Add a journey card to a journey list from a pasted link: an admin link (`/journeys/<id>`) or a public URL on any domain resolves to a published or archived journey of any team, with the routing filter skipped, and its title and description are snapshotted as the default-language values. The item lands last among the list’s children (`parentOrder = siblings.length`), copying the list’s page scoping down. Linking another team’s journey needs no rights there.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: parentBlockId does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a journey list.\n- BAD_USER_INPUT (field: `url`): not a journey link, or "Journey not found, or not published or archived" (unknown, deleted or a draft).\n' +
      CLIENT_ID_ERROR +
      '',
    args: {
      input: t.arg({ type: CampaignJourneyBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const { id, parentBlockId, url } = input
      const parent = await authorizeBlockUpdate(
        String(parentBlockId),
        context.user
      )
      if (parent.typename !== 'CampaignJourneyListBlock')
        throw badUserInput(
          'parentBlockId must be a journey list',
          'parentBlockId'
        )
      const clientId = assertClientId(id)
      const journey = await resolveJourneyLink(url, CARD_JOURNEY_STATUSES)
      return await createWithClientIds(
        { id: [clientId] },
        async (tx) =>
          await createChildBlock(tx, parent, {
            id: clientId,
            typename: 'CampaignJourneyBlock',
            journeyId: journey.id,
            ...snapshotOf(journey)
          })
      )
    }
  })
)
