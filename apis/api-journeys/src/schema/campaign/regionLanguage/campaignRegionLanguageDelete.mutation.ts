import { enqueueShortLinkDeletes } from '../../../workers/shortlinkDelete/queue'
import { builder } from '../../builder'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { campaignWrite } from '../campaignWrite'
import { badUserInput } from '../errors'

import {
  authorizeRegionLanguageUpdate,
  deleteQrCodes,
  reorderRegionLanguages
} from './service'

builder.mutationField('campaignRegionLanguageDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionLanguageRef,
    nullable: false,
    description:
      'Remove an unlinked Share Language from a Campaign Region; a linked one must be unlinked first. A Campaign QR Code the language kept from an earlier link goes with it: its `QrCode` row is deleted in the same transaction and its short link queued for deletion once it commits, so printed copies stop redirecting; a QR code another Share Language still holds is kept. There is no restore, so the editor confirms first when the language has a QR code; a later link of a re-added language mints a new one. The journey and its own QR codes are untouched. The remaining languages are renumbered. Returns the deleted row; only its scalar fields are readable.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): "Unlink the journey before removing this language."',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }, context) => {
      const regionLanguage = await authorizeRegionLanguageUpdate(
        String(id),
        context.user
      )
      // Decide from the row as locked, not as authorised: a concurrent link
      // may have linked it, or given it a QR code, since.
      return await campaignWrite(
        regionLanguage.region.campaignId,
        { structure: true, shareLanguage: regionLanguage.id },
        async ({ tx, afterCommit }) => {
          const current = await tx.campaignRegionLanguage.findUniqueOrThrow({
            where: { id: regionLanguage.id },
            select: {
              journeyId: true,
              qrCode: { select: { id: true, shortLinkId: true } }
            }
          })
          if (current.journeyId != null)
            throw badUserInput(
              'Unlink the journey before removing this language.',
              'id'
            )
          const deleted = await tx.campaignRegionLanguage.delete({
            where: { id: regionLanguage.id }
          })
          // The QR code goes only once no other Share Language holds it, so
          // its delete never nulls another row's code.
          if (
            current.qrCode != null &&
            (await tx.campaignRegionLanguage.count({
              where: { qrCodeId: current.qrCode.id }
            })) === 0
          ) {
            const shortLinkIds = await deleteQrCodes(tx, [current.qrCode])
            afterCommit(async () => await enqueueShortLinkDeletes(shortLinkIds))
          }
          await reorderRegionLanguages(
            await tx.campaignRegionLanguage.findMany({
              where: { regionId: regionLanguage.regionId },
              orderBy: { order: 'asc' }
            }),
            tx
          )
          return deleted
        }
      )
    }
  })
)
