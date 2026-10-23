import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { lockCampaignStructure, touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { badUserInput } from '../errors'

import {
  authorizeRegionLanguageUpdate,
  lockRegionLanguage,
  reorderRegionLanguages
} from './service'

builder.mutationField('campaignRegionLanguageDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionLanguageRef,
    nullable: false,
    description:
      'Remove a Share Language from a Campaign Region. A language that holds a Campaign QR Code cannot be removed, so printed codes keep working: unlink it instead, or delete its region or campaign. The linked journey is untouched. The remaining languages are renumbered. Returns the deleted row; only its scalar fields are readable.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): "This language has a QR code. Unlink it instead."',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const regionLanguage = await authorizeRegionLanguageUpdate(
        String(id),
        context.user
      )
      return await prisma.$transaction(async (tx) => {
        await lockCampaignStructure(tx, regionLanguage.region.campaignId)
        // Decide from the row as locked, not as authorised: a concurrent link
        // may have given it a QR code since.
        await lockRegionLanguage(tx, regionLanguage.id)
        const current = await tx.campaignRegionLanguage.findUniqueOrThrow({
          where: { id: regionLanguage.id },
          select: { qrCodeId: true }
        })
        if (current.qrCodeId != null)
          throw badUserInput(
            'This language has a QR code. Unlink it instead.',
            'id'
          )
        const deleted = await tx.campaignRegionLanguage.delete({
          where: { id: regionLanguage.id }
        })
        await reorderRegionLanguages(
          await tx.campaignRegionLanguage.findMany({
            where: { regionId: regionLanguage.regionId },
            orderBy: { order: 'asc' }
          }),
          tx
        )
        await touchCampaign(tx, regionLanguage.region.campaignId)
        return deleted
      })
    }
  })
)
