import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CARD_JOURNEY_STATUSES, resolveJourneyLink } from '../../journeyLink'
import { CLIENT_ID_ERROR, assertClientId, badUserInput } from '../../validation'
import { CampaignJourneyBlock } from '../campaignJourneyBlock'
import {
  authorizeBlockUpdate,
  createChildBlock,
  withClientIds
} from '../service'

import { snapshotOf } from './snapshot'

builder.mutationField('campaignJourneyBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignJourneyBlock,
    nullable: false,
    description:
      'Add a journey card to a journey list from a pasted link: an admin link (`/journeys/<id>`) or a public URL on any domain resolves to a published or archived journey of any team, with the routing filter skipped, and its title and description are snapshotted as the default-language values. The item lands last among the list’s children (`parentOrder = siblings.length`), copying the list’s page scoping down. Linking another team’s journey needs no rights there.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: parentBlockId does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a journey list.\n- BAD_USER_INPUT (field: `url`): not a journey link, or "Journey not found or not published" (unknown, deleted or a draft).\n' +
      CLIENT_ID_ERROR +
      '',
    args: {
      id: t.arg({
        type: 'ID',
        required: false,
        description: 'A client-chosen id for the new item.'
      }),
      parentBlockId: t.arg({
        type: 'ID',
        required: true,
        description: 'The journey list the card is added to.'
      }),
      url: t.arg.string({
        required: true,
        description: 'The journey’s admin link or public URL on any domain.'
      })
    },
    resolve: async (_parent, { id, parentBlockId, url }, context) => {
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
      return await withClientIds(
        { id: [clientId] },
        async () =>
          await prisma.$transaction(
            async (tx) =>
              await createChildBlock(tx, parent, {
                id: clientId,
                typename: 'CampaignJourneyBlock',
                journeyId: journey.id,
                ...snapshotOf(journey)
              })
          )
      )
    }
  })
)
