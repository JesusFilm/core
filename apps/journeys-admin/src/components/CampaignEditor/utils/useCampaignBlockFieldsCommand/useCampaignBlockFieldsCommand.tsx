import { useCallback, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import {
  CampaignBlockUpdateInput,
  CampaignUpdatableBlock,
  useCampaignBlockUpdateMutation
} from '../../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'
import { useCommandFailure } from '../useCommandFailure'

interface FieldsParameters<I> {
  input: I
  pageKind: CampaignPageKind
  /** Undo and redo: refocus the block, and report a refusal in the snackbar, since the panel that added the Command may have unmounted. */
  replay: boolean
}

/**
 * Sends one step's fields in place of the block's update: a media pick or
 * an owned image creates its block here on the first execute.
 */
export type CampaignFieldsSend<I> = (input: I) => Promise<unknown>

export interface CampaignBlockFieldsCommand {
  /** Write some of a block's fields as one Command. */
  addFields: <B extends CampaignUpdatableBlock>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>,
    send?: CampaignFieldsSend<CampaignBlockUpdateInput<B['__typename']>>
  ) => void
  /** The API's message, verbatim, when the last save failed. */
  error?: string
  clearError: () => void
}

/**
 * Every field edit of a Campaign Block, Style or Settings, is one Command:
 * execute writes the given fields through the block's update; undo writes
 * the values the cache held when the Command was added back, after focusing
 * the page and block the change was made on; redo writes the change again.
 */
export function useCampaignBlockFieldsCommand(): CampaignBlockFieldsCommand {
  const { add } = useCommand()
  const {
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const { update, previousFields } = useCampaignBlockUpdateMutation()
  const [error, setError] = useState<string>()
  const reportFailure = useCommandFailure()
  const clearError = useCallback(() => setError(undefined), [])

  function addFields<B extends CampaignUpdatableBlock>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>,
    send: CampaignFieldsSend<
      CampaignBlockUpdateInput<B['__typename']>
    > = async (fields) => await update(block, fields)
  ): void {
    setError(undefined)
    const blockPageKind = pageKindOf(block) ?? pageKind
    const previous = previousFields(block, input)
    add<FieldsParameters<CampaignBlockUpdateInput<B['__typename']>>>({
      parameters: {
        execute: { input, pageKind: blockPageKind, replay: false },
        undo: { input: previous, pageKind: blockPageKind, replay: true },
        redo: { input, pageKind: blockPageKind, replay: true }
      },
      execute({ input: next, pageKind: targetPageKind, replay }) {
        if (replay)
          dispatch({
            type: 'SetEditorFocusAction',
            pageKind: targetPageKind,
            selectedBlockId: block.id
          })
        void send(next).catch((mutationError: unknown) => {
          if (replay) reportFailure(mutationError)
          else setError(messageOf(mutationError))
        })
      }
    })
  }

  return { addFields, error, clearError }
}
