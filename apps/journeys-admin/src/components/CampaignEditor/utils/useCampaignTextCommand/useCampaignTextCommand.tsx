import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import {
  CampaignTextBlock,
  CampaignTextField,
  useCampaignBlockTextMutation
} from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'

interface UseCampaignTextCommandOptions {
  block: CampaignTextBlock
  field: CampaignTextField
}

export interface CampaignTextCommand {
  /** The text as typed; follows the cache when a save or an undo changes it. */
  value: string
  /** The API's message, verbatim, when the last save failed. */
  error?: string
  handleChange: (next: string) => void
  handleFocus: () => void
  handleBlur: () => void
}

interface TextCommandParameters {
  value: string
  context: Record<string, unknown>
  pageKind: CampaignPageKind
  focus: boolean
}

/** The debounce key that groups one field's keystrokes into one request. */
export function textDebounceKey(
  block: Pick<CampaignTextBlock, '__typename' | 'id'>,
  field: CampaignTextField
): string {
  return `${block.__typename}:${block.id}:${field}`
}

/**
 * Typing into one field is one Command: every change while the field is
 * focused carries the same stable id, so CommandProvider keeps only the
 * latest, and the id resets on blur or undo. Execute writes the value through
 * the block's text mutation, debounced by the Apollo link under one key per
 * field and shown optimistically; undo writes the value the field had when
 * it took focus back through the same mutation, after focusing the page and
 * block the edit was made on.
 */
export function useCampaignTextCommand({
  block,
  field
}: UseCampaignTextCommandOptions): CampaignTextCommand {
  const committed =
    (block as unknown as Record<string, string | null>)[field] ?? ''
  const [value, setValue] = useState(committed)
  const [error, setError] = useState<string>()
  const [commandInput, setCommandInput] = useState(() => ({
    id: uuidv4(),
    value: committed
  }))
  const {
    add,
    state: { undo }
  } = useCommand()
  const {
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const mutate = useCampaignBlockTextMutation()

  useEffect(() => {
    if (undo == null || undo.id === commandInput.id) return
    setCommandInput({ id: uuidv4(), value })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    setValue(committed)
  }, [committed])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleChange(next: string): void {
    setValue(next)
    setError(undefined)
    const blockPageKind = pageKindOf(block) ?? pageKind
    add<TextCommandParameters>({
      id: commandInput.id,
      parameters: {
        execute: {
          value: next,
          context: {},
          pageKind: blockPageKind,
          focus: false
        },
        undo: {
          value: commandInput.value,
          context: { debounceTimeout: 1 },
          pageKind: blockPageKind,
          focus: true
        },
        redo: {
          value: next,
          context: { debounceTimeout: 1 },
          pageKind: blockPageKind,
          focus: true
        }
      },
      execute({ value: nextValue, context, pageKind: targetPageKind, focus }) {
        if (focus)
          dispatch({
            type: 'SetEditorFocusAction',
            pageKind: targetPageKind,
            selectedBlockId: block.id
          })
        void mutate(block, field, nextValue, {
          debounceKey: textDebounceKey(block, field),
          ...context
        }).catch((mutationError: unknown) => {
          setError(messageOf(mutationError))
        })
      }
    })
  }

  return {
    value,
    error,
    handleChange,
    handleFocus: resetCommandInput,
    handleBlur: resetCommandInput
  }
}
