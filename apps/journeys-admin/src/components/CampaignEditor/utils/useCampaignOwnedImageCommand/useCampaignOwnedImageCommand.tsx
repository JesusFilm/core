import { v4 as uuidv4 } from 'uuid'

import { CampaignImageSlot } from '../../../../../__generated__/globalTypes'
import {
  CampaignBlockUpdateInput,
  CampaignUpdatableBlock,
  useCampaignBlockUpdateMutation
} from '../../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignImageBlockCreateMutation } from '../../../../libs/useCampaignImageBlockCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import {
  CampaignBlockFieldsCommand,
  useCampaignBlockFieldsCommand
} from '../useCampaignBlockFieldsCommand'

export interface AddOwnedImageOptions<B extends CampaignUpdatableBlock> {
  /** The section or chrome block that will own the image. */
  owner: B
  slot: CampaignImageSlot
  /** The stored (imagedelivery.net) address the picker returned. */
  src: string
  /** The owner's fields to write once the image exists, given its id. */
  input: (imageId: string) => CampaignBlockUpdateInput<B['__typename']>
  /** The image id a set of the owner's fields points the slot at. */
  imageIdOf: (
    fields: CampaignBlockUpdateInput<B['__typename']>
  ) => string | null | undefined
}

export interface CampaignOwnedImageCommand extends CampaignBlockFieldsCommand {
  /** Create a cover or logo and point the owner at it as one Command. */
  addOwnedImage: <B extends CampaignUpdatableBlock>(
    options: AddOwnedImageOptions<B>
  ) => void
}

/**
 * Picking a cover or a logo is one Command: execute creates the owned image
 * (`campaignImageBlockCreate`, which also points the slot column at it on the
 * server) and then writes the owner's fields — the background kind and
 * overlay, or `logoBlockId` — so the canvas shows the picture at once; undo
 * writes the owner's previous fields back, and the server's slot swap
 * restores the image the slot held (the create soft-deleted it) and
 * soft-deletes the new one; redo writes the fields again without a second
 * create. An owned image never comes back through `campaignBlockRestore`,
 * which refuses it. A refused create is retried by redo.
 * `addFields` is the plain fields Command for the slot's other edits (Clear
 * logo, the overlay), sharing this hook's error.
 */
export function useCampaignOwnedImageCommand(): CampaignOwnedImageCommand {
  const { campaign } = useCampaignEditor()
  const createOwnedImage = useCampaignImageBlockCreateMutation(campaign.id)
  const { update } = useCampaignBlockUpdateMutation()
  const fieldsCommand = useCampaignBlockFieldsCommand()

  function addOwnedImage<B extends CampaignUpdatableBlock>({
    owner,
    slot,
    src,
    input,
    imageIdOf
  }: AddOwnedImageOptions<B>): void {
    const imageId = uuidv4()
    let created = false
    fieldsCommand.addFields(owner, input(imageId), async (next) => {
      if (imageIdOf(next) === imageId && !created) {
        created = true
        try {
          await createOwnedImage({ id: imageId, owner, slot, src })
        } catch (error) {
          created = false
          throw error
        }
      }
      return await update(owner, next)
    })
  }

  return { ...fieldsCommand, addOwnedImage }
}
