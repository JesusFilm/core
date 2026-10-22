import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { lockCampaignStructure, touchCampaign } from '../block/service'
import { CampaignRegionRef } from '../campaignRegion'
import { conflict, notFound } from '../errors'
import {
  deleteQrCodes,
  deleteShortLinks,
  findRegionQrCodes
} from '../regionLanguage/service'
import { enqueueRegionRevalidation } from '../revalidateCampaign'

import { authorizeRegionUpdate, getRegions, reorderRegions } from './service'

builder.mutationField('campaignRegionDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionRef,
    nullable: false,
    description:
      'Hard-delete an unlisted Campaign Region with everything it owns: its Share Languages (each deleting its Campaign QR Code and short link), its Region Countries and its Region Lines go by cascade; `CampaignNavigateToRegionAction` rows that targeted it keep their row with `regionId` set null; linked journeys are untouched. The remaining regions are renumbered. A published campaign’s landing page and the deleted path are queued for on-demand revalidation so the deleted path stops resolving. There is no restore, so the editor confirms first. The Region Page itself is not a region and cannot be deleted. Returns the deleted row; only its scalar fields are readable.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT (field: `regionId`): the region is listed; unlist it first.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const region = await authorizeRegionUpdate(String(id), context.user)
      let shortLinkIds: string[] = []
      const deleted = await prisma.$transaction(async (tx) => {
        // Decide from the row as locked, not as authorised: a concurrent
        // update may have listed it since.
        await lockCampaignStructure(tx, region.campaignId)
        await tx.$queryRaw`SELECT 1 FROM "CampaignRegion" WHERE id = ${region.id} FOR UPDATE`
        const current = await tx.campaignRegion.findUnique({
          where: { id: region.id },
          select: { listed: true }
        })
        if (current == null) throw notFound('region not found')
        if (current.listed)
          throw conflict(
            'a listed region cannot be deleted; unlist it first',
            'regionId'
          )
        shortLinkIds = await deleteQrCodes(
          tx,
          await findRegionQrCodes(tx, { regionId: region.id })
        )
        const deleted = await tx.campaignRegion.delete({
          where: { id: region.id }
        })
        await reorderRegions(await getRegions(region.campaignId, tx), tx)
        await touchCampaign(tx, region.campaignId)
        return deleted
      })
      await deleteShortLinks(shortLinkIds)
      await enqueueRegionRevalidation(region.campaign, [deleted.slug])
      return deleted
    }
  })
)
