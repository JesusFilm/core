import { useApolloClient } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

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
  /** Fallback undo action when the button is absent from the cache; null removes it. */
  undoAction: CampaignButtonAction | null
  /** Receives the API's message, verbatim, when the write fails. */
  onError?: (message: string) => void
}

/**
 * Changing a button's link is one Command: execute writes the action through
 * the mutation for its kind, shown optimistically; undo writes the previous
 * action captured at first execution back the same way, or removes it through
 * `campaignBlockDeleteAction` when there was none. Every step selects the
 * button, which may sit in the section being edited. A refused execute goes to
 * `onError`; the Campaign Command module reports a refused undo or redo in
 * the editor's error snackbar.
 */
export function useCampaignActionCommand(): {
  addAction: (params: AddActionParameters) => void
} {
  const { cache } = useApolloClient()
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
    let previous: CampaignButtonAction | null | undefined
    addCampaignCommand({
      focus: { execute: selectButton, undo: selectButton, redo: selectButton },
      execute: async () => {
        if (previous === undefined) {
          const current = cache.readFragment<
            Pick<CampaignButtonBlock, 'action'>
          >({
            id: cache.identify({
              __typename: 'CampaignButtonBlock',
              id: block.id
            }),
            fragment: CAMPAIGN_PUBLIC_BLOCK_FIELDS,
            fragmentName: 'CampaignPublicBlockFields',
            optimistic: true
          })
          previous = current == null ? undoAction : current.action
        }
        return await mutate(block, action)
      },
      undo: async () => {
        if (previous === undefined) return
        return await mutate(block, previous)
      }
    }).catch((error: unknown) => onError?.(messageOf(error)))
  }

  return { addAction }
}
