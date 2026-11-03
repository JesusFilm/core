import {
  CampaignButtonAction,
  CampaignButtonBlock,
  useCampaignBlockActionMutation
} from '../../../../libs/useCampaignBlockActionMutation'
import { messageOf } from '../messageOf'
import { useCampaignCommand } from '../useCampaignCommand'

export interface AddActionParameters {
  block: Pick<CampaignButtonBlock, 'id' | 'pageId'>
  /** The action to write; null removes the button's action. */
  action: CampaignButtonAction | null
  /** The action the button had, written back on undo; null removes it. */
  undoAction: CampaignButtonAction | null
  /** Receives the API's message, verbatim, when the write fails. */
  onError?: (message: string) => void
}

/**
 * Changing a button's link is one Command: execute writes the action through
 * the mutation for its kind, shown optimistically; undo writes the previous
 * action back the same way, or removes it through
 * `campaignBlockDeleteAction` when there was none. Every step selects the
 * button, which may sit in the section being edited. A refused execute goes to
 * `onError`; the Campaign Command module reports a refused undo or redo in
 * the editor's error snackbar.
 */
export function useCampaignActionCommand(): {
  addAction: (params: AddActionParameters) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const mutate = useCampaignBlockActionMutation()

  function addAction({
    block,
    action,
    undoAction,
    onError
  }: AddActionParameters): void {
    const selectButton = {
      selectedBlockId: block.id,
      selectedRegionId: undefined
    }
    addCampaignCommand({
      focus: { execute: selectButton, undo: selectButton, redo: selectButton },
      execute: async () => await mutate(block, action),
      undo: async () => await mutate(block, undoAction)
    }).catch((error: unknown) => onError?.(messageOf(error)))
  }

  return { addAction }
}
