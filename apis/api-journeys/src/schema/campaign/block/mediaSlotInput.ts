import { builder } from '../../builder'

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
  '- BAD_USER_INPUT (field: `mediaBlockId`): not a CampaignVideoBlock or CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.'

/**
 * The `mediaBlockId` column an update writes; omitted leaves the slot alone.
 * The target is validated and the slot swapped by `updateBlock`, under the
 * structure lock.
 */
export function mediaSlotColumns(
  mediaBlockId: string | number | null | undefined
): {
  mediaBlockId?: string | null
} {
  if (mediaBlockId === undefined) return {}
  return { mediaBlockId: mediaBlockId == null ? null : String(mediaBlockId) }
}
