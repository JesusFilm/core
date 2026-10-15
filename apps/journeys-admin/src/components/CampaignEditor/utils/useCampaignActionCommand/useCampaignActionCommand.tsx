import { useCommand } from '@core/journeys/ui/CommandProvider'

import {
  CampaignButtonAction,
  CampaignButtonBlock,
  useCampaignBlockActionMutation
} from '../../../../libs/useCampaignBlockActionMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'
import { useCommandFailure } from '../useCommandFailure'

export interface AddActionParameters {
  block: Pick<CampaignButtonBlock, 'id' | 'pageId'>
  /** The action to write; null removes the button's action. */
  action: CampaignButtonAction | null
  /** The action the button had, written back on undo; null removes it. */
  undoAction: CampaignButtonAction | null
  /** Receives the API's message, verbatim, when the write fails. */
  onError?: (message: string) => void
}

interface ActionParameters {
  action: CampaignButtonAction | null
  /** Undo and redo report a refusal in the snackbar, since the panel that added the Command may have unmounted. */
  replay: boolean
}

/**
 * Changing a button's link is one Command: execute focuses the page and
 * button it was made on and writes the action through the mutation for its
 * kind, shown optimistically; undo writes the previous action back the same
 * way, or removes it through `campaignBlockDeleteAction` when there was none.
 * A refused execute goes to `onError`; a refused undo or redo goes to the
 * editor's error snackbar.
 */
export function useCampaignActionCommand(): {
  addAction: (params: AddActionParameters) => void
} {
  const { add } = useCommand()
  const {
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const mutate = useCampaignBlockActionMutation()
  const reportFailure = useCommandFailure()

  function addAction({
    block,
    action,
    undoAction,
    onError
  }: AddActionParameters): void {
    const blockPageKind = pageKindOf(block) ?? pageKind
    add<ActionParameters>({
      parameters: {
        execute: { action, replay: false },
        undo: { action: undoAction, replay: true },
        redo: { action, replay: true }
      },
      execute({ action: next, replay }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.id
        })
        void mutate(block, next).catch((error: unknown) => {
          if (replay) reportFailure(error)
          else onError?.(messageOf(error))
        })
      }
    })
  }

  return { addAction }
}
