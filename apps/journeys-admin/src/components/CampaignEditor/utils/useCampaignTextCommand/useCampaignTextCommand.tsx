import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_strings as CampaignString } from '../../../../../__generated__/GetCampaign'
import {
  CampaignTextBlock,
  CampaignTextField
} from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'
import { textDebounceKey, useCampaignCommand } from '../useCampaignCommand'
import { useTranslatedFieldWrite } from '../useTranslatedField'

/** One inline-editable text: a text field of a campaign block, or a Campaign String. */
export type CampaignTextTarget =
  | { block: CampaignTextBlock; field: CampaignTextField; string?: undefined }
  | { string: CampaignString; block?: undefined; field?: undefined }

export interface CampaignTextCommand {
  /** The text as typed; follows the cache when a save or an undo changes it. */
  value: string
  /**
   * While previewing a non-default language: the default-language text the
   * public page falls back to when the translation is empty. Empty otherwise.
   */
  fallback: string
  /** The API's message, verbatim, when the last save failed. */
  error?: string
  handleChange: (next: string) => void
  handleFocus: () => void
  handleBlur: () => void
}

/**
 * Typing into one text is one Command: every change while the field is
 * focused carries the same stable id, so CommandProvider keeps only the
 * latest, and the id resets on blur, undo or a change of Preview Language.
 * Each edit is written through the writer `useTranslatedFieldWrite` picks: in
 * the default language a block field through the block's typed update
 * mutation and a Campaign String through `campaignStringUpdate`; while
 * previewing another campaign language a human translation for that language
 * through `campaignTranslationSet`. Each write is debounced by the Apollo link under
 * one key per field (and language) and shown optimistically; undo writes the
 * value the field had when it took focus back through the same mutation.
 * The keystrokes are plain debounced saves, not Command steps, and a refused
 * one shows in `error`; the Campaign Command module returns undo and redo
 * to the page, block and Preview Language the edit was made in, runs them in
 * the editor's order and reports their refusals in the snackbar. While a
 * typed write is pending (in its debounce or in flight) the field keeps the
 * typed text whatever the cache says, so a `GetCampaign` refetch answered
 * with older text cannot overwrite it; once the write answers, the cache
 * holds the typed text again.
 */
export function useCampaignTextCommand(
  target: CampaignTextTarget
): CampaignTextCommand {
  const {
    state: { previewLanguageId }
  } = useCampaignEditor()
  const {
    value: committed,
    fallback,
    translating,
    write: writeField
  } = useTranslatedFieldWrite(
    target.string != null
      ? { string: target.string }
      : { block: target.block, field: target.field }
  )
  const [value, setValue] = useState(committed)
  const [error, setError] = useState<string>()
  const [commandInput, setCommandInput] = useState(() => ({
    id: uuidv4(),
    value: committed
  }))
  // Typed writes not yet answered: in their debounce or in flight.
  const pendingWrites = useRef(new Set<symbol>())
  // A cache change arrived while a typed write was pending; the field
  // catches up once the last one answers.
  const skippedCacheChange = useRef(false)
  const [resyncRequest, setResyncRequest] = useState(0)
  const { addCampaignCommand } = useCampaignCommand()
  const {
    state: { undo }
  } = useCommand()

  // The value an undo or redo of this field just wrote: the cache has not
  // caught up when the effect below runs, so it is the field's new baseline.
  const appliedValue = useRef<string | undefined>(undefined)

  useEffect(() => {
    const applied = appliedValue.current
    appliedValue.current = undefined
    if (undo == null || undo.id === commandInput.id) return
    setCommandInput({ id: uuidv4(), value: applied ?? committed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    // A cache change while a typed write is pending is older than the typed
    // text (a refetch that overtook the save), so the typed text wins.
    if (pendingWrites.current.size > 0) {
      skippedCacheChange.current = true
      return
    }
    skippedCacheChange.current = false
    // The API trims what it stores, so a save that only trimmed what was
    // typed must not rewrite the field while the user is still typing.
    setValue((typed) => (typed.trim() === committed ? typed : committed))
  }, [committed, resyncRequest])

  useEffect(() => {
    setCommandInput({ id: uuidv4(), value: committed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewLanguageId])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  async function write(
    nextValue: string,
    languageId: string | null,
    context: Record<string, unknown>
  ): Promise<unknown> {
    const debounceKey =
      target.string != null
        ? textDebounceKey(target.string, 'value', languageId)
        : textDebounceKey(target.block, target.field, languageId)
    return await writeField(nextValue, { debounceKey, ...context })
  }

  function handleChange(next: string): void {
    setValue(next)
    setError(undefined)
    const languageId = translating ? previewLanguageId : null
    const pending = Symbol('pending write')
    pendingWrites.current.add(pending)
    void write(next, languageId, {})
      .catch((mutationError: unknown) => setError(messageOf(mutationError)))
      .finally(() => {
        pendingWrites.current.delete(pending)
        // Answered: the cache holds the saved text, or the rolled-back one.
        if (pendingWrites.current.size === 0 && skippedCacheChange.current)
          setResyncRequest((request) => request + 1)
      })

    function writeBack(replayValue: string): () => Promise<unknown> {
      return async () => {
        appliedValue.current = replayValue
        // Same debounce key: this write replaces any keystroke still pending.
        pendingWrites.current.clear()
        return await write(replayValue, languageId, { debounceTimeout: 1 })
      }
    }

    void addCampaignCommand({
      id: commandInput.id,
      // The keystroke was sent above, on its debounce: it is not a step.
      execute: async () => undefined,
      undo: writeBack(commandInput.value),
      redo: writeBack(next)
    })
  }

  return {
    value,
    fallback: translating ? fallback : '',
    error,
    handleChange,
    handleFocus: resetCommandInput,
    handleBlur: resetCommandInput
  }
}
