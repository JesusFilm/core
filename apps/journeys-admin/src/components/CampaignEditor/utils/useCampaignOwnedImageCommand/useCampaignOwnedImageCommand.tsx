import { v4 as uuidv4 } from 'uuid'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignImageSlot } from '../../../../../__generated__/globalTypes'
import {
  CampaignImageOwner,
  useCampaignImageBlockCreateMutation
} from '../../../../libs/useCampaignImageBlockCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import {
  CampaignStyleCommand,
  useCampaignStyleCommand
} from '../useCampaignStyleCommand'

export interface AddOwnedImageOptions<B extends CampaignBlock, I> {
  /** The section or chrome block that will own the image. */
  owner: B
  slot: CampaignImageSlot
  /** The stored (imagedelivery.net) address the picker returned. */
  src: string
  /** The owner's fields to write once the image exists, given its id. */
  input: (imageId: string) => I
  /** The same fields as the owner holds them now: what undo writes back. */
  previous: I
  /** Runs the owner's own update mutation for `input`. */
  write: (owner: B, input: I) => Promise<unknown>
}

export interface CampaignOwnedImageCommand extends CampaignStyleCommand {
  /** Create a cover or logo and point the owner at it as one Command. */
  addOwnedImage: <B extends CampaignBlock, I>(
    options: AddOwnedImageOptions<B, I>
  ) => void
}

/**
 * Picking a cover or a logo is one Command: execute creates the owned image
 * (`campaignImageBlockCreate`, which also points the slot column at it on the
 * server) and then writes the owner's fields — the background kind and
 * overlay, or `logoBlockId` — so the canvas shows the picture at once; undo
 * writes the owner's previous fields back and leaves the image row behind,
 * out of the tree; redo writes the fields again without a second create.
 * `addStyle` is the plain style Command for the slot's other edits (Clear
 * logo, the overlay), sharing this hook's error.
 */
export function useCampaignOwnedImageCommand(): CampaignOwnedImageCommand {
  const { campaign } = useCampaignEditor()
  const createOwnedImage = useCampaignImageBlockCreateMutation(campaign.id)
  const styleCommand = useCampaignStyleCommand()

  function addOwnedImage<B extends CampaignBlock, I>({
    owner,
    slot,
    src,
    input,
    previous,
    write
  }: AddOwnedImageOptions<B, I>): void {
    const imageId = uuidv4()
    let created = false
    styleCommand.addStyle<B, I>({
      block: owner,
      input: input(imageId),
      previous,
      async run(current, next) {
        if (!created) {
          created = true
          await createOwnedImage({
            id: imageId,
            owner: current as unknown as CampaignImageOwner,
            slot,
            src
          })
        }
        return await write(current, next)
      }
    })
  }

  return { ...styleCommand, addOwnedImage }
}
