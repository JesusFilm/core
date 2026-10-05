import { CampaignAction, Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  CampaignBlockWithCampaignAcl,
  authorizeBlockUpdate,
  touchCampaign
} from '../block/service'
import { badUserInput } from '../validation'

/**
 * The campaign Action service: the journeys Action mutations' shape
 * (`canBlockHaveAction`, the `ACTION_UPDATE_RESET` upsert, `deleteMany`),
 * authorised through the campaign as every block mutation is.
 */

/** Every target column; the upsert's update resets them before writing the new kind. */
export const CAMPAIGN_ACTION_UPDATE_RESET = {
  blockId: null,
  regionId: null,
  url: null,
  target: null
} satisfies Prisma.CampaignActionUncheckedUpdateInput

export type CampaignActionData = Pick<
  Prisma.CampaignActionUncheckedCreateInput,
  'blockId' | 'regionId' | 'url' | 'target'
>

/**
 * Action mutations address a live block of the caller's campaign
 * (`NOT_FOUND` / `FORBIDDEN` as block update), and only a
 * CampaignButtonBlock may carry an action (`BAD_USER_INPUT` / `id`).
 */
export async function authorizeActionUpdate(
  blockId: string,
  user: User
): Promise<CampaignBlockWithCampaignAcl> {
  const block = await authorizeBlockUpdate(blockId, user)
  if (block.typename !== 'CampaignButtonBlock')
    throw badUserInput('id must be a CampaignButtonBlock', 'id')
  return block
}

/**
 * Write the button's one action: create the row, or reset every target column
 * and set the new kind, so changing kinds never leaves a stale column behind.
 */
export async function upsertAction(
  block: Pick<CampaignBlockWithCampaignAcl, 'id' | 'campaignId'>,
  data: CampaignActionData
): Promise<CampaignAction> {
  return await prisma.$transaction(async (tx) => {
    const action = await tx.campaignAction.upsert({
      where: { campaignBlockId: block.id },
      create: { campaignBlockId: block.id, ...data },
      update: { ...CAMPAIGN_ACTION_UPDATE_RESET, ...data }
    })
    await touchCampaign(tx, block.campaignId)
    return action
  })
}

/** Remove the button's action row, if any. */
export async function deleteAction(
  block: Pick<CampaignBlockWithCampaignAcl, 'id' | 'campaignId'>
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.campaignAction.deleteMany({ where: { campaignBlockId: block.id } })
    await touchCampaign(tx, block.campaignId)
  })
}
