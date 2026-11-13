import { useApolloClient } from '@apollo/client/react'
import { useCallback, useState } from 'react'

import { CampaignBlockTranslationFields } from '../../../../../__generated__/CampaignBlockTranslationFields'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignTextField } from '../../../../../__generated__/globalTypes'
import {
  blockTranslations,
  translationValue
} from '../../../../libs/useCampaignBlockTextMutation'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../../../../libs/useCampaignQuery/campaignFields'
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
  /** Fallback undo value when the block is absent from the cache. */
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
 * captured when execute first runs back; redo writes it again. The Campaign Command module
 * returns undo and redo to the page, block and Preview Language the edit was
 * made in, and reports their refusals in the snackbar; a refused execute
 * shows in `error`. The row is read from the cache when the step runs, so an
 * undo never resurrects translations changed since.
 */
export function useCampaignTranslationCommand(): CampaignTranslationCommand {
  const { cache } = useApolloClient()
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const writeTranslation = useCampaignTranslationWrite()
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
    let undoValue: string | undefined

    function currentBlock(): CampaignBlockTranslationFields | null {
      return cache.readFragment<CampaignBlockTranslationFields>({
        id: cache.identify({ __typename: block.__typename, id: block.id }),
        fragment: CAMPAIGN_BLOCK_TRANSLATION_FIELDS,
        fragmentName: 'CampaignBlockTranslationFields',
        optimistic: true
      })
    }

    async function write(nextValue: string): Promise<unknown> {
      const current = currentBlock() ?? block
      return await writeTranslation({
        campaignId: campaign.id,
        row: block,
        target: { blockId: block.id },
        field,
        languageId,
        value: nextValue,
        translations: blockTranslations(current, field)
      })
    }

    addCampaignCommand({
      execute: async () => {
        if (undoValue === undefined) {
          const current = currentBlock()
          undoValue =
            current == null
              ? previous
              : translationValue(blockTranslations(current, field), languageId)
        }
        return await write(value)
      },
      undo: async () => await write(undoValue ?? previous)
    }).catch((mutationError: unknown) => setError(messageOf(mutationError)))
  }

  return { addTranslation, error, clearError }
}
