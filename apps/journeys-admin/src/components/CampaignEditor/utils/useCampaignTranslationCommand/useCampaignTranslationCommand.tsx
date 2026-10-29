import { useCallback, useRef, useState } from 'react'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignTextField } from '../../../../../__generated__/globalTypes'
import { blockTranslations } from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCampaignTranslationWrite } from '../useCampaignTranslationWrite'

export interface AddTranslationOptions {
  block: CampaignBlock
  field: CampaignTextField
  /** The campaign language being previewed; never the default. */
  languageId: string
  value: string
  /** The translation as the block holds it now: what undo writes back. */
  previous: string
}

export interface CampaignTranslationCommand {
  addTranslation: (options: AddTranslationOptions) => void
  /** The API's message, verbatim, when the last translation save failed. */
  error?: string
  clearError: () => void
}

/**
 * A translation of a block field that is committed in one go (an image's
 * alt, a carousel card's title or description) is one Command: execute
 * writes it through `campaignTranslationSet`; undo writes the translation
 * the block had back; redo writes it again. The Campaign Command module
 * returns undo and redo to the page, block and Preview Language the edit was
 * made in, and reports their refusals in the snackbar; a refused execute
 * shows in `error`. The row is read from the cache when the step runs, so an
 * undo never resurrects translations changed since.
 */
export function useCampaignTranslationCommand(): CampaignTranslationCommand {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const writeTranslation = useCampaignTranslationWrite()
  const blocksRef = useRef(campaign.blocks)
  blocksRef.current = campaign.blocks
  const [error, setError] = useState<string>()
  const clearError = useCallback(() => setError(undefined), [])

  function addTranslation({
    block,
    field,
    languageId,
    value,
    previous
  }: AddTranslationOptions): void {
    setError(undefined)

    async function write(nextValue: string): Promise<unknown> {
      const current =
        blocksRef.current.find((candidate) => candidate.id === block.id) ??
        block
      return await writeTranslation({
        campaignId: campaign.id,
        row: current,
        target: { blockId: block.id },
        field,
        languageId,
        value: nextValue,
        translations: blockTranslations(current, field)
      })
    }

    addCampaignCommand({
      execute: async () => await write(value),
      undo: async () => await write(previous)
    }).catch((mutationError: unknown) => setError(messageOf(mutationError)))
  }

  return { addTranslation, error, clearError }
}
