import { CampaignBlock, Prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

import { swapMediaSlot, validateMediaSlotTarget } from './service'

type InputFieldBuilder = Parameters<
  Parameters<typeof builder.inputType>[1]['fields']
>[0]

/** The `mediaBlockId` input field of the hero and Featured Media updates. */
export function mediaSlotInputField(t: InputFieldBuilder) {
  return t.id({
    required: false,
    description:
      'The owned CampaignVideoBlock or CampaignImageBlock to show in the Media Slot (one this section owns, even if an earlier swap soft-deleted it), or null to empty the slot. The block the slot held is soft-deleted; the new one is restored. Fill the slot with `campaignVideoBlockCreate` or `campaignImageBlockCreate` (`slot: media`); this field swaps between blocks the section already owns, which is how undo works.'
  })
}

export const MEDIA_SLOT_ERRORS =
  '- BAD_USER_INPUT (field: `mediaBlockId`): not a CampaignVideoBlock or CampaignImageBlock this section owns.'

export interface MediaSlotUpdate {
  data: { mediaBlockId?: string | null }
  before?: (tx: Prisma.TransactionClient) => Promise<void>
}

/**
 * Validate a `mediaBlockId` update and return the column plus the swap to
 * run in the update's transaction; omitted leaves the slot alone.
 */
export async function mediaSlotUpdate(
  mediaBlockId: string | number | null | undefined,
  owner: Pick<CampaignBlock, 'id' | 'campaignId' | 'mediaBlockId'>
): Promise<MediaSlotUpdate> {
  const target = await validateMediaSlotTarget(mediaBlockId, owner)
  if (target === undefined) return { data: {} }
  return {
    data: { mediaBlockId: target },
    before: async (tx) => await swapMediaSlot(tx, owner, target)
  }
}
