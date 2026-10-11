import { useCommand } from '@core/journeys/ui/CommandProvider'

import {
  CampaignButtonAction,
  CampaignButtonBlock,
  useCampaignBlockActionMutation
} from '../../../../libs/useCampaignBlockActionMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'

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
}

/**
 * Changing a button's link is one Command: execute focuses the page and
 * button it was made on and writes the action through the mutation for its
 * kind, shown optimistically; undo writes the previous action back the same
 * way, or removes it through `campaignBlockDeleteAction` when there was none.
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

  function addAction({
    block,
    action,
    undoAction,
    onError
  }: AddActionParameters): void {
    const blockPageKind = pageKindOf(block) ?? pageKind
    add<ActionParameters>({
      parameters: { execute: { action }, undo: { action: undoAction } },
      execute({ action: next }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.id
        })
        void mutate(block, next).catch((error: unknown) => {
          onError?.(messageOf(error))
        })
      }
    })
  }

  return { addAction }
}
