import { CombinedGraphQLErrors } from '@apollo/client'
import { useCallback, useRef, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { useCommandFailure } from '../useCommandFailure'

/** The API's message, verbatim, from a failed mutation. */
export function messageOf(error: unknown): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : String(error)
}

interface StyleParameters<I> {
  input: I
  pageKind: CampaignPageKind
  /** Undo and redo: refocus the block, and report a refusal in the snackbar, since the panel that added the Command may have unmounted. */
  replay: boolean
}

export interface AddStyleOptions<B extends CampaignBlock, I> {
  block: B
  /** The fields to write. */
  input: I
  /** The same fields as the block holds them now: what undo writes back. */
  previous: I
  /** Runs the block's update mutation for `input` over the block as the cache holds it when the Command runs. */
  run: (block: B, input: I) => Promise<unknown>
}

export interface CampaignStyleCommand {
  addStyle: <B extends CampaignBlock, I>(options: AddStyleOptions<B, I>) => void
  /** The API's message, verbatim, when the last style save failed. */
  error?: string
  clearError: () => void
}

/**
 * Every style change is one Command: execute writes the given fields through
 * the block's own update mutation with an optimistic response; undo writes
 * the values the block had back through the same mutation, after focusing
 * the page and block the change was made on; redo writes the change again.
 * The optimistic row is built from the block as the cache holds it when the
 * Command runs, so an undo never resurrects fields changed since.
 */
export function useCampaignStyleCommand(): CampaignStyleCommand {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const blocksRef = useRef(campaign.blocks)
  blocksRef.current = campaign.blocks
  const [error, setError] = useState<string>()
  const reportFailure = useCommandFailure()
  const clearError = useCallback(() => setError(undefined), [])

  function addStyle<B extends CampaignBlock, I>({
    block,
    input,
    previous,
    run
  }: AddStyleOptions<B, I>): void {
    setError(undefined)
    const blockPageKind = pageKindOf(block) ?? pageKind
    add<StyleParameters<I>>({
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
        const current =
          (blocksRef.current.find((candidate) => candidate.id === block.id) as
            | B
            | undefined) ?? block
        void run(current, next).catch((mutationError: unknown) => {
          if (replay) reportFailure(mutationError)
          else setError(messageOf(mutationError))
        })
      }
    })
  }

  return { addStyle, error, clearError }
}

/** The block's current values of the keys an input names: what undo writes back. */
export function previousOf<I extends object>(
  block: object,
  input: I,
  columns: Partial<Record<keyof I, string>> = {}
): I {
  const previous: Record<string, unknown> = {}
  const row = block as Record<string, unknown>
  for (const key of Object.keys(input) as Array<keyof I & string>) {
    previous[key] = row[columns[key] ?? key] ?? null
  }
  return previous as I
}
