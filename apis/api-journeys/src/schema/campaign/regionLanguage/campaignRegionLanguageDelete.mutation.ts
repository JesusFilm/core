import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'

import {
  authorizeRegionLanguageUpdate,
  deleteQrCodes,
  deleteShortLinks,
  getRegionLanguages,
  reorderRegionLanguages
} from './service'

builder.mutationField('campaignRegionLanguageDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionLanguageRef,
    nullable: false,
    description:
      'Remove a Share Language from a Campaign Region. Its Campaign QR Code and short link are deleted with it, as `qrCodeDelete` does; the linked journey is untouched. The remaining languages are renumbered. Returns the deleted row; only its scalar fields are readable.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const regionLanguage = await authorizeRegionLanguageUpdate(
        String(id),
        context.user
      )
      let shortLinkIds: string[] = []
      const deleted = await prisma.$transaction(async (tx) => {
        if (regionLanguage.qrCode != null)
          shortLinkIds = await deleteQrCodes(tx, [regionLanguage.qrCode])
        const deleted = await tx.campaignRegionLanguage.delete({
          where: { id: regionLanguage.id }
        })
        await reorderRegionLanguages(
          await getRegionLanguages(regionLanguage.regionId, tx),
          tx
        )
        await touchCampaign(tx, regionLanguage.region.campaignId)
        return deleted
      })
      await deleteShortLinks(shortLinkIds)
      return deleted
    }
  })
)
