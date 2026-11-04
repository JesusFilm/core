import { useCallback, useState } from 'react'

import {
  CampaignBlockUpdateInput,
  CampaignUpdatableBlock,
  useCampaignBlockUpdateMutation
} from '../../../../libs/useCampaignBlockUpdateMutation'
import { messageOf } from '../messageOf'
import { useCampaignCommand } from '../useCampaignCommand'

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
 * the values the cache held when the Command was added back; redo writes the
 * change again. A refused execute shows in `error`; the Campaign Command
 * module refocuses undo and redo and reports their refusals.
 */
export function useCampaignBlockFieldsCommand(): CampaignBlockFieldsCommand {
  const { addCampaignCommand } = useCampaignCommand()
  const { update, previousFields } = useCampaignBlockUpdateMutation()
  const [error, setError] = useState<string>()
  const clearError = useCallback(() => setError(undefined), [])

  function addFields<B extends CampaignUpdatableBlock>(
    block: B,
    input: CampaignBlockUpdateInput<B['__typename']>,
    send: CampaignFieldsSend<
      CampaignBlockUpdateInput<B['__typename']>
    > = async (fields) => await update(block, fields)
  ): void {
    setError(undefined)
    const previous = previousFields(block, input)
    addCampaignCommand({
      execute: async () => await send(input),
      undo: async () => await send(previous)
    }).catch((mutationError: unknown) => setError(messageOf(mutationError)))
  }

  return { addFields, error, clearError }
}
