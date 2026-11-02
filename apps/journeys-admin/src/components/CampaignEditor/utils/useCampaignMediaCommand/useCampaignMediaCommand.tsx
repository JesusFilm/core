import { v4 as uuidv4 } from 'uuid'

import { CampaignImageSlot } from '../../../../../__generated__/globalTypes'
import { useCampaignImageBlockCreateMutation } from '../../../../libs/useCampaignImageBlockCreateMutation'
import {
  CampaignMediaOwner,
  CampaignMediaSlotInput,
  useCampaignMediaSlotMutation
} from '../../../../libs/useCampaignMediaSlotMutation'
import { useCampaignVideoBlockCreateMutation } from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import type { CampaignMediaPick } from '../../Pickers/MediaPasteField'
import {
  CampaignStyleCommand,
  useCampaignStyleCommand
} from '../useCampaignStyleCommand'

export interface CampaignMediaCommand extends CampaignStyleCommand {
  /** Fill (or replace) the owner's Media Slot with a picked video or image as one Command. */
  addMediaPick: (owner: CampaignMediaOwner, pick: CampaignMediaPick) => void
  /** Empty the owner's Media Slot as one Command. */
  clearMedia: (owner: CampaignMediaOwner) => void
}

/**
 * A media pick is one Command. Execute creates the slot block once
 * (`campaignVideoBlockCreate`, or `campaignImageBlockCreate` with
 * `slot: media`) under a client id; the server points the owner's
 * `mediaBlockId` at it and soft-deletes the block the slot held, and the
 * create's optimistic response does the same in the cache so the canvas
 * shows the pick at once. Undo writes the owner's previous `mediaBlockId`
 * back through the owner's update mutation — null removes the new block, a
 * previous id restores the block it replaced; redo writes the new id again
 * without a second create. A refused create (a Watch address that is not a
 * video, say) shows the API's message and is retried by redo.
 */
export function useCampaignMediaCommand(): CampaignMediaCommand {
  const { campaign } = useCampaignEditor()
  const createVideo = useCampaignVideoBlockCreateMutation(campaign.id)
  const createImage = useCampaignImageBlockCreateMutation(campaign.id)
  const writeMediaSlot = useCampaignMediaSlotMutation()
  const styleCommand = useCampaignStyleCommand()

  function addMediaPick(
    owner: CampaignMediaOwner,
    pick: CampaignMediaPick
  ): void {
    const mediaId = uuidv4()
    let created = false

    async function create(current: CampaignMediaOwner): Promise<unknown> {
      if ('src' in pick)
        return await createImage({
          id: mediaId,
          owner: current,
          slot: CampaignImageSlot.media,
          src: pick.src
        })
      return await createVideo({ id: mediaId, owner: current, pick })
    }

    styleCommand.addStyle<CampaignMediaOwner, CampaignMediaSlotInput>({
      block: owner,
      input: { mediaBlockId: mediaId },
      previous: { mediaBlockId: owner.mediaBlockId },
      async run(current, next) {
        if (created || next.mediaBlockId !== mediaId)
          return await writeMediaSlot(current, next)
        created = true
        try {
          return await create(current)
        } catch (error) {
          created = false
          throw error
        }
      }
    })
  }

  function clearMedia(owner: CampaignMediaOwner): void {
    styleCommand.addStyle<CampaignMediaOwner, CampaignMediaSlotInput>({
      block: owner,
      input: { mediaBlockId: null },
      previous: { mediaBlockId: owner.mediaBlockId },
      run: writeMediaSlot
    })
  }

  return { ...styleCommand, addMediaPick, clearMedia }
}
